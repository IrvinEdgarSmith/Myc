// Knowledge Types
export interface KnowledgeFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  itemId: string;
  content?: string;
  embeddings?: number[];
  fileUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeSection {
  id: string;
  itemId: string;
  title: string;
  content: string;
  embeddings?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  description?: string;
  type: string;
  tags: string[];
  folderId?: string;
  basinId?: string;
  createdAt: Date;
  updatedAt: Date;
  sections?: KnowledgeSection[];
  files?: KnowledgeFile[];
}

export interface KnowledgeFolder {
  id: string;
  name: string;
  description: string;
  items: KnowledgeItem[];
  parentFolderId?: string;
  subfolders?: KnowledgeFolder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBasin {
  id: string;
  name: string;
  description: string;
  items: KnowledgeItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Project and Thread Types
export interface Thread {
  id: string;
  name: string;
  workspaceId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  threadId: string;
  createdAt: Date;
}

export interface PromptHistory {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  description: string;
  categoryId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  threads: Thread[];
  linkedKnowledge: string[];
  knowledgeInContext: string[];
  promptHistory: PromptHistory[];
  createdAt: Date;
  updatedAt: Date;
  modelId?: string;
  systemPrompt?: string;
  temperature?: number;
  openRouterApiKey?: string;
}

// Model types
export interface OpenRouterModel {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  capabilities?: {
    completion?: boolean;
    chat_completion?: boolean;
  };
}

export interface GeminiEmbeddingModel {
  id: string;
  name: string;
  description: string;
  dimensions: number;
  contextLength: number;
  maxTokens?: number;
}

// System Persona type
export interface SystemPersona {
  id: string;
  name: string;
  description: string;
  promptAddition: string;
  iconColor: string;
  gradientFrom?: string;
  gradientTo?: string;
  createdAt: Date;
}

// Enhancement Type
export interface EnhancementType {
  id: string;
  name: string;
  systemPromptModifications: string;
  knowledgeContext?: string;
}

// Workspace and User Types
export interface User {
  id: string;
  name: string;
  email: string;
}

// Workspace related types
export interface WorkspaceSettings {
  selectedModelId?: string;
  temperature?: number;
  overrideSystemPrompt?: boolean;
  customSystemPrompt?: string;
  selectedPersonaId?: string;
  linkedKnowledge?: string[];
  knowledgeInContext?: string[];
  webSearchEnabled?: boolean;
  webSearchDeep?: boolean;
  webSearchModelId?: string;
  openRouterApiKey?: string;
}

export interface Workspace {
  id: string;
  name: string;
  threads: Thread[];
  isExpanded: boolean;
  settings: WorkspaceSettings;
  linkedKnowledge: string[];
  knowledgeInContext: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Global Settings type
export interface GlobalSettings {
  openRouterApiKey: string;
  defaultSystemPrompt: string;
  geminiApiKey: string;
  braveApiKey: string;
  selectedEmbeddingModelId: string;
  selectedPromptEngineerModelId: string;
  selectedWebSearchModelId: string;
  systemPersonas: SystemPersona[];
  showSystemPrompt: boolean;
  enhancementTypes?: EnhancementType[]; // Add enhancementTypes here
}
