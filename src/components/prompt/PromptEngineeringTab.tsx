import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PromptCategory } from '@/components/knowledge/types/promptTypes';
import { usePromptEngineering } from './hooks/usePromptEngineering';
import { systemPromptCategories, userPromptCategories } from './data/promptCategoriesData';
import PromptCategoryView from './components/PromptCategoryView';
import SelectedPromptsPanel from './components/SelectedPromptsPanel';
import PromptInstructionsPanel from './components/PromptInstructionsPanel';
import PromptEngineerModelStatus from './components/PromptEngineerModelStatus';

interface PromptEngineeringTabProps {
  projectId?: string;
}

const PromptEngineeringTab: React.FC<PromptEngineeringTabProps> = ({ projectId }) => {
  const engineeringState = usePromptEngineering();
  const { activeCategory, setActiveCategory, addPrompt } = engineeringState;
  
  // Combine all categories
  const allCategories: PromptCategory[] = [...systemPromptCategories, ...userPromptCategories];
  
  // Find the currently active category
  const currentCategory = allCategories.find(c => c.id === activeCategory) || null;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-mycelial-card/30 border-b border-mycelial-border/30 p-4">
        <h2 className="text-xl font-semibold mb-2">Prompt Engineering</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Combine prompt components to create effective, complex prompts. Select categories from the sidebar.
        </p>
        <PromptEngineerModelStatus engineeringState={engineeringState} />
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Category sidebar */}
        <div className="w-60 border-r border-mycelial-border/30 bg-mycelial-card/10 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-medium mb-2 text-sm">System Prompts</h3>
            <div className="space-y-1 mb-4">
              {systemPromptCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
                    activeCategory === category.id
                      ? 'bg-mycelial-secondary/20 text-mycelial-secondary'
                      : 'hover:bg-mycelial-card/40'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
            
            <h3 className="font-medium mb-2 text-sm">User Prompts</h3>
            <div className="space-y-1">
              {userPromptCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
                    activeCategory === category.id
                      ? 'bg-mycelial-secondary/20 text-mycelial-secondary'
                      : 'hover:bg-mycelial-card/40'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content area - showing only the currently selected category's prompts */}
        <ScrollArea className="flex-1 p-4">
          <PromptCategoryView 
            category={currentCategory} 
            onAddPrompt={addPrompt} 
          />
        </ScrollArea>
      </div>
      
      {/* Fixed bottom bar for selected prompts and instructions */}
      <div className="border-t border-mycelial-border/30 bg-mycelial-card/20 p-4">
        <SelectedPromptsPanel engineeringState={engineeringState} />
        <PromptInstructionsPanel engineeringState={engineeringState} />
      </div>
    </div>
  );
};

export default PromptEngineeringTab;
