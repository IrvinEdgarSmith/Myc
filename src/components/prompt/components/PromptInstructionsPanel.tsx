import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { UsePromptEngineeringReturn } from '../hooks/usePromptEngineering';
import { useProject } from '@/context/ProjectContext';
import { useOpenRouter } from '@/services/openRouterService';

interface PromptInstructionsPanelProps {
  engineeringState: UsePromptEngineeringReturn;
}

const PromptInstructionsPanel: React.FC<PromptInstructionsPanelProps> = ({ 
  engineeringState 
}) => {
  const {
    customInstructions,
    setCustomInstructions,
    constructFinalPrompt,
    selectedPrompts,
    hasOpenRouterApiKey,
    selectedModelId
  } = engineeringState;
  
  const { isLoading, setIsLoading } = useOpenRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCreatePrompt = async () => {
    setIsProcessing(true);
    setIsLoading(true);
    try {
      await constructFinalPrompt();
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-1">
        <h4 className="text-sm font-medium">Combination Instructions</h4>
        <p className="text-xs text-muted-foreground">
          Explain how you want the AI to combine the selected prompt components.
        </p>
      </div>
      <Textarea
        placeholder="Explain how you want the AI to combine these prompt components..."
        value={customInstructions}
        onChange={(e) => setCustomInstructions(e.target.value)}
        className="min-h-[100px] bg-mycelial-background/40 border-mycelial-border/30 mb-4"
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleCreatePrompt}
          className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
          disabled={selectedPrompts.length === 0 || isProcessing || isLoading}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" /> 
              {hasOpenRouterApiKey && selectedModelId 
                ? "Create, Improve & Copy Prompt" 
                : "Create & Copy Prompt"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PromptInstructionsPanel;
