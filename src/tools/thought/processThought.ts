import { z } from "zod";
import {
  getProcessThoughtPrompt,
  ProcessThoughtPromptParams,
} from "../../prompts/generators/processThought.js";

/**
 * Parameter structure for processThought tool
 */
export const processThoughtSchema = z.object({
  thought: z
    .string()
    .min(1, {
      message: "Thought content cannot be empty, please provide valid thought content",
    })
    .describe("Thought content"),
  thought_number: z
    .number()
    .int()
    .positive({
      message: "Thought number must be a positive integer",
    })
    .describe("Current thought number"),
  total_thoughts: z
    .number()
    .int()
    .positive({
      message: "Total thoughts must be a positive integer",
    })
    .describe("Expected total number of thoughts, can be changed if more thinking is needed"),
  next_thought_needed: z.boolean().describe("Whether next thought is needed"),
  stage: z
    .string()
    .min(1, {
      message: "Thinking stage cannot be empty, please provide valid thinking stage",
    })
    .describe(
      "Thinking stage. Available stages include: Problem Definition, Information Gathering, Research, Analysis, Synthesis, Conclusion, Critical Questioning, and Planning."
    ),
  tags: z.array(z.string()).optional().describe("Thought tags, an array of strings"),
  axioms_used: z
    .array(z.string())
    .optional()
    .describe("Axioms used, an array of strings"),
  assumptions_challenged: z
    .array(z.string())
    .optional()
    .describe("Assumptions challenged, an array of strings"),
});

/**
 * Process a single thought and return formatted output
 */
export async function processThought(
  params: z.infer<typeof processThoughtSchema>
) {
  try {
    // Convert parameters to standardized ThoughtData format
    const thoughtData: ProcessThoughtPromptParams = {
      thought: params.thought,
      thoughtNumber: params.thought_number,
      totalThoughts: params.total_thoughts,
      nextThoughtNeeded: params.next_thought_needed,
      stage: params.stage,
      tags: params.tags || [],
      axioms_used: params.axioms_used || [],
      assumptions_challenged: params.assumptions_challenged || [],
    };

    // Ensure thought number does not exceed total thoughts
    if (thoughtData.thoughtNumber > thoughtData.totalThoughts) {
      // Automatically adjust total thoughts count
      thoughtData.totalThoughts = thoughtData.thoughtNumber;
    }

    // Format thought output
    const formattedThought = getProcessThoughtPrompt(thoughtData);

    // Return successful response
    return {
      content: [
        {
          type: "text" as const,
          text: formattedThought,
        },
      ],
    };
  } catch (error) {
    // Catch and handle all unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Error processing thought: ${errorMessage}`,
        },
      ],
    };
  }
}
