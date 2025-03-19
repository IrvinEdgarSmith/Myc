import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { NewPromptFormData } from '../types/promptTypes';

interface EditPromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  promptData: NewPromptFormData;
  onPromptChange: (prompt: NewPromptFormData) => void;
  onSave: () => void;
}

const EditPromptDialog: React.FC<EditPromptDialogProps> = ({
  isOpen,
  onOpenChange,
  promptData,
  onPromptChange,
  onSave
}) => {
  console.log('Rendering EditPromptDialog with data:', promptData);
  
  const handleSave = () => {
    console.log('Edit save button clicked with data:', promptData);
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogDescription>
            Update your existing prompt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input 
              id="edit-title" 
              value={promptData.title}
              onChange={(e) => onPromptChange({...promptData, title: e.target.value})}
              placeholder="Prompt title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input 
              id="edit-description" 
              value={promptData.description}
              onChange={(e) => onPromptChange({...promptData, description: e.target.value})}
              placeholder="Short description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea 
              id="edit-content" 
              rows={5}
              value={promptData.content}
              onChange={(e) => onPromptChange({...promptData, content: e.target.value})}
              placeholder="Prompt content"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Update Prompt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPromptDialog;
