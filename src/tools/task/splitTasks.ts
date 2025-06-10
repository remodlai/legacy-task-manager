import { z } from "zod";
import {
  getAllTasks,
  batchCreateOrUpdateTasks,
  clearAllTasks as modelClearAllTasks,
} from "../../models/taskModel.js";
import { RelatedFileType, Task } from "../../types/index.js";
import { getSplitTasksPrompt } from "../../prompts/index.js";

// Task splitting tool
export const splitTasksSchema = z.object({
  updateMode: z
    .enum(["append", "overwrite", "selective", "clearAllTasks"])
    .describe(
      "Task update mode selection: 'append' (preserve all existing tasks and add new ones), 'overwrite' (clear all incomplete tasks and completely replace, preserve completed tasks), 'selective' (smart update: update existing tasks based on task name matching, preserve tasks not in list, recommended for task fine-tuning), 'clearAllTasks' (clear all tasks and create backup).\nDefaults to 'clearAllTasks' mode, only use other modes when user requests changes or modifications to plan content"
    ),
  tasks: z
    .array(
      z.object({
        name: z
          .string()
          .max(100, {
            message: "Task name is too long, please limit to 100 characters",
          })
          .describe("Concise and clear task name that should express the task purpose"),
        description: z
          .string()
          .min(10, {
            message: "Task description is too short, please provide more details to ensure understanding",
          })
          .describe("Detailed task description including implementation points, technical details and acceptance criteria"),
        implementationGuide: z
          .string()
          .describe(
            "Specific implementation methods and steps for this task, please provide concise pseudocode referring to previous analysis results"
          ),
        dependencies: z
          .array(z.string())
          .optional()
          .describe(
            "List of prerequisite task IDs or task names that this task depends on, supports two reference methods, name reference is more intuitive, is a string array"
          ),
        notes: z
          .string()
          .optional()
          .describe("Supplementary notes, special handling requirements or implementation suggestions (optional)"),
        relatedFiles: z
          .array(
            z.object({
              path: z
                .string()
                .min(1, {
                  message: "File path cannot be empty",
                })
                .describe("File path, can be relative to project root or absolute path"),
              type: z
                .nativeEnum(RelatedFileType)
                .describe(
                  "File type (TO_MODIFY: To be modified, REFERENCE: Reference material, CREATE: To be created, DEPENDENCY: Dependency file, OTHER: Other)"
                ),
              description: z
                .string()
                .min(1, {
                  message: "File description cannot be empty",
                })
                .describe("File description explaining the purpose and content of the file"),
              lineStart: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("Starting line of relevant code block (optional)"),
              lineEnd: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("Ending line of relevant code block (optional)"),
            })
          )
          .optional()
          .describe(
            "List of files related to the task, used to record code files, reference materials, files to be created, etc. (optional)"
          ),
        verificationCriteria: z
          .string()
          .optional()
          .describe("Verification standards and inspection methods for this specific task"),
      })
    )
    .min(1, {
      message: "Please provide at least one task",
    })
    .describe(
      "Structured task list, each task should maintain atomicity and have clear completion criteria, avoid overly simple tasks, simple modifications can be integrated with other tasks, avoid too many tasks"
    ),
  globalAnalysisResult: z
    .string()
    .optional()
    .describe("Final task objective, common parts from previous analysis applicable to all tasks"),
});

export async function splitTasks({
  updateMode,
  tasks,
  globalAnalysisResult,
}: z.infer<typeof splitTasksSchema>) {
  try {
    // Check for duplicate names in tasks
    const nameSet = new Set();
    for (const task of tasks) {
      if (nameSet.has(task.name)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Duplicate task names exist in tasks parameter, please ensure each task name is unique",
            },
          ],
        };
      }
      nameSet.add(task.name);
    }

    // Handle tasks based on different update modes
    let message = "";
    let actionSuccess = true;
    let backupFile = null;
    let createdTasks: Task[] = [];
    let allTasks: Task[] = [];

    // Convert task data to format compatible with batchCreateOrUpdateTasks
    const convertedTasks = tasks.map((task) => ({
      name: task.name,
      description: task.description,
      notes: task.notes,
      dependencies: task.dependencies,
      implementationGuide: task.implementationGuide,
      verificationCriteria: task.verificationCriteria,
      relatedFiles: task.relatedFiles?.map((file) => ({
        path: file.path,
        type: file.type as RelatedFileType,
        description: file.description,
        lineStart: file.lineStart,
        lineEnd: file.lineEnd,
      })),
    }));

    // Handle clearAllTasks mode
    if (updateMode === "clearAllTasks") {
      const clearResult = await modelClearAllTasks();

      if (clearResult.success) {
        message = clearResult.message;
        backupFile = clearResult.backupFile;

        try {
          // Create new tasks after clearing
          createdTasks = await batchCreateOrUpdateTasks(
            convertedTasks,
            "append",
            globalAnalysisResult
          );
          message += `\nSuccessfully created ${createdTasks.length} new tasks.`;
        } catch (error) {
          actionSuccess = false;
          message += `\nError occurred while creating new tasks: ${
            error instanceof Error ? error.message : String(error)
          }`;
        }
      } else {
        actionSuccess = false;
        message = clearResult.message;
      }
    } else {
      // For other modes, directly use batchCreateOrUpdateTasks
      try {
        createdTasks = await batchCreateOrUpdateTasks(
          convertedTasks,
          updateMode,
          globalAnalysisResult
        );

        // Generate message based on different update modes
        switch (updateMode) {
          case "append":
            message = `Successfully appended ${createdTasks.length} new tasks.`;
            break;
          case "overwrite":
            message = `Successfully cleared incomplete tasks and created ${createdTasks.length} new tasks.`;
            break;
          case "selective":
            message = `Successfully selectively updated/created ${createdTasks.length} tasks.`;
            break;
        }
      } catch (error) {
        actionSuccess = false;
        message = `Task creation failed: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }

    // Get all tasks for displaying dependencies
    try {
      allTasks = await getAllTasks();
    } catch (error) {
      allTasks = [...createdTasks]; // If retrieval fails, at least use newly created tasks
    }

    // Use prompt generator to get final prompt
    const prompt = getSplitTasksPrompt({
      updateMode,
      createdTasks,
      allTasks,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
      ephemeral: {
        taskCreationResult: {
          success: actionSuccess,
          message,
          backupFilePath: backupFile,
        },
      },
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text:
            "Error occurred while executing task splitting: " +
            (error instanceof Error ? error.message : String(error)),
        },
      ],
    };
  }
}
