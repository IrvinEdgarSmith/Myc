import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { KnowledgeItem } from '@/types';

interface FolderItemSelectorProps {
  items: KnowledgeItem[];
  selectedItemIds: string[];
  onItemsChange: (itemIds: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FolderItemSelector: React.FC<FolderItemSelectorProps> = ({
  items,
  selectedItemIds,
  onItemsChange,
  searchTerm,
  setSearchTerm
}) => {
  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      onItemsChange(selectedItemIds.filter(id => id !== itemId));
    } else {
      onItemsChange([...selectedItemIds, itemId]);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Label htmlFor="search-items" className="mb-2">Select Knowledge Items</Label>
      
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-items"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <ScrollArea className="flex-1 border rounded-md p-2">
        {filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No matching knowledge items found
          </p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={selectedItemIds.includes(item.id)}
                  onCheckedChange={() => toggleItemSelection(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`item-${item.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {item.title}
                  </label>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {item.content.substring(0, 100)}
                    {item.content.length > 100 ? '...' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default FolderItemSelector;
