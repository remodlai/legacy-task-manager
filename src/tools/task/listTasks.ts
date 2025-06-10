import { z } from "zod";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus } from "../../types/index.js";
import { getListTasksPrompt } from "../../prompts/index.js";

export const listTasksSchema = z.object({
  status: z
    .enum(["all", "pending", "in_progress", "completed"])
    .describe("Task status to list - can choose 'all' to list all tasks, or specify a specific status"),
});

// List tasks tool
export async function listTasks({ status }: z.infer<typeof listTasksSchema>) {
  const tasks = await getAllTasks();
  let filteredTasks = tasks;
  switch (status) {
    case "all":
      break;
    case "pending":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.PENDING
      );
      break;
    case "in_progress":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS
      );
      break;
    case "completed":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      break;
  }

  if (filteredTasks.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## System Notification\n\nThere are currently no ${
            status === "all" ? "" : `${status} `
          }tasks in the system. Please query other task statuses or first use the 'split_tasks' tool to create a task structure before proceeding with further operations.`,
        },
      ],
    };
  }

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  // Use prompt generator to get final prompt
  const prompt = getListTasksPrompt({
    status,
    tasks: tasksByStatus,
    allTasks: filteredTasks,
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
