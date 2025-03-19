import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KnowledgeItemForm from './KnowledgeItemForm';

interface CreateKnowledgeItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialFolderId?: string;
}

const CreateKnowledgeItemDialog: React.FC<CreateKnowledgeItemDialogProps> = ({
  isOpen,
  onOpenChange,
  initialFolderId
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Knowledge Item</DialogTitle>
        </DialogHeader>
        <KnowledgeItemForm 
          onClose={handleClose}
          initialFolderId={initialFolderId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateKnowledgeItemDialog;
