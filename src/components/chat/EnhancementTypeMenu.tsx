import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings2, Zap } from 'lucide-react';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { EnhancementType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea';
import { toast } from '../ui/use-toast';

interface EnhancementTypeMenuProps {
  children: React.ReactNode;
  onSelect: (enhancementType: EnhancementType | null) => void;
  selectedEnhancementType: EnhancementType | null;
}

const EnhancementTypeMenu: React.FC<EnhancementTypeMenuProps> = ({
  children,
  onSelect,
  selectedEnhancementType
}) => {
  const { settings, addEnhancementType, updateEnhancementType, deleteEnhancementType } = useGlobalSettings();
  const [open, setOpen] = useState(false);
    const [editEnhancementType, setEditEnhancementType] = useState<EnhancementType | null>(null);
    const [isNew, setIsNew] = useState(false);

    const handleEnhancementTypeSelect = (enhancementType: EnhancementType | null) => {
        onSelect(enhancementType);
        setOpen(false);
    };

    const handleCreateNew = () => {
        setEditEnhancementType({
            id: '',
            name: '',
            systemPromptModifications: '',
            knowledgeContext: ''
        });
        setIsNew(true);
    }

    const handleEdit = (enhancementType: EnhancementType) => {
        setEditEnhancementType(enhancementType);
        setIsNew(false);
    }

    const handleDelete = (id: string) => {
        deleteEnhancementType(id);
        if (selectedEnhancementType?.id === id) {
            onSelect(null); // Clear selection if deleted type was selected
        }
        toast({
            title: 'Enhancement Type Deleted',
            description: 'The enhancement type has been deleted.',
        });
    }

    const handleSave = () => {
        if (!editEnhancementType) return;

        if (isNew) {
            const newType = addEnhancementType(
                editEnhancementType.name,
                editEnhancementType.systemPromptModifications,
                editEnhancementType.knowledgeContext
            );
            onSelect(newType); // Select the newly created type
            toast({
                title: 'Enhancement Type Created',
                description: 'The new enhancement type has been created and selected.',
            });
        } else {
            updateEnhancementType(editEnhancementType.id, editEnhancementType);
            toast({
                title: 'Enhancement Type Updated',
                description: 'The enhancement type has been updated.',
            });
        }

        setEditEnhancementType(null);
    }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => handleEnhancementTypeSelect(null)}>
            None
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {settings.enhancementTypes?.map((type) => (
            <DropdownMenuItem key={type.id} onSelect={() => handleEnhancementTypeSelect(type)}>
              {type.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateNew}>
            <Zap className="mr-2 h-4 w-4" />
            Create New
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(false)}>
            <Settings2 className="mr-2 h-4 w-4" />
            Manage
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

            {editEnhancementType && (
                <Dialog open={!!editEnhancementType} onOpenChange={() => setEditEnhancementType(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isNew ? 'Create Enhancement Type' : 'Edit Enhancement Type'}</DialogTitle>
                            <DialogDescription>
                                {isNew ? 'Define a new enhancement type.' : 'Modify an existing enhancement type.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={editEnhancementType.name}
                                    onChange={(e) => setEditEnhancementType({ ...editEnhancementType, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="systemPromptModifications">System Prompt Modifications</Label>
                                <Textarea
                                    id="systemPromptModifications"
                                    value={editEnhancementType.systemPromptModifications}
                                    onChange={(e) => setEditEnhancementType({ ...editEnhancementType, systemPromptModifications: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="knowledgeContext">Knowledge Context (Optional)</Label>
                                <Textarea
                                    id="knowledgeContext"
                                    value={editEnhancementType.knowledgeContext || ''}
                                    onChange={(e) => setEditEnhancementType({ ...editEnhancementType, knowledgeContext: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            {!isNew && (
                                <Button type="button" variant="destructive" onClick={() => {
                                    handleDelete(editEnhancementType.id);
                                    setEditEnhancementType(null);
                                }}>
                                    Delete
                                </Button>
                            )}
                            <Button type="button" onClick={() => setEditEnhancementType(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={handleSave}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
    </>
  );
};

export default EnhancementTypeMenu;
