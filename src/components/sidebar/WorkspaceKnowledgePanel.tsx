import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKnowledge } from '@/context/KnowledgeContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Plus, Database, BookOpen, FileText, Link, Unlink, ToggleLeft, ToggleRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeItem, KnowledgeFolder } from '@/types';
import KnowledgeManager from '../knowledge/KnowledgeManager';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const WorkspaceKnowledgePanel: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const { folders, knowledgeItems } = useKnowledge();
  const { workspaces, toggleKnowledgeInContext, linkKnowledgeToWorkspace, unlinkKnowledgeFromWorkspace, updateWorkspaceSettings } = useWorkspace();
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('items');
  
  const workspace = workspaces.find(w => w.id === workspaceId);
  
  if (!workspace) return null;
  
  const directlyLinkedItems = knowledgeItems.filter(item => 
    workspace.linkedKnowledge?.includes(item.id)
  );
  
  const linkedFolders = folders.filter(folder => 
    workspace.linkedKnowledge?.includes(folder.id)
  );
  
  const itemsFromLinkedFolders = useMemo(() => {
    const folderIds = linkedFolders.map(folder => folder.id);
    return knowledgeItems.filter(item => 
      (item.folderId && folderIds.includes(item.folderId)) ||
      (item.folderIds && item.folderIds.some(id => folderIds.includes(id)))
    );
  }, [linkedFolders, knowledgeItems]);
  
  const allLinkedItems = useMemo(() => {
    const allItems = [...directlyLinkedItems];
    
    itemsFromLinkedFolders.forEach(folderItem => {
      if (!allItems.some(item => item.id === folderItem.id)) {
        allItems.push(folderItem);
      }
    });
    
    return allItems;
  }, [directlyLinkedItems, itemsFromLinkedFolders]);
  
  const toggleKnowledgeManager = () => {
    setIsKnowledgeOpen(!isKnowledgeOpen);
  };
  
  const handleToggleIncludeInContext = (id: string) => {
    try {
      toggleKnowledgeInContext(workspaceId, id);
      
      const isNowIncluded = !workspace.knowledgeInContext?.includes(id);
      
      toast({
        title: isNowIncluded ? "Added to context" : "Removed from context",
        description: isNowIncluded 
          ? "This knowledge will be included in AI responses." 
          : "This knowledge will not be included in AI responses.",
      });
    } catch (error) {
      console.error("Error toggling knowledge in context:", error);
      toast({
        title: "Error",
        description: "There was an error updating the context. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleIncludeKnowledgeInPrompt = (checked: boolean) => {
    try {
      updateWorkspaceSettings(workspaceId, {
        includeKnowledgeInPrompt: checked
      });
      
      toast({
        title: checked ? "Knowledge enabled" : "Knowledge disabled",
        description: checked 
          ? "Knowledge items will be included in AI prompts." 
          : "Knowledge items will not be included in AI prompts.",
      });
    } catch (error) {
      console.error("Error updating workspace settings:", error);
      toast({
        title: "Error",
        description: "There was an error updating the settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUnlinkFromWorkspace = (id: string) => {
    try {
      unlinkKnowledgeFromWorkspace(workspaceId, id);
      
      toast({
        title: "Knowledge unlinked",
        description: "The knowledge has been unlinked from this workspace.",
      });
    } catch (error) {
      console.error("Error unlinking knowledge from workspace:", error);
      toast({
        title: "Error",
        description: "There was an error unlinking the knowledge. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="h-full flex flex-col border-l border-mycelial-border/20">
        <div className="flex items-center justify-between p-3 border-b border-mycelial-border/10">
          <h3 className="text-sm font-medium">Workspace Knowledge</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={toggleKnowledgeManager}
          >
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {allLinkedItems.length === 0 && linkedFolders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <BookOpen className="h-10 w-10 text-mycelial-secondary/40 mb-2" />
              <p className="text-sm mb-2">
                No knowledge linked to this workspace
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleKnowledgeManager}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Knowledge
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="p-3 border-b border-mycelial-border/10">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-knowledge"
                    checked={workspace.settings?.includeKnowledgeInPrompt !== false}
                    onCheckedChange={handleToggleIncludeKnowledgeInPrompt}
                  />
                  <Label htmlFor="include-knowledge" className="text-sm">
                    Include knowledge in AI prompts
                  </Label>
                </div>
              </div>
            
              <TabsList className="mx-3 mt-3 grid w-auto grid-cols-2">
                <TabsTrigger value="items" className="px-2 py-1 text-xs">Items</TabsTrigger>
                <TabsTrigger value="folders" className="px-2 py-1 text-xs">Folders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="items" className="flex-1 flex flex-col p-3 pt-0">
                {allLinkedItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-muted-foreground">No knowledge items linked</p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-2">
                      {allLinkedItems.map((item) => (
                        <KnowledgeCard 
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          description={item.content}
                          type="item"
                          isIncludedInContext={workspace.knowledgeInContext?.includes(item.id) || false}
                          onToggleInclude={() => handleToggleIncludeInContext(item.id)}
                          onUnlinkFromWorkspace={() => handleUnlinkFromWorkspace(item.id)}
                          isFromFolder={!!item.folderId && linkedFolders.some(f => f.id === item.folderId)}
                          folderName={
                            item.folderId 
                              ? folders.find(f => f.id === item.folderId)?.name 
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
              
              <TabsContent value="folders" className="flex-1 flex flex-col p-3 pt-0">
                {linkedFolders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-muted-foreground">No knowledge folders linked</p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-2">
                      {linkedFolders.map((folder) => (
                        <KnowledgeCard 
                          key={folder.id}
                          id={folder.id}
                          title={folder.name}
                          description={folder.description || ""}
                          type="folder"
                          isIncludedInContext={workspace.knowledgeInContext?.includes(folder.id) || false}
                          onToggleInclude={() => handleToggleIncludeInContext(folder.id)}
                          onUnlinkFromWorkspace={() => handleUnlinkFromWorkspace(folder.id)}
                          itemCount={folder.items?.length || knowledgeItems.filter(item => item.folderId === folder.id).length}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <div className="p-3 border-t border-mycelial-border/10">
          <Button 
            size="sm" 
            onClick={toggleKnowledgeManager}
            className="w-full bg-mycelial-secondary hover:bg-mycelial-secondary/90"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Knowledge
          </Button>
        </div>
      </div>
      
      {isKnowledgeOpen && (
        <KnowledgeManager
          workspaceId={workspaceId}
          isOpen={isKnowledgeOpen}
          onClose={() => setIsKnowledgeOpen(false)}
        />
      )}
    </>
  );
};

interface KnowledgeCardProps {
  id: string;
  title: string;
  description: string;
  type: 'folder' | 'item';
  isIncludedInContext: boolean;
  onToggleInclude: () => void;
  onUnlinkFromWorkspace: () => void;
  isFromFolder?: boolean;
  folderName?: string;
  itemCount?: number;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ 
  id, 
  title, 
  description, 
  type,
  isIncludedInContext,
  onToggleInclude,
  onUnlinkFromWorkspace,
  isFromFolder,
  folderName,
  itemCount
}) => {
  const [hovering, setHovering] = useState(false);

  return (
    <div 
      className="bg-mycelial-card/50 border border-mycelial-border/10 rounded-md p-3 hover:bg-mycelial-card/80 transition-colors"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            {type === 'folder' ? (
              <Database className="h-3.5 w-3.5 text-mycelial-secondary/70 mr-1 flex-shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-mycelial-tertiary/70 mr-1 flex-shrink-0" />
            )}
            <h4 className="text-sm font-medium truncate">{title}</h4>
            
            {type === 'folder' && itemCount !== undefined && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          
          {isFromFolder && folderName && (
            <div className="text-xs text-mycelial-secondary flex items-center mt-0.5">
              <Database className="h-3 w-3 mr-1" />
              From folder: {folderName}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1.5">
              <Checkbox 
                id={`include-${id}`}
                checked={isIncludedInContext}
                onCheckedChange={onToggleInclude}
                className="h-4 w-4 data-[state=checked]:bg-mycelial-secondary data-[state=checked]:text-white"
              />
              <label 
                htmlFor={`include-${id}`}
                className="text-xs cursor-pointer select-none"
              >
                Include
              </label>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-red-500 hover:text-red-600"
              onClick={onUnlinkFromWorkspace}
            >
              <Unlink className="h-3 w-3 mr-1" />
              Unlink
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceKnowledgePanel;
