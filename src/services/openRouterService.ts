import { OpenRouterModel } from '@/types';

const OPENROUTER_API_BASE_URL = 'https://openrouter.ai/api/v1';

export const fetchOpenRouterModels = async (apiKey: string): Promise<OpenRouterModel[]> => {
  const response = await fetch(`${OPENROUTER_API_BASE_URL}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

export const enhancePrompt = async (
    prompt: string,
    systemPrompt: string,
    apiKey: string
): Promise<string> => {
    const response = await fetch(`${OPENROUTER_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "mistralai/mixtral-8x7b-instruct", // Hardcoded to a general-purpose model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Enhance the following user prompt:\n\n${prompt}` },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to enhance prompt: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

export const getChatCompletion = async (
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number
): Promise<string> => {
  const response = await fetch(`${OPENROUTER_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get chat completion: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
