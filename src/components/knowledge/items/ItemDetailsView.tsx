import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Folder, Edit } from 'lucide-react';
import { KnowledgeItem } from '@/types';
import { useKnowledge } from '@/context/KnowledgeContext';

interface ItemDetailsViewProps {
  item: KnowledgeItem;
  onEdit: () => void;
}

const ItemDetailsView: React.FC<ItemDetailsViewProps> = ({ item, onEdit }) => {
  const { basins } = useKnowledge();
  const basin = item.basinId ? basins.find(b => b.id === item.basinId) : undefined;
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
        
        {basin && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Folder className="h-4 w-4 mr-1" /> {basin.name}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(item.updatedAt).toLocaleString()}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Content</h3>
        <div className="bg-mycelial-card/30 p-4 rounded border border-mycelial-border/10 whitespace-pre-wrap">
          {item.content || "No content provided."}
        </div>
      </div>
      
      {/* Sections */}
      {item.sections && item.sections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Sections ({item.sections.length})</h3>
          <div className="space-y-4">
            {item.sections.map((section, index) => (
              <div key={section.id} className="bg-mycelial-card/30 p-4 rounded border border-mycelial-border/10">
                <h4 className="text-md font-medium mb-2">{section.title || `Section ${index + 1}`}</h4>
                <div className="whitespace-pre-wrap text-sm">
                  {section.content || "No content provided for this section."}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Files */}
      {item.files && item.files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Files ({item.files.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {item.files.map(file => (
              <div key={file.id} className="flex items-center p-3 bg-mycelial-card/50 rounded border border-mycelial-border/10">
                <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-mycelial-tertiary" />
                <div className="overflow-hidden">
                  <div className="truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB • {file.type || "Unknown type"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsView;
