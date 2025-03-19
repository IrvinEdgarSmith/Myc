import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TabsContent } from '@/components/ui/tabs';
import ThreadChatInterface from '@/components/chat/ThreadChatInterface';
import PromptEngineeringTab from '@/components/prompt/PromptEngineeringTab';
import { Project } from '@/types';

interface TabContentProps {
  activeTab: string;
  project: Project | undefined;
  activeThreadId: string | null;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  project,
  activeThreadId,
}) => {
  return (
    <div className="h-full">
      <TabsContent value="chat" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
        <ThreadChatInterface 
          projectId={project?.id} 
          threadId={activeThreadId}
        />
      </TabsContent>
      
      <TabsContent value="knowledge" className="h-full p-4 data-[state=active]:flex flex-col overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Knowledge Items</h2>
        <p className="text-sm text-muted-foreground">Knowledge items linked to this project will appear here.</p>
      </TabsContent>
      
      <TabsContent value="prompt" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
        <PromptEngineeringTab projectId={project?.id} />
      </TabsContent>
      
      <TabsContent value="history" className="h-full p-4 data-[state=active]:flex flex-col overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Prompt History</h2>
        {project?.promptHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prompt history yet. Your interactions will be recorded here.</p>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              {project?.promptHistory.map(entry => (
                <div key={entry.id} className="bg-mycelial-card/80 rounded-lg p-3">
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-medium mb-1">Prompt:</p>
                  <p className="text-sm mb-3 whitespace-pre-wrap">{entry.prompt}</p>
                  <p className="font-medium mb-1">Response:</p>
                  <p className="text-sm whitespace-pre-wrap">{entry.response}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
    </div>
  );
};

export default TabContent;
