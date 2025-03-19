import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadListProps {
  files: Omit<KnowledgeFile, 'itemId' | 'createdAt' | 'updatedAt'>[];
  onFilesChange: (files: Omit<KnowledgeFile, 'itemId' | 'createdAt' | 'updatedAt'>[]) => void;
  maxFiles?: number;
}

const FileUploadList: React.FC<FileUploadListProps> = ({ 
  files, 
  onFilesChange,
  maxFiles = 30
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload button click
  const handleFileUploadClick = () => {
    if (files.length >= maxFiles) {
      toast({
        title: "Maximum files reached",
        description: `You can add up to ${maxFiles} files per knowledge item`,
        variant: "destructive",
      });
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (files.length + newFiles.length >= maxFiles) {
        toast({
          title: "Maximum files reached",
          description: `You can add up to ${maxFiles} files per knowledge item`,
          variant: "destructive",
        });
        break;
      }
      
      newFiles.push({
        id: uuidv4(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
      });
    }
    
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a file
  const removeFile = (fileId: string) => {
    onFilesChange(
      files.filter(file => {
        if (file.id === fileId) {
          // Revoke object URL to prevent memory leaks
          URL.revokeObjectURL(file.url);
          return false;
        }
        return true;
      })
    );
  };

  return (
    <div className="border-t border-mycelial-border/20 pt-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Files</h3>
        <Button
          onClick={handleFileUploadClick}
          size="sm"
          variant="outline"
          disabled={files.length >= maxFiles}
        >
          <Upload className="mr-2 h-3 w-3" /> Upload File
        </Button>
      </div>
      
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">No files uploaded yet. Add up to {maxFiles} files.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between bg-mycelial-card/50 rounded p-2 text-sm">
              <div className="flex items-center overflow-hidden">
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <Button
                onClick={() => removeFile(file.id)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploadList;
