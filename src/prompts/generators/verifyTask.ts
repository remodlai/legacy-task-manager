/**
 * verifyTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";

/**
 * verifyTask prompt parameters interface
 */
export interface VerifyTaskPromptParams {
  task: Task;
  score: number;
  summary: string;
}

/**
 * Extract summary content
 * @param content original content
 * @param maxLength maximum length
 * @returns extracted summary
 */
function extractSummary(
  content: string | undefined,
  maxLength: number
): string {
  if (!content) return "";

  if (content.length <= maxLength) {
    return content;
  }

  // Simple summary extraction: take first maxLength characters and add ellipsis
  return content.substring(0, maxLength) + "...";
}

/**
 * Get the complete prompt for verifyTask
 * @param params prompt parameters
 * @returns generated prompt
 */
export function getVerifyTaskPrompt(params: VerifyTaskPromptParams): string {
  const { task, score, summary } = params;
  if (score < 80) {
    const noPassTemplate = loadPromptFromTemplate("verifyTask/noPass.md");
    const prompt = generatePrompt(noPassTemplate, {
      name: task.name,
      id: task.id,
      summary,
    });
    return prompt;
  }
  const indexTemplate = loadPromptFromTemplate("verifyTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    description: task.description,
    notes: task.notes || "no notes",
    verificationCriteria:
      task.verificationCriteria || "no verification criteria",
    implementationGuideSummary:
      extractSummary(task.implementationGuide, 200) ||
      "no implementation guide",
    analysisResult:
      extractSummary(task.analysisResult, 300) || "no analysis result",
  });

  // Load possible custom prompt
  return loadPrompt(prompt, "VERIFY_TASK");
}
