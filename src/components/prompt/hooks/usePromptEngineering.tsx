import { useState, useEffect } from 'react';
import { PromptCategory, PromptCategoryItem } from '@/components/knowledge/types/promptTypes';
import { toast } from '@/components/ui/use-toast';
import { callOpenRouter } from '@/services/openRouterService';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { useProject } from '@/context/ProjectContext';
import { useKnowledge } from '@/context/KnowledgeContext';

interface SelectedPrompt {
  id: string;
  category: string;
  title: string;
  content: string;
  position: number;
}

interface PromptIteration {
  id: string;
  timestamp: Date;
  prompt: string;
  notes?: string;
  modelId?: string;
  response?: string;
}

export const usePromptEngineering = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<SelectedPrompt[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [customPrompt, setCustomPrompt] = useState<SelectedPrompt | null>(null);
  const [promptIterations, setPromptIterations] = useState<PromptIteration[]>([]);
  const [activeIteration, setActiveIteration] = useState<PromptIteration | null>(null);
  const [expandedIterations, setExpandedIterations] = useState<string[]>([]);
  
  // Get global settings for system prompt and OpenRouter API key
  const { settings } = useGlobalSettings();
  
  // Get project context for RAG
  const { projects, currentProjectId, addPromptHistory } = useProject();
  const { knowledgeItems, basins } = useKnowledge();

  // Toggle iteration expanded state
  const toggleIterationExpanded = (id: string) => {
    if (expandedIterations.includes(id)) {
      setExpandedIterations(expandedIterations.filter(itemId => itemId !== id));
    } else {
      setExpandedIterations([...expandedIterations, id]);
    }
  };

  // Function to add a prompt to the selected list
  const addPrompt = (prompt: PromptCategoryItem, category: string) => {
    const newPrompt: SelectedPrompt = {
      id: prompt.id,
      category,
      title: prompt.title,
      content: prompt.content,
      position: selectedPrompts.length + 1,
    };
    
    setSelectedPrompts([...selectedPrompts, newPrompt]);
    toast({
      title: "Prompt Added",
      description: `Added "${prompt.title}" to your prompt engineering recipe.`,
    });
  };

  // Function to remove a prompt from the selected list
  const removePrompt = (id: string) => {
    const updatedPrompts = selectedPrompts.filter(p => p.id !== id);
    // Update positions
    const reorderedPrompts = updatedPrompts.map((p, index) => ({
      ...p,
      position: index + 1,
    }));
    setSelectedPrompts(reorderedPrompts);
  };

  // Function to add a custom prompt ingredient
  const addCustomPrompt = () => {
    if (customPrompt) {
      setSelectedPrompts([...selectedPrompts, customPrompt]);
      setCustomPrompt(null);
      toast({
        title: "Custom Prompt Added",
        description: "Added your custom prompt ingredient to the recipe.",
      });
    } else {
      const newCustomPrompt: SelectedPrompt = {
        id: `custom-${Date.now()}`,
        category: 'custom',
        title: 'Custom Prompt',
        content: '',
        position: selectedPrompts.length + 1,
      };
      setCustomPrompt(newCustomPrompt);
    }
  };

  // Function to update custom prompt content
  const updateCustomPromptContent = (content: string) => {
    if (customPrompt) {
      setCustomPrompt({
        ...customPrompt,
        content,
      });
    }
  };

  // Function to cancel adding a custom prompt
  const cancelCustomPrompt = () => {
    setCustomPrompt(null);
  };

  // Helper function to get knowledge context for RAG
  const getKnowledgeContext = () => {
    if (!currentProjectId) return '';
    
    const currentProject = projects.find(p => p.id === currentProjectId);
    if (!currentProject || !currentProject.knowledgeInContext || currentProject.knowledgeInContext.length === 0) {
      return '';
    }
    
    let contextText = '### RAG Knowledge Context ###\n\n';
    
    // Add knowledge item content
    currentProject.knowledgeInContext.forEach(id => {
      // Check if it's a knowledge item
      const item = knowledgeItems.find(item => item.id === id);
      if (item) {
        contextText += `## ${item.title} ##\n${item.content}\n\n`;
        
        // Add sections if they exist
        if (item.sections && item.sections.length > 0) {
          item.sections.forEach(section => {
            contextText += `### ${section.title} ###\n${section.content}\n\n`;
          });
        }
        
        // Add file content if files exist
        if (item.files && item.files.length > 0) {
          item.files.forEach(file => {
            if (file.content) {
              contextText += `### File: ${file.name} ###\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
            }
          });
        }
      }
      
      // Check if it's a basin
      const basin = basins.find(basin => basin.id === id);
      if (basin) {
        contextText += `## Knowledge Basin: ${basin.name} ##\n${basin.description || ""}\n\n`;
        
        // Add all items in the basin
        const basinItems = knowledgeItems.filter(item => item.basinId === basin.id);
        basinItems.forEach(item => {
          contextText += `### ${item.title} ###\n${item.content}\n\n`;
          
          // Add sections if they exist
          if (item.sections && item.sections.length > 0) {
            item.sections.forEach(section => {
              contextText += `#### ${section.title} ####\n${section.content}\n\n`;
            });
          }
          
          // Add file content if files exist
          if (item.files && item.files.length > 0) {
            item.files.forEach(file => {
              if (file.content) {
                contextText += `#### File: ${file.name} ####\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
              }
            });
          }
        });
      }
    });
    
    return contextText;
  };

  // Function to construct the final prompt and use LLM to improve it
  const constructFinalPrompt = async (modelId?: string) => {
    if (selectedPrompts.length === 0) {
      toast({
        title: "No prompts selected",
        description: "Please select at least one prompt or add a custom prompt.",
        variant: "destructive",
      });
      return;
    }

    const sortedPrompts = [...selectedPrompts].sort((a, b) => a.position - b.position);
    
    // Create a better prompt format for the LLM to understand the components
    let promptForLLM = "I have several prompt components that I need you to combine into a cohesive prompt. Here are the components:\n\n";
    
    sortedPrompts.forEach((prompt, index) => {
      promptForLLM += `COMPONENT ${index + 1} (${prompt.title} - ${prompt.category}):\n${prompt.content}\n\n`;
    });
    
    promptForLLM += "USER INSTRUCTIONS:\n";
    promptForLLM += customInstructions || "Please combine all the prompt components above into one cohesive prompt.";
    
    // Add RAG context if available
    const knowledgeContext = getKnowledgeContext();
    
    let response = "";
    
    // Use the selected model from global settings if available, or fallback to provided modelId
    const modelToUse = modelId || settings.selectedPromptEngineerModelId;
    
    // If modelId is provided or available in settings, try to generate a response using the OpenRouter API
    if (modelToUse && settings.openRouterApiKey) {
      try {
        // Use the global system prompt from settings
        const systemPrompt = settings.defaultSystemPrompt || 
                           "You are an expert AI prompt engineer. Your job is to combine prompt components into a single, cohesive prompt that achieves the user's goal.";
        
        // Call OpenRouter API with the apiKey from settings
        const result = await callOpenRouter({
          modelId: modelToUse,
          prompt: promptForLLM,
          systemPrompt: knowledgeContext ? `${systemPrompt}\n\n${knowledgeContext}` : systemPrompt,
          temperature: 0.7,
          apiKey: settings.openRouterApiKey,
        });
        
        if (result && result.choices && result.choices.length > 0) {
          response = result.choices[0].message.content || "";
        } else {
          toast({
            title: "No response from model",
            description: "The model didn't return any content. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error calling OpenRouter:", error);
        toast({
          title: "Error generating response",
          description: "There was an error generating a response with the selected model.",
          variant: "destructive",
        });
      }
    } else if (!settings.openRouterApiKey) {
      toast({
        title: "OpenRouter API Key Missing",
        description: "Add your OpenRouter API key in Knowledge Center Settings to use AI models.",
        variant: "destructive",
      });
      
      // Fall back to manual combination without AI improvement
      response = sortedPrompts.map(p => p.content).join("\n\n");
    } else if (!settings.selectedPromptEngineerModelId && !modelId) {
      toast({
        title: "No Model Selected",
        description: "Select a model in Knowledge Center Settings to generate responses.",
        variant: "destructive",
      });
      
      // Fall back to manual combination without AI improvement
      response = sortedPrompts.map(p => p.content).join("\n\n");
    }
    
    // Copy response to clipboard if we got one
    if (response) {
      navigator.clipboard.writeText(response);
    } else {
      // If no response was generated, create a basic combination
      const fallbackPrompt = sortedPrompts.map(p => p.content).join("\n\n");
      navigator.clipboard.writeText(fallbackPrompt);
      response = fallbackPrompt;
    }
    
    // Add to iterations
    const newIteration: PromptIteration = {
      id: `iteration-${Date.now()}`,
      timestamp: new Date(),
      prompt: promptForLLM,
      notes: `Prompt combined from ${sortedPrompts.length} components`,
      modelId: modelToUse,
      response: response
    };
    
    setPromptIterations([newIteration, ...promptIterations]);
    setActiveIteration(newIteration);
    setExpandedIterations([newIteration.id, ...expandedIterations]);
    
    // Save to project prompt history if in a project
    if (currentProjectId) {
      addPromptHistory(currentProjectId, {
        id: newIteration.id,
        prompt: promptForLLM,
        response: response,
        timestamp: new Date()
      });
    }
    
    toast({
      title: "Prompt Constructed",
      description: modelToUse && settings.openRouterApiKey
        ? "Your engineered prompt has been processed with the selected model, improved, and copied to clipboard."
        : "Your engineered prompt has been combined and copied to clipboard (without AI improvement).",
    });
    
    return response;
  };

  // Function to copy an iteration to clipboard
  const copyIteration = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to Clipboard",
      description: "Prompt iteration has been copied to clipboard.",
    });
  };

  return {
    activeCategory,
    setActiveCategory,
    selectedPrompts,
    setSelectedPrompts,
    customInstructions,
    setCustomInstructions,
    customPrompt,
    setCustomPrompt,
    promptIterations,
    activeIteration,
    expandedIterations,
    toggleIterationExpanded,
    addPrompt,
    removePrompt,
    addCustomPrompt,
    updateCustomPromptContent,
    cancelCustomPrompt,
    constructFinalPrompt,
    copyIteration,
    globalSystemPrompt: settings.defaultSystemPrompt,
    hasOpenRouterApiKey: !!settings.openRouterApiKey,
    selectedModelId: settings.selectedPromptEngineerModelId
  };
};

export type UsePromptEngineeringReturn = ReturnType<typeof usePromptEngineering>;
