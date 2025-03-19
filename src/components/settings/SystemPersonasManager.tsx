import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { SystemPersona } from '@/types';
import { EditIcon, PlusCircle, Trash2, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '../ui/switch';

const SystemPersonasManager: React.FC = () => {
  const { settings, addSystemPersona, updateSystemPersona, deleteSystemPersona } = useGlobalSettings();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<SystemPersona | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promptAddition: '',
    iconColor: '#0EA5E9',
    gradientFrom: '#0EA5E9',
    gradientTo: '#2563EB',
    visibleInChat: true
  });
  
  const handleAddClick = () => {
    setFormData({
      name: '',
      description: '',
      promptAddition: '',
      iconColor: '#0EA5E9',
      gradientFrom: '#0EA5E9',
      gradientTo: '#2563EB',
      visibleInChat: true
    });
    setIsAddDialogOpen(true);
  };
  
  const handleEditClick = (persona: SystemPersona) => {
    setSelectedPersona(persona);
    setFormData({
      name: persona.name,
      description: persona.description,
      promptAddition: persona.promptAddition,
      iconColor: persona.iconColor,
      gradientFrom: persona.gradientFrom || persona.iconColor,
      gradientTo: persona.gradientTo || persona.iconColor,
      visibleInChat: persona.visibleInChat !== undefined ? persona.visibleInChat : true
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (persona: SystemPersona) => {
    if (persona.isSystem) {
      toast({
        title: "Cannot Delete",
        description: "Built-in system personas cannot be deleted",
        variant: "destructive"
      });
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${persona.name}"?`)) {
      if (deleteSystemPersona(persona.id)) {
        toast({
          title: "Persona Deleted",
          description: `"${persona.name}" has been deleted`
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete persona",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, visibleInChat: checked }));
  };
  
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitAdd = () => {
    const { name, description, promptAddition, iconColor, gradientFrom, gradientTo, visibleInChat } = formData;
    
    if (!name || !promptAddition) {
      toast({
        title: "Missing Fields",
        description: "Name and Prompt Addition are required",
        variant: "destructive"
      });
      return;
    }
    
    addSystemPersona(
      name, 
      description, 
      promptAddition, 
      iconColor,
      gradientFrom,
      gradientTo,
      visibleInChat
    );
    
    toast({
      title: "Persona Added",
      description: `"${name}" has been added as a system persona`
    });
    
    setIsAddDialogOpen(false);
  };
  
  const handleSubmitEdit = () => {
    if (!selectedPersona) return;
    
    const { name, description, promptAddition, iconColor, gradientFrom, gradientTo, visibleInChat } = formData;
    
    if (!name || !promptAddition) {
      toast({
        title: "Missing Fields",
        description: "Name and Prompt Addition are required",
        variant: "destructive"
      });
      return;
    }
    
    updateSystemPersona(selectedPersona.id, {
      name,
      description,
      promptAddition,
      iconColor,
      gradientFrom,
      gradientTo,
      visibleInChat
    });
    
    toast({
      title: "Persona Updated",
      description: `"${name}" has been updated`
    });
    
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium">System Personas</h2>
          <p className="text-sm text-muted-foreground">
            Customize AI personas with specific behaviors and knowledge
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Persona
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.systemPersonas.map(persona => (
          <Card key={persona.id} className="relative">
            <div className="absolute right-3 top-3 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleEditClick(persona)}
              >
                <EditIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${!persona.isSystem ? "text-destructive hover:text-destructive/90" : "text-muted-foreground/40 cursor-not-allowed"}`}
                onClick={() => !persona.isSystem && handleDeleteClick(persona)}
                disabled={persona.isSystem}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ 
                      background: persona.gradientFrom && persona.gradientTo 
                        ? `linear-gradient(135deg, ${persona.gradientFrom}, ${persona.gradientTo})` 
                        : persona.iconColor
                    }}
                  />
                  <CardTitle className="text-lg">{persona.name}</CardTitle>
                </div>
              </div>
              <CardDescription>{persona.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xs space-y-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Visible in chat:</span>
                  {persona.visibleInChat !== false ? (
                    <span className="flex items-center text-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <X className="h-3 w-3 mr-1" />
                      No
                    </span>
                  )}
                </div>
                {persona.isSystem && (
                  <div className="text-amber-600">
                    System persona
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground truncate">
                {persona.promptAddition.substring(0, 100)}...
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Persona Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add System Persona</DialogTitle>
            <DialogDescription>
              Create a new AI persona with custom behavior and knowledge
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Creative Writer"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Specializes in creative writing"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="promptAddition" className="text-right pt-2">
                Prompt Addition
              </Label>
              <Textarea
                id="promptAddition"
                name="promptAddition"
                value={formData.promptAddition}
                onChange={handleInputChange}
                placeholder="e.g., You are a creative writer who specializes in..."
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="iconColor" className="text-right">
                Icon Color
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Input
                  id="iconColor"
                  name="iconColor"
                  type="color"
                  value={formData.iconColor}
                  onChange={handleColorInputChange}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">Base color</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gradientFrom" className="text-right">
                Gradient From
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Input
                  id="gradientFrom"
                  name="gradientFrom"
                  type="color"
                  value={formData.gradientFrom}
                  onChange={handleColorInputChange}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">Gradient start color</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gradientTo" className="text-right">
                Gradient To
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Input
                  id="gradientTo"
                  name="gradientTo"
                  type="color"
                  value={formData.gradientTo}
                  onChange={handleColorInputChange}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">Gradient end color</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visibleInChat" className="text-right">
                Visible in Chat
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Switch
                  id="visibleInChat"
                  checked={formData.visibleInChat}
                  onCheckedChange={handleToggleChange}
                />
                <span className="text-sm text-muted-foreground">Show this persona in the chat interface</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Preview</Label>
              <div className="col-span-3">
                <div 
                  className="w-10 h-10 rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${formData.gradientFrom}, ${formData.gradientTo})`
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd}>Add Persona</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Persona Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit System Persona</DialogTitle>
            <DialogDescription>
              Update this AI persona's behavior and appearance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={selectedPersona?.isSystem}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={selectedPersona?.isSystem}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-promptAddition" className="text-right pt-2">
                Prompt Addition
              </Label>
              <Textarea
                id="edit-promptAddition"
                name="promptAddition"
                value={formData.promptAddition}
                onChange={handleInputChange}
                className="col-span-3"
                rows={4}
                disabled={selectedPersona?.isSystem}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-iconColor" className="text-right">
                Icon Color
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Input
                  id="edit-iconColor"
                  name="iconColor"
                  type="color"
                  value={formData.iconColor}
                  onChange={handleColorInputChange}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">Base color</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-gradientFrom" className="text-right">
                Gradient From
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Input
                  id="edit-gradientFrom"
                  name="gradientFrom"
                  type="color"
                  value={formData.gradientFrom}
                  onChange={handleColorInputChange}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">Gradient start color</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-gradientTo" className="text-right">
                Gradient To
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Input
                  id="edit-gradientTo"
                  name="gradientTo"
                  type="color"
                  value={formData.gradientTo}
                  onChange={handleColorInputChange}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">Gradient end color</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-visibleInChat" className="text-right">
                Visible in Chat
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Switch
                  id="edit-visibleInChat"
                  checked={formData.visibleInChat}
                  onCheckedChange={handleToggleChange}
                />
                <span className="text-sm text-muted-foreground">Show this persona in the chat interface</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Preview</Label>
              <div className="col-span-3">
                <div 
                  className="w-10 h-10 rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${formData.gradientFrom}, ${formData.gradientTo})`
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemPersonasManager;
