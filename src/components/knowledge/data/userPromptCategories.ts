import { PromptCategory } from '../types/promptTypes';

// User prompts organized by category
export const initialUserPromptCategories: PromptCategory[] = [
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
  {
    id: 'instructions',
    title: 'Detailed Instructions',
    description: 'Provide step-by-step guidance for complex tasks.',
    prompts: [
      {
        id: 'instructions-1',
        title: 'Meeting Setup',
        description: 'Request steps for setting up a meeting',
        content: 'Explain the steps for setting up a quarterly review meeting with our international team, then list potential dates in the next two weeks that avoid major holidays across relevant time zones. Include best practices for preparing an agenda.'
      },
      {
        id: 'instructions-2',
        title: 'Research Process',
        description: 'Request research methodology steps',
        content: 'Outline a comprehensive research methodology for evaluating customer satisfaction with our new product feature. Include data collection methods, sample size considerations, analysis approach, and how to present findings.'
      }
    ]
  },
  {
    id: 'followup',
    title: 'Clarification & Follow-Up',
    description: 'Specify requirements for iterative clarification if the initial prompt is vague.',
    prompts: [
      {
        id: 'followup-1',
        title: 'Request Clarification',
        description: 'Ask for clarification on vague requests',
        content: 'If my request lacks specific details needed to provide a comprehensive response, ask me targeted questions to clarify the most important parameters before proceeding with a full answer.'
      },
      {
        id: 'followup-2',
        title: 'Iterative Development',
        description: 'Request iterative approach to complex requests',
        content: 'For this complex request, first provide an initial high-level approach, then ask me which aspects need further development. Continue this iterative process until we\'ve reached a satisfactory level of detail.'
      }
    ]
  },
  {
    id: 'customization',
    title: 'Customization Parameters',
    description: 'Set personal preferences to adjust the output for specific audiences or contexts.',
    prompts: [
      {
        id: 'custom-1',
        title: 'Technical Audience',
        description: 'Adjust response for a technical audience',
        content: 'Adjust your response for a technical audience with advanced knowledge of our industry. Use appropriate terminology and concepts without extensive explanation of basics. Include technical details that would be valuable for implementation.'
      },
      {
        id: 'custom-2',
        title: 'Executive Summary',
        description: 'Adjust response for executive audience',
        content: 'Provide an executive summary suitable for senior leadership. Focus on strategic implications, business impact, and key decisions needed. Begin with the most important insights and recommendations, followed by supporting points.'
      }
    ]
  },
  {
    id: 'custom-user',
    title: 'Custom User Prompts',
    description: 'Your custom user prompts and templates.',
    prompts: [],
    isCustom: true
  }
];
