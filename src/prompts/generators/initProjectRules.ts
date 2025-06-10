/**
 * initProjectRules prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import { loadPrompt, loadPromptFromTemplate } from "../loader.js";
/**
 * initProjectRules prompt parameters interface
 */
export interface InitProjectRulesPromptParams {
  // Currently no additional parameters, can be expanded in the future as needed
}

/**
 * Get the complete prompt for initProjectRules
 * @param params prompt parameters (optional)
 * @returns generated prompt
 */
export function getInitProjectRulesPrompt(
  params?: InitProjectRulesPromptParams
): string {
  const indexTemplate = loadPromptFromTemplate("initProjectRules/index.md");

  // Load possible custom prompt (override or append via environment variables)
  return loadPrompt(indexTemplate, "INIT_PROJECT_RULES");
}
