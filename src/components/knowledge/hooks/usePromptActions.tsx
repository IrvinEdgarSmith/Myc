import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { PromptCategory, Prompt, NewPromptFormData, SelectedPromptData } from '../types/promptTypes';

interface UsePromptActionsProps {
  systemPromptCategories: PromptCategory[];
  setSystemPromptCategories: React.Dispatch<React.SetStateAction<PromptCategory[]>>;
  userPromptCategories: PromptCategory[];
  setUserPromptCategories: React.Dispatch<React.SetStateAction<PromptCategory[]>>;
  activeTab: string;
}

export const usePromptActions = ({
  systemPromptCategories,
  setSystemPromptCategories,
  userPromptCategories,
  setUserPromptCategories,
  activeTab
}: UsePromptActionsProps) => {
  const [isNewPromptOpen, setIsNewPromptOpen] = useState(false);
  const [isEditPromptOpen, setIsEditPromptOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<SelectedPromptData | null>(null);
  const [newPrompt, setNewPrompt] = useState<NewPromptFormData>({
    title: '',
    description: '',
    content: '',
    categoryId: ''
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Prompt copied to clipboard" });
  };

  const handleAddPrompt = () => {
    console.log('handleAddPrompt called with:', newPrompt);
    
    if (!newPrompt.title || !newPrompt.content || !newPrompt.categoryId) {
      toast({ 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    const newPromptItem: Prompt = {
      id: `prompt-${Date.now()}`,
      title: newPrompt.title,
      description: newPrompt.description,
      content: newPrompt.content
    };

    console.log('Adding new prompt:', newPromptItem);
    console.log('To active tab:', activeTab);
    console.log('In category:', newPrompt.categoryId);

    if (activeTab === 'system') {
      setSystemPromptCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          if (category.id === newPrompt.categoryId) {
            console.log('Found matching category:', category.title);
            return {
              ...category,
              prompts: [...category.prompts, newPromptItem]
            };
          }
          return category;
        });
        console.log('Updated system categories:', updatedCategories);
        return updatedCategories;
      });
    } else {
      setUserPromptCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          if (category.id === newPrompt.categoryId) {
            console.log('Found matching category:', category.title);
            return {
              ...category,
              prompts: [...category.prompts, newPromptItem]
            };
          }
          return category;
        });
        console.log('Updated user categories:', updatedCategories);
        return updatedCategories;
      });
    }

    // Reset form and close dialog
    setNewPrompt({
      title: '',
      description: '',
      content: '',
      categoryId: ''
    });
    setIsNewPromptOpen(false);
    toast({ description: "Prompt added successfully" });
  };

  const handleEditPrompt = () => {
    console.log('handleEditPrompt called with:', newPrompt);
    console.log('Selected prompt:', selectedPrompt);
    
    if (!selectedPrompt || !newPrompt.title || !newPrompt.content) {
      toast({ 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    const updatedPrompt: Prompt = {
      id: selectedPrompt.prompt.id,
      title: newPrompt.title,
      description: newPrompt.description,
      content: newPrompt.content
    };

    console.log('Updating prompt to:', updatedPrompt);

    if (activeTab === 'system') {
      setSystemPromptCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          if (category.id === selectedPrompt.categoryId) {
            return {
              ...category,
              prompts: category.prompts.map(prompt => 
                prompt.id === selectedPrompt.prompt.id ? updatedPrompt : prompt
              )
            };
          }
          return category;
        });
        console.log('Updated system categories after edit:', updatedCategories);
        return updatedCategories;
      });
    } else {
      setUserPromptCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          if (category.id === selectedPrompt.categoryId) {
            return {
              ...category,
              prompts: category.prompts.map(prompt => 
                prompt.id === selectedPrompt.prompt.id ? updatedPrompt : prompt
              )
            };
          }
          return category;
        });
        console.log('Updated user categories after edit:', updatedCategories);
        return updatedCategories;
      });
    }

    // Reset form and close dialog
    setSelectedPrompt(null);
    setNewPrompt({
      title: '',
      description: '',
      content: '',
      categoryId: ''
    });
    setIsEditPromptOpen(false);
    toast({ description: "Prompt updated successfully" });
  };

  const handleDeletePrompt = (promptId: string, categoryId: string) => {
    console.log('Deleting prompt:', promptId, 'from category:', categoryId);
    
    if (activeTab === 'system') {
      setSystemPromptCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          if (category.id === categoryId) {
            return {
              ...category,
              prompts: category.prompts.filter(prompt => prompt.id !== promptId)
            };
          }
          return category;
        });
        console.log('Updated system categories after delete:', updatedCategories);
        return updatedCategories;
      });
    } else {
      setUserPromptCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          if (category.id === categoryId) {
            return {
              ...category,
              prompts: category.prompts.filter(prompt => prompt.id !== promptId)
            };
          }
          return category;
        });
        console.log('Updated user categories after delete:', updatedCategories);
        return updatedCategories;
      });
    }

    toast({ description: "Prompt deleted successfully" });
  };

  const openEditPromptDialog = (prompt: Prompt, categoryId: string) => {
    console.log('Opening edit dialog for prompt:', prompt, 'in category:', categoryId);
    setSelectedPrompt({ prompt, categoryId });
    setNewPrompt({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      categoryId: categoryId
    });
    setIsEditPromptOpen(true);
  };

  return {
    isNewPromptOpen,
    setIsNewPromptOpen,
    isEditPromptOpen,
    setIsEditPromptOpen,
    selectedPrompt,
    setSelectedPrompt,
    newPrompt,
    setNewPrompt,
    copyToClipboard,
    handleAddPrompt,
    handleEditPrompt,
    handleDeletePrompt,
    openEditPromptDialog
  };
};
