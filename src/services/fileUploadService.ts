import { KnowledgeFile } from "@/types";
import { generateEmbeddings } from './geminiService';

/**
 * Extracts text content from a file using local processing and optional Gemini API
 */
export const extractContentFromFile = async (file: File, useGeminiAPI: boolean = false): Promise<string> => {
  try {
    console.log(`Extracting content from file: ${file.name} (${file.type}) using ${useGeminiAPI ? 'Gemini API' : 'local processing'}`);
    
    // Handle different file types
    const fileType = file.type || getFileTypeFromName(file.name);
    
    if (useGeminiAPI) {
      try {
        // Create a form data object to send to Gemini
        const formData = new FormData();
        formData.append('file', file);
        
        // Generate embeddings using the Gemini API (includes text extraction)
        const result = await generateEmbeddings(file);
        
        // If we have a result with extracted text, return it
        if (result && result.text) {
          console.log(`Gemini API successfully extracted text (${result.text.length} chars)`);
          return result.text;
        } else {
          console.log('Gemini API did not return extracted text, falling back to local processing');
        }
      } catch (error) {
        console.error('Error using Gemini API for text extraction:', error);
        console.log('Falling back to local processing');
      }
    }
    
    // Local processing fallback
    if (fileType.includes('text/') || fileType.includes('application/json') || 
        fileType.includes('text/markdown') || fileType.includes('text/plain')) {
      // Text-based files can be read directly
      return await file.text();
    } 
    else if (fileType.includes('application/pdf')) {
      // For PDFs, we'd normally use PDF.js, but for simplicity:
      return `Content extracted from PDF: ${file.name}. 
        To fully implement PDF text extraction, you would need to include PDF.js library.`;
    }
    else if (fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
             fileType.includes('application/msword')) {
      // For Word docs, suggest using a library
      return `Content extracted from Word document: ${file.name}.
        To fully implement Word document extraction, you would need a specialized library.`;
    }
    else {
      // For unsupported types, return a placeholder
      return `[This file type (${fileType}) is not supported for text extraction. File: ${file.name}]`;
    }
  } catch (error) {
    console.error('Error extracting content from file:', error);
    return `[Error extracting content from ${file.name}: ${error instanceof Error ? error.message : String(error)}]`;
  }
};

/**
 * Processes a file for text extraction
 */
export const processFileForText = async (file: File, useGeminiAPI: boolean = false): Promise<{
  content: string;
  originalFile: File;
  embeddings?: number[];
}> => {
  console.log(`Processing file for text extraction: ${file.name} (${file.type})`);
  
  try {
    // Extract content from the file
    const content = await extractContentFromFile(file, useGeminiAPI);
    
    // Generate embeddings if Gemini API is available
    let embeddings: number[] | undefined = undefined;
    if (useGeminiAPI) {
      try {
        const result = await generateEmbeddings(content);
        if (result && result.embeddings) {
          embeddings = result.embeddings;
          console.log(`Generated ${embeddings.length} embeddings for ${file.name}`);
        }
      } catch (err) {
        console.error('Error generating embeddings:', err);
      }
    }
    
    console.log(`Successfully extracted content (${content.length} chars) from ${file.name}`);
    
    return {
      content,
      originalFile: file,
      embeddings
    };
  } catch (error) {
    console.error('Error in text processing pipeline:', error);
    throw error;
  }
};

/**
 * Helper function to determine file type from file name
 */
export const getFileTypeFromName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'rtf': 'application/rtf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'json': 'application/json',
    'js': 'text/javascript',
    'ts': 'text/typescript',
    'py': 'text/x-python',
    'html': 'text/html',
    'css': 'text/css',
  };
  
  return extension && mimeTypes[extension] ? mimeTypes[extension] : 'application/octet-stream';
};
