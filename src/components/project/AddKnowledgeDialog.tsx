import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useProject } from '@/context/ProjectContext';
import { useKnowledge } from '@/context/KnowledgeContext';
import { toast } from '@/components/ui/use-toast';
import EmptyItemsState from '@/components/knowledge/items/EmptyItemsState';

interface AddKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

const AddKnowledgeDialog: React.FC<AddKnowledgeDialogProps> = ({
  open,
  onOpenChange,
  projectId
}) => {
  const { projects, linkKnowledgeToProject } = useProject();
  const { knowledgeItems, folders } = useKnowledge();
  const [activeTab, setActiveTab] = useState('items');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  
  const project = projects.find(p => p.id === projectId);
  
  // Filter out already linked knowledge
  const availableItems = knowledgeItems.filter(item => 
    !project?.linkedKnowledge.includes(item.id)
  );
  
  const availableFolders = folders.filter(folder => 
    !project?.linkedKnowledge.includes(folder.id)
  );
  
  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
  
  const handleToggleFolder = (id: string) => {
    setSelectedFolders(prev => 
      prev.includes(id) 
        ? prev.filter(folderId => folderId !== id)
        : [...prev, id]
    );
  };
  
  const handleSave = () => {
    if (!projectId) return;
    
    // Link selected items
    selectedItems.forEach(itemId => {
      linkKnowledgeToProject(projectId, itemId);
    });
    
    // Link selected folders
    selectedFolders.forEach(folderId => {
      linkKnowledgeToProject(projectId, folderId);
    });
    
    toast({
      title: "Knowledge linked",
      description: `Successfully linked ${selectedItems.length} items and ${selectedFolders.length} folders to the project.`,
    });
    
    // Reset and close
    setSelectedItems([]);
    setSelectedFolders([]);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card">
        <DialogHeader>
          <DialogTitle>Add Knowledge to Project</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="items" className="flex-1">Knowledge Items</TabsTrigger>
            <TabsTrigger value="folders" className="flex-1">Knowledge Folders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Select knowledge items to link to this project. They will be available in the knowledge sidebar.
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border border-mycelial-border/20 p-2">
              {availableItems.length === 0 ? (
                <EmptyItemsState onCreateNewItem={() => {
                  onOpenChange(false);
                  // Navigate to knowledge items page logic would go here
                  toast({
                    title: "No items available",
                    description: "Create knowledge items in the Knowledge section first."
                  });
                }} />
              ) : (
                <div className="space-y-2">
                  {availableItems.map(item => (
                    <div key={item.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-mycelial-card/50">
                      <Checkbox 
                        id={`item-${item.id}`}
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleToggleItem(item.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`item-${item.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {item.title}
                        </label>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="folders" className="mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Select knowledge folders to link to this project. They will be available in the knowledge sidebar.
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border border-mycelial-border/20 p-2">
              {availableFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-sm mb-2">No knowledge folders available.</p>
                  <p className="text-xs text-muted-foreground">Create knowledge folders in the Knowledge section first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableFolders.map(folder => (
                    <div key={folder.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-mycelial-card/50">
                      <Checkbox 
                        id={`folder-${folder.id}`}
                        checked={selectedFolders.includes(folder.id)}
                        onCheckedChange={() => handleToggleFolder(folder.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`folder-${folder.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {folder.name}
                        </label>
                        <p className="text-xs text-muted-foreground line-clamp-2">{folder.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Selected: {selectedItems.length} items, {selectedFolders.length} folders
          </div>
          <Button 
            onClick={handleSave}
            disabled={selectedItems.length === 0 && selectedFolders.length === 0}
            className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
          >
            Link to Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddKnowledgeDialog;
