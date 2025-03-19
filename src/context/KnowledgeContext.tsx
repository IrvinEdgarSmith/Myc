import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeFolder, KnowledgeItem, KnowledgeSection, KnowledgeFile, PromptTemplate, KnowledgeBasin } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface KnowledgeContextProps {
  folders: KnowledgeFolder[];
  knowledgeItems: KnowledgeItem[];
  basins: KnowledgeBasin[];
  createFolder: (name: string, description: string, itemIds?: string[], parentFolderId?: string) => KnowledgeFolder;
  updateFolder: (id: string, data: Partial<KnowledgeFolder>) => void;
  deleteFolder: (id: string) => void;
  addItemToFolder: (folderId: string, item: KnowledgeItem) => void;
  removeItemFromFolder: (folderId: string, itemId: string) => void;
  addFolderToFolder: (parentFolderId: string, childFolderId: string) => void;
  removeFolderFromFolder: (parentFolderId: string, childFolderId: string) => void;
  linkPromptToFolder: (folderId: string, promptId: string) => void;
  unlinkPromptFromFolder: (folderId: string, promptId: string) => void;
  createKnowledgeItem: (
    title: string, 
    content: string, 
    folderId?: string,
    sections?: KnowledgeSection[],
    files?: KnowledgeFile[]
  ) => KnowledgeItem;
  updateKnowledgeItem: (id: string, data: Partial<KnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;
  getKnowledgeItemById: (id: string) => KnowledgeItem | undefined;
  getFolderById: (id: string) => KnowledgeFolder | undefined;
  // Basin methods
  createBasin: (name: string, description: string, itemIds?: string[]) => KnowledgeBasin;
  updateBasin: (id: string, data: Partial<KnowledgeBasin>) => void;
  deleteBasin: (id: string) => void;
  getBasinById: (id: string) => KnowledgeBasin | undefined;
}

const KnowledgeContext = createContext<KnowledgeContextProps | undefined>(undefined);

export const useKnowledge = () => {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
};

// Helper function to safely parse dates from localStorage
const parseDates = (item: any) => {
  if (!item) return item;
  
  // Handle date parsing for the main item
  const result = {
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
  };
  
  // Handle date parsing for sections
  if (item.sections && Array.isArray(item.sections)) {
    result.sections = item.sections.map((section: any) => ({
      ...section,
      itemId: section.itemId || item.id,
      createdAt: section.createdAt ? new Date(section.createdAt) : new Date(),
      updatedAt: section.updatedAt ? new Date(section.updatedAt) : new Date(),
    }));
  }
  
  // Handle date parsing for files
  if (item.files && Array.isArray(item.files)) {
    result.files = item.files.map((file: any) => ({
      ...file,
      itemId: file.itemId || item.id,
      createdAt: file.createdAt ? new Date(file.createdAt) : new Date(),
      updatedAt: new Date(file.updatedAt),
    }));
  }
  
  // Handle date parsing for nested items
  if (item.items && Array.isArray(item.items)) {
    result.items = item.items.map((nestedItem: any) => parseDates(nestedItem));
  }
  
  // Handle date parsing for subfolders
  if (item.subfolders && Array.isArray(item.subfolders)) {
    result.subfolders = item.subfolders.map((subfolder: any) => parseDates(subfolder));
  }
  
  return result;
};

// Helper function to safely store data to localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    console.log(`Saved ${key} to localStorage:`, data.length, "items");
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
    return false;
  }
};

