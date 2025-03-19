import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeSection } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SectionsListProps {
  sections: Omit<KnowledgeSection, 'itemId' | 'createdAt' | 'updatedAt'>[];
  onSectionsChange: (sections: Omit<KnowledgeSection, 'itemId' | 'createdAt' | 'updatedAt'>[]) => void;
}

const SectionsList: React.FC<SectionsListProps> = ({ sections, onSectionsChange }) => {
  // Add a new section
  const addSection = () => {
    if (sections.length >= 5) {
      toast({
        title: "Maximum sections reached",
        description: "You can add up to 5 sections per knowledge item",
        variant: "destructive",
      });
      return;
    }
    
    const newSection = {
      id: uuidv4(),
      title: '',
      content: '',
    };
    
    onSectionsChange([...sections, newSection]);
  };

  // Remove a section
  const removeSection = (sectionId: string) => {
    onSectionsChange(sections.filter(section => section.id !== sectionId));
  };

  // Update a section's content
  const updateSection = (sectionId: string, field: 'title' | 'content', value: string) => {
    onSectionsChange(
      sections.map(section => 
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  return (
    <div className="border-t border-mycelial-border/20 pt-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Sections</h3>
        <Button
          onClick={addSection}
          size="sm"
          variant="outline"
          disabled={sections.length >= 5}
        >
          <Plus className="mr-2 h-3 w-3" /> Add Section
        </Button>
      </div>
      
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">No sections added yet. Add up to 5 sections.</p>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="border border-mycelial-border/20 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Section {index + 1}</h4>
                <Button
                  onClick={() => removeSection(section.id)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`section-title-${section.id}`} className="text-xs">Title</Label>
                  <Input
                    id={`section-title-${section.id}`}
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    placeholder="Section title"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`section-content-${section.id}`} className="text-xs">Content</Label>
                  <Textarea
                    id={`section-content-${section.id}`}
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    placeholder="Section content"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionsList;
