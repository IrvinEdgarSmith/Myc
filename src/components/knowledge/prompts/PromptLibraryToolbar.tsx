import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3 as Gallery, ListFilter as List, Plus } from 'lucide-react';

interface PromptLibraryToolbarProps {
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  onNewPromptClick: () => void;
}

const PromptLibraryToolbar: React.FC<PromptLibraryToolbarProps> = ({
  viewMode,
  setViewMode,
  onNewPromptClick
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode('list')}
        className={viewMode === 'list' ? 'bg-mycelial-secondary/20' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode('grid')}
        className={viewMode === 'grid' ? 'bg-mycelial-secondary/20' : ''}
      >
        <Gallery className="h-4 w-4" />
      </Button>
      <Button 
        className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
        size="sm"
        onClick={onNewPromptClick}
      >
        <Plus className="h-4 w-4 mr-1" /> New Prompt
      </Button>
    </div>
  );
};

export default PromptLibraryToolbar;
