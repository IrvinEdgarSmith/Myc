import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KnowledgeItem } from '@/types';

interface BasinItemSelectorProps {
  knowledgeItems: KnowledgeItem[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const BasinItemSelector: React.FC<BasinItemSelectorProps> = ({
  knowledgeItems,
  selectedItems,
  setSelectedItems,
  searchTerm,
  setSearchTerm,
}) => {
  // Filter knowledge items based on search term
  const filteredItems = knowledgeItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemSelection = (itemId: string) => {
    // Directly create a new array instead of using functional update
    if (selectedItems.includes(itemId)) {
      // Remove the item if it's already selected
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      // Add the item if it's not selected
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  return (
    <div className="grid gap-2 flex-1 overflow-hidden">
      <Label>Link Knowledge Items</Label>
      <p className="text-sm text-muted-foreground">
        Select one or more knowledge items to link to this basin
      </p>
      
      <Input
        placeholder="Search knowledge items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      
      <div className="border rounded-md overflow-hidden flex-1">
        <ScrollArea className="h-[250px] w-full">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No knowledge items matching your search.
            </div>
          ) : (
            <div className="p-2">
              {filteredItems.map(item => (
                <div key={item.id} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md">
                  <Checkbox 
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleItemSelection(item.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`item-${item.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item.title}
                    </label>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      <div className="text-sm text-muted-foreground mt-1">
        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
};

export default BasinItemSelector;
