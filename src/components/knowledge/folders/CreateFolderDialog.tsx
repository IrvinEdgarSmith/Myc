import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FolderDetailsForm from './FolderDetailsForm';
import FolderItemSelector from './FolderItemSelector';
import { useKnowledge } from '@/context/KnowledgeContext';
import { toast } from '@/components/ui/use-toast';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({ isOpen, onOpenChange }) => {
  const { folders, knowledgeItems, createFolder } = useKnowledge();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      createFolder(name, description, selectedItemIds, parentFolderId || undefined);
      
      toast({
        title: "Folder created",
        description: "The folder has been created successfully",
      });
      
      // Reset form
      setName('');
      setDescription('');
      setParentFolderId(null);
      setSelectedItemIds([]);
      setSearchTerm('');
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Create failed",
        description: "There was an error creating the folder",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => {
      if (!open && !isSubmitting) {
        onOpenChange(false);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Knowledge Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your knowledge items.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
          <FolderDetailsForm 
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            parentFolderId={parentFolderId}
            setParentFolderId={setParentFolderId}
          />
          
          <FolderItemSelector
            items={knowledgeItems}
            selectedItemIds={selectedItemIds}
            onItemsChange={setSelectedItemIds}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
