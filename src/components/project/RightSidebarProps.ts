import { Dispatch, SetStateAction } from 'react';
import { KnowledgeFolder, KnowledgeItem, Project } from '@/types';

export interface RightSidebarProps {
  project: Project;
  activeTab: string;  // Added property to match what's being passed in ProjectDashboard.tsx
  linkedItems: KnowledgeItem[];
  linkedFolders: KnowledgeFolder[];
  expandedIterations: string[];
  selectedIteration: string | null;
  toggleIterationExpanded: (id: string) => void;
  setShowAddKnowledgeDialog: Dispatch<SetStateAction<boolean>>;
  handleToggleIncludeInContext: (id: string) => void;
}
