import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus, Task } from "../../types/index.js";
import { getPlanTaskPrompt } from "../../prompts/index.js";

// Planning tool
export const planTaskSchema = z.object({
  description: z
    .string()
    .min(10, {
      message: "Task description cannot be less than 10 characters. Please provide a more detailed description to ensure clear task objectives",
    })
    .describe("Complete detailed task problem description, should include task objectives, background and expected outcomes"),
  requirements: z
    .string()
    .optional()
    .describe("Specific technical requirements, business constraints or quality standards for the task (optional)"),
  existingTasksReference: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to reference existing tasks as a planning basis, used for task adjustment and continuity planning"),
});

export async function planTask({
  description,
  requirements,
  existingTasksReference = false,
}: z.infer<typeof planTaskSchema>) {
  // Get base directory paths
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../../..");
  const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, "data");
  const MEMORY_DIR = path.join(DATA_DIR, "memory");

  // Prepare required parameters
  let completedTasks: Task[] = [];
  let pendingTasks: Task[] = [];

  // When existingTasksReference is true, load all tasks from database as reference
  if (existingTasksReference) {
    try {
      const allTasks = await getAllTasks();

      // Divide tasks into completed and incomplete categories
      completedTasks = allTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      pendingTasks = allTasks.filter(
        (task) => task.status !== TaskStatus.COMPLETED
      );
    } catch (error) {}
  }

  // Use prompt generator to get final prompt
  const prompt = getPlanTaskPrompt({
    description,
    requirements,
    existingTasksReference,
    completedTasks,
    pendingTasks,
    memoryDir: MEMORY_DIR,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
  };
}