export const KnowledgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<KnowledgeFolder[]>(() => {
    try {
      const savedFolders = localStorage.getItem('mycelial-knowledge-folders');
      console.log("Loading folders from localStorage:", savedFolders);
      if (savedFolders) {
        const parsed = JSON.parse(savedFolders);
        return Array.isArray(parsed) ? parsed.map(parseDates) : [];
      }
    } catch (error) {
      console.error('Failed to parse knowledge folders from localStorage', error);
    }
    return [];
  });

  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(() => {
    try {
      const savedItems = localStorage.getItem('mycelial-knowledge-items');
      console.log("Loading knowledge items from localStorage:", savedItems);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        return Array.isArray(parsed) ? parsed.map(parseDates) : [];
      }
    } catch (error) {
      console.error('Failed to parse knowledge items from localStorage', error);
    }
    return [];
  });

  const [basins, setBasins] = useState<KnowledgeBasin[]>(() => {
    try {
      const savedBasins = localStorage.getItem('mycelial-knowledge-basins');
      console.log("Loading knowledge basins from localStorage:", savedBasins);
      if (savedBasins) {
        const parsed = JSON.parse(savedBasins);
        return Array.isArray(parsed) ? parsed.map(parseDates) : [];
      }
    } catch (error) {
      console.error('Failed to parse knowledge basins from localStorage', error);
    }
    return [];
  });

  // Save folders to localStorage whenever they change
  useEffect(() => {
    console.log("Saving folders to localStorage:", folders.length);
    saveToLocalStorage('mycelial-knowledge-folders', folders);
  }, [folders]);

  // Save knowledge items to localStorage whenever they change
  useEffect(() => {
    console.log("Saving knowledge items to localStorage:", knowledgeItems.length);
    saveToLocalStorage('mycelial-knowledge-items', knowledgeItems);
  }, [knowledgeItems]);

  // Save knowledge basins to localStorage whenever they change
  useEffect(() => {
    console.log("Saving knowledge basins to localStorage:", basins.length);
    saveToLocalStorage('mycelial-knowledge-basins', basins);
  }, [basins]);

  // Create a new knowledge folder
  const createFolder = (
    name: string, 
    description: string, 
    itemIds: string[] = [],
    parentFolderId?: string
  ): KnowledgeFolder => {
    console.log("Creating folder:", name, description, itemIds, parentFolderId);
    
    // If the parentFolderId is "no-parent" or empty string, set it to undefined
    const actualParentFolderId = parentFolderId === "no-parent" || parentFolderId === "" ? undefined : parentFolderId;
    
    // Find the knowledge items based on the provided IDs
    const selectedItems = knowledgeItems.filter(item => itemIds.includes(item.id));
    
    const now = new Date();
    const newFolder: KnowledgeFolder = {
      id: uuidv4(),
      name,
      description,
      items: selectedItems,
      subfolders: [],
      parentFolderId: actualParentFolderId,
      createdAt: now,
      updatedAt: now,
    };

    // Update state with the new folder
    setFolders(prevFolders => {
      const updatedFolders = [...prevFolders, newFolder];
      
      // If parentFolderId is provided, update the parent folder to include this new folder
      if (actualParentFolderId) {
        const folderToUpdate = updatedFolders.find(f => f.id === actualParentFolderId);
        if (folderToUpdate) {
          const updatedParentFolder = {
            ...folderToUpdate,
            subfolders: [...(folderToUpdate.subfolders || []), newFolder],
            updatedAt: now
          };
          
          return updatedFolders.map(f => 
            f.id === actualParentFolderId ? updatedParentFolder : f
          );
        }
      }
      
      return updatedFolders;
    });
    
    toast({
      title: "Folder created",
      description: `${name} has been created successfully with ${selectedItems.length} linked items`,
    });
    
    return newFolder;
  };

  // Update an existing folder
  const updateFolder = (id: string, data: Partial<KnowledgeFolder>) => {
    console.log("Updating folder:", id, data);
    
    setFolders(prevFolders => {
      const updatedFolders = prevFolders.map(folder => {
        if (folder.id === id) {
          const now = new Date();
          // Create a new folder object with updated properties
          return { 
            ...folder, 
            ...data,
            // Ensure we create a new array for items to avoid reference issues
            items: data.items ? [...data.items] : [...folder.items],
            // Ensure we create a new array for subfolders to avoid reference issues
            subfolders: data.subfolders ? [...data.subfolders] : [...(folder.subfolders || [])],
            updatedAt: now 
          };
        }
        return folder;
      });
      
      return updatedFolders;
    });
    
    toast({
      title: "Folder updated",
      description: `Folder has been updated successfully`,
    });
  };

  // Delete a folder and remove it from any parent folders
  const deleteFolder = (id: string) => {
    console.log("Deleting folder:", id);
    
    // First, find the folder to get its parentFolderId
    const folderToDelete = folders.find(folder => folder.id === id);
    
    // Remove from parent folder if it exists
    if (folderToDelete && folderToDelete.parentFolderId) {
      const parentFolder = folders.find(folder => folder.id === folderToDelete.parentFolderId);
      if (parentFolder && parentFolder.subfolders) {
        const updatedParentFolder = {
          ...parentFolder,
          subfolders: parentFolder.subfolders.filter(subfolder => subfolder.id !== id),
          updatedAt: new Date()
        };
        
        setFolders(prevFolders => 
          prevFolders.map(folder => 
            folder.id === parentFolder.id ? updatedParentFolder : folder
          )
        );
      }
    }
    
    // Now remove the folder from the main folders array
    setFolders(prevFolders => prevFolders.filter(folder => folder.id !== id));
    
    toast({
      title: "Folder deleted",
      description: "Folder has been deleted successfully",
    });
  };

  // Add a knowledge item to a folder
  const addItemToFolder = (folderId: string, item: KnowledgeItem) => {
    console.log("Adding item to folder:", folderId, item.id);
    
    setFolders(prevFolders => {
      return prevFolders.map(folder => 
        folder.id === folderId 
          ? { 
              ...folder, 
              items: [...folder.items, item],
              updatedAt: new Date() 
            } 
          : folder
      );
    });
    
    // Update the item to include this folder in its folderIds array
    setKnowledgeItems(prevItems => {
      return prevItems.map(knowledgeItem => {
        if (knowledgeItem.id === item.id) {
          const currentFolderIds = knowledgeItem.folderIds || [];
          if (!currentFolderIds.includes(folderId)) {
            return {
              ...knowledgeItem,
              folderIds: [...currentFolderIds, folderId],
              // If this is the first folder, also set folderId
              folderId: knowledgeItem.folderId || folderId,
              updatedAt: new Date()
            };
          }
        }
        return knowledgeItem;
      });
    });
  };

  // Remove a knowledge item from a folder
  const removeItemFromFolder = (folderId: string, itemId: string) => {
    console.log("Removing item from folder:", folderId, itemId);
    
    setFolders(prevFolders => {
      return prevFolders.map(folder => 
        folder.id === folderId 
          ? { 
              ...folder, 
              items: folder.items.filter(item => item.id !== itemId),
              updatedAt: new Date() 
            } 
          : folder
      );
    });
    
    // Update the item to remove this folder from its folderIds array
    setKnowledgeItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          const currentFolderIds = item.folderIds || [];
          const updatedFolderIds = currentFolderIds.filter(id => id !== folderId);
          
          // If folderId was the primary folder, update that too
          const updatedPrimaryFolderId = item.folderId === folderId 
            ? (updatedFolderIds.length > 0 ? updatedFolderIds[0] : undefined)
            : item.folderId;
            
          return {
            ...item,
            folderIds: updatedFolderIds,
            folderId: updatedPrimaryFolderId,
            updatedAt: new Date()
          };
        }
        return item;
      });
    });
  };

  // Add a folder to another folder (as a subfolder)
  const addFolderToFolder = (parentFolderId: string, childFolderId: string) => {
    console.log("Adding folder to folder:", parentFolderId, childFolderId);
    
    const childFolder = folders.find(folder => folder.id === childFolderId);
    
    if (!childFolder) {
      console.error("Child folder not found:", childFolderId);
      return;
    }
    
    // Update the child folder to reference its parent
    const updatedChildFolder = {
      ...childFolder,
      parentFolderId,
      updatedAt: new Date()
    };
    
    setFolders(prevFolders => {
      // First update the child folder
      const foldersWithUpdatedChild = prevFolders.map(folder => 
        folder.id === childFolderId ? updatedChildFolder : folder
      );
      
      // Then add the child folder to the parent folder's subfolders
      return foldersWithUpdatedChild.map(folder => {
        if (folder.id === parentFolderId) {
          const currentSubfolders = folder.subfolders || [];
          // Check if the child folder is already a subfolder
          if (!currentSubfolders.some(sf => sf.id === childFolderId)) {
            return {
              ...folder,
              subfolders: [...currentSubfolders, updatedChildFolder],
              updatedAt: new Date()
            };
          }
        }
        return folder;
      });
    });
    
    toast({
      title: "Folder linked",
      description: `Folder has been added as a subfolder successfully`,
    });
  };

  // Remove a folder from another folder (remove as subfolder)
  const removeFolderFromFolder = (parentFolderId: string, childFolderId: string) => {
    console.log("Removing folder from folder:", parentFolderId, childFolderId);
    
    // Update the parent folder to remove the child from its subfolders
    setFolders(prevFolders => {
      return prevFolders.map(folder => {
        if (folder.id === parentFolderId && folder.subfolders) {
          return {
            ...folder,
            subfolders: folder.subfolders.filter(sf => sf.id !== childFolderId),
            updatedAt: new Date()
          };
        }
        return folder;
      });
    });
    
    // Update the child folder to remove the parent reference
    setFolders(prevFolders => {
      return prevFolders.map(folder => {
        if (folder.id === childFolderId && folder.parentFolderId === parentFolderId) {
          const { parentFolderId, ...folderWithoutParent } = folder;
          return {
            ...folderWithoutParent,
            parentFolderId: undefined,
            updatedAt: new Date()
          };
        }
        return folder;
      });
    });
    
    toast({
      title: "Folder unlinked",
      description: `Folder has been removed as a subfolder successfully`,
    });
  };

  // Create a new knowledge item
  const createKnowledgeItem = (
    title: string, 
    content: string, 
    folderId: string = '', 
    sections: KnowledgeSection[] = [],
    files: KnowledgeFile[] = []
  ): KnowledgeItem => {
    console.log("Creating knowledge item:", title, content, folderId, sections.length, files.length);
    
    const now = new Date();
    const itemId = uuidv4();
    
    // Ensure all sections have proper IDs and timestamps
    const formattedSections = sections.map(section => ({
      ...section,
      itemId,
      id: section.id || uuidv4(),
      createdAt: section.createdAt || now,
      updatedAt: section.updatedAt || now
    }));
    
    // Ensure all files have proper IDs and timestamps
    const formattedFiles = files.map(file => ({
      ...file,
      itemId,
      id: file.id || uuidv4(),
      createdAt: file.createdAt || now,
      updatedAt: file.updatedAt || now
    }));
    
    // Create the new knowledge item
    const newItem: KnowledgeItem = {
      id: itemId,
      title,
      content,
      folderId: folderId || undefined,
      folderIds: folderId ? [folderId] : [],
      type: 'note', // Default type for knowledge items
      tags: [], // Default empty tags array
      sections: formattedSections.length > 0 ? formattedSections : undefined,
      files: formattedFiles.length > 0 ? formattedFiles : undefined,
      createdAt: now,
      updatedAt: now
    };

    // Update state with the new item
    setKnowledgeItems(prev => [...prev, newItem]);
    
    // If a folder ID was provided, add the item to that folder
    if (folderId) {
      // Use setTimeout to ensure the item is added to state first
      setTimeout(() => {
        addItemToFolder(folderId, newItem);
      }, 0);
    }
    
    toast({
      title: "Knowledge item created",
      description: `"${title}" has been created successfully`,
    });
    
    return newItem;
  };

  // Update an existing knowledge item
  const updateKnowledgeItem = (id: string, data: Partial<KnowledgeItem>) => {
    console.log("Updating knowledge item:", id, data);
    
    const now = new Date();
    let updatedData = { ...data };
    
    // Ensure all sections have proper IDs and timestamps
    if (data.sections) {
      updatedData.sections = data.sections.map(section => ({
        ...section,
        id: section.id || uuidv4(),
        itemId: section.itemId || id,
        createdAt: section.createdAt || now,
        updatedAt: now
      }));
    }
    
    // Ensure all files have proper IDs and timestamps
    if (data.files) {
      updatedData.files = data.files.map(file => ({
        ...file,
        id: file.id || uuidv4(),
        itemId: file.itemId || id,
        createdAt: file.createdAt || now,
        updatedAt: now
      }));
    }
    
    // Get the existing item
    const existingItem = knowledgeItems.find(item => item.id === id);
    
    if (existingItem) {
      // Track which folders the item was in before
      const previousFolderIds = existingItem.folderIds || 
        (existingItem.folderId ? [existingItem.folderId] : []);
        
      // Get the new set of folder IDs
      const newFolderIds = updatedData.folderIds || 
        (updatedData.folderId ? [updatedData.folderId] : []);
      
      // Find folders to add the item to (in new list but not in previous)
      const foldersToAdd = newFolderIds.filter(fId => !previousFolderIds.includes(fId));
      
      // Find folders to remove the item from (in previous but not in new)
      const foldersToRemove = previousFolderIds.filter(fId => !newFolderIds.includes(fId));
      
      // Update the knowledge item in state
      setKnowledgeItems(prevItems => {
        return prevItems.map(item => 
          item.id === id ? { ...item, ...updatedData, updatedAt: now } : item
        );
      });
      
      // Update folders that item was removed from
      foldersToRemove.forEach(folderId => {
        setFolders(prevFolders => {
          return prevFolders.map(folder => {
            if (folder.id === folderId) {
              return {
                ...folder,
                items: folder.items.filter(item => item.id !== id),
                updatedAt: now
              };
            }
            return folder;
          });
        });
      });
      
      // Update folders that item was added to
      foldersToAdd.forEach(folderId => {
        // Get the updated item with all changes applied
        const updatedItem = { ...existingItem, ...updatedData };
        
        setFolders(prevFolders => {
          return prevFolders.map(folder => {
            if (folder.id === folderId) {
              // Check if the item is already in the folder
              const hasItem = folder.items.some(item => item.id === id);
              
              if (!hasItem) {
                return {
                  ...folder,
                  items: [...folder.items, updatedItem],
                  updatedAt: now
                };
              }
            }
            return folder;
          });
        });
      });
    } else {
      // If the item wasn't found, just update the knowledgeItems array
      setKnowledgeItems(prevItems => {
        return prevItems.map(item => 
          item.id === id ? { ...item, ...updatedData, updatedAt: now } : item
        );
      });
    }
    
    toast({
      title: "Knowledge item updated",
      description: `Item has been updated successfully`,
    });
  };

  // Delete a knowledge item
  const deleteKnowledgeItem = (id: string) => {
    console.log("Deleting knowledge item:", id);
    
    // Remove the item from state
    setKnowledgeItems(prevItems => prevItems.filter(item => item.id !== id));
    
    // Also remove the item from any folders that contain it
    setFolders(prevFolders => {
      return prevFolders.map(folder => {
        const hasItem = folder.items.some(item => item.id === id);
        
        if (hasItem) {
          return {
            ...folder,
            items: folder.items.filter(item => item.id !== id),
            updatedAt: new Date()
          };
        }
        
        return folder;
      });
    });
    
    toast({
      title: "Knowledge item deleted",
      description: "Item has been deleted successfully",
    });
  };

  // Basin methods
  const createBasin = (name: string, description: string, itemIds: string[] = []): KnowledgeBasin => {
    const now = new Date();
    const selectedItems = knowledgeItems.filter(item => itemIds.includes(item.id));
    
    const newBasin: KnowledgeBasin = {
      id: uuidv4(),
      name,
      description,
      items: selectedItems,
      createdAt: now,
      updatedAt: now
    };
    
    setBasins(prev => [...prev, newBasin]);
    
    toast({
      title: "Knowledge basin created",
      description: `${name} has been created successfully`,
    });
    
    return newBasin;
  };
  
  const updateBasin = (id: string, data: Partial<KnowledgeBasin>) => {
    const now = new Date();
    
    setBasins(prevBasins => {
      return prevBasins.map(basin => {
        if (basin.id === id) {
          return { 
            ...basin, 
            ...data,
            // Ensure we create a new array for items to avoid reference issues
            items: data.items ? [...data.items] : [...basin.items],
            updatedAt: now 
          };
        }
        return basin;
      });
    });
    
    toast({
      title: "Knowledge basin updated",
      description: `Basin has been updated successfully`,
    });
  };
  
  const deleteBasin = (id: string) => {
    setBasins(prevBasins => prevBasins.filter(basin => basin.id !== id));
    
    toast({
      title: "Knowledge basin deleted",
      description: "Basin has been deleted successfully",
    });
  };

  // Placeholder functions for prompt linking that will be implemented later
  const linkPromptToFolder = (folderId: string, promptId: string) => {
    console.log("Linking prompt to folder:", folderId, promptId);
    
    toast({
      title: "Prompt linked",
      description: `Prompt has been linked to the folder`,
    });
  };

  const unlinkPromptFromFolder = (folderId: string, promptId: string) => {
    console.log("Unlinking prompt from folder:", folderId, promptId);
    
    toast({
      title: "Prompt unlinked",
      description: `Prompt has been unlinked from the folder`,
    });
  };

  // Helper functions to get items by ID
  const getKnowledgeItemById = (id: string): KnowledgeItem | undefined => {
    return knowledgeItems.find(item => item.id === id);
  };

  const getFolderById = (id: string): KnowledgeFolder | undefined => {
    return folders.find(folder => folder.id === id);
  };
  
  const getBasinById = (id: string): KnowledgeBasin | undefined => {
    return basins.find(basin => basin.id === id);
  };

  // Create the context value object
  const contextValue: KnowledgeContextProps = {
    folders,
    knowledgeItems,
    basins,
    createFolder,
    updateFolder,
    deleteFolder,
    addItemToFolder,
    removeItemFromFolder,
    addFolderToFolder,
    removeFolderFromFolder,
    linkPromptToFolder,
    unlinkPromptFromFolder,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    getKnowledgeItemById,
    getFolderById,
    createBasin,
    updateBasin,
    deleteBasin,
    getBasinById
  };

  return (
    <KnowledgeContext.Provider value={contextValue}>
      {children}
    </KnowledgeContext.Provider>
  );
};
