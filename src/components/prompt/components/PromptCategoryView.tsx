import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PromptCategory, PromptCategoryItem } from '@/components/knowledge/types/promptTypes';

interface PromptCategoryViewProps {
  category: PromptCategory | null;
  onAddPrompt: (prompt: PromptCategoryItem, categoryTitle: string) => void;
}

const PromptCategoryView: React.FC<PromptCategoryViewProps> = ({ category, onAddPrompt }) => {
  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Select a category from the sidebar to view available prompts</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-2">
          {category.title}
        </h3>
        <p className="text-muted-foreground">
          {category.description}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.prompts.map(prompt => (
          <Card 
            key={prompt.id} 
            className="bg-mycelial-card/50 border-mycelial-border/20 hover:bg-mycelial-card/80 transition-colors h-full flex flex-col"
          >
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{prompt.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddPrompt(prompt, category.title)}
                  className="text-mycelial-accent h-8 w-8 p-0"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-background/50 p-3 rounded-md text-sm mt-2 flex-1 border border-mycelial-border/10 overflow-auto max-h-32">
                {prompt.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default PromptCategoryView;
