import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Thread } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ThreadFormProps {
  onClose?: () => void;
  workspaceId?: string;
  projectId?: string;
}

const ThreadForm: React.FC<ThreadFormProps> = ({ onClose, workspaceId, projectId }) => {
  const { createThread, currentWorkspaceId, selectThread } = useWorkspace();
  const [threadName, setThreadName] = useState('New Thread');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!threadName.trim()) {
      return;
    }
    
    try {
      setIsCreating(true);
      // Use the provided workspaceId or fall back to the current workspace
      const targetWorkspaceId = workspaceId || currentWorkspaceId;
      
      if (!targetWorkspaceId) {
        toast({
          title: "Error",
          description: "No workspace selected to create thread",
          variant: "destructive",
        });
        return;
      }
      
      const newThread = await createThread(targetWorkspaceId, threadName.trim());
      
      // Select the newly created thread
      if (newThread) {
        selectThread(targetWorkspaceId, newThread.id);
        toast({
          title: "Success",
          description: `Thread "${threadName}" created successfully`,
        });
      }
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setThreadName('New Thread');
      
      // Call onClose if provided
      if (onClose) onClose();
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">New Thread</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="threadName" className="text-sm font-medium">
              Thread Name
            </label>
            <Input
              id="threadName"
              value={threadName}
              onChange={(e) => setThreadName(e.target.value)}
              placeholder="Enter thread name"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isCreating || !threadName.trim()}
            >
              {isCreating ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ThreadForm;
