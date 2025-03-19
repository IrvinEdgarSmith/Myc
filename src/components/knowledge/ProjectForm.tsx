import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProject } from '@/context/ProjectContext';
import { fetchOpenRouterModels } from '@/services/openRouterService';

export interface ProjectFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Project description is required'),
});

type FormValues = z.infer<typeof formSchema>;

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onOpenChange }) => {
  const { createProject } = useProject();
  
  // Get the OpenRouter API key from localStorage (shared with Workspace)
  const openRouterApiKey = localStorage.getItem('mycelial-global-settings') 
    ? JSON.parse(localStorage.getItem('mycelial-global-settings') || '{}').openRouterApiKey 
    : '';
  
  // Pre-fetch models when the form opens if we have an API key
  useEffect(() => {
    if (isOpen && openRouterApiKey) {
      fetchOpenRouterModels(openRouterApiKey).catch(error => {
        console.error('Failed to fetch OpenRouter models:', error);
      });
    }
  }, [isOpen, openRouterApiKey]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    createProject(data.name, data.description);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-mycelial-secondary hover:bg-mycelial-secondary/90">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
