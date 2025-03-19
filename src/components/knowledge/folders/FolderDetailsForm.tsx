import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKnowledge } from '@/context/KnowledgeContext';
import { Folder } from 'lucide-react';

interface FolderDetailsFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  parentFolderId?: string | null;
  setParentFolderId?: (id: string | null) => void;
  currentFolderId?: string;
}

const FolderDetailsForm: React.FC<FolderDetailsFormProps> = ({
  name,
  setName,
  description,
  setDescription,
  parentFolderId,
  setParentFolderId,
  currentFolderId
}) => {
  const { folders } = useKnowledge();
  
  // Filter out the current folder and its children to prevent circular references
  const availableFolders = folders.filter(folder => 
    folder.id !== currentFolderId && 
    (!currentFolderId || !isFolderDescendant(folder.id, currentFolderId, folders))
  );

  // Function to check if a folder is a descendant of another folder
  function isFolderDescendant(folderId: string, ancestorId: string, allFolders: any[]): boolean {
    const folder = allFolders.find(f => f.id === folderId);
    if (!folder) return false;
    if (folder.parentFolderId === ancestorId) return true;
    if (folder.parentFolderId) {
      return isFolderDescendant(folder.parentFolderId, ancestorId, allFolders);
    }
    return false;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="folder-name">Folder Name</Label>
        <Input
          id="folder-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter folder name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="folder-description">Description (optional)</Label>
        <Textarea
          id="folder-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a brief description of this folder"
          rows={3}
        />
      </div>
      
      {setParentFolderId && (
        <div className="space-y-2">
          <Label htmlFor="parent-folder">Parent Folder (Optional)</Label>
          <Select
            value={parentFolderId || "no-parent"}
            onValueChange={(value) => setParentFolderId(value === "no-parent" ? null : value)}
          >
            <SelectTrigger id="parent-folder">
              <SelectValue placeholder="No Parent Folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-parent">No Parent Folder</SelectItem>
              {availableFolders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center">
                    <Folder className="h-4 w-4 mr-2" />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select a parent folder to create a hierarchical structure. A folder cannot be its own parent.
          </p>
        </div>
      )}
    </div>
  );
};

export default FolderDetailsForm;
