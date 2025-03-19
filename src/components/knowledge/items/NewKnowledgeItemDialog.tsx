import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import KnowledgeItemForm from './KnowledgeItemForm';

interface NewKnowledgeItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialFolderId?: string;
}

const NewKnowledgeItemDialog: React.FC<NewKnowledgeItemDialogProps> = ({
  isOpen,
  onOpenChange,
  initialFolderId
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Knowledge Item</DialogTitle>
          <DialogDescription>
            Create a new knowledge item with up to 5 sections and 30 file attachments.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <KnowledgeItemForm 
            onClose={handleClose}
            initialFolderId={initialFolderId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewKnowledgeItemDialog;
