import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FolderPlus, Folder, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeFolder } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderSelectorProps {
  folders: KnowledgeFolder[];
  selectedFolderIds: string[];
  onFolderToggle: (folderId: string) => void;
  maxHeight?: string;
  excludeFolderIds?: string[];
  placeholder?: string;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ 
  folders, 
  selectedFolderIds, 
  onFolderToggle,
  maxHeight = "200px",
  excludeFolderIds = [],
  placeholder = "Select folders..."
}) => {
  const [folderSearchOpen, setFolderSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Filter folders based on search and exclusions
  const filteredFolders = searchValue
    ? folders.filter(folder => 
        (folder.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        folder.description?.toLowerCase().includes(searchValue.toLowerCase())) &&
        !excludeFolderIds.includes(folder.id)
      )
    : folders.filter(folder => !excludeFolderIds.includes(folder.id));

  return (
    <Popover open={folderSearchOpen} onOpenChange={setFolderSearchOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={folderSearchOpen}
          className="w-full justify-between"
        >
          {selectedFolderIds.length > 0
            ? `${selectedFolderIds.length} folder${selectedFolderIds.length > 1 ? 's' : ''} selected`
            : placeholder}
          <FolderPlus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search folders..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="mb-2">No folders found</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mx-auto"
                  onClick={() => {
                    setFolderSearchOpen(false);
                    toast({
                      title: "Create Folder", 
                      description: "You can create a new folder from the Knowledge Folders tab"
                    });
                  }}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create New Folder
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className={`max-h-[${maxHeight}]`}>
                {filteredFolders.map((folder) => (
                  <CommandItem
                    key={folder.id}
                    value={folder.name}
                    onSelect={() => {
                      onFolderToggle(folder.id);
                      // Note: We're not closing the popover here to allow multiple selections
                    }}
                  >
                    <div className="flex items-center space-x-2 w-full">
                      <Folder className="h-4 w-4" />
                      <span>{folder.name}</span>
                      {selectedFolderIds.includes(folder.id) && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FolderSelector;
