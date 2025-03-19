import React, { useState } from 'react';
import { useKnowledge } from '@/context/KnowledgeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Link, FileText, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import KnowledgeItemForm from './KnowledgeItemForm';

interface KnowledgeItemsListProps {
  workspaceId?: string;
  onLinkToWorkspace?: (id: string) => void;
}

const KnowledgeItemsList: React.FC<KnowledgeItemsListProps> = ({ 
  workspaceId,
  onLinkToWorkspace 
}) => {
  const { knowledgeItems, folders, deleteKnowledgeItem } = useKnowledge();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const filteredItems = knowledgeItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this knowledge item? This action cannot be undone.')) {
      deleteKnowledgeItem(id);
      toast({
        title: "Item deleted",
        description: "Knowledge item has been deleted successfully",
      });
    }
  };
  
  const handleEditItem = (id: string) => {
    setEditingItemId(id);
  };
  
  const closeEditDialog = () => {
    setEditingItemId(null);
  };

  const getFolderNames = (item: { folderId?: string, folderIds?: string[] }) => {
    const folderIdList = [];
    
    if (item.folderId) {
      folderIdList.push(item.folderId);
    }
    
    if (item.folderIds) {
      item.folderIds.forEach(id => {
        if (!folderIdList.includes(id)) {
          folderIdList.push(id);
        }
      });
    }
    
    if (folderIdList.length === 0) return null;
    
    return folderIdList
      .map(id => folders.find(folder => folder.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search knowledge items..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No knowledge items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-mycelial-secondary" />
                  {item.title}
                </CardTitle>
                {getFolderNames(item) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Folders: {getFolderNames(item)}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditItem(item.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {workspaceId && onLinkToWorkspace && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onLinkToWorkspace(item.id)}
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
      
      {/* Edit Item Dialog */}
      {editingItemId && (
        <Dialog open={!!editingItemId} onOpenChange={open => !open && closeEditDialog()}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
            <KnowledgeItemForm 
              itemId={editingItemId}
              onClose={closeEditDialog}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KnowledgeItemsList;
