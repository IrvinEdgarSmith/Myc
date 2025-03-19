import React, { useState } from 'react';
import { FileText, Database, Link, Unlink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectKnowledgeItemProps {
  id: string;
  title: string;
  description: string;
  type: 'folder' | 'item';
  isIncludedInContext: boolean;
  onToggleInclude: (id: string) => void;
  onLinkToWorkspace?: (id: string) => void;
  onUnlinkFromWorkspace?: (id: string) => void;
  isLinked?: boolean;
}

const ProjectKnowledgeItem: React.FC<ProjectKnowledgeItemProps> = ({
  id,
  title,
  description,
  type,
  isIncludedInContext,
  onToggleInclude,
  onLinkToWorkspace,
  onUnlinkFromWorkspace,
  isLinked = true
}) => {
  const [hovering, setHovering] = useState(false);

  return (
    <div 
      className={cn(
        "p-3 rounded-md border border-mycelial-border/20 bg-mycelial-card/80",
        isIncludedInContext && "border-mycelial-secondary/50 bg-mycelial-secondary/5"
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1">
          {type === 'folder' ? 
            <Database className="h-4 w-4 text-mycelial-secondary" /> : 
            <FileText className="h-4 w-4 text-mycelial-tertiary" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium truncate">{title}</h3>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`include-${id}`} 
                  checked={isIncludedInContext}
                  onCheckedChange={() => onToggleInclude(id)}
                />
                <label 
                  htmlFor={`include-${id}`}
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Include in AI context
                </label>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>
          
          {/* Link/Unlink Button */}
          <div className="mt-2">
            {isLinked && onUnlinkFromWorkspace ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center text-xs"
                onClick={() => onUnlinkFromWorkspace(id)}
              >
                <Unlink className="h-3.5 w-3.5 mr-1.5" />
                Unlink from Workspace
              </Button>
            ) : onLinkToWorkspace && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center text-xs"
                onClick={() => onLinkToWorkspace(id)}
              >
                <Link className="h-3.5 w-3.5 mr-1.5" />
                Link to Workspace
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKnowledgeItem;
