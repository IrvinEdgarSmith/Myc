import React from 'react';
import { AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UsePromptEngineeringReturn } from '../hooks/usePromptEngineering';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import KnowledgeCenterSettings from '@/components/knowledge/settings/KnowledgeCenterSettings';

interface PromptEngineerModelStatusProps {
  engineeringState: UsePromptEngineeringReturn;
}

const PromptEngineerModelStatus: React.FC<PromptEngineerModelStatusProps> = ({ 
  engineeringState 
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { hasOpenRouterApiKey, selectedModelId } = engineeringState;

  // If no API key is set
  if (!hasOpenRouterApiKey) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>OpenRouter API key is required for prompt engineering.</span>
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">Configure</Button>
            </SheetTrigger>
            <KnowledgeCenterSettings isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
          </Sheet>
        </AlertDescription>
      </Alert>
    );
  }

  // If API key exists but no model is selected
  if (!selectedModelId) {
    return (
      <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="flex items-center justify-between">
          <span>Select a model in Knowledge Center Settings to generate prompt responses.</span>
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">Configure</Button>
            </SheetTrigger>
            <KnowledgeCenterSettings isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
          </Sheet>
        </AlertDescription>
      </Alert>
    );
  }

  // Both API key and model are set
  return (
    <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
      <Check className="h-4 w-4 text-green-500" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Using model: <span className="font-medium">{selectedModelId}</span>
        </span>
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">Change Model</Button>
          </SheetTrigger>
          <KnowledgeCenterSettings isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        </Sheet>
      </AlertDescription>
    </Alert>
  );
};

export default PromptEngineerModelStatus;
