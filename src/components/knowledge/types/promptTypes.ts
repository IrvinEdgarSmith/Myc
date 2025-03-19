// Define the type for prompt categories
export interface PromptCategory {
  id: string;
  title: string;
  description: string;
  prompts: Prompt[];
  isCustom?: boolean;
}

// Define the type for individual prompts
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
}

// Alias for Prompt to fix the PromptCategoryItem error
export type PromptCategoryItem = Prompt;

export interface NewPromptFormData {
  title: string;
  description: string;
  content: string;
  categoryId: string;
}

export interface SelectedPromptData {
  prompt: Prompt;
  categoryId: string;
}

// Type for new category creation
export interface NewCategoryFormData {
  title: string;
  description: string;
}
