import { PromptCategory } from '@/components/knowledge/types/promptTypes';

// System prompts organized by category
export const systemPromptCategories: PromptCategory[] = [
  {
    id: 'persona',
    title: 'Persona Declaration',
    description: 'Define the AI\'s role and expertise.',
    prompts: [
      {
        id: 'persona-1',
        title: 'Market Analyst',
        description: 'Sets the AI as a market analyst with financial expertise',
        content: 'You are a market analyst with expertise in financial trends and economic forecasting. Provide data-driven insights and objective analysis based on the information available.'
      },
      {
        id: 'persona-2',
        title: 'Creative Writer',
        description: 'Sets the AI as a creative writer with storytelling expertise',
        content: 'You are a creative writer with expertise in storytelling, narrative structure, and character development. Offer imaginative and engaging content while maintaining coherence and quality.'
      },
      {
        id: 'persona-3',
        title: 'Technical Expert',
        description: 'Sets the AI as a technical expert with programming knowledge',
        content: 'You are a technical expert with deep knowledge of programming languages, software development, and computer science concepts. Provide clear, accurate explanations and solutions to technical problems.'
      }
    ]
  },
  {
    id: 'context',
    title: 'Contextual Briefing',
    description: 'Provide essential background or situational context.',
    prompts: [
      {
        id: 'context-1',
        title: 'Current Economic Climate',
        description: 'Sets the context to the current economic situation',
        content: 'Given the latest economic data including inflation rates, employment figures, and market indices, provide analysis that reflects current market conditions and accounts for recent policy changes.'
      },
      {
        id: 'context-2',
        title: 'Project Background',
        description: 'Provides project background information',
        content: 'This project has been ongoing for six months and has passed through initial research and development phases. Your responses should build upon existing progress and align with established project goals.'
      }
    ]
  },
  {
    id: 'formatting',
    title: 'Response Formatting',
    description: 'Specify the desired output format.',
    prompts: [
      {
        id: 'format-1',
        title: 'Bullet Points',
        description: 'Format response as bullet points',
        content: 'Return your answer as a structured list of bullet points, with main points clearly separated and sub-points indented. Use concise language and ensure each point is self-contained.'
      },
      {
        id: 'format-2',
        title: 'Markdown Tables',
        description: 'Format response with markdown tables',
        content: 'Present your analysis using markdown tables where appropriate. Include column headers and maintain consistent formatting throughout. Follow tables with brief explanatory text.'
      }
    ]
  },
  {
    id: 'constraints',
    title: 'Output Constraints',
    description: 'Set limitations such as word count, tone, or style restrictions.',
    prompts: [
      {
        id: 'constraints-1',
        title: 'Concise Response',
        description: 'Limits response to 150 words',
        content: 'Limit your answer to approximately 150 words while maintaining clarity and covering all essential points. Prioritize important information and use precise language.'
      },
      {
        id: 'constraints-2',
        title: 'Simple Language',
        description: 'Use simple language for general audience',
        content: 'Use simple, accessible language appropriate for a general audience. Avoid jargon, and when technical terms must be used, provide brief explanations. Aim for approximately an 8th-grade reading level.'
      }
    ]
  },
  {
    id: 'ethics',
    title: 'Ethical/Compliance Directives',
    description: 'Instruct the AI to adhere to ethical guidelines and compliance requirements.',
    prompts: [
      {
        id: 'ethics-1',
        title: 'Neutrality',
        description: 'Maintain neutrality and avoid personal opinions',
        content: 'Maintain strict neutrality in your responses. Present multiple perspectives where relevant, avoid personal opinions, and clearly distinguish between factual statements and interpretations.'
      },
      {
        id: 'ethics-2',
        title: 'Data Privacy',
        description: 'Adhere to data privacy guidelines',
        content: 'Adhere to strict data privacy guidelines in your responses. Do not request personal identifying information, and remind users not to share sensitive data if the conversation appears to be heading in that direction.'
      }
    ]
  },
];

// User prompts organized by category
export const userPromptCategories: PromptCategory[] = [
  {
    id: 'task',
    title: 'Task Specification',
    description: 'Clearly state the task at hand.',
    prompts: [
      {
        id: 'task-1',
        title: 'Project Summary',
        description: 'Request a project summary',
        content: 'Generate a comprehensive project summary that highlights key objectives, current progress, major milestones, and next steps. Include any significant challenges and proposed solutions.'
      },
      {
        id: 'task-2',
        title: 'Competitive Analysis',
        description: 'Request a competitive analysis',
        content: 'Analyze the top three competitors in our market. For each competitor, identify their strengths, weaknesses, unique selling propositions, and market positioning. Compare their offerings to our product.'
      }
    ]
  },
  {
    id: 'goal',
    title: 'Goal Declaration',
    description: 'Define the intended outcome.',
    prompts: [
      {
        id: 'goal-1',
        title: 'Blog Title',
        description: 'Request a creative blog title',
        content: 'I need a creative and engaging title for my blog post about sustainable urban gardening practices for apartment dwellers. The title should be attention-grabbing and SEO-friendly.'
      },
      {
        id: 'goal-2',
        title: 'Presentation Outline',
        description: 'Request a presentation outline',
        content: 'I need to create a 15-minute presentation outlining our Q2 marketing strategy. Help me structure this presentation with clear sections and key talking points for each slide.'
      }
    ]
  },
  {
    id: 'tone',
    title: 'Tone/Style Preferences',
    description: 'Guide the style or tone of the response.',
    prompts: [
      {
        id: 'tone-1',
        title: 'Conversational Tone',
        description: 'Request a friendly, conversational tone',
        content: 'Write in a friendly, conversational tone that makes complex concepts accessible and engaging. Use analogies where appropriate and avoid overly formal language.'
      },
      {
        id: 'tone-2',
        title: 'Professional Tone',
        description: 'Request a professional, formal tone',
        content: 'Write in a professional, formal tone appropriate for a business audience. Maintain a structured approach with clear headings and concise paragraphs. Use industry-standard terminology where appropriate.'
      }
    ]
  },
];
