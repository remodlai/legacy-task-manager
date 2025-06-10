import { z } from "zod";
import { getAnalyzeTaskPrompt } from "../../prompts/index.js";

// Task analysis tool
export const analyzeTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "Task summary cannot be less than 10 characters, please provide more detailed description to ensure clear task objectives",
    })
    .describe(
      "Structured task summary including task objectives, scope and key technical challenges, minimum 10 characters"
    ),
  initialConcept: z
    .string()
    .min(50, {
      message:
        "Initial solution concept cannot be less than 50 characters, please provide more detailed content to ensure technical solution clarity",
    })
    .describe(
      "Initial solution concept of minimum 50 characters, including technical approach, architecture design and implementation strategy. If code is needed, use pseudocode format and only provide high-level logic flow and key steps avoiding complete code"
    ),
  previousAnalysis: z
    .string()
    .optional()
    .describe("Previous iteration's analysis results, used for continuous solution improvement (only required for re-analysis)"),
});

export async function analyzeTask({
  summary,
  initialConcept,
  previousAnalysis,
}: z.infer<typeof analyzeTaskSchema>) {
  // Use prompt generator to get final prompt
  const prompt = getAnalyzeTaskPrompt({
    summary,
    initialConcept,
    previousAnalysis,
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
