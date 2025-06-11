import { z } from "zod";
import { getReflectTaskPrompt } from "../../prompts/index.js";

// Task reflection tool
export const reflectTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "Task summary cannot be less than 10 characters. Please provide a more detailed description to ensure clear task objectives",
    })
    .describe("Structured task summary, maintaining consistency with the analysis phase to ensure continuity"),
  analysis: z
    .string()
    .min(100, {
      message: "Technical analysis content is not detailed enough. Please provide complete technical analysis and implementation plan",
    })
    .describe(
      "Complete and detailed technical analysis results, including all technical details, dependencies and implementation plans. If code needs to be provided, use pseudocode format and only provide high-level logic flow and key steps, avoiding complete code"
    ),
});

export async function reflectTask({
  summary,
  analysis,
}: z.infer<typeof reflectTaskSchema>) {
  // Use prompt generator to get final prompt
  const prompt = getReflectTaskPrompt({
    summary,
    analysis,
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
