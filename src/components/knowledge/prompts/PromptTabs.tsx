import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PromptCategory } from '../types/promptTypes';
import PromptCategorySection from './PromptCategorySection';

interface PromptTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  systemPromptCategories: PromptCategory[];
  userPromptCategories: PromptCategory[];
  viewMode: 'list' | 'grid';
  onCopyPrompt: (text: string) => void;
  onEditPrompt: (prompt: any, categoryId: string) => void;
  onDeletePrompt: (promptId: string, categoryId: string) => void;
}

const PromptTabs: React.FC<PromptTabsProps> = ({
  activeTab,
  onTabChange,
  systemPromptCategories,
  userPromptCategories,
  viewMode,
  onCopyPrompt,
  onEditPrompt,
  onDeletePrompt
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-mycelial-card/50 border border-mycelial-border/20 w-full justify-start mb-6">
        <TabsTrigger value="system">System Prompts</TabsTrigger>
        <TabsTrigger value="user">User Prompts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="system" className="space-y-6 mt-0">
        <div className="mb-4">
          <p className="text-muted-foreground">
            System prompts set the overall context, guidelines, and operational parameters for the AI.
          </p>
        </div>
        
        {systemPromptCategories.length > 0 ? (
          systemPromptCategories.map(category => (
            <PromptCategorySection
              key={category.id}
              category={category}
              viewMode={viewMode}
              onCopyPrompt={onCopyPrompt}
              onEditPrompt={onEditPrompt}
              onDeletePrompt={onDeletePrompt}
            />
          ))
        ) : (
          <div className="p-4 border border-dashed border-mycelial-border/20 rounded-md">
            <p className="text-center text-muted-foreground">
              No system prompt categories available. 
            </p>
          </div>
        )}
      </TabsContent>
        
      <TabsContent value="user" className="space-y-6 mt-0">
        <div className="mb-4">
          <p className="text-muted-foreground">
            User prompts guide task-specific requests and help tailor the AI's responses to individual needs.
          </p>
        </div>
        
        {userPromptCategories.length > 0 ? (
          userPromptCategories.map(category => (
            <PromptCategorySection
              key={category.id}
              category={category}
              viewMode={viewMode}
              onCopyPrompt={onCopyPrompt}
              onEditPrompt={onEditPrompt}
              onDeletePrompt={onDeletePrompt}
            />
          ))
        ) : (
          <div className="p-4 border border-dashed border-mycelial-border/20 rounded-md">
            <p className="text-center text-muted-foreground">
              No user prompt categories available.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PromptTabs;
