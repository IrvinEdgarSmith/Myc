import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeFile } from '@/types';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

interface FileUploaderProps {
  onFileUploaded: (file: KnowledgeFile) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { settings } = useGlobalSettings();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check file type - only allow PDF, text, and markdown for now
      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'text/markdown',
        'text/md',
        'text/rtf',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Unsupported file type',
          description: 'Only PDF, text, and markdown files are supported.',
          variant: 'destructive',
        });
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !settings.geminiApiKey) {
      toast({
        title: 'Missing requirements',
        description: !selectedFile
          ? 'Please select a file to upload'
          : 'Gemini API key is required for file processing',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Process file based on type
      let content = '';
      let fileUri = '';

      // For text files, read content directly
      if (
        selectedFile.type === 'text/plain' ||
        selectedFile.type === 'text/markdown' ||
        selectedFile.type === 'text/md'
      ) {
        content = await readTextFile(selectedFile);
      }
      // For PDFs, we would normally upload to Google's infrastructure
      // This is a simplified version for demo purposes
      else if (selectedFile.type === 'application/pdf') {
        // In a real implementation, you would:
        // 1. Upload the file to Google's storage
        // 2. Get a fileUri back
        // 3. Use that URI in embedding calls

        // For now, just create a placeholder message
        content = `PDF file: ${selectedFile.name}`;
        fileUri = `mock-uri-${uuidv4()}`;

        toast({
          title: 'PDF Processing',
          description:
            'PDFs would be processed via Gemini API in a production environment.',
        });
      }

      // Create knowledge file object
      const knowledgeFile: KnowledgeFile = {
        id: uuidv4(),
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
        type: selectedFile.type,
        size: selectedFile.size,
        itemId: '', // Will be set when assigned to an item
        content,
        fileUri,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Pass the file to the parent component
      onFileUploaded(knowledgeFile);

      // Clear the file input
      setSelectedFile(null);

      toast({
        title: 'File uploaded',
        description: `${selectedFile.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading the file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to read text files
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.rtf"
          className="flex-1"
        />
        <Button
          onClick={uploadFile}
          disabled={!selectedFile || isUploading}
          className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" /> Upload
            </>
          )}
        </Button>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-2 bg-background/30 rounded-md">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-mycelial-secondary" />
            <span className="text-sm truncate">{selectedFile.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>Supported file types: PDF, text, markdown</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  );
};

export default FileUploader;
