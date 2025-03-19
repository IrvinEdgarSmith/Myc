import React from 'react';
import { Edit, Trash2, Folder, FileText, Upload, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useKnowledge } from '@/context/KnowledgeContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/components/ui/use-toast';
import EditItemDialog from './EditItemDialog';

interface KnowledgeItemProps {
  item: {
    id: string;
    title: string;
    content: string;
    basinId?: string;
    sections?: { id: string; title: string; content: string; }[];
    files?: { id: string; name: string; url: string; type: string; size: number; }[];
    updatedAt: Date;
  };
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  workspaceId?: string; // Optional workspace ID for linking functionality
}

const KnowledgeItem: React.FC<KnowledgeItemProps> = ({ item, onDelete, onEdit, workspaceId }) => {
  const { basins } = useKnowledge();
  const { toast } = useToast();
  const { linkKnowledgeToWorkspace } = useWorkspace();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  
  // Safely find the basin name - handle cases where the basin might not exist
  const basinName = React.useMemo(() => {
    if (!item.basinId) return null;
    const basin = basins.find(b => b.id === item.basinId);
    return basin?.name || 'Unknown Basin';
  }, [item.basinId, basins]);
  
  // Use stopPropagation to prevent event bubbling that could cause issues
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDialogOpen(true);
    onEdit(item.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(item.id);
  };
  
  const handleLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!workspaceId) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace first before linking this item.",
        variant: "destructive"
      });
      return;
    }
    
    linkKnowledgeToWorkspace(workspaceId, item.id);
    toast({
      title: "Item linked",
      description: `"${item.title}" has been linked to the workspace.`
    });
  };
  
  return (
    <div className="bg-mycelial-card border border-mycelial-border/20 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium truncate">{item.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <span className="sr-only">Open menu</span>
              <Edit className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.content}</p>
      
      <div className="flex flex-wrap gap-2 mt-3">
        {item.basinId && basinName && (
          <div className="text-xs bg-mycelial-secondary/20 text-mycelial-secondary py-1 px-2 rounded-md flex items-center">
            <Folder className="h-3 w-3 mr-1" />
            {basinName}
          </div>
        )}
        
        {item.sections && item.sections.length > 0 && (
          <div className="text-xs bg-mycelial-tertiary/20 text-mycelial-tertiary py-1 px-2 rounded-md flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            {item.sections.length} {item.sections.length === 1 ? 'Section' : 'Sections'}
          </div>
        )}
        
        {item.files && item.files.length > 0 && (
          <div className="text-xs bg-mycelial-accent/20 text-mycelial-accent py-1 px-2 rounded-md flex items-center">
            <Upload className="h-3 w-3 mr-1" />
            {item.files.length} {item.files.length === 1 ? 'File' : 'Files'}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-muted-foreground">
          Updated {item.updatedAt instanceof Date 
            ? item.updatedAt.toLocaleDateString() 
            : new Date(item.updatedAt).toLocaleDateString()}
        </div>
        
        {workspaceId && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={handleLink}
          >
            <Link className="h-3.5 w-3.5 mr-1.5" />
            Link
          </Button>
        )}
      </div>
      
      {isEditDialogOpen && (
        <EditItemDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          itemId={item.id}
        />
      )}
    </div>
  );
};

export default KnowledgeItem;
