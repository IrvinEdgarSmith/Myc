import { useState, useEffect } from 'react';
import { PromptCategory } from '../types/promptTypes';
import { initialSystemPromptCategories } from '../data/systemPromptCategories';
import { initialUserPromptCategories } from '../data/userPromptCategories';

// Custom hook to manage prompt categories
export const usePromptCategories = () => {
  // System prompts organized by category
  const [systemPromptCategories, setSystemPromptCategories] = useState<PromptCategory[]>(initialSystemPromptCategories);

  // User prompts organized by category
  const [userPromptCategories, setUserPromptCategories] = useState<PromptCategory[]>(initialUserPromptCategories);

  useEffect(() => {
    console.log('System Categories:', systemPromptCategories);
    console.log('User Categories:', userPromptCategories);
  }, [systemPromptCategories, userPromptCategories]);

  return {
    systemPromptCategories,
    setSystemPromptCategories,
    userPromptCategories,
    setUserPromptCategories
  };
};
