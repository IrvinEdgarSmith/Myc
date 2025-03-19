import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useProject } from '@/context/ProjectContext';
import { toast } from '@/components/ui/use-toast';
import { fetchOpenRouterModels } from '@/services/openRouterService';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { OpenRouterModel, Project } from '@/types';

interface ProjectSettingsProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projectId, open, onOpenChange }) => {
  const { projects, updateProject } = useProject();
  const project = projects.find(p => p.id === projectId);
  
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [temperature, setTemperature] = useState([0.7]); // Default temperature
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    if (project) {
      // Initialize with project settings if they exist, otherwise use defaults
      setSystemPrompt(project.systemPrompt || '');
      setSelectedModel(project.modelId || '');
      setTemperature([project.temperature || 0.7]);
      setApiKey(project.openRouterApiKey || localStorage.getItem('openrouter-api-key') || '');
    }
  }, [project]);

  useEffect(() => {
    // Fetch models when component mounts or API key changes
    if (apiKey) {
      fetchModels();
    }
  }, [apiKey]);
  
  const fetchModels = async () => {
    setLoading(true);
    try {
      const models = await fetchOpenRouterModels(apiKey);
      setOpenRouterModels(models);
    } catch (error) {
      console.error("Failed to fetch models:", error);
      toast({
        title: "Error",
        description: "Failed to fetch models. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSettings = () => {
    if (project) {
      // Save API key to localStorage
      if (apiKey) {
        localStorage.setItem('openrouter-api-key', apiKey);
      }
      
      // Update the project with custom settings
      const updatedSettings: Partial<Project> = {
        linkedKnowledge: project.linkedKnowledge, // preserve existing linked knowledge
        knowledgeInContext: project.knowledgeInContext, // preserve knowledge in context
      };
      
      // Add custom settings as custom properties
      (updatedSettings as any).systemPrompt = systemPrompt;
      (updatedSettings as any).modelId = selectedModel;
      (updatedSettings as any).temperature = temperature[0];
      (updatedSettings as any).openRouterApiKey = apiKey;
      
      updateProject(projectId, updatedSettings);
      
      toast({
        title: "Settings saved",
        description: "Your project settings have been updated"
      });
      
      onOpenChange(false);
    }
  };

  const handleRefreshModels = () => {
    fetchModels();
    toast({
      title: "Refreshing models",
      description: "Fetching the latest available models from OpenRouter"
    });
  };
  
  if (!project) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-mycelial-card border-mycelial-border/30">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure the project's AI assistant settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
            <Input
              id="openrouter-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="bg-mycelial-background/40 border-mycelial-border/30"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared with our servers.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              placeholder="Enter system instructions for the AI..."
              className="min-h-[100px] bg-mycelial-background/40 border-mycelial-border/30"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The system prompt sets the behavior and context for the AI assistant.
              Knowledge items marked for inclusion will be automatically added to the context.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="model">LLM Model</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshModels}
                disabled={!apiKey || loading}
                className="h-7 w-7 p-0"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
            
            {!apiKey ? (
              <div className="p-3 rounded-md bg-mycelial-secondary/10 border border-mycelial-secondary/20 text-sm">
                Please add an OpenRouter API key to see available models.
              </div>
            ) : loading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            ) : openRouterModels.length === 0 ? (
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-sm">
                No models found. Try refreshing or check your API key.
              </div>
            ) : (
              <div className="space-y-2">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model" className="bg-mycelial-background/40 border-mycelial-border/30">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none" className="focus:bg-mycelial-secondary/10">
                      None (Select a model)
                    </SelectItem>
                    {openRouterModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedModel && selectedModel !== "_none" && (
                  <div className="text-xs text-muted-foreground p-2 rounded bg-mycelial-card/50">
                    {openRouterModels.find(m => m.id === selectedModel)?.description || 
                      "Selected model will be used for chat responses in this project."}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {temperature[0].toFixed(1)}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onValueChange={setTemperature}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>More Predictable</span>
              <span>More Creative</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lower values produce more predictable responses, higher values produce more creative ones.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSaveSettings} 
            className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettings;
