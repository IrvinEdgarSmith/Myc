import React, { useState, useRef, useEffect } from 'react';
  import { Label } from '@/components/ui/label';
  import { Input } from '@/components/ui/input';
  import { Textarea } from '@/components/ui/textarea';
  import { Button } from '@/components/ui/button';
  import { useKnowledge } from '@/context/KnowledgeContext';
  import { v4 as uuidv4 } from 'uuid';
  import { toast } from '@/components/ui/use-toast';
  import { Plus, X, Upload, File as FileIcon } from 'lucide-react';
  import { KnowledgeFile, KnowledgeSection } from '@/types';
  import { ScrollArea } from '@/components/ui/scroll-area';
  import FolderSelect from './FolderSelect';
  import { useFileProcessor } from '@/hooks/useFileProcessor'; // Import the hook

  interface KnowledgeItemFormProps {
    onClose: () => void;
    initialFolderId?: string;
    itemId?: string;
  }

  interface SectionState {
    id: string;
    title: string;
    content: string;
  }

  const KnowledgeItemForm: React.FC<KnowledgeItemFormProps> = ({
    onClose,
    initialFolderId,
    itemId,
  }) => {
    const {
      createKnowledgeItem,
      updateKnowledgeItem,
      getKnowledgeItemById,
      folders,
    } = useKnowledge();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sections, setSections] = useState<SectionState[]>([]);
    const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(
      initialFolderId ? [initialFolderId] : []
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditMode = !!itemId;

    // Use the useFileProcessor hook
    const { processFiles } = useFileProcessor(itemId);

    // State for managing uploaded files
    const [uploadedFiles, setUploadedFiles] = useState<KnowledgeFile[]>([]);

    useEffect(() => {
      if (itemId) {
        const item = getKnowledgeItemById(itemId);
        if (item) {
          setTitle(item.title);
          setContent(item.content);

          // Convert KnowledgeSection[] to SectionState[]
          if (item.sections) {
            setSections(
              item.sections.map((section) => ({
                id: section.id,
                title: section.title,
                content: section.content,
              }))
            );
          }

          // Initialize uploadedFiles with existing files
          if (item.files) {
            setUploadedFiles(item.files);
          }

          const folderIds: string[] = [];
          if (item.folderId) folderIds.push(item.folderId);
          if (item.folderIds) {
            item.folderIds.forEach((id) => {
              if (!folderIds.includes(id)) folderIds.push(id);
            });
          }
          setSelectedFolderIds(folderIds);
        }
      }
    }, [itemId, getKnowledgeItemById]);

    const addSection = () => {
      if (sections.length >= 5) {
        toast({
          title: 'Maximum sections reached',
          description: 'You can add up to 5 sections per knowledge item',
          variant: 'destructive',
        });
        return;
      }

      setSections([
        ...sections,
        {
          id: uuidv4(),
          title: '',
          content: '',
        },
      ]);
    };

    const removeSection = (id: string) => {
      setSections(sections.filter((section) => section.id !== id));
    };

    const updateSection = (
      id: string,
      field: 'title' | 'content',
      value: string
    ) => {
      setSections(
        sections.map((section) =>
          section.id === id ? { ...section, [field]: value } : section
        )
      );
    };

    const handleFileChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (e.target.files && e.target.files.length > 0) {
        const filesToProcess = Array.from(e.target.files);

        if (uploadedFiles.length + filesToProcess.length > 30) {
          toast({
            title: 'File limit exceeded',
            description: 'You can upload up to 30 files per knowledge item',
            variant: 'destructive',
          });
          return;
        }

        // Process the files and get the KnowledgeFile objects
        const processed = await processFiles(e.target.files);
        setUploadedFiles((prev) => [...prev, ...processed]); // Add to uploaded files

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    const removeFile = (id: string) => {
      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim()) {
        toast({
          title: 'Title required',
          description: 'Please enter a title for your knowledge item',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const primaryFolderId =
          selectedFolderIds.length > 0 ? selectedFolderIds[0] : undefined;

        // Convert sections to the format expected by the API
        const formattedSections: KnowledgeSection[] = sections.map(
          (section) => ({
            id: section.id,
            itemId: itemId || '', // Will be set properly by the backend
            title: section.title,
            content: section.content,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        );

        if (isEditMode && itemId) {
          await updateKnowledgeItem(itemId, {
            title,
            content,
            folderId: primaryFolderId,
            folderIds: selectedFolderIds,
            sections: formattedSections,
            files: uploadedFiles, // Use the KnowledgeFile objects
          });

          toast({
            title: 'Knowledge item updated',
            description: 'Your knowledge item has been updated successfully',
          });
        } else {
          await createKnowledgeItem(
            title,
            content,
            primaryFolderId,
            formattedSections,
            uploadedFiles // Use the KnowledgeFile objects
          );

          toast({
            title: 'Knowledge item created',
            description: 'Your knowledge item has been created successfully',
          });
        }

        onClose();
      } catch (error) {
        console.error('Error with knowledge item:', error);
        toast({
          title: 'Error',
          description: `There was an error ${
            isEditMode ? 'updating' : 'creating'
          } your knowledge item`,
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter a title for your knowledge item"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Main Content</Label>
          <Textarea
            id="content"
            placeholder="Enter the main content of your knowledge item"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
          />
        </div>

        <div>
          <Label>Select Folders</Label>
          <FolderSelect
            folders={folders}
            selectedFolderIds={selectedFolderIds}
            onChange={setSelectedFolderIds}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Additional Sections</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSection}
              disabled={sections.length >= 5}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Section
            </Button>
          </div>

          {sections.length > 0 ? (
            <ScrollArea className="max-h-[300px] mt-2">
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={section.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Section {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(section.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`section-${section.id}-title`}>
                          Section Title
                        </Label>
                        <Input
                          id={`section-${section.id}-title`}
                          value={section.title}
                          onChange={(e) =>
                            updateSection(section.id, 'title', e.target.value)
                          }
                          placeholder="Enter section title"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`section-${section.id}-content`}>
                          Section Content
                        </Label>
                        <Textarea
                          id={`section-${section.id}-content`}
                          value={section.content}
                          onChange={(e) =>
                            updateSection(section.id, 'content', e.target.value)
                          }
                          placeholder="Enter section content"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              No additional sections. Add a section if you want to organize
              your content.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Attachments ({uploadedFiles.length}/30)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadedFiles.length >= 30}
            >
              <Upload className="h-4 w-4 mr-1" />
              Add Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>

          {uploadedFiles.length > 0 ? (
            <ScrollArea className="max-h-[200px] mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              No files attached. Add files to include them with your knowledge
              item.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Item'
              : 'Create Item'}
          </Button>
        </div>
      </form>
    );
  };

  export default KnowledgeItemForm;
