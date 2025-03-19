import React, { useState } from 'react';
import { useKnowledge } from '@/context/KnowledgeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Link, Folder, Search, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import CreateFolderDialog from './folders/CreateFolderDialog';
import EditFolderDialog from './folders/EditFolderDialog';

interface KnowledgeFoldersListProps {
  workspaceId?: string;
  onLinkToWorkspace?: (id: string) => void;
}

const KnowledgeFoldersList: React.FC<KnowledgeFoldersListProps> = ({ 
  workspaceId,
  onLinkToWorkspace 
}) => {
  const { folders, deleteFolder } = useKnowledge();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteFolder = (id: string) => {
    if (confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      deleteFolder(id);
      toast({
        title: "Folder deleted",
        description: "Knowledge folder has been deleted successfully",
      });
    }
  };
  
  const handleEditFolder = (id: string) => {
    setEditingFolderId(id);
  };
  
  const closeEditDialog = () => {
    setEditingFolderId(null);
  };

  // Get folder name with count of items
  const getFolderLabel = (folder: { name: string, items: any[] }) => {
    return `${folder.name} (${folder.items.length} ${folder.items.length === 1 ? 'item' : 'items'})`;
  };

  // Get parent folder name if it exists
  const getParentFolderName = (parentId?: string) => {
    if (!parentId) return null;
    const parentFolder = folders.find(f => f.id === parentId);
    return parentFolder ? parentFolder.name : 'Unknown';
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search folders..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="default" 
          className="ml-2 bg-mycelial-secondary hover:bg-mycelial-secondary/90"
          onClick={() => setIsCreateFolderOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Folder
        </Button>
      </div>
      
      {filteredFolders.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No folders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFolders.map(folder => (
            <Card key={folder.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Folder className="h-4 w-4 text-mycelial-secondary" />
                  {folder.name}
                </CardTitle>
                {folder.parentFolderId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Parent: {getParentFolderName(folder.parentFolderId)}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {folder.description || "No description"}
                </p>
                <p className="text-xs text-mycelial-secondary mt-2">
                  {folder.items.length} {folder.items.length === 1 ? 'item' : 'items'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditFolder(folder.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteFolder(folder.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {workspaceId && onLinkToWorkspace && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onLinkToWorkspace(folder.id)}
                  >
                    <Link className="h-4 w-4 mr-1" />
                    Link to Workspace
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Folder Dialog */}
      <EditFolderDialog
        isOpen={!!editingFolderId}
        onOpenChange={open => !open && closeEditDialog()}
        folderId={editingFolderId}
      />
      
      {/* Create Folder Dialog */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
      />
    </div>
  );
};

export default KnowledgeFoldersList;
