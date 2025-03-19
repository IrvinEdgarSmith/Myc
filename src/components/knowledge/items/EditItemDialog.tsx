import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FileText, Upload, Link, X, Folder, FolderPlus, Check, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from '@/components/ui/use-toast';
import { useKnowledge } from '@/context/KnowledgeContext';
import { KnowledgeSection, KnowledgeFile } from '@/types';
import ItemDetailsView from './ItemDetailsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import FolderSelector from './folders/FolderSelector';

interface EditItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
}

const EditItemDialog: React.FC<EditItemDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  itemId
}) => {
  const { getKnowledgeItemById, updateKnowledgeItem, folders } = useKnowledge();
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [editedItem, setEditedItem] = useState<{
    title: string;
    content: string;
    folderId?: string;
    sections: KnowledgeSection[];
    files: KnowledgeFile[];
    selectedFolderIds?: string[];
  }>({
    title: '',
    content: '',
    sections: [],
    files: [],
    selectedFolderIds: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalItem = itemId ? getKnowledgeItemById(itemId) : null;
  
  const { isProcessing, processFiles } = useFileProcessor(itemId || '');
  const isLoading = isProcessing || isSubmitting;

  useEffect(() => {
    if (itemId && isOpen) {
      const item = getKnowledgeItemById(itemId);
      if (item) {
        const primaryFolderId = item.folderId;
        const selectedFolderIds: string[] = [];
        
        if (primaryFolderId) {
          selectedFolderIds.push(primaryFolderId);
        }
        
        // Add additional folder IDs if they exist in the item
        if (item.folderIds) {
          item.folderIds.forEach(id => {
            if (!selectedFolderIds.includes(id)) {
              selectedFolderIds.push(id);
            }
          });
        }
        
        setEditedItem({
          title: item.title || '',
          content: item.content || '',
          folderId: primaryFolderId,
          sections: item.sections || [],
          files: item.files || [],
          selectedFolderIds: selectedFolderIds,
        });
      }
    } else {
      setEditedItem({
        title: '',
        content: '',
        sections: [],
        files: [],
        selectedFolderIds: [],
      });
      setActiveTab('view');
    }
  }, [itemId, isOpen, getKnowledgeItemById]);

  const handleUpdateItem = async () => {
    if (!editedItem.title || !itemId) return;
    
    setIsSubmitting(true);
    
    try {
      const primaryFolderId = editedItem.selectedFolderIds && editedItem.selectedFolderIds.length > 0 
        ? editedItem.selectedFolderIds[0] 
        : undefined;
      
      updateKnowledgeItem(itemId, {
        ...editedItem,
        folderId: primaryFolderId,
        folderIds: editedItem.selectedFolderIds
      });
      
      toast({
        title: "Knowledge Item Updated",
        description: "The knowledge item has been updated successfully",
      });
      
      setActiveTab('view');
    } catch (error) {
      console.error("Error updating knowledge item:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the knowledge item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSection = () => {
    if (editedItem.sections && editedItem.sections.length >= 5) {
      toast({
        title: "Maximum sections reached",
        description: "You can add up to 5 sections per knowledge item",
        variant: "destructive",
      });
      return;
    }
    
    const newSection: KnowledgeSection = {
      id: uuidv4(),
      title: '',
      content: '',
      itemId: itemId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setEditedItem({
      ...editedItem,
      sections: [...(editedItem.sections || []), newSection],
    });
  };

  const removeSection = (sectionId: string) => {
    setEditedItem({
      ...editedItem,
      sections: (editedItem.sections || []).filter(section => section.id !== sectionId),
    });
  };

  const updateSection = (sectionId: string, field: 'title' | 'content', value: string) => {
    setEditedItem({
      ...editedItem,
      sections: (editedItem.sections || []).map(section => 
        section.id === sectionId ? { ...section, [field]: value, updatedAt: new Date() } : section
      ),
    });
  };

  const handleFileUploadClick = () => {
    if (editedItem.files && editedItem.files.length >= 30) {
      toast({
        title: "Maximum files reached",
        description: "You can add up to 30 files per knowledge item",
        variant: "destructive",
      });
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if ((editedItem.files?.length || 0) + files.length > 30) {
      toast({
        title: "Maximum files reached",
        description: "You can add up to 30 files per knowledge item",
        variant: "destructive",
      });
      return;
    }
    
    const newFiles = await processFiles(files);
    
    setEditedItem({
      ...editedItem,
      files: [...(editedItem.files || []), ...newFiles],
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setEditedItem({
      ...editedItem,
      files: (editedItem.files || []).filter(file => {
        if (file.id === fileId) {
          URL.revokeObjectURL(file.url);
          return false;
        }
        return true;
      }),
    });
  };

  const toggleFolderSelection = (folderId: string) => {
    setEditedItem(prev => {
      const currentSelectedFolders = prev.selectedFolderIds || [];
      
      if (currentSelectedFolders.includes(folderId)) {
        return {
          ...prev,
          selectedFolderIds: currentSelectedFolders.filter(id => id !== folderId)
        };
      } else {
        return {
          ...prev,
          selectedFolderIds: [...currentSelectedFolders, folderId]
        };
      }
    });
  };

  const renderFileItem = (file: KnowledgeFile) => (
    <div key={file.id} className="flex items-center justify-between bg-mycelial-card/50 rounded p-2 text-sm">
      <div className="flex items-center overflow-hidden">
        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="truncate">{file.name}</span>
        {file.content && (
          <span className="ml-2 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
            Text Extracted
          </span>
        )}
      </div>
      <Button
        onClick={() => removeFile(file.id)}
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 ml-2"
        disabled={isLoading}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );

  if (!itemId || !originalItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Knowledge Item</DialogTitle>
          <DialogDescription>
            View or edit details for your knowledge item with RAG support.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'view' | 'edit')} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="mt-4 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <ItemDetailsView item={originalItem} onEdit={() => setActiveTab('edit')} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-4 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="grid gap-4 py-4 pr-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={editedItem.title || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
                    placeholder="Item title"
                    className="col-span-3"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right mt-2">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    value={editedItem.content || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, content: e.target.value })}
                    placeholder="Main content for this item"
                    className="col-span-3"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">
                    Item Folders
                  </Label>
                  <div className="col-span-3">
                    <FolderSelector
                      folders={folders}
                      selectedFolderIds={editedItem.selectedFolderIds || []}
                      onFolderToggle={toggleFolderSelection}
                      placeholder="Select folders..."
                    />
                    
                    {editedItem.selectedFolderIds && editedItem.selectedFolderIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {editedItem.selectedFolderIds.map(folderId => {
                          const folder = folders.find(f => f.id === folderId);
                          return folder ? (
                            <div 
                              key={folder.id} 
                              className="flex items-center bg-secondary/20 text-secondary py-1 px-2 rounded-md text-sm"
                            >
                              <Folder className="h-3 w-3 mr-1" />
                              {folder.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => toggleFolderSelection(folder.id)}
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-mycelial-border/20 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Sections</h3>
                    <Button
                      onClick={addSection}
                      size="sm"
                      variant="outline"
                      disabled={(editedItem.sections || []).length >= 5 || isLoading}
                    >
                      <Plus className="mr-2 h-3 w-3" /> Add Section
                    </Button>
                  </div>
                  
                  {(editedItem.sections || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-4">No sections added yet. Add up to 5 sections.</p>
                  ) : (
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-4">
                        {(editedItem.sections || []).map((section, index) => (
                          <div key={section.id} className="border border-mycelial-border/20 rounded-md p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium">Section {index + 1}</h4>
                              <Button
                                onClick={() => removeSection(section.id)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <Label htmlFor={`section-title-${section.id}`} className="text-xs">Title</Label>
                                <Input
                                  id={`section-title-${section.id}`}
                                  value={section.title}
                                  onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                  placeholder="Section title"
                                  className="mt-1"
                                  disabled={isLoading}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`section-content-${section.id}`} className="text-xs">Content</Label>
                                <Textarea
                                  id={`section-content-${section.id}`}
                                  value={section.content}
                                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                                  placeholder="Section content"
                                  className="mt-1"
                                  rows={3}
                                  disabled={isLoading}
                                />
                              </div>
                              
                              {section.embeddings && (
                                <div className="text-xs flex items-center text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  RAG embeddings generated
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
                
                <div className="border-t border-mycelial-border/20 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Files</h3>
                    <Button
                      onClick={handleFileUploadClick}
                      size="sm"
                      variant="outline"
                      disabled={(editedItem.files || []).length >= 30 || isLoading}
                    >
                      <Upload className="mr-2 h-3 w-3" />
                      Upload File
                      {isProcessing && " (Processing...)"}
                    </Button>
                  </div>
                  
                  {(editedItem.files || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-4">
                      No files uploaded yet. Add up to 30 files. Text files, PDFs, and Markdown files will be processed for RAG.
                    </p>
                  ) : (
                    <ScrollArea className="max-h-[200px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(editedItem.files || []).map(file => renderFileItem(file))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
          disabled={isLoading}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {activeTab === 'edit' && (
            <Button 
              onClick={handleUpdateItem} 
              disabled={!editedItem.title || isLoading}
            >
              {isSubmitting ? 'Updating...' : 'Update Item'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
