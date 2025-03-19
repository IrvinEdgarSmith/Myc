import React, { useState, useEffect } from 'react';
import { usePromptCategories } from './hooks/usePromptCategories';
import { usePromptActions } from './hooks/usePromptActions';
import PromptTabs from './prompts/PromptTabs';
import PromptLibraryToolbar from './prompts/PromptLibraryToolbar';
import NewPromptDialog from './prompts/NewPromptDialog';
import EditPromptDialog from './prompts/EditPromptDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, FolderPlus } from 'lucide-react';

const PromptLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  const {
    systemPromptCategories,
    setSystemPromptCategories,
    userPromptCategories,
    setUserPromptCategories
  } = usePromptCategories();

  const {
    isNewPromptOpen,
    setIsNewPromptOpen,
    isEditPromptOpen,
    setIsEditPromptOpen,
    selectedPrompt,
    newPrompt,
    setNewPrompt,
    copyToClipboard,
    handleAddPrompt,
    handleEditPrompt,
    handleDeletePrompt,
    openEditPromptDialog
  } = usePromptActions({
    systemPromptCategories,
    setSystemPromptCategories,
    userPromptCategories,
    setUserPromptCategories,
    activeTab
  });

  useEffect(() => {
    console.log('Active Tab:', activeTab);
  }, [activeTab]);

  // Determine which categories to display based on active tab
  const categoriesToDisplay = activeTab === 'system' ? systemPromptCategories : userPromptCategories;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Logic to create a new category would go here
              console.log(`Create new ${activeTab} prompt category`);
            }}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            New {activeTab === 'system' ? 'System' : 'User'} Category
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <PromptLibraryToolbar 
            viewMode={viewMode}
            setViewMode={setViewMode}
            onNewPromptClick={() => {
              console.log('New prompt button clicked');
              setIsNewPromptOpen(true);
            }}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <PromptTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          systemPromptCategories={systemPromptCategories}
          userPromptCategories={userPromptCategories}
          viewMode={viewMode}
          onCopyPrompt={copyToClipboard}
          onEditPrompt={openEditPromptDialog}
          onDeletePrompt={handleDeletePrompt}
        />
      </ScrollArea>

      <NewPromptDialog
        isOpen={isNewPromptOpen}
        onOpenChange={setIsNewPromptOpen}
        newPrompt={newPrompt}
        onPromptChange={(updatedPrompt) => {
          console.log('Prompt form changed:', updatedPrompt);
          setNewPrompt(updatedPrompt);
        }}
        onSave={handleAddPrompt}
        categories={activeTab === 'system' ? systemPromptCategories : userPromptCategories}
      />

      <EditPromptDialog
        isOpen={isEditPromptOpen}
        onOpenChange={setIsEditPromptOpen}
        promptData={newPrompt}
        onPromptChange={(updatedPrompt) => {
          console.log('Edit form changed:', updatedPrompt);
          setNewPrompt(updatedPrompt);
        }}
        onSave={handleEditPrompt}
      />
    </div>
  );
};

export default PromptLibrary;
