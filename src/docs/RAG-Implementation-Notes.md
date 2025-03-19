# RAG Implementation Technical Notes

This document outlines how to implement Retrieval Augmented Generation (RAG) using the knowledge entities marked for inclusion in the AI context.

## Current Implementation

The system currently has the following features:
- Knowledge items and basins can be linked to a project
- Users can mark specific knowledge entities (items or basins) to be included in the AI context using the "Include in AI context" checkbox
- The Project type stores these selections in the `knowledgeInContext` array
- The UI for toggling knowledge context inclusion is implemented
- File content is extracted using code-based text extraction and included in the RAG context

## File Content Extraction

When a file is uploaded to a knowledge item:
1. The file's content is extracted locally using the `fileUploadService.ts` utilities
2. The extracted text content is stored in the `content` field of the `KnowledgeFile` object
3. When the knowledge item is included in the AI context, all of its file contents are also included
4. This allows the AI to reference information from uploaded documents and code files

## Required Integration with LLM

To complete the RAG functionality, integration with the LLM chat interface is needed:

1. For each chat message sent to the LLM, gather all knowledge marked for inclusion in context:
   ```typescript
   // Get all relevant knowledge text
   const getKnowledgeContext = (project) => {
     if (!project || !project.knowledgeInContext || project.knowledgeInContext.length === 0) {
       return '';
     }
     
     let contextText = 'Here is additional context for your response:\n\n';
     
     // Add knowledge item content
     project.knowledgeInContext.forEach(id => {
       // Check if it's a knowledge item
       const item = knowledgeItems.find(item => item.id === id);
       if (item) {
         contextText += `# ${item.title}\n${item.content}\n\n`;
         
         // Add sections if they exist
         if (item.sections && item.sections.length > 0) {
           item.sections.forEach(section => {
             contextText += `## ${section.title}\n${section.content}\n\n`;
           });
         }
         
         // Add file content if files exist
         if (item.files && item.files.length > 0) {
           item.files.forEach(file => {
             if (file.content) {
               contextText += `### File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
             }
           });
         }
       }
       
       // Check if it's a basin
       const basin = basins.find(basin => basin.id === id);
       if (basin) {
         contextText += `# Basin: ${basin.name}\n${basin.description}\n\n`;
         
         // Add all items in the basin
         basin.items.forEach(item => {
           contextText += `## ${item.title}\n${item.content}\n\n`;
           
           // Add sections if they exist
           if (item.sections && item.sections.length > 0) {
             item.sections.forEach(section => {
               contextText += `### ${section.title}\n${section.content}\n\n`;
             });
           }
           
           // Add file content if files exist
           if (item.files && item.files.length > 0) {
             item.files.forEach(file => {
               if (file.content) {
                 contextText += `### File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
               }
             });
           }
         });
       }
     });
     
     return contextText;
   };
   ```

2. Append this knowledge context to the system prompt or include it as part of the conversation context when sending requests to the LLM

3. Since `ThreadChatInterface.tsx` is read-only, we would need to add this functionality at a higher level in the API or LLM service that processes the chat requests

## Example Implementation

To implement this with an LLM service like OpenRouter, you would modify the prompt construction:

```typescript
// In the LLM service
const constructPromptWithRAG = async (projectId, threadId, userMessage) => {
  const project = projects.find(p => p.id === projectId);
  const knowledgeContext = getKnowledgeContext(project);
  
  // Construct the prompt with the knowledge context
  const systemPrompt = `You are a helpful assistant. 
${knowledgeContext}

Please use the provided context information when relevant to answer the user's questions.`;
  
  // Send to LLM with the enhanced system prompt
  return sendToLLM(systemPrompt, userMessage, threadId);
};
```

This implementation ensures that any knowledge items or basins marked for inclusion in the AI context will be provided to the LLM when generating responses, including any file content that has been extracted.
