import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KnowledgeItem } from '@/types';
import { useKnowledge } from '@/context/KnowledgeContext';
import KnowledgeItemForm from './KnowledgeItemForm';
import { useToast } from '@/components/ui/use-toast';

export interface NewItemDialogProps {
  isOpen: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  folderId?: string | null;
}

const NewItemDialog: React.FC<NewItemDialogProps> = ({ isOpen, onOpenChange, folderId }) => {
  const { createKnowledgeItem } = useKnowledge();
  const { toast } = useToast();

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Knowledge Item</DialogTitle>
        </DialogHeader>
        <KnowledgeItemForm 
          onClose={handleCancel}
          initialFolderId={folderId || undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewItemDialog;
