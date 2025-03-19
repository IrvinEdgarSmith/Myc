import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { KnowledgeProvider } from '@/context/KnowledgeContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <ProjectProvider>
      <KnowledgeProvider>
        <WorkspaceProvider>
          <div className="app-container w-full h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </WorkspaceProvider>
      </KnowledgeProvider>
    </ProjectProvider>
  );
}

export default App;
