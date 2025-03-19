import { useState, useEffect } from 'react';
import { useKnowledge } from '@/context/KnowledgeContext';
import { KnowledgeItem, KnowledgeFolder } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export const useFolderEditor = (
  folderId: string | null,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void
) => {
  const { folders, knowledgeItems, getFolderById, updateFolder } = useKnowledge();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load folder data when dialog opens or folderId changes
  useEffect(() => {
    if (folderId && isOpen) {
      const folder = getFolderById(folderId);
      if (folder) {
        setName(folder.name || '');
        setDescription(folder.description || '');
        setParentFolderId(folder.parentFolderId || null);
        setSelectedItems(folder.items || []);
      }
    }
  }, [folderId, isOpen, getFolderById]);
  
  // Get valid parent folders (exclude self and any descendants to prevent loops)
  const getValidParentFolders = (): KnowledgeFolder[] => {
    if (!folderId) return folders;
    
    // Function to recursively find all descendant folder IDs
    const findDescendantIds = (currentFolderId: string, accum: Set<string> = new Set()): Set<string> => {
      const descendants = folders.filter(f => f.parentFolderId === currentFolderId);
      
      descendants.forEach(descendant => {
        accum.add(descendant.id);
        findDescendantIds(descendant.id, accum);
      });
      
      return accum;
    };
    
    // Get all descendants of the current folder
    const descendantIds = findDescendantIds(folderId);
    // Add self to exclusion list
    descendantIds.add(folderId);
    
    // Return all folders except self and descendants
    return folders.filter(folder => !descendantIds.has(folder.id));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderId) return;
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      updateFolder(folderId, {
        name,
        description,
        parentFolderId: parentFolderId || undefined,
        items: selectedItems,
      });
      
      toast({
        title: "Folder updated",
        description: "The folder has been updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the folder",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    name,
    setName,
    description,
    setDescription,
    parentFolderId,
    setParentFolderId,
    isSubmitting,
    selectedItems,
    setSelectedItems,
    searchTerm,
    setSearchTerm,
    handleSubmit,
    validParentFolders: getValidParentFolders()
  };
};
