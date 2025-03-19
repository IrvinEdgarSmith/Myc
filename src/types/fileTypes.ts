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
