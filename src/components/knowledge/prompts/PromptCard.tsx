import React from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { Prompt } from '../types/promptTypes';

interface PromptCardProps {
  prompt: Prompt;
  categoryId: string;
  onCopy: (text: string) => void;
  onEdit: (prompt: Prompt, categoryId: string) => void;
  onDelete: (promptId: string, categoryId: string) => void;
  viewMode: 'list' | 'grid';
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  categoryId,
  onCopy,
  onEdit,
  onDelete,
  viewMode
}) => {
  const renderGridCard = () => (
    <Card key={prompt.id} className="bg-mycelial-card/50 border-mycelial-border/20 h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium">{prompt.title}</h4>
            <CardDescription className="line-clamp-1">{prompt.description}</CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onCopy(prompt.content)}
              className="text-mycelial-accent h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(prompt, categoryId)}
              className="text-amber-500 h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(prompt.id, categoryId)}
              className="text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="bg-background/50 p-3 rounded-md text-sm mt-2 mb-auto border border-mycelial-border/10 line-clamp-4 overflow-hidden">
          {prompt.content}
        </div>
      </CardContent>
    </Card>
  );

  const renderListCard = () => (
    <Card key={prompt.id} className="bg-mycelial-card/50 border-mycelial-border/20">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium">{prompt.title}</h4>
            <CardDescription>{prompt.description}</CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onCopy(prompt.content)}
              className="text-mycelial-accent h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(prompt, categoryId)}
              className="text-amber-500 h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(prompt.id, categoryId)}
              className="text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="bg-background/50 p-3 rounded-md text-sm mt-2 border border-mycelial-border/10">
          {prompt.content}
        </div>
      </CardContent>
    </Card>
  );

  return viewMode === 'grid' ? renderGridCard() : renderListCard();
};

export default PromptCard;
