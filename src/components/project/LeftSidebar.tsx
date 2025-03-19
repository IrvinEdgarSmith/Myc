import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import ThreadForm from '@/components/thread/ThreadForm';
import ThreadItem from '@/components/thread/ThreadItem';
import { Project, Thread } from '@/types';

interface LeftSidebarProps {
  activeTab: string;
  project: Project;
  activeThreadId: string | null;
  handleSelectThread: (threadId: string) => void;
  promptCategories: Array<{ id: string; title: string; type: string }>;
  activePromptCategory: string | null;
  handleSelectPromptCategory: (categoryId: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  project,
  activeThreadId,
  handleSelectThread,
  promptCategories,
  activePromptCategory,
  handleSelectPromptCategory,
}) => {
  return (
    <div className="p-4 flex flex-col h-full">
      {activeTab === 'prompt' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Prompt Categories</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              <div className="mb-2">
                <h3 className="text-xs uppercase font-medium text-mycelial-accent/70 mb-1">System Prompts</h3>
                {promptCategories
                  .filter(cat => cat.type === 'system')
                  .map(category => (
                    <Button
                      key={category.id}
                      variant={activePromptCategory === category.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleSelectPromptCategory(category.id)}
                      className="w-full justify-start mb-1 h-8"
                    >
                      <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${activePromptCategory === category.id ? 'rotate-90' : ''}`} />
                      {category.title}
                    </Button>
                  ))}
              </div>
              <div>
                <h3 className="text-xs uppercase font-medium text-mycelial-accent/70 mb-1">User Prompts</h3>
                {promptCategories
                  .filter(cat => cat.type === 'user')
                  .map(category => (
                    <Button
                      key={category.id}
                      variant={activePromptCategory === category.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleSelectPromptCategory(category.id)}
                      className="w-full justify-start mb-1 h-8"
                    >
                      <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${activePromptCategory === category.id ? 'rotate-90' : ''}`} />
                      {category.title}
                    </Button>
                  ))}
              </div>
            </div>
          </ScrollArea>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Threads</h2>
            <ThreadForm projectId={project?.id} />
          </div>
          <ScrollArea className="flex-1">
            {project?.threads?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No threads yet. Create a new thread to start a conversation.</p>
            ) : (
              <div className="space-y-1">
                {project?.threads?.map(thread => (
                  <ThreadItem 
                    key={thread.id} 
                    thread={thread} 
                    projectId={project.id}
                    isActive={thread.id === activeThreadId}
                    onSelect={handleSelectThread}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default LeftSidebar;
