import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '@/context/ProjectContext';
import { useKnowledge } from '@/context/KnowledgeContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, KnowledgeItem, Project } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getChatCompletion } from '@/services/openRouterService';
import { toast } from '@/components/ui/use-toast';

// Define props for the ThreadChatInterface component
interface ThreadChatInterfaceProps {
  projectId?: string;
  threadId?: string;
}

// Create a custom message type for local use
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: Date;
}

const ThreadChatInterface: React.FC<ThreadChatInterfaceProps> = ({ projectId, threadId }) => {
  const { projects, addPromptHistory, addMessageToThread } = useProject();
  const { knowledgeItems, folders } = useKnowledge();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const project = projectId ? projects.find((p) => p.id === projectId) : null;
  const projectThreads = project?.threads || [];
  const thread = projectThreads.find((t) => t.id === threadId);

  // Gather all knowledge in context to be used for RAG
  const knowledgeInContext = React.useMemo(() => {
    if (!project || !project.knowledgeInContext || project.knowledgeInContext.length === 0) {
      return null;
    }

    let contextText = '### RAG KNOWLEDGE CONTEXT - USE THIS INFORMATION TO ANSWER QUESTIONS ###\n\n';

    // Add knowledge item content
    project.knowledgeInContext.forEach((id) => {
      // Check if it's a knowledge item
      const item = knowledgeItems.find((item) => item.id === id);
      if (item) {
        contextText += `## ${item.title} ##\n${item.content}\n\n`;
        // Add sections if they exist
        if (item.sections && item.sections.length > 0) {
          item.sections.forEach((section) => {
            contextText += `### ${section.title} ###\n${section.content}\n\n`;
          });
        }
        
        // Add file content if files exist
        if (item.files && item.files.length > 0) {
          item.files.forEach((file) => {
            if (file.content) {
              contextText += `### File: ${file.name} ###\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
            }
          });
        }
      }

      // Check if it's a folder
      const folder = folders.find((folder) => folder.id === id);
      if (folder) {
        contextText += `## Knowledge Folder: ${folder.name} ##\n${folder.description || ""}\n\n`;
        // Add all items in the folder
        const folderItems = knowledgeItems.filter(item => item.folderId === folder.id);
        folderItems.forEach((item) => {
          contextText += `### ${item.title} ###\n${item.content}\n\n`;
          
          // Add sections if they exist
          if (item.sections && item.sections.length > 0) {
            item.sections.forEach((section) => {
              contextText += `#### ${section.title} ####\n${section.content}\n\n`;
            });
          }
          
          // Add file content if files exist
          if (item.files && item.files.length > 0) {
            item.files.forEach((file) => {
              if (file.content) {
                contextText += `#### File: ${file.name} ####\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
              }
            });
          }
        });
      }
    });

    contextText += "### END OF RAG KNOWLEDGE CONTEXT ###\n\nUse the above information when answering the user's questions. If the answer isn't in the provided context, you can still respond with general knowledge.";

    return contextText;
  }, [project, knowledgeItems, folders]);

  // Get system prompt with RAG content
  const systemPromptWithRAG = React.useMemo(() => {
    // Use a default prompt if none is specified
    const basePrompt = "You are a helpful AI assistant that provides accurate information based on your knowledge.";
    if (knowledgeInContext) {
      return `${basePrompt}\n\n${knowledgeInContext}`;
    }
    return basePrompt;
  }, [project, knowledgeInContext]);

  useEffect(() => {
    if (thread) {
      setMessages(thread.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt
      })));
    } else {
      setMessages([]);
    }
  }, [thread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleReasoning = (messageId: string) => {
    setShowReasoning(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Check if a message has reasoning (separated by "Reasoning:" or similar)
  const parseMessageContent = (content: string) => {
    const reasoningPatterns = [
      /^(.*?)Reasoning:([\s\S]*)$/i,
      /^(.*?)Thought process:([\s\S]*)$/i,
      /^(.*?)Let me think:([\s\S]*)$/i,
      /^(.*?)Let's think about this:([\s\S]*)$/i
    ];
    
    for (const pattern of reasoningPatterns) {
      const match = content.match(pattern);
      if (match) {
        return {
          hasReasoning: true,
          response: match[1].trim(),
          reasoning: match[2].trim()
        };
      }
    }
    
    return {
      hasReasoning: false,
      response: content,
      reasoning: ''
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !projectId || !threadId || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: input.trim(),
      role: 'user',
      createdAt: new Date()
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a thinking message
      const thinkingMessage: ChatMessage = {
        id: 'thinking-' + uuidv4(),
        content: 'Thinking...',
        role: 'assistant',
        createdAt: new Date()
      };
      
      setMessages((prev) => [...prev, thinkingMessage]);
      
      // Prepare messages array for the API
      let apiMessages = [
        {
          role: 'system',
          content: systemPromptWithRAG
        }
      ];
      
      // Add previous messages from the thread for context
      const previousMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      apiMessages = [...apiMessages, ...previousMessages, {
        role: 'user',
        content: userMessage.content
      }];
      
      let responseContent;
      
      // Get API key from global settings
      const apiKey = localStorage.getItem('openrouter-api-key');
        
      if (apiKey) {
        // Default values for model and temperature if not in project
        const modelId = "openai/gpt-3.5-turbo"; // Default model
        const temperature = 0.7; // Default temperature
          
        // Pass the temperature parameter to the API call
        responseContent = await getChatCompletion(apiKey, modelId, apiMessages, temperature);
      } else {
        responseContent = "No OpenRouter API key found. Please add an API key in global settings.";
      }

      // Create the assistant response message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseContent,
        role: 'assistant',
        createdAt: new Date()
      };

      // Replace thinking message with actual response
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? assistantMessage
            : msg
        )
      );

      // Save messages to the thread
      if (projectId && threadId) {
        addMessageToThread(projectId, threadId, {
          id: userMessage.id,
          content: userMessage.content,
          role: 'user',
          threadId: threadId,
          createdAt: userMessage.createdAt
        });
        
        addMessageToThread(projectId, threadId, {
          id: assistantMessage.id,
          content: assistantMessage.content,
          role: 'assistant',
          threadId: threadId,
          createdAt: assistantMessage.createdAt
        });
      }

      // Record prompt history
      if (projectId) {
        addPromptHistory(projectId, {
          id: uuidv4(),
          prompt: userMessage.content,
          response: responseContent,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        role: 'assistant',
        createdAt: new Date()
      };
      
      // Replace thinking message with error message
      setMessages((prev) => 
        prev.map(msg => 
          msg.id.startsWith('thinking-') 
            ? errorMessage
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "There was a problem connecting to the AI service",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!threadId) {
    return (
      <div className="flex items-center justify-center h-full bg-mycelial-card/30">
        <div className="text-center p-8">
          <Bot className="h-12 w-12 mx-auto mb-4 text-mycelial-secondary" />
          <h2 className="text-xl font-semibold mb-2">No Thread Selected</h2>
          <p className="text-muted-foreground">
            Select a thread from the sidebar or create a new one to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        {showSystemPrompt && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 m-4 p-4 rounded-lg shadow-lg border border-mycelial-border/30">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-white">System Prompt with RAG Context</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSystemPrompt(false)}
                className="text-white/70 hover:text-white h-7 w-7 p-0"
              >
                <EyeOff size={14} />
              </Button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>
                {systemPromptWithRAG}
              </ReactMarkdown>
            </div>
          </div>
        )}
        
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center p-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-mycelial-secondary" />
                <h2 className="text-xl font-semibold mb-2">Start a New Conversation</h2>
                <p className="text-muted-foreground">
                  Send a message to start chatting with the AI assistant.
                </p>
                {knowledgeInContext && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSystemPrompt(true)}
                    className="mt-4 bg-mycelial-card/80 border-mycelial-border/30 hover:bg-mycelial-card"
                  >
                    <Eye size={14} className="mr-2" />
                    Show System Prompt with RAG
                  </Button>
                )}
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const { hasReasoning, response, reasoning } = parseMessageContent(message.content);
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-4",
                        message.role === 'assistant'
                          ? "bg-gradient-to-r from-mycelial-messages-ai-from to-mycelial-messages-ai-to text-white border border-mycelial-border/20" 
                          : "bg-gradient-to-r from-mycelial-messages-user-from to-mycelial-messages-user-to text-white"
                      )}
                    >
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-mycelial-card border border-mycelial-border/30">
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4 text-mycelial-secondary" />
                        ) : (
                          <User className="h-4 w-4 text-mycelial-tertiary" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="prose prose-invert max-w-none">
                          {message.content === 'Thinking...' ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-mycelial-tertiary/50 rounded-full animate-pulse"></div>
                              <div className="h-2 w-2 bg-mycelial-tertiary/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="h-2 w-2 bg-mycelial-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                              <span className="ml-1 text-sm opacity-70">Thinking...</span>
                            </div>
                          ) : (
                            <>
                              <ReactMarkdown
                                components={{
                                  code({node, className, children, ...props}) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !node?.position?.start || node.position.start.line === node.position.end.line;
                                    
                                    return isInline ? (
                                      <code {...props} className="bg-mycelial-card px-1.5 py-0.5 rounded-md text-gray-300">
                                        {children}
                                      </code>
                                    ) : !match ? (
                                      <code {...props} className="bg-mycelial-card text-gray-300">
                                        {children}
                                      </code>
                                    ) : (
                                      <SyntaxHighlighter
                                        language={match[1]}
                                        style={vscDarkPlus}
                                        customStyle={{backgroundColor: '#1A1F2C'}}
                                        codeTagProps={{
                                          style: {
                                            color: '#d4d4d8'
                                          }
                                        }}
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    );
                                  }
                                }}
                              >
                                {message.role === 'assistant' && hasReasoning 
                                  ? showReasoning[message.id] ? message.content : response
                                  : message.content
                                }
                              </ReactMarkdown>
                              
                              {message.role === 'assistant' && hasReasoning && (
                                <button 
                                  onClick={() => toggleReasoning(message.id)}
                                  className="flex items-center mt-2 text-xs text-white/60 hover:text-white/90 transition-colors"
                                >
                                  {showReasoning[message.id] ? (
                                    <>
                                      <EyeOff size={12} className="mr-1" /> Hide reasoning
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={12} className="mr-1" /> Show reasoning
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-white/60 mt-2">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
                
                {knowledgeInContext && messages.length > 0 && !showSystemPrompt && (
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSystemPrompt(true)}
                      className="bg-mycelial-card/50 border-mycelial-border/30 hover:bg-mycelial-card"
                    >
                      <Eye size={14} className="mr-2" />
                      Show System Prompt with RAG
                    </Button>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t border-mycelial-border/30 bg-mycelial-card/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none bg-mycelial-card/80 border-mycelial-border/30"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-mycelial-secondary hover:bg-mycelial-secondary/90 h-[60px] px-4"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          {knowledgeInContext && (
            <div className="mt-2 text-xs text-mycelial-secondary flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-mycelial-secondary mr-1.5"></span>
              <span><span className="font-medium">RAG enabled:</span> {project?.knowledgeInContext.length} knowledge {project?.knowledgeInContext.length === 1 ? 'item' : 'items'} included in context</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadChatInterface;
