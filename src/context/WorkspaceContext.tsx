import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
    import { v4 as uuidv4 } from 'uuid';
    import { Workspace, Thread, Message, WorkspaceSettings } from '@/types';
    import { getChatCompletion } from '@/services/openRouterService';
    import { toast } from '@/components/ui/use-toast';
    import { useKnowledge } from './KnowledgeContext';

    interface WorkspaceContextProps {
      workspaces: Workspace[];
      createWorkspace: (name: string) => Promise<Workspace>;
      renameWorkspace: (id: string, name: string) => void;
      deleteWorkspace: (id: string) => void;
      currentWorkspaceId: string | null;
      currentThreadId: string | null;
      currentWorkspace: Workspace | null;
      setCurrentWorkspaceId: (id: string | null) => void;
      toggleWorkspaceExpand: (id: string) => void;
      selectThread: (workspaceId: string, threadId: string) => void;
      renameThread: (workspaceId: string, threadId: string, name: string) => void;
      createThread: (workspaceId: string, name?: string) => Promise<Thread>;
      deleteThread: (workspaceId: string, threadId: string) => void;
      currentThread: Thread | null;
      saveMessage: (workspaceId: string, threadId: string, message: Partial<Message>) => void;
      saveAssistantMessage: (workspaceId: string, threadId: string, content: string) => void;
      linkKnowledgeToWorkspace: (workspaceId: string, knowledgeId: string) => void;
      unlinkKnowledgeFromWorkspace: (workspaceId: string, knowledgeId: string) => void;
      toggleKnowledgeInContext: (workspaceId: string, knowledgeId: string) => void;
      updateWorkspaceSettings: (workspaceId: string, settings: Partial<WorkspaceSettings>) => void;
      updateAllWorkspacesSettings: (settings: Partial<WorkspaceSettings>) => void;
      sendMessage: (userMessage: string, systemPrompt: string) => Promise<void>;
      getKnowledgeContext: (workspaceId: string) => string;
    }

    const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

    export const useWorkspace = () => {
      const context = useContext(WorkspaceContext);
      if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
      }
      return context;
    };

    const parseDates = (item: any) => {
      if (!item) return item;
      
      const result = {
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      };
      
      if (item.threads && Array.isArray(item.threads)) {
        result.threads = item.threads.map((thread: any) => ({
          ...thread,
          createdAt: thread.createdAt ? new Date(thread.createdAt) : new Date(),
          updatedAt: thread.updatedAt ? new Date(thread.updatedAt) : new Date(),
          messages: thread.messages ? thread.messages.map((message: any) => ({
            ...message,
            createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
          })) : []
        }));
      }
      
      return result;
    };

    const saveToLocalStorage = (key: string, data: any) => {
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        return true;
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error);
        return false;
      }
    };

    export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      const { knowledgeItems, folders } = useKnowledge();
      const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
        try {
          const savedWorkspaces = localStorage.getItem('mycelial-workspaces');
          if (savedWorkspaces) {
            const parsed = JSON.parse(savedWorkspaces);
            return Array.isArray(parsed) ? parsed.map(parseDates) : [];
          }
        } catch (error) {
          console.error('Failed to parse workspaces from localStorage', error);
        }
        return [];
      });
      
      const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
      const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
      
      const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || null;
      const currentThread = currentWorkspace
        ? currentWorkspace.threads.find(t => t.id === currentThreadId)
        : null;

      useEffect(() => {
        saveToLocalStorage('mycelial-workspaces', workspaces);
      }, [workspaces]);

      const createWorkspace = async (name: string): Promise<Workspace> => {
        const id = uuidv4();
        const now = new Date();

        const newWorkspace: Workspace = {
          id,
          name: name || 'New Workspace',
          threads: [],
          isExpanded: true,
          settings: {
            temperature: 0.7,
            selectedModelId: '',
            overrideSystemPrompt: false,
            customSystemPrompt: '',
            selectedPersonaId: '',
          },
          linkedKnowledge: [],
          knowledgeInContext: [],
          createdAt: now,
          updatedAt: now
        };

        setWorkspaces(prev => [...prev, newWorkspace]);
        setCurrentWorkspaceId(id);

        return newWorkspace;
      };

      const renameWorkspace = (id: string, name: string) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === id) {
              return { ...workspace, name, updatedAt: new Date() };
            }
            return workspace;
          });
        });
      };

      const deleteWorkspace = (id: string) => {
        setWorkspaces(prev => prev.filter(workspace => workspace.id !== id));
        if (currentWorkspaceId === id) {
          setCurrentWorkspaceId(null);
        }
      };

      const toggleWorkspaceExpand = (id: string) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === id) {
              return { ...workspace, isExpanded: !workspace.isExpanded };
            }
            return workspace;
          });
        });
      };

      const selectThread = (workspaceId: string, threadId: string) => {
        setCurrentWorkspaceId(workspaceId);
        setCurrentThreadId(threadId);

        const workspace = workspaces.find(w => w.id === workspaceId);
        const threadExists = workspace?.threads.some(t => t.id === threadId);

        if (!workspace) {
          console.error(`Workspace ${workspaceId} not found`);
          return;
        }

        if (!threadExists) {
          console.error(`Thread ${threadId} not found in workspace ${workspaceId}`);
          return;
        }
      };

      const renameThread = (workspaceId: string, threadId: string, name: string) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              const updatedThreads = workspace.threads.map(thread => {
                if (thread.id === threadId) {
                  return { ...thread, name, updatedAt: new Date() };
                }
                return thread;
              });

              return { ...workspace, threads: updatedThreads };
            }
            return workspace;
          });
        });
      };

      const createThread = async (workspaceId: string, name: string = 'New Thread'): Promise<Thread> => {
        const newThread: Thread = {
          id: uuidv4(),
          name,
          workspaceId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              return {
                ...workspace,
                threads: [...workspace.threads, newThread]
              };
            }
            return workspace;
          });
        });

        return newThread;
      };

      const deleteThread = (workspaceId: string, threadId: string) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              const updatedThreads = workspace.threads.filter(thread => thread.id !== threadId);
              return { ...workspace, threads: updatedThreads };
            }
            return workspace;
          });
        });
      };

      const saveMessage = (workspaceId: string, threadId: string, message: Partial<Message>) => {
        const messageToSave: Message = {
          id: uuidv4(),
          threadId,
          role: message.role || 'user',
          content: message.content || '',
          createdAt: new Date()
        };

        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              const updatedThreads = workspace.threads.map(thread => {
                if (thread.id === threadId) {
                  return {
                    ...thread,
                    messages: [...thread.messages, messageToSave],
                    updatedAt: new Date()
                  };
                }
                return thread;
              });

              return { ...workspace, threads: updatedThreads };
            }
            return workspace;
          });
        });
      };

      const saveAssistantMessage = (workspaceId: string, threadId: string, content: string) => {
        const assistantMessage: Message = {
          id: uuidv4(),
          threadId,
          role: 'assistant',
          content,
          createdAt: new Date()
        };

        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              const updatedThreads = workspace.threads.map(thread => {
                if (thread.id === threadId) {
                  return {
                    ...thread,
                    messages: [...thread.messages, assistantMessage],
                    updatedAt: new Date()
                  };
                }
                return thread;
              });

              return { ...workspace, threads: updatedThreads };
            }
            return workspace;
          });
        });
      };

      const linkKnowledgeToWorkspace = (workspaceId: string, knowledgeId: string) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              if (!workspace.linkedKnowledge.includes(knowledgeId)) {
                return {
                  ...workspace,
                  linkedKnowledge: [...workspace.linkedKnowledge, knowledgeId],
                  updatedAt: new Date()
                };
              }
            }
            return workspace;
          });
        });
      };

      const unlinkKnowledgeFromWorkspace = (workspaceId: string, knowledgeId: string) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              return {
                ...workspace,
                linkedKnowledge: workspace.linkedKnowledge.filter(id => id !== knowledgeId),
                updatedAt: new Date()
              };
            }
            return workspace;
          });
        });
      };

      const toggleKnowledgeInContext = (workspaceId: string, knowledgeId: string) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              const knowledgeInContext = workspace.knowledgeInContext || [];
              const isKnowledgeInContext = knowledgeInContext.includes(knowledgeId);

              const updatedKnowledgeInContext = isKnowledgeInContext
                ? knowledgeInContext.filter(id => id !== knowledgeId)
                : [...knowledgeInContext, knowledgeId];

              return {
                ...workspace,
                knowledgeInContext: updatedKnowledgeInContext,
                updatedAt: new Date()
              };
            }
            return workspace;
          });
        });
      };

      const updateWorkspaceSettings = (workspaceId: string, settings: Partial<WorkspaceSettings>) => {
        setWorkspaces(prev => {
          return prev.map(workspace => {
            if (workspace.id === workspaceId) {
              return {
                ...workspace,
                settings: { ...workspace.settings, ...settings },
                            updatedAt: new Date()
          };
        }
        return workspace;
      });
    });
  };

  const updateAllWorkspacesSettings = (settings: Partial<WorkspaceSettings>) => {
    setWorkspaces(prev => {
      return prev.map(workspace => ({
        ...workspace,
        settings: { ...workspace.settings, ...settings },
        updatedAt: new Date()
      }));
    });
  };

  // New function to gather knowledge context for RAG
  const getKnowledgeContext = (workspaceId: string): string => {
    const workspace = workspaces.find(w => w.id === workspaceId);

    if (!workspace || !workspace.knowledgeInContext || workspace.knowledgeInContext.length === 0 ||
        workspace.settings?.includeKnowledgeInPrompt === false) {
      return '';
    }

    let contextText = '### KNOWLEDGE CONTEXT ###\n\n';

    // Add knowledge item content
    workspace.knowledgeInContext.forEach(id => {
      // Check if it's a knowledge item
      const item = knowledgeItems.find(item => item.id === id);
      if (item) {
        contextText += `## ${item.title} ##\n${item.content}\n\n`;

        // Add sections if they exist
        if (item.sections && item.sections.length > 0) {
          item.sections.forEach(section => {
            contextText += `### ${section.title} ###\n${section.content}\n\n`;
          });
        }

        // Add file content if files exist
        if (item.files && item.files.length > 0) {
          item.files.forEach(file => {
            if (file.content) {
              contextText += `### File: ${file.name} ###\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
            }
          });
        }
      }

      // Check if it's a folder
      const folder = folders.find(folder => folder.id === id);
      if (folder) {
        contextText += `## Knowledge Folder: ${folder.name} ##\n${folder.description || ""}\n\n`;

        // Add all items in the folder
        const folderItems = knowledgeItems.filter(item => item.folderId === folder.id);
        folderItems.forEach(item => {
          contextText += `### ${item.title} ###\n${item.content}\n\n`;

          // Add sections if they exist
          if (item.sections && item.sections.length > 0) {
            item.sections.forEach(section => {
              contextText += `#### ${section.title} ####\n${section.content}\n\n`;
            });
          }

          // Add file content if files exist
          if (item.files && item.files.length > 0) {
            item.files.forEach(file => {
              if (file.content) {
                contextText += `#### File: ${file.name} ####\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
              }
            });
          }
        });
      }
    });

    contextText += "### END OF KNOWLEDGE CONTEXT ###\n\nPlease use the above information to help answer the user's questions when relevant.";

    return contextText;
  };

  // Modify the sendMessage function to include knowledge context
  const sendMessage = async (userMessage: string, systemPrompt: string) => {
    if (!currentWorkspaceId) {
      toast({
        title: "Error",
        description: "No workspace selected. Please select a workspace first.",
        variant: "destructive",
        duration: 3000
      });
      throw new Error("No workspace selected");
    }

    if (!currentThreadId) {
      toast({
        title: "Error",
        description: "No thread selected. Please select a thread first.",
        variant: "destructive",
        duration: 3000
      });
      throw new Error("No thread selected");
    }

    const workspace = workspaces.find(w => w.id === currentWorkspaceId);
    if (!workspace) {
      toast({
        title: "Error",
        description: "Selected workspace not found.",
        variant: "destructive",
        duration: 3000
      });
      throw new Error("Workspace not found");
    }

    const thread = workspace.threads.find(t => t.id === currentThreadId);
    if (!thread) {
      toast({
        title: "Error",
        description: "Selected thread not found.",
        variant: "destructive",
        duration: 3000
      });
      throw new Error("Thread not found");
    }

    saveMessage(workspace.id, thread.id, {
      role: 'user',
      content: userMessage
    });

    const apiKey = localStorage.getItem('openrouter-api-key');
    if (!apiKey) {
      toast({
        title: "Error",
        description: "OpenRouter API key not found. Please add your API key in settings.",
        variant: "destructive",
        duration: 3000
      });
      throw new Error("OpenRouter API key not found");
    }

    const modelId = workspace.settings.selectedModelId || "openai/gpt-3.5-turbo";

    try {
      // Get knowledge context
      const knowledgeContext = getKnowledgeContext(workspace.id);

      // Combine system prompt with knowledge context if applicable
      const fullSystemPrompt = knowledgeContext
        ? `${systemPrompt}\n\n${knowledgeContext}`
        : systemPrompt;

      const messages = [
        { role: 'system', content: fullSystemPrompt },
        ...thread.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      const temperature = workspace.settings.temperature || 0.7;
      const assistantResponse = await getChatCompletion(
        apiKey,
        modelId,
        messages,
        temperature
      );

      saveAssistantMessage(workspace.id, thread.id, assistantResponse);

      return;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI model.",
        variant: "destructive",
        duration: 3000
      });
      throw error;
    }
  };

  const contextValue: WorkspaceContextProps = {
    workspaces,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    currentWorkspaceId,
    currentThreadId,
    currentWorkspace,
    setCurrentWorkspaceId,
    toggleWorkspaceExpand,
    selectThread,
    renameThread,
    createThread,
    deleteThread,
    currentThread,
    saveMessage,
    saveAssistantMessage,
    linkKnowledgeToWorkspace,
    unlinkKnowledgeFromWorkspace,
    toggleKnowledgeInContext,
    updateWorkspaceSettings,
    updateAllWorkspacesSettings,
    sendMessage,
    getKnowledgeContext,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
