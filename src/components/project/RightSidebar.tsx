import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Book, Check, ArrowRight, File, Database, Folder, Link, Unlink } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import KnowledgeItemsList from '@/components/knowledge/KnowledgeItemsList';
import KnowledgeGallery from '@/components/knowledge/KnowledgeGallery';
import ProjectKnowledgeItem from '@/components/project/ProjectKnowledgeItem';
import { KnowledgeFolder, KnowledgeItem } from '@/types';

interface RightSidebarProps {
  activeTab: string;
  project: any;
  linkedItems: KnowledgeItem[];
  linkedFolders: KnowledgeFolder[];
  expandedIterations: string[];
  selectedIteration: string | null;
  toggleIterationExpanded: (id: string) => void;
  setShowAddKnowledgeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleIncludeInContext: (id: string) => void;
  handleUnlinkFromProject?: (id: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  activeTab,
  project,
  linkedItems,
  linkedFolders,
  expandedIterations,
  selectedIteration,
  toggleIterationExpanded,
  setShowAddKnowledgeDialog,
  handleToggleIncludeInContext,
  handleUnlinkFromProject
}) => {
  const { toast } = useToast();
  const { workspaces, linkKnowledgeToWorkspace, unlinkKnowledgeFromWorkspace } = useWorkspace();
  const [isKnowledgeGalleryOpen, setIsKnowledgeGalleryOpen] = useState(false);
  const [knowledgeTab, setKnowledgeTab] = useState("items");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [itemToLink, setItemToLink] = useState<{id: string, type: 'item' | 'folder'} | null>(null);
  
  const handleLinkToWorkspace = (id: string, type: 'item' | 'folder') => {
    setItemToLink({id, type});
    setShowLinkDialog(true);
  };
  
  const handleConfirmLink = () => {
    if (!itemToLink || !selectedWorkspaceId) return;
    
    try {
      linkKnowledgeToWorkspace(selectedWorkspaceId, itemToLink.id);
      
      toast({
        title: "Knowledge linked to workspace",
        description: `The ${itemToLink.type} has been linked to the selected workspace.`,
      });
      
      setShowLinkDialog(false);
      setSelectedWorkspaceId(null);
      setItemToLink(null);
    } catch (error) {
      console.error("Error linking knowledge to workspace:", error);
      toast({
        title: "Error",
        description: "There was an error linking the knowledge to the workspace.",
        variant: "destructive",
      });
    }
  };
  
  const handleUnlinkItem = (id: string) => {
    if (handleUnlinkFromProject) {
      handleUnlinkFromProject(id);
    }
  };
  
  const WebSearchToggle: React.FC = () => {
    const [enabled, setEnabled] = useState(false);
    const [deepSearch, setDeepSearch] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    
    const handleToggleEnabled = () => {
      setEnabled(!enabled);
    };
    
    const handleToggleDeepSearch = () => {
      setDeepSearch(!deepSearch);
    };
    
    const handleSelectModel = (model: string) => {
      setSelectedModel(model);
    };
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="web-search">Web Search</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? "Disable" : "Enable"}
          </Button>
        </div>
        {enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="deep-search">Deep Search</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeepSearch(!deepSearch)}
              >
                {deepSearch ? "Disable" : "Enable"}
              </Button>
            </div>
            <div>
              <Label htmlFor="search-model">Search Model</Label>
              <Select onValueChange={(value) => setSelectedModel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="model-1">Model 1</SelectItem>
                  <SelectItem value="model-2">Model 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <h2 className="text-xl font-semibold">Project Details</h2>
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium">{project.name}</h3>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </div>

      {/* Knowledge Manager Section */}
      <div className="border-t border-border mt-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Knowledge</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsKnowledgeGalleryOpen(true)}
          >
            <Book className="h-4 w-4 mr-1.5" />
            Manage
          </Button>
        </div>
        
        <Tabs 
          value={knowledgeTab} 
          onValueChange={setKnowledgeTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="mt-4 space-y-3">
            {linkedItems.length > 0 ? (
              linkedItems.map((item) => (
                <ProjectKnowledgeItem 
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '')}
                  type="item"
                  isIncludedInContext={project.knowledgeInContext?.includes(item.id) || false}
                  onToggleInclude={handleToggleIncludeInContext}
                  onLinkToWorkspace={(id) => handleLinkToWorkspace(id, 'item')}
                  onUnlinkFromWorkspace={handleUnlinkItem}
                />
              ))
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center">
                <p className="text-muted-foreground text-sm mb-2">
                  No knowledge items linked to this project
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddKnowledgeDialog(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Knowledge
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="folders" className="mt-4 space-y-3">
            {linkedFolders.length > 0 ? (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3 pr-2">
                  {linkedFolders.map((folder) => (
                    <ProjectKnowledgeItem 
                      key={folder.id}
                      id={folder.id}
                      title={folder.name}
                      description={folder.description || "No description"}
                      type="folder"
                      isIncludedInContext={project.knowledgeInContext?.includes(folder.id) || false}
                      onToggleInclude={handleToggleIncludeInContext}
                      onLinkToWorkspace={(id) => handleLinkToWorkspace(id, 'folder')}
                      onUnlinkFromWorkspace={handleUnlinkItem}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center">
                <p className="text-muted-foreground text-sm mb-2">
                  No knowledge folders linked to this project
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddKnowledgeDialog(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Knowledge
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Web Search Section */}
      <div className="border-t border-border mt-4 pt-4">
        <WebSearchToggle />
      </div>

      {/* Knowledge Gallery Dialog */}
      {isKnowledgeGalleryOpen && (
        <Dialog open={isKnowledgeGalleryOpen} onOpenChange={setIsKnowledgeGalleryOpen}>
          <DialogContent className="max-w-full h-screen max-h-screen p-0 m-0 w-screen rounded-none">
            <KnowledgeGallery onClose={() => setIsKnowledgeGalleryOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Link to Workspace Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Link to Workspace</h3>
            <p className="text-sm text-muted-foreground">
              Select a workspace to link this {itemToLink?.type} to:
            </p>
            
            <Select onValueChange={(value) => setSelectedWorkspaceId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map(workspace => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmLink}
                disabled={!selectedWorkspaceId}
              >
                <Link className="h-4 w-4 mr-1.5" />
                Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RightSidebar;
