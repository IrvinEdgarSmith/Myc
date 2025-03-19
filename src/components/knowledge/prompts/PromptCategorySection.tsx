import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import PromptCard from './PromptCard';
import { PromptCategory } from '../types/promptTypes';

interface PromptCategorySectionProps {
  category: PromptCategory;
  viewMode: 'list' | 'grid';
  onCopyPrompt: (text: string) => void;
  onEditPrompt: (prompt: any, categoryId: string) => void;
  onDeletePrompt: (promptId: string, categoryId: string) => void;
}

const PromptCategorySection: React.FC<PromptCategorySectionProps> = ({
  category,
  viewMode,
  onCopyPrompt,
  onEditPrompt,
  onDeletePrompt
}) => {
  useEffect(() => {
    console.log(`Rendering PromptCategorySection for ${category.title} with ${category.prompts.length} prompts`);
  }, [category]);

  return (
    <div key={category.id} className="mb-8">
      <div className="mb-3">
        <h3 className="text-lg font-medium">{category.title}</h3>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </div>
      
      {category.prompts.length === 0 && category.isCustom ? (
        <div className="p-4 border border-dashed border-mycelial-border/20 rounded-md">
          <p className="text-sm text-muted-foreground">
            No custom prompts yet. Add your first prompt by clicking the "New Prompt" button.
          </p>
        </div>
      ) : category.prompts.length === 0 ? (
        <div className="p-4 border border-dashed border-mycelial-border/20 rounded-md">
          <p className="text-sm text-muted-foreground">
            No prompts in this category yet.
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
          {category.prompts.map(prompt => {
            console.log(`Rendering prompt: ${prompt.title} (${prompt.id})`);
            return (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                categoryId={category.id}
                onCopy={onCopyPrompt}
                onEdit={onEditPrompt}
                onDelete={onDeletePrompt}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromptCategorySection;
