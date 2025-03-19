import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Slider } from '@/components/ui/slider';
    import { useWorkspace } from '@/context/WorkspaceContext';
    import { toast } from '@/components/ui/use-toast';
    import { useGlobalSettings } from '@/hooks/useGlobalSettings';
    import { OpenRouterModel, SystemPersona, Workspace } from '@/types';
    import { fetchOpenRouterModels } from '@/services/openRouterService';
    import { Skeleton } from '@/components/ui/skeleton';
    import { RefreshCw, Search } from 'lucide-react';
    import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

    interface WorkspaceSettingsProps {
      workspaceId: string;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }

    const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ workspaceId, open, onOpenChange }) => {
      const { workspaces, updateWorkspaceSettings } = useWorkspace();
      const { settings: globalSettings } = useGlobalSettings();
      const workspace = workspaces.find(w => w.id === workspaceId);

      const [systemPrompt, setSystemPrompt] = useState('');
      const [selectedModel, setSelectedModel] = useState('');
      const [temperature, setTemperature] = useState([0.7]);
      const [selectedPersonaId, setSelectedPersonaId] = useState<string | undefined>(undefined);
      const [overrideSystemPrompt, setOverrideSystemPrompt] = useState(false);
      const [customSystemPrompt, setCustomSystemPrompt] = useState('');
      const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
      const [loading, setLoading] = useState(false);
      const [apiKey, setApiKey] = useState('');
      const [modelSearchOpen, setModelSearchOpen] = useState(false);
      const [modelSearchTerm, setModelSearchTerm] = useState('');

      useEffect(() => {
        if (workspace) {
          setSystemPrompt(workspace.settings.customSystemPrompt || '');
          setSelectedModel(workspace.settings.selectedModelId || '');
          setTemperature([workspace.settings.temperature || 0.7]);
          setSelectedPersonaId(workspace.settings.selectedPersonaId);
          setOverrideSystemPrompt(workspace.settings.overrideSystemPrompt || false);
          setCustomSystemPrompt(workspace.settings.customSystemPrompt || '');
          setApiKey(workspace.settings.openRouterApiKey || localStorage.getItem('openrouter-api-key') || '');
        }
      }, [workspace]);

      useEffect(() => {
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
            variant: "destructive",
            duration: 3000
          });
        } finally {
          setLoading(false);
        }
      };

      const handleSaveSettings = () => {
        if (workspace) {
          if (apiKey) {
            localStorage.setItem('openrouter-api-key', apiKey);
          }

          const updatedSettings = {
            ...workspace.settings,
            selectedModelId: selectedModel,
            temperature: temperature[0],
            selectedPersonaId: selectedPersonaId,
            overrideSystemPrompt: overrideSystemPrompt,
            customSystemPrompt: customSystemPrompt,
            openRouterApiKey: apiKey
          };

          updateWorkspaceSettings(workspaceId, updatedSettings);

          toast({
            title: "Settings saved",
            description: "Your workspace settings have been updated",
            duration: 3000
          });

          onOpenChange(false);
        }
      };

      const handleRefreshModels = () => {
        fetchModels();
        toast({
          title: "Refreshing models",
          description: "Fetching the latest available models from OpenRouter",
          duration: 3000
        });
      };

      // Filter models based on search term
      const filteredModels = openRouterModels.filter(model =>
        model.name?.toLowerCase().includes(modelSearchTerm.toLowerCase()) ||
        model.id.toLowerCase().includes(modelSearchTerm.toLowerCase())
      );

      if (!workspace) return null;

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[600px] bg-mycelial-card border-mycelial-border/30">
            <DialogHeader>
              <DialogTitle>Workspace Settings</DialogTitle>
              <DialogDescription>
                Configure the workspace's AI assistant settings
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
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The system prompt sets the behavior and context for the AI assistant.
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
                    <Popover open={modelSearchOpen} onOpenChange={setModelSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={modelSearchOpen}
                          className="w-full justify-between bg-mycelial-background/40 border-mycelial-border/30"
                        >
                          {selectedModel ?
                            openRouterModels.find(model => model.id === selectedModel)?.name || selectedModel :
                            "Select model"}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search models..."
                            value={modelSearchTerm}
                            onValueChange={setModelSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>No models found.</CommandEmpty>
                            <CommandGroup>
                              {filteredModels.map(model => (
                                <CommandItem
                                  key={model.id}
                                  onSelect={() => {
                                    setSelectedModel(model.id);
                                    setModelSearchOpen(false);
                                    setModelSearchTerm('');
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span>{model.name}</span>
                                    <span className="text-xs text-muted-foreground">{model.id}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedModel && (
                      <div className="text-xs text-muted-foreground p-2 rounded bg-mycelial-card/50">
                        {openRouterModels.find(m => m.id === selectedModel)?.description ||
                          "Selected model will be used for chat responses in this workspace."}
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
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={temperature}
                  onValueChange={setTemperature}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More Predictable (0.1)</span>
                  <span>More Creative (2.0)</span>
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

    export default WorkspaceSettings;
