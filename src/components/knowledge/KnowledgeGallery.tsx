import React from 'react';
import KnowledgeManager from './KnowledgeManager';

interface KnowledgeGalleryProps {
  onClose: () => void;
}

const KnowledgeGallery: React.FC<KnowledgeGalleryProps> = ({ onClose }) => {
  return (
    <div className="h-full w-full">
      <KnowledgeManager isOpen={true} onClose={onClose} />
    </div>
  );
};

export default KnowledgeGallery;
