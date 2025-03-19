import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { UsePromptEngineeringReturn } from '../hooks/usePromptEngineering';

interface SelectedPromptsPanelProps {
  engineeringState: UsePromptEngineeringReturn;
}

const SelectedPromptsPanel: React.FC<SelectedPromptsPanelProps> = ({ 
  engineeringState
}) => {
  const {
    selectedPrompts,
    customPrompt,
    removePrompt,
    addCustomPrompt,
    updateCustomPromptContent,
    cancelCustomPrompt
  } = engineeringState;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Selected Prompts</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addCustomPrompt}
          className="bg-mycelial-secondary/20 hover:bg-mycelial-secondary/30 border-mycelial-secondary/40"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add Temp Prompt Ingredient
        </Button>
      </div>
      
      <ScrollArea className="h-24 mb-4">
        <div className="flex gap-2 py-1">
          {selectedPrompts.length === 0 && !customPrompt ? (
            <p className="text-sm text-muted-foreground p-2">
              No prompt components selected yet. Add components from the library or create a custom ingredient.
            </p>
          ) : (
            <div className="flex gap-2">
              {selectedPrompts.map((prompt) => (
                <Card key={prompt.id} className="bg-mycelial-card/30 border-mycelial-border/30 min-w-[180px] max-w-[220px] flex-shrink-0">
                  <CardContent className="p-2">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-start gap-1">
                        <div className="bg-mycelial-secondary/20 text-mycelial-secondary font-medium rounded-full h-5 w-5 flex items-center justify-center text-xs">
                          {prompt.position}
                        </div>
                        <div>
                          <h4 className="font-medium text-xs">{prompt.title}</h4>
                          <p className="text-xs text-muted-foreground">{prompt.category}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrompt(prompt.id)}
                        className="h-5 w-5 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      >
                        &times;
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {customPrompt && (
                <Card className="bg-mycelial-secondary/10 border-mycelial-secondary/30 min-w-[220px] max-w-[300px] flex-shrink-0">
                  <CardContent className="p-2">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-start gap-1">
                        <div className="bg-mycelial-secondary/20 text-mycelial-secondary font-medium rounded-full h-5 w-5 flex items-center justify-center text-xs">
                          {customPrompt.position}
                        </div>
                        <div>
                          <h4 className="font-medium text-xs">Custom Ingredient</h4>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelCustomPrompt}
                        className="h-5 w-5 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      >
                        &times;
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Enter your custom prompt content..."
                      value={customPrompt.content}
                      onChange={(e) => updateCustomPromptContent(e.target.value)}
                      className="min-h-[60px] mt-1 bg-background/60 border-mycelial-border/20 text-xs"
                    />
                    <div className="mt-1 flex justify-end">
                      <Button 
                        size="sm"
                        onClick={() => {
                          if (customPrompt.content.trim()) {
                            engineeringState.setSelectedPrompts([...selectedPrompts, customPrompt]);
                            engineeringState.setCustomPrompt(null);
                          } else {
                            toast({
                              title: "Empty content",
                              description: "Please enter content for your custom prompt ingredient.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="bg-mycelial-secondary hover:bg-mycelial-secondary/90 text-xs h-6"
                        disabled={!customPrompt.content.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SelectedPromptsPanel;
