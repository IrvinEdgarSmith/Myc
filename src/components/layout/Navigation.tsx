import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import KnowledgeGallery from '@/components/knowledge/KnowledgeGallery';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <Button
          variant={isActive('/') ? "default" : "ghost"}
          size="sm"
          className={`flex items-center gap-2 ${isActive('/') ? 'bg-mycelial-secondary text-white' : 'text-mycelial-accent hover:text-mycelial-secondary'}`}
          onClick={() => navigate('/')}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Mycelial Chat</span>
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsKnowledgeModalOpen(true)}
        className="h-8 w-8"
        title="Knowledge Manager"
      >
        <Book className="h-5 w-5" />
      </Button>
      
      {/* Full screen knowledge management modal */}
      {isKnowledgeModalOpen && (
        <Dialog open={isKnowledgeModalOpen} onOpenChange={setIsKnowledgeModalOpen}>
          <DialogContent className="max-w-full h-screen max-h-screen p-0 m-0 w-screen rounded-none">
            <KnowledgeGallery onClose={() => setIsKnowledgeModalOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Navigation;
