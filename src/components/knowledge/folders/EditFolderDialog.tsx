import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FolderDetailsForm from './FolderDetailsForm';
import FolderItemSelector from './FolderItemSelector';
import { useFolderEditor } from './useFolderEditor';
import { useKnowledge } from '@/context/KnowledgeContext';

interface EditFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string | null;
}

const EditFolderDialog: React.FC<EditFolderDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  folderId
}) => {
  const { knowledgeItems } = useKnowledge();
  const {
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
    validParentFolders
  } = useFolderEditor(folderId, isOpen, onOpenChange);

  // Safe guard to prevent rendering if no folder ID
  if (!folderId) return null;

  // Extract IDs from selected items
  const selectedItemIds = selectedItems.map(item => item.id);

  // Handle item selection changes
  const handleItemsChange = (itemIds: string[]) => {
    const newSelectedItems = knowledgeItems.filter(item => itemIds.includes(item.id));
    setSelectedItems(newSelectedItems);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => {
      if (!open && !isSubmitting) {
        onOpenChange(false);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Folder</DialogTitle>
          <DialogDescription>
            Update this knowledge folder's details, parent folder, and linked items.
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
            currentFolderId={folderId}
          />
          
          <FolderItemSelector
            items={knowledgeItems}
            selectedItemIds={selectedItemIds}
            onItemsChange={handleItemsChange}
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
              {isSubmitting ? 'Updating...' : 'Update Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFolderDialog;
