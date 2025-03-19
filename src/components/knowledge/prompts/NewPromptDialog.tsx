import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { NewPromptFormData, PromptCategory } from '../types/promptTypes';

interface NewPromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newPrompt: NewPromptFormData;
  onPromptChange: (prompt: NewPromptFormData) => void;
  onSave: () => void;
  categories: PromptCategory[];
}

const NewPromptDialog: React.FC<NewPromptDialogProps> = ({
  isOpen,
  onOpenChange,
  newPrompt,
  onPromptChange,
  onSave,
  categories
}) => {
  console.log('Rendering NewPromptDialog with categories:', categories);
  console.log('Current newPrompt state:', newPrompt);
  
  const handleSave = () => {
    console.log('Save button clicked with data:', newPrompt);
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Prompt</DialogTitle>
          <DialogDescription>
            Create a new prompt to add to your library.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select 
              id="category"
              className="w-full p-2 rounded-md border border-mycelial-border/20 bg-mycelial-card/30"
              value={newPrompt.categoryId}
              onChange={(e) => {
                console.log('Category selected:', e.target.value);
                onPromptChange({...newPrompt, categoryId: e.target.value});
              }}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={newPrompt.title}
              onChange={(e) => onPromptChange({...newPrompt, title: e.target.value})}
              placeholder="Prompt title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={newPrompt.description}
              onChange={(e) => onPromptChange({...newPrompt, description: e.target.value})}
              placeholder="Short description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content" 
              rows={5}
              value={newPrompt.content}
              onChange={(e) => onPromptChange({...newPrompt, content: e.target.value})}
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
          <Button onClick={handleSave}>Save Prompt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPromptDialog;
