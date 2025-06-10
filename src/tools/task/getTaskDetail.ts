import { z } from "zod";
import { searchTasksWithCommand } from "../../models/taskModel.js";
import { getGetTaskDetailPrompt } from "../../prompts/index.js";

// Parameters for getting complete task details
export const getTaskDetailSchema = z.object({
  taskId: z
    .string()
    .min(1, {
      message: "Task ID cannot be empty, please provide a valid task ID",
    })
    .describe("Task ID to view details for"),
});

// Get complete task details
export async function getTaskDetail({
  taskId,
}: z.infer<typeof getTaskDetailSchema>) {
  try {
    // Use searchTasksWithCommand instead of getTaskById to search tasks in memory area
    // Set isId to true to search by ID; page 1 with page size 1
    const result = await searchTasksWithCommand(taskId, true, 1, 1);

    // Check if task was found
    if (result.tasks.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `## Error\n\nCould not find task with ID \`${taskId}\`. Please verify the task ID is correct.`,
          },
        ],
        isError: true,
      };
    }

    // Get the found task (first and only one)
    const task = result.tasks[0];

    // Use prompt generator to get final prompt
    const prompt = getGetTaskDetailPrompt({
      taskId,
      task,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
    };
  } catch (error) {
    // Use prompt generator to get error message
    const errorPrompt = getGetTaskDetailPrompt({
      taskId,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      content: [
        {
          type: "text" as const,
          text: errorPrompt,
        },
      ],
    };
  }
}
