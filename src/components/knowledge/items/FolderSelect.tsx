import React from 'react';
import { KnowledgeFolder } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Folder } from 'lucide-react';

interface FolderSelectProps {
  folders: KnowledgeFolder[];
  selectedFolderIds: string[];
  onChange: (folderIds: string[]) => void;
}

const FolderSelect: React.FC<FolderSelectProps> = ({
  folders,
  selectedFolderIds,
  onChange
}) => {
  // Toggle folder selection
  const toggleFolder = (folderId: string) => {
    if (selectedFolderIds.includes(folderId)) {
      onChange(selectedFolderIds.filter(id => id !== folderId));
    } else {
      onChange([...selectedFolderIds, folderId]);
    }
  };

  return (
    <div className="mt-2 border rounded-md">
      {folders.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No folders available
        </div>
      ) : (
        <ScrollArea className="h-[150px]">
          <div className="p-2 space-y-1">
            {folders.map(folder => (
              <div 
                key={folder.id} 
                className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md"
              >
                <Checkbox
                  id={`folder-${folder.id}`}
                  checked={selectedFolderIds.includes(folder.id)}
                  onCheckedChange={() => toggleFolder(folder.id)}
                />
                <label 
                  htmlFor={`folder-${folder.id}`}
                  className="flex items-center cursor-pointer text-sm"
                >
                  <Folder className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  {folder.name}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default FolderSelect;
