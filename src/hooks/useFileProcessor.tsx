import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { KnowledgeFile } from '@/types';
import { processFileForText, getFileTypeFromName } from '@/services/fileUploadService';
import { useGlobalSettings } from './useGlobalSettings';

/**
 * Custom hook to handle file processing for text extraction
 */
export const useFileProcessor = (itemId: string = '') => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const { settings, hasValidGeminiKey, hasSelectedEmbeddingModel } = useGlobalSettings();

  // Process files for text extraction and create KnowledgeFile objects
  const processFiles = async (fileList: FileList | null): Promise<KnowledgeFile[]> => {
    if (!fileList || fileList.length === 0) return [];

    setIsProcessing(true);
    const newFiles: KnowledgeFile[] = [];
    
    // Determine if we should use Gemini API for text extraction
    const useGeminiAPI = hasValidGeminiKey && hasSelectedEmbeddingModel;

    try {
      console.log(`Processing ${fileList.length} files with ${useGeminiAPI ? 'Gemini API' : 'code-based'} extraction`);

      // Process each file
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Create basic file object
        const newFile: KnowledgeFile = {
          id: uuidv4(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type || getFileTypeFromName(file.name),
          size: file.size,
          itemId: itemId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        try {
          console.log(`Processing file ${file.name} for text extraction`);
          
          const result = await processFileForText(file, useGeminiAPI);
          
          if (result.content && result.content.trim() !== '') {
            newFile.content = result.content;
            console.log(`Content extracted (${result.content.length} chars)`);
          }
          
          if (result.embeddings && result.embeddings.length > 0) {
            newFile.embeddings = result.embeddings;
            console.log(`Embeddings generated (${result.embeddings.length} dimensions)`);
          }
          
          toast({
            title: "File Processed",
            description: `${file.name} processed successfully${useGeminiAPI ? ' with Gemini API' : ''}`,
          });
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          toast({
            title: `Error processing ${file.name}`,
            description: "Failed to process this file. See console for details.",
            variant: "destructive",
          });
          // Continue with the file but without content
        }

        newFiles.push(newFile);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "File Processing Error",
        description: "There was an error processing some files. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }

    return newFiles;
  };

  // Process files from the queue
  const processQueue = async () => {
    if (fileQueue.length === 0 || isProcessingQueue) return;
    
    setIsProcessingQueue(true);
    const nextFile = fileQueue[0];
    
    try {
      if (nextFile) {
        console.log(`Processing queued file: ${nextFile.name}`);
        // Use Gemini API if available
        const useGeminiAPI = hasValidGeminiKey && hasSelectedEmbeddingModel;
        await processFileForText(nextFile, useGeminiAPI);
        console.log(`Successfully processed queued file: ${nextFile.name}`);
      }
    } catch (error) {
      console.error('Error processing file from queue:', error);
    } finally {
      setFileQueue(prev => prev.slice(1));
      setIsProcessingQueue(false);
    }
  };

  // Add files to the processing queue
  const queueFilesForProcessing = (files: File[]) => {
    setFileQueue(prev => [...prev, ...files]);
    toast({
      title: "Files Queued",
      description: `${files.length} files added to processing queue`,
    });
  };

  return {
    isProcessing,
    processFiles,
    queueFilesForProcessing,
    fileQueueLength: fileQueue.length,
    apiKeyValid: hasValidGeminiKey,
    modelIdValid: hasSelectedEmbeddingModel
  };
};
