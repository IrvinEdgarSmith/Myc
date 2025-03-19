import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { KnowledgeProvider } from '@/context/KnowledgeContext';

const Index: React.FC = () => {
  return (
    <ProjectProvider>
      <KnowledgeProvider>
        <WorkspaceProvider>
          <MainLayout />
        </WorkspaceProvider>
      </KnowledgeProvider>
    </ProjectProvider>
  );
};

export default Index;
