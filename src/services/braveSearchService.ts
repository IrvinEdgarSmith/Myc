interface BraveSearchOptions {
  q: string;
  count?: number;
  offset?: number;
  deep?: boolean;
}

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  publishedDate?: string;
}

interface BraveSearchResponse {
  web?: {
    results?: BraveSearchResult[];
    totalResults?: number;
  };
  error?: any;
}

export async function braveSearch(
  query: string,
  apiKey: string,
  options?: Partial<BraveSearchOptions>
): Promise<BraveSearchResult[]> {
  if (!apiKey || !query.trim()) {
    throw new Error('Brave API key and search query are required');
  }

  try {
    const searchParams = new URLSearchParams({
      q: query.trim(),
      count: String(options?.count || 5),
      offset: String(options?.offset || 0),
    });
    
    // If deep search is enabled, use different endpoint or parameters
    const deepParam = options?.deep ? '&deep=true' : '';
    
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${searchParams.toString()}${deepParam}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brave search error:', errorData);
      throw new Error(`Brave search failed with status ${response.status}`);
    }
    
    const data: BraveSearchResponse = await response.json();
    
    if (data.error) {
      console.error('Brave search API error:', data.error);
      throw new Error('Brave search API returned an error');
    }
    
    return data.web?.results || [];
  } catch (error) {
    console.error('Error performing Brave search:', error);
    throw error;
  }
}

export function formatSearchResultsAsContext(results: BraveSearchResult[], query: string): string {
  if (results.length === 0) {
    return `No search results found for "${query}"`;
  }
  
  let context = `Web search results for query: "${query}"\n\n`;
  
  results.forEach((result, index) => {
    context += `[${index + 1}] ${result.title}\n`;
    context += `URL: ${result.url}\n`;
    context += `${result.description}\n`;
    if (result.publishedDate) {
      context += `Published: ${result.publishedDate}\n`;
    }
    context += '\n';
  });
  
  return context;
}

// Advanced function to process search query and results using a model
export async function processWebSearchWithModel(
  userQuery: string,
  searchResults: BraveSearchResult[],
  modelId: string,
  apiKey: string
): Promise<string> {
  // If no model is selected, just format the results
  if (!modelId || !apiKey) {
    return formatSearchResultsAsContext(searchResults, userQuery);
  }

  try {
    // Create a system prompt for the model to process search results
    const systemPrompt = `You are a research assistant. Given a user query and web search results, 
    extract and synthesize the most relevant information to help answer the query. 
    Be factual, concise, and focused on the question at hand.`;

    // Create a formatted context from search results
    const formattedResults = formatSearchResultsAsContext(searchResults, userQuery);

    // Call the model to process results
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Mycelial Interface - Web Search',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Query: ${userQuery}\n\nSearch Results:\n${formattedResults}` }
        ],
        temperature: 0.3, // Lower temperature for more focused, factual responses
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API returned status ${response.status}`);
    }

    const data = await response.json();
    const processedResults = data.choices[0].message.content;

    return `## Web Search Results for "${userQuery}"\n\n${processedResults}`;
  } catch (error) {
    console.error('Error processing web search with model:', error);
    // Fallback to simple formatting if model processing fails
    return formatSearchResultsAsContext(searchResults, userQuery);
  }
}
