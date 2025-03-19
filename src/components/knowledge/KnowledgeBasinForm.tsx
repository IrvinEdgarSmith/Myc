import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useKnowledge } from '@/context/KnowledgeContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KnowledgeItem } from '@/types';

interface KnowledgeBasinFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const KnowledgeBasinForm: React.FC<KnowledgeBasinFormProps> = ({ 
  isOpen, 
  onOpenChange
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { createFolder, knowledgeItems } = useKnowledge();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSelectedItems([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    
    // Create the folder with selected knowledge items
    createFolder(name.trim(), description.trim(), selectedItems);
    
    // Reset form
    setName('');
    setDescription('');
    setSelectedItems([]);
    setSearchTerm('');
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Filter knowledge items based on search term
  const filteredItems = knowledgeItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Knowledge Folder</DialogTitle>
          <DialogDescription>
            Create a new knowledge folder to organize related knowledge items and prompts.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
          <div className="grid gap-2">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="folder-description">Description</Label>
            <Textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter folder description"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2 flex-1 overflow-hidden">
            <Label>Link Knowledge Items</Label>
            <p className="text-sm text-muted-foreground">
              Select one or more knowledge items to link to this folder
            </p>
            
            <Input
              placeholder="Search knowledge items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            
            <div className="border rounded-md overflow-hidden flex-1">
              <ScrollArea className="h-[250px] w-full">
                {knowledgeItems.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No knowledge items available. Create some in the Knowledge Items tab.
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredItems.map(item => (
                      <div key={item.id} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md">
                        <Checkbox 
                          id={`item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemSelection(item.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`item-${item.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {item.title}
                          </label>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
          </div>
          
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

export default KnowledgeBasinForm;
