import { useState, useEffect, useCallback } from 'react';
import { useKnowledge } from '@/context/KnowledgeContext';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeBasin } from '@/types';

export const useBasinEditor = (basinId: string | null, isOpen: boolean, onOpenChange: (open: boolean) => void) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { getBasinById, knowledgeItems, updateBasin } = useKnowledge();

  // Load basin data when the dialog opens
  useEffect(() => {
    if (basinId && isOpen) {
      const basin = getBasinById(basinId);
      if (basin) {
        setName(basin.name || '');
        setDescription(basin.description || '');
        setSelectedItems(basin.items.map(item => item.id));
      }
    } else if (!isOpen) {
      // Reset form when dialog closes
      setName('');
      setDescription('');
      setSelectedItems([]);
      setSearchTerm('');
    }
  }, [basinId, isOpen, getBasinById]);

  // Handle form submission with better error handling
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !basinId) {
      toast({
        title: "Validation error",
        description: "Basin name is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the basin by ID
      const basin = getBasinById(basinId);
      
      if (!basin) {
        throw new Error("Basin not found");
      }
      
      // Get the selected knowledge items based on IDs
      const updatedItems = knowledgeItems.filter(item => selectedItems.includes(item.id));
      
      // Create a new basin object to avoid reference issues
      const updatedBasin: Partial<KnowledgeBasin> = {
        name: name.trim(),
        description: description.trim(),
        items: [...updatedItems], // Create a new array to avoid reference issues
        updatedAt: new Date()
      };
      
      // Update the basin
      updateBasin(basinId, updatedBasin);
      
      toast({
        title: "Basin updated",
        description: `${name} has been updated successfully`,
      });
      
      // Close the dialog after successful update
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating basin:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the basin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, basinId, selectedItems, knowledgeItems, updateBasin, onOpenChange, getBasinById]);

  return {
    name,
    setName,
    description,
    setDescription,
    isSubmitting,
    selectedItems,
    setSelectedItems,
    searchTerm,
    setSearchTerm,
    handleSubmit
  };
};
