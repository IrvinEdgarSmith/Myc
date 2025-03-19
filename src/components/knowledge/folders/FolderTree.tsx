import React from 'react';
import { ChevronDown, ChevronRight, Folder, FileBox, Settings, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KnowledgeFolder } from '@/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FolderTreeProps {
  folders: KnowledgeFolder[];
  expandedFolders: string[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderToggle: (folderId: string) => void;
  onFolderEdit?: (folderId: string) => void;
  onFolderDelete?: (folderId: string) => void;
  parentId?: string;
  level?: number;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  expandedFolders,
  selectedFolderId,
  onFolderSelect,
  onFolderToggle,
  onFolderEdit,
  onFolderDelete,
  parentId = undefined,
  level = 0
}) => {
  // Get folders that belong to this level
  const currentLevelFolders = folders.filter(folder => 
    parentId ? folder.parentFolderId === parentId : !folder.parentFolderId
  );

  // If at top level, always show "All Items" option
  if (level === 0) {
    return (
      <div>
        {/* All Items option */}
        <div 
          className={cn(
            "flex items-center p-2 rounded-md cursor-pointer mb-1",
            selectedFolderId === null ? "bg-primary/10" : "hover:bg-muted"
          )}
          onClick={() => onFolderSelect(null)}
        >
          <FileBox className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm font-medium">All Items</span>
        </div>

        {/* Folder tree */}
        {currentLevelFolders.length > 0 ? (
          <div className={cn(level > 0 ? "border-l ml-2 mt-1" : "")}>
            {currentLevelFolders.map(folder => {
              // Check if this folder has children
              const hasChildren = folders.some(f => f.parentFolderId === folder.id);
              const isExpanded = expandedFolders.includes(folder.id);
              const isSelected = selectedFolderId === folder.id;
              
              return (
                <div key={folder.id} className="py-1">
                  <div 
                    className={cn(
                      "flex items-center p-2 rounded-md cursor-pointer justify-between",
                      isSelected ? "bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <div 
                      className="flex items-center flex-1"
                      onClick={() => onFolderSelect(folder.id)}
                    >
                      {hasChildren ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onFolderToggle(folder.id);
                          }}
                          className="mr-1 focus:outline-none"
                        >
                          {isExpanded ? 
                            <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      ) : (
                        <div className="w-4 mr-1" />
                      )}
                      <Folder className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm truncate">{folder.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({folder.items?.length || 0})
                      </span>
                    </div>
                    
                    {/* Add folder actions menu */}
                    {(onFolderEdit || onFolderDelete) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0 ml-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Settings className="h-3 w-3" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {onFolderEdit && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onFolderEdit(folder.id);
                              }}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              Edit Folder
                            </DropdownMenuItem>
                          )}
                          
                          {onFolderDelete && (
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFolderDelete(folder.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete Folder
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {hasChildren && isExpanded && (
                    <FolderTree 
                      folders={folders}
                      expandedFolders={expandedFolders}
                      selectedFolderId={selectedFolderId}
                      onFolderSelect={onFolderSelect}
                      onFolderToggle={onFolderToggle}
                      onFolderEdit={onFolderEdit}
                      onFolderDelete={onFolderDelete}
                      parentId={folder.id}
                      level={level + 1}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No folders yet. Create your first folder to start organizing.
          </div>
        )}
      </div>
    );
  }

  // For nested levels, continue with original rendering logic
  if (currentLevelFolders.length === 0) {
    return null;
  }

  return (
    <div className={cn("pl-4", level > 0 ? "border-l ml-2 mt-1" : "")}>
      {currentLevelFolders.map(folder => {
        // Check if this folder has children
        const hasChildren = folders.some(f => f.parentFolderId === folder.id);
        const isExpanded = expandedFolders.includes(folder.id);
        const isSelected = selectedFolderId === folder.id;
        
        return (
          <div key={folder.id} className="py-1">
            <div 
              className={cn(
                "flex items-center p-2 rounded-md cursor-pointer justify-between",
                isSelected ? "bg-primary/10" : "hover:bg-muted"
              )}
            >
              <div 
                className="flex items-center flex-1"
                onClick={() => onFolderSelect(folder.id)}
              >
                {hasChildren ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onFolderToggle(folder.id);
                    }}
                    className="mr-1 focus:outline-none"
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </button>
                ) : (
                  <div className="w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm truncate">{folder.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({folder.items?.length || 0})
                </span>
              </div>
              
              {/* Add folder actions menu for nested levels too */}
              {(onFolderEdit || onFolderDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Settings className="h-3 w-3" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {onFolderEdit && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onFolderEdit(folder.id);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit Folder
                      </DropdownMenuItem>
                    )}
                    
                    {onFolderDelete && (
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFolderDelete(folder.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete Folder
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {hasChildren && isExpanded && (
              <FolderTree 
                folders={folders}
                expandedFolders={expandedFolders}
                selectedFolderId={selectedFolderId}
                onFolderSelect={onFolderSelect}
                onFolderToggle={onFolderToggle}
                onFolderEdit={onFolderEdit}
                onFolderDelete={onFolderDelete}
                parentId={folder.id}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FolderTree;
