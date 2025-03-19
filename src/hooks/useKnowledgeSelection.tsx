import { useState } from 'react';
import { KnowledgeItem, KnowledgeFolder } from '@/types';

export function useKnowledgeSelection() {
  const [selectedItems, setSelectedItems] = useState<KnowledgeItem[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<KnowledgeFolder[]>([]);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  
  const selectItem = (item: KnowledgeItem, isCtrlPressed: boolean = false) => {
    setSelectedItems(prevItems => {
      // Check if the item is already selected
      const isAlreadySelected = prevItems.some(i => i.id === item.id);
      
      if (isAlreadySelected) {
        // If Ctrl is pressed, remove the item from selection
        return isCtrlPressed 
          ? prevItems.filter(i => i.id !== item.id)
          : [item]; // If Ctrl is not pressed, select only this item
      } else {
        // If Ctrl is pressed, add the item to selection
        return isCtrlPressed 
          ? [...prevItems, item]
          : [item]; // If Ctrl is not pressed, select only this item
      }
    });
    
    // Clear folder selection when selecting items
    if (!isCtrlPressed) {
      setSelectedFolders([]);
    }
  };
  
  const selectFolder = (folder: KnowledgeFolder, isCtrlPressed: boolean = false) => {
    setSelectedFolders(prevFolders => {
      // Check if the folder is already selected
      const isAlreadySelected = prevFolders.some(f => f.id === folder.id);
      
      if (isAlreadySelected) {
        // If Ctrl is pressed, remove the folder from selection
        return isCtrlPressed 
          ? prevFolders.filter(f => f.id !== folder.id)
          : [folder]; // If Ctrl is not pressed, select only this folder
      } else {
        // If Ctrl is pressed, add the folder to selection
        return isCtrlPressed 
          ? [...prevFolders, folder]
          : [folder]; // If Ctrl is not pressed, select only this folder
      }
    });
    
    // Clear item selection when selecting folders
    if (!isCtrlPressed) {
      setSelectedItems([]);
    }
  };
  
  const clearSelection = () => {
    setSelectedItems([]);
    setSelectedFolders([]);
  };
  
  const setCtrlPressed = (isPressed: boolean) => {
    setIsCtrlPressed(isPressed);
  };
  
  return {
    selectedItems,
    selectedFolders,
    isCtrlPressed,
    selectItem,
    selectFolder,
    clearSelection,
    setCtrlPressed,
    hasSelection: selectedItems.length > 0 || selectedFolders.length > 0
  };
}
