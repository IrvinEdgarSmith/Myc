import { GoogleGenerativeAI } from "@google/generative-ai";
import { KnowledgeFile } from "@/types";
import { toast } from "@/components/ui/use-toast";

export interface GeminiEmbeddingOptions {
  apiKey: string;
  modelName?: string;
}

// Create and configure the Google Generative AI client
export const createGeminiClient = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

// Generate embeddings for text content
export const generateEmbeddings = async (
  text: string,
  options: GeminiEmbeddingOptions
): Promise<number[] | null> => {
  try {
    const { apiKey, modelName = "embedding-001" } = options;
    const genAI = createGeminiClient(apiKey);
    const embeddingModel = genAI.getGenerativeModel({ model: modelName });
    
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding.values;
    
    return embedding;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    toast({
      title: "Embedding Error",
      description: "Failed to generate embeddings for the content",
      variant: "destructive",
    });
    return null;
  }
};

// Process a file to generate embeddings
export const processFileForEmbeddings = async (
  file: KnowledgeFile,
  options: GeminiEmbeddingOptions
): Promise<KnowledgeFile> => {
  if (!file.content) {
    return file;
  }
  
  try {
    const embeddings = await generateEmbeddings(file.content, options);
    
    return {
      ...file,
      embeddings: embeddings || undefined
    };
  } catch (error) {
    console.error("Error processing file for embeddings:", error);
    return file;
  }
};

// Upload a file to the Gemini API and get a file URI
export const uploadFileToGemini = async (
  file: File,
  options: GeminiEmbeddingOptions
): Promise<string | null> => {
  try {
    const { apiKey } = options;
    const genAI = createGeminiClient(apiKey);
    
    // TODO: Implement actual file upload to Gemini when API supports it
    // For now, this is a placeholder for future implementation
    console.log("File upload to Gemini will be implemented when API supports it");
    
    // Return a placeholder URI
    const fileUri = `gemini://file/${file.name}`;
    
    return fileUri;
  } catch (error) {
    console.error("Error uploading file to Gemini:", error);
    toast({
      title: "Upload Error",
      description: "Failed to upload file to Gemini API",
      variant: "destructive",
    });
    return null;
  }
};
