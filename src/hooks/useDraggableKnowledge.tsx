import { useState, useEffect } from 'react';
import { KnowledgeItem, KnowledgeFolder } from '@/types';

type DragType = 'item' | 'folder' | 'multiple' | null;

interface DraggableKnowledgeState {
  draggedItem: KnowledgeItem | null;
  draggedFolder: KnowledgeFolder | null;
  draggedItems: KnowledgeItem[];
  draggedFolders: KnowledgeFolder[];
  dragType: DragType;
  isDragging: boolean;
  dropTargetId: string | null;
}

export function useDraggableKnowledge() {
  const [state, setState] = useState<DraggableKnowledgeState>({
    draggedItem: null,
    draggedFolder: null,
    draggedItems: [],
    draggedFolders: [],
    dragType: null,
    isDragging: false,
    dropTargetId: null
  });

  const startDragging = (
    item: KnowledgeItem | null, 
    folder: KnowledgeFolder | null,
    items: KnowledgeItem[] = [],
    folders: KnowledgeFolder[] = []
  ) => {
    if (items.length > 0 || folders.length > 0) {
      // Multiple items/folders being dragged
      setState({
        draggedItem: null,
        draggedFolder: null,
        draggedItems: items,
        draggedFolders: folders,
        dragType: 'multiple',
        isDragging: true,
        dropTargetId: null
      });
      console.log("Started dragging multiple items:", items.length, "items and", folders.length, "folders");
    } else if (item) {
      // Single item being dragged
      setState({
        draggedItem: item,
        draggedFolder: null,
        draggedItems: [item],
        draggedFolders: [],
        dragType: 'item',
        isDragging: true,
        dropTargetId: null
      });
      console.log("Started dragging item:", item.id, item.title);
    } else if (folder) {
      // Single folder being dragged
      setState({
        draggedItem: null,
        draggedFolder: folder,
        draggedItems: [],
        draggedFolders: [folder],
        dragType: 'folder',
        isDragging: true,
        dropTargetId: null
      });
      console.log("Started dragging folder:", folder.id, folder.name);
    }
  };

  const stopDragging = () => {
    setState({
      draggedItem: null,
      draggedFolder: null,
      draggedItems: [],
      draggedFolders: [],
      dragType: null,
      isDragging: false,
      dropTargetId: null
    });
    console.log("Stopped dragging");
  };

  const setDropTarget = (id: string | null) => {
    if (id !== state.dropTargetId) {
      setState(prev => ({
        ...prev,
        dropTargetId: id
      }));
    }
  };

  useEffect(() => {
    const handleGlobalDragEnd = () => {
      if (state.isDragging) {
        stopDragging();
      }
    };
    
    window.addEventListener('dragend', handleGlobalDragEnd);
    
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, [state.isDragging]);

  return {
    ...state,
    startDragging,
    stopDragging,
    setDropTarget
  };
}
