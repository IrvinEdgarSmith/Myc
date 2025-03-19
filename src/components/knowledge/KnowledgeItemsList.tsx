import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import KnowledgeManager from './KnowledgeManager';

interface KnowledgeItemsListProps {
  workspaceId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeItemsList: React.FC<KnowledgeItemsListProps> = ({ 
  workspaceId,
  isOpen,
  onClose
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-hidden">
        <KnowledgeManager
          workspaceId={workspaceId}
          isOpen={isOpen}
          onClose={onClose}
        />
      </SheetContent>
    </Sheet>
  );
};

export default KnowledgeItemsList;
