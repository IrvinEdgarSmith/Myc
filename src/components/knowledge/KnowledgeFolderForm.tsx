import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useKnowledge } from '@/context/KnowledgeContext';
import { KnowledgeFolder } from '@/types';
import FolderSelector from './items/folders/FolderSelector';

interface KnowledgeFolderFormProps {
  folder?: KnowledgeFolder;
  onSubmit: (data: { name: string; description: string; parentFolderId?: string }) => void;
  onCancel: () => void;
}

const KnowledgeFolderForm: React.FC<KnowledgeFolderFormProps> = ({
  folder,
  onSubmit,
  onCancel
}) => {
  const { folders } = useKnowledge();
  const [selectedParentFolderId, setSelectedParentFolderId] = useState<string | undefined>(
    folder?.parentFolderId
  );
  const [selectedParentFolders, setSelectedParentFolders] = useState<string[]>(
    folder?.parentFolderId ? [folder.parentFolderId] : []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      name: folder?.name || '',
      description: folder?.description || ''
    }
  });

  useEffect(() => {
    if (folder) {
      reset({
        name: folder.name,
        description: folder.description
      });
      setSelectedParentFolderId(folder.parentFolderId);
      setSelectedParentFolders(folder.parentFolderId ? [folder.parentFolderId] : []);
    }
  }, [folder, reset]);

  const onFormSubmit = (data: { name: string; description: string }) => {
    onSubmit({
      ...data,
      parentFolderId: selectedParentFolders[0] // Currently we only support one parent folder
    });
  };

  const handleToggleParentFolder = (folderId: string) => {
    // For now, we're only supporting one parent folder
    if (selectedParentFolders.includes(folderId)) {
      setSelectedParentFolders([]);
      setSelectedParentFolderId(undefined);
    } else {
      setSelectedParentFolders([folderId]);
      setSelectedParentFolderId(folderId);
    }
  };

  // Get all folders except the current one (to avoid circular references)
  const availableFolders = folders.filter(f => f.id !== folder?.id);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Folder Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Folder name is required' })}
          placeholder="Enter folder name"
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter folder description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Parent Folder (Optional)</Label>
        <FolderSelector
          folders={availableFolders}
          selectedFolderIds={selectedParentFolders}
          onFolderToggle={handleToggleParentFolder}
          placeholder="Select parent folder (optional)"
          excludeFolderIds={folder ? [folder.id] : []}
        />
        <p className="text-sm text-muted-foreground">
          Select a parent folder to create a nested folder structure
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : folder ? 'Update Folder' : 'Create Folder'}
        </Button>
      </div>
    </form>
  );
};

export default KnowledgeFolderForm;
