import React, { useState } from 'react';
import { KnowledgeItem, KnowledgeFolder } from '@/types';
import { cn } from '@/lib/utils';
import { Upload, FolderOpen } from 'lucide-react';
import { useDraggableKnowledge } from '@/hooks/useDraggableKnowledge';

interface KnowledgeDropZoneProps {
  onDrop: (items: KnowledgeItem[], folders: KnowledgeFolder[]) => void;
  className?: string;
  children?: React.ReactNode;
  label?: string;
  isActive?: boolean;
  folderName?: string;
}

const KnowledgeDropZone: React.FC<KnowledgeDropZoneProps> = ({
  onDrop,
  className,
  children,
  label = "Drop knowledge here",
  isActive = false,
  folderName
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { draggedItem, draggedFolder, draggedItems, draggedFolders, stopDragging } = useDraggableKnowledge();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Get items to drop - either multiple selected items or just the dragged item
    const itemsToDrop: KnowledgeItem[] = draggedItems.length > 0 
      ? [...draggedItems] 
      : (draggedItem ? [draggedItem] : []);
    
    // Get folders to drop - either multiple selected folders or just the dragged folder
    const foldersToDrop: KnowledgeFolder[] = draggedFolders.length > 0
      ? [...draggedFolders]
      : (draggedFolder ? [draggedFolder] : []);
    
    // Pass the items and folders to the onDrop handler
    onDrop(itemsToDrop, foldersToDrop);
    
    // Reset the dragged state
    stopDragging();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-colors",
        isDragOver ? "border-mycelial-secondary bg-mycelial-secondary/5" : 
                    isActive ? "border-mycelial-secondary/70 bg-mycelial-secondary/5" : "border-mycelial-border/30",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children || (
        <div className="flex flex-col items-center justify-center text-center h-full py-6">
          {isActive ? (
            <>
              <FolderOpen className="h-10 w-10 text-mycelial-secondary mb-3" />
              <p className="text-sm font-medium">Drop into {folderName || "this folder"}</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag and drop knowledge items or folders here
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeDropZone;
