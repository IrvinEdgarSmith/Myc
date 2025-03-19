import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Link, Folder, FolderPlus, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeBasin } from '@/types';

interface BasinSelectorProps {
  basins: KnowledgeBasin[];
  selectedBasinId?: string;
  onBasinSelect: (basinId: string, name: string) => void;
}

const BasinSelector: React.FC<BasinSelectorProps> = ({ 
  basins, 
  selectedBasinId, 
  onBasinSelect 
}) => {
  const [basinSearchOpen, setBasinSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [basinName, setBasinName] = useState('');
  
  // Update basin name when selectedBasinId changes
  useEffect(() => {
    if (selectedBasinId) {
      const basin = basins.find(b => b.id === selectedBasinId);
      if (basin) {
        setBasinName(basin.name);
      }
    } else {
      setBasinName('');
    }
  }, [selectedBasinId, basins]);

  // Filter basins based on search
  const filteredBasins = searchValue
    ? basins.filter(basin => 
        basin.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        basin.description.toLowerCase().includes(searchValue.toLowerCase())
      )
    : basins;

  return (
    <Popover open={basinSearchOpen} onOpenChange={setBasinSearchOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={basinSearchOpen}
          className="w-full justify-between"
        >
          {basinName || "Select basin..."}
          <Link className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search basins..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="mb-2">No basins found</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mx-auto"
                  onClick={() => {
                    setBasinSearchOpen(false);
                    toast({
                      title: "Create Basin", 
                      description: "You can create a new basin from the Knowledge Basins tab"
                    });
                  }}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create New Basin
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredBasins.map((basin) => (
                <CommandItem
                  key={basin.id}
                  value={basin.name}
                  onSelect={() => {
                    onBasinSelect(basin.id, basin.name);
                    setBasinName(basin.name);
                    setBasinSearchOpen(false);
                  }}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  {basin.name}
                  {basin.id === selectedBasinId && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BasinSelector;
