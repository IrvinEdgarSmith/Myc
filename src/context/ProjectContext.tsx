import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Project, Thread, Message, PromptHistory } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ProjectContextProps {
  projects: Project[];
  currentProjectId: string | null;
  createProject: (name: string, description: string) => string;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  addThreadToProject: (projectId: string, thread: Thread) => void;
  removeThreadFromProject: (projectId: string, threadId: string) => void;
  linkKnowledgeToProject: (projectId: string, knowledgeId: string) => void;
  unlinkKnowledgeFromProject: (projectId: string, knowledgeId: string) => void;
  addPromptHistory: (projectId: string, promptHistory: PromptHistory) => void;
  addMessageToThread: (projectId: string, threadId: string, message: Message) => void;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('mycelial-projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert string dates to Date objects
        return parsed.map((project: any) => ({
          ...project,
          knowledgeInContext: project.knowledgeInContext || [], // Initialize if not present
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          promptHistory: project.promptHistory?.map((prompt: any) => ({
            ...prompt,
            timestamp: new Date(prompt.timestamp),
          })) || [],
          threads: project.threads?.map((thread: any) => ({
            ...thread,
            createdAt: new Date(thread.createdAt),
            updatedAt: new Date(thread.updatedAt),
            messages: thread.messages?.map((message: any) => ({
              ...message,
              createdAt: new Date(message.createdAt),
            })) || [],
          })) || [],
        }));
      } catch (e) {
        console.error('Failed to parse projects from localStorage', e);
        return [];
      }
    }
    return [];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mycelial-projects', JSON.stringify(projects));
  }, [projects]);

  const createProject = (name: string, description: string): string => {
    // Get the OpenRouter API key from localStorage (shared with Workspace)
    const openRouterApiKey = localStorage.getItem('mycelial-global-settings') 
      ? JSON.parse(localStorage.getItem('mycelial-global-settings') || '{}').openRouterApiKey 
      : '';

    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      threads: [],
      linkedKnowledge: [],
      knowledgeInContext: [],
      promptHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    toast({
      title: "Project created",
      description: `${name} has been created successfully`,
    });
    
    return newProject.id;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, ...data, updatedAt: new Date() } 
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
    }
  };

  const selectProject = (id: string) => {
    setCurrentProjectId(id);
  };

  const addThreadToProject = (projectId: string, thread: Thread) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              threads: [...(project.threads || []), thread],
              updatedAt: new Date() 
            } 
          : project
      )
    );
  };

  const removeThreadFromProject = (projectId: string, threadId: string) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId && project.threads
          ? { 
              ...project, 
              threads: project.threads.filter(t => t.id !== threadId),
              updatedAt: new Date() 
            } 
          : project
      )
    );
  };

  const linkKnowledgeToProject = (projectId: string, knowledgeId: string) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              linkedKnowledge: project.linkedKnowledge.includes(knowledgeId)
                ? project.linkedKnowledge
                : [...project.linkedKnowledge, knowledgeId],
              updatedAt: new Date() 
            } 
          : project
      )
    );
  };

  const unlinkKnowledgeFromProject = (projectId: string, knowledgeId: string) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              linkedKnowledge: project.linkedKnowledge.filter(id => id !== knowledgeId),
              // Also remove from knowledgeInContext if it exists there
              knowledgeInContext: project.knowledgeInContext.filter(id => id !== knowledgeId),
              updatedAt: new Date() 
            } 
          : project
      )
    );
  };

  const addPromptHistory = (projectId: string, promptHistory: PromptHistory) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              promptHistory: [...project.promptHistory, promptHistory],
              updatedAt: new Date() 
            } 
          : project
      )
    );
  };

  // Add a new function to add a message to a thread
  const addMessageToThread = (projectId: string, threadId: string, message: Message) => {
    setProjects(prev => 
      prev.map(project => {
        if (project.id !== projectId || !project.threads) return project;
        
        return {
          ...project,
          threads: project.threads.map(thread => {
            if (thread.id !== threadId) return thread;
            
            return {
              ...thread,
              messages: [...thread.messages, message],
              updatedAt: new Date()
            };
          }),
          updatedAt: new Date()
        };
      })
    );
  };

  const contextValue: ProjectContextProps = {
    projects,
    currentProjectId,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    addThreadToProject,
    removeThreadFromProject,
    linkKnowledgeToProject,
    unlinkKnowledgeFromProject,
    addPromptHistory,
    addMessageToThread
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
