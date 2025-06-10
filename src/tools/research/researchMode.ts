import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { getResearchModePrompt } from "../../prompts/index.js";

// Research mode tool
export const researchModeSchema = z.object({
  topic: z
    .string()
    .min(5, {
      message: "Research topic must be at least 5 characters, please provide a clear research topic",
    })
    .describe("The content of the programming topic to be researched, should be clear and specific"),
  previousState: z
    .string()
    .optional()
    .default("")
    .describe(
      "Previous research status and content summary, empty on first execution, subsequent executions will include detailed and critical research results, which will help subsequent research"
    ),
  currentState: z
    .string()
    .describe(
      "The current content that the Agent should execute, such as using network tools to search for certain keywords or analyze specific code, please call research_mode to record the status and integrate it with the previous `previousState`, this will help you better save and execute research content"
    ),
  nextSteps: z
    .string()
    .describe(
      "Subsequent plans, steps, or research directions, used to constrain the Agent from deviating from the topic or going in the wrong direction, if you find that the research direction needs to be adjusted during the research process, please update this field"
    ),
});

export async function researchMode({
  topic,
  previousState = "",
  currentState,
  nextSteps,
}: z.infer<typeof researchModeSchema>) {
  // Get base directory path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../../..");
  const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, "data");
  const MEMORY_DIR = path.join(DATA_DIR, "memory");

  // Use prompt generator to get final prompt
  const prompt = getResearchModePrompt({
    topic,
    previousState,
    currentState,
    nextSteps,
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
