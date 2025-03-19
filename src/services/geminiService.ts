import { GoogleGenerativeAI } from '@google/generative-ai';

// Interfaces
interface EmbeddingResponse {
  text?: string;
  embeddings?: number[];
  error?: string;
}

/**
 * Generate embeddings for text using Gemini API
 */
export const generateEmbeddings = async (
  input: string | File
): Promise<EmbeddingResponse> => {
  try {
    // Get API key from local storage
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the embedding model
    const modelId = localStorage.getItem('gemini-embedding-model') || 'embedding-001';
    const embeddingModel = genAI.getGenerativeModel({ model: modelId });
    
    let result;
    
    if (typeof input === 'string') {
      // Generate embeddings for text
      result = await embeddingModel.embedContent(input);
    } else {
      // For file upload, we'd normally use the File upload API
      // This is a simplified version which extracts text from the file first
      const text = await input.text();
      result = await embeddingModel.embedContent(text);
      
      // Return both the text and embeddings
      return {
        text,
        embeddings: result.embedding.values
      };
    }
    
    return {
      embeddings: result.embedding.values
    };
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
