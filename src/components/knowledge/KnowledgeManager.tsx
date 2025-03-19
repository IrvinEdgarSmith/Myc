import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import KnowledgeItemsList from './items/KnowledgeItemsList';
import KnowledgeFoldersList from './KnowledgeFoldersList';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useKnowledge } from '@/context/KnowledgeContext';
import { KnowledgeItem, KnowledgeFolder } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import NewKnowledgeItemDialog from './items/NewKnowledgeItemDialog';

interface KnowledgeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
}

const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ isOpen, onClose, workspaceId }) => {
  const [activeTab, setActiveTab] = useState('items');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const { linkKnowledgeToWorkspace } = useWorkspace();
  const { knowledgeItems, folders } = useKnowledge();
  
  const handleLinkToWorkspace = (id: string) => {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "No workspace selected.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      linkKnowledgeToWorkspace(workspaceId, id);
      
      toast({
        title: "Knowledge linked",
        description: "The knowledge has been linked to the workspace.",
      });
    } catch (error) {
      console.error("Error linking knowledge to workspace:", error);
      toast({
        title: "Error",
        description: "There was an error linking the knowledge. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Knowledge Management</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-auto mb-4">
            <TabsTrigger value="items">Knowledge Items</TabsTrigger>
            <TabsTrigger value="folders">Knowledge Folders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="flex-1 overflow-hidden">
            <div className="flex justify-end mb-4">
              <Button 
                variant="default" 
                onClick={() => setIsNewItemDialogOpen(true)}
                className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Knowledge Item
              </Button>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4">
                <KnowledgeItemsList 
                  workspaceId={workspaceId}
                  onLinkToWorkspace={handleLinkToWorkspace}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="folders" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <KnowledgeFoldersList 
                  workspaceId={workspaceId}
                  onLinkToWorkspace={handleLinkToWorkspace}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <NewKnowledgeItemDialog 
          isOpen={isNewItemDialogOpen} 
          onOpenChange={setIsNewItemDialogOpen} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeManager;
