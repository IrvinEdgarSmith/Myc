import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileText, Check, X, Key, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { processFileForText } from '@/services/fileUploadService';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { fetchOpenRouterModels } from '@/services/openRouterService';
import { OpenRouterModel } from '@/types';

interface KnowledgeCenterSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const KnowledgeCenterSettings: React.FC<KnowledgeCenterSettingsProps> = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const { settings, updateSettings, hasValidGeminiKey } = useGlobalSettings();
  
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    fileName: string;
    success: boolean;
    message: string;
    content?: string;
  }>>([]);
  
  useEffect(() => {
    if (isOpen) {
      setPromptTemplate(settings.defaultSystemPrompt);
      setGeminiApiKey(settings.geminiApiKey);
      setOpenRouterApiKey(settings.openRouterApiKey || '');
      setSelectedModelId(settings.selectedPromptEngineerModelId || '');
      
      if (settings.openRouterApiKey) {
        fetchModels(settings.openRouterApiKey);
      }
    }
  }, [isOpen, settings]);
  
  const fetchModels = async (apiKey: string) => {
    if (!apiKey) return;
    
    setIsLoadingModels(true);
    try {
      const models = await fetchOpenRouterModels(apiKey);
      setOpenRouterModels(models);
      console.log('Fetched OpenRouter models:', models);
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      toast({
        title: 'Error fetching models',
        description: 'Failed to fetch OpenRouter models. Please check your API key.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptTemplate(e.target.value);
  };
  
  const handleGeminiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiApiKey(e.target.value);
  };
  
  const handleOpenRouterApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenRouterApiKey(e.target.value);
    
    if (!e.target.value) {
      setOpenRouterModels([]);
    }
  };
  
  const handleRefreshModels = () => {
    if (openRouterApiKey) {
      fetchModels(openRouterApiKey);
      toast({
        title: 'Refreshing models',
        description: 'Fetching the latest available models from OpenRouter'
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...fileList]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };
  
  const testFileProcessing = async (file: File, index: number) => {
    setProcessingFile(file.name);
    
    try {
      const useGeminiAPI = hasValidGeminiKey;
      const result = await processFileForText(file, useGeminiAPI);
      
      setTestResults(prev => [...prev, {
        fileName: file.name,
        success: true,
        message: `Successfully processed ${file.name}${useGeminiAPI ? ' with Gemini API' : ''}`,
        content: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : '')
      }]);
      
      toast({
        title: "Test Successful",
        description: `${file.name} was successfully processed and text extracted${useGeminiAPI ? ' using Gemini API' : ''}`,
      });
    } catch (error) {
      console.error(`Error testing file ${file.name}:`, error);
      
      setTestResults(prev => [...prev, {
        fileName: file.name,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }]);
      
      toast({
        title: "Test Failed",
        description: `Failed to process ${file.name}. See console for details.`,
        variant: "destructive",
      });
    } finally {
      setProcessingFile(null);
    }
  };
  
  const saveSettings = () => {
    updateSettings({
      defaultSystemPrompt: promptTemplate,
      geminiApiKey: geminiApiKey,
      openRouterApiKey: openRouterApiKey,
      selectedPromptEngineerModelId: selectedModelId
    });
    
    toast({
      title: "Settings saved",
      description: "Your knowledge center settings have been updated.",
    });
    
    onOpenChange(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Knowledge Center Settings</SheetTitle>
          <SheetDescription>
            Configure settings for the Knowledge Center
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[70vh] mt-6 pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="promptSystemPrompt">Prompt Engineer System Prompt</Label>
              <Textarea 
                id="promptSystemPrompt"
                placeholder="Enter a system prompt for the prompt engineer..."
                className="min-h-[120px]"
                value={promptTemplate}
                onChange={handleSystemPromptChange}
              />
              <p className="text-xs text-muted-foreground">
                This prompt will guide the AI when combining your prompt components
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="openRouterApiKey">OpenRouter API Key</Label>
              <div className="flex">
                <Input
                  id="openRouterApiKey"
                  type="password"
                  placeholder="Enter your OpenRouter API key for model access"
                  value={openRouterApiKey}
                  onChange={handleOpenRouterApiKeyChange}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshModels}
                  disabled={!openRouterApiKey || isLoadingModels}
                  className="ml-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your OpenRouter API key is used for accessing AI models for the Prompt Engineer
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promptEngineerModel">Prompt Engineer Model</Label>
              {!openRouterApiKey ? (
                <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-sm">
                  Please add an OpenRouter API key to see available models.
                </div>
              ) : isLoadingModels ? (
                <Skeleton className="h-10 w-full" />
              ) : openRouterModels.length === 0 ? (
                <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-sm">
                  No models found. Try refreshing or check your API key.
                </div>
              ) : (
                <Select 
                  value={selectedModelId} 
                  onValueChange={setSelectedModelId}
                >
                  <SelectTrigger id="promptEngineerModel">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">
                      None (Select a model)
                    </SelectItem>
                    <SelectItem value="gemini-1.0-pro">
                      Gemini 1.0 Pro
                    </SelectItem>
                    <SelectItem value="gemini-1.5-flash">
                      Gemini 1.5 Flash
                    </SelectItem>
                    {openRouterModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name || model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                This model will be used by the Prompt Engineer in all projects
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="geminiApiKey">Gemini API Key</Label>
              <div className="flex">
                <Input
                  id="geminiApiKey"
                  type="password"
                  placeholder="Enter your Gemini API key for embedding generation"
                  value={geminiApiKey}
                  onChange={handleGeminiApiKeyChange}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your Gemini API key is used for advanced text extraction and embedding generation
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Test File Processing</Label>
              <div className="border border-dashed border-mycelial-border/50 rounded-md p-4">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload files to test text extraction{hasValidGeminiKey ? ' with Gemini API' : ''}
                </p>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Selected Files</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex justify-between items-center text-sm p-2 bg-mycelial-card/30 rounded">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {processingFile === file.name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => testFileProcessing(file, index)}
                              className="h-6 px-2 py-1 text-xs"
                              disabled={!!processingFile}
                            >
                              Test
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 ml-1"
                            disabled={!!processingFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {testResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Test Results</Label>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <Card key={index} className={`p-2 text-sm ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{result.fileName}</span>
                        </div>
                        <p className="text-xs mt-1">{result.message}</p>
                        {result.content && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-hidden">
                            <p className="font-medium">Extracted Text Preview:</p>
                            <p className="whitespace-pre-wrap break-words">{result.content}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
          <Button onClick={saveSettings}>
            Save Settings
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default KnowledgeCenterSettings;
