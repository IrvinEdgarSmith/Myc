import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyItemsStateProps {
  onCreateNewItem: () => void;
}

const EmptyItemsState: React.FC<EmptyItemsStateProps> = ({ onCreateNewItem }) => {
  return (
    <div className="text-center p-12 border border-dashed border-mycelial-border/50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">No Knowledge Items Yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first knowledge item to start organizing your information.
      </p>
      <Button 
        onClick={onCreateNewItem}
        className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
      >
        <Plus className="mr-2 h-4 w-4" /> Create Your First Item
      </Button>
    </div>
  );
};

export default EmptyItemsState;
