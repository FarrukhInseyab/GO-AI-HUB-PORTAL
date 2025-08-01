// OpenAI client for direct API calls

// Get API key from environment
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Base URL for OpenAI API
const OPENAI_API_URL = 'https://api.openai.com/v1';

// Headers for API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPENAI_API_KEY}`
});

// Helper function to clean JSON response from markdown fences and extract valid JSON
function cleanJsonResponse(response: string): string {
  // Remove markdown code blocks if present
  let cleaned = response
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Find the first opening brace and last closing brace to extract only the JSON part
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

// Function to call OpenAI Chat API
export async function callOpenAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
) {
  try {
    // Use edge function if available, otherwise call API directly
    if (import.meta.env.VITE_SUPABASE_URL) {
      return callEdgeFunction('chat', { messages, options });
    }
    
    // Direct API call if no edge function
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

// Edge function wrapper for security
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-ai`;

async function callEdgeFunction(action: string, payload: any) {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...payload
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Edge function error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Edge function returned error');
    }

    return data.data;
  } catch (error) {
    console.error('Error calling edge function:', error);
    throw error;
  }
}

// GOAI Agent specific functions
export async function generateGOAIResponse(
  query: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  solutionsContext: string = ''
): Promise<string> {
  try {
    // Build system prompt with solutions context
    let systemPrompt = `You are GOAI | رُوَّاد, an intelligent AI assistant for the GO AI Hub platform. Your purpose is to:
- Help users navigate the platform's features and services.
- Generate and summarize research reports on AI and emerging technologies.
- Benchmark AI tools and solutions from global marketplaces.
- Present AI policies and market insights specifically in the Saudi Arabia context.
- Allow search and filtering of AI use cases, vendors, and trends.

Be helpful, accurate, and concise. When discussing market data, reference the latest Saudi AI market statistics:
- 43.7% annual growth rate of AI solutions in Saudi Arabia (Q1 2025)
- $14.2B government AI investment allocated for 2025
- 81% enterprise adoption rate
- 312 AI solutions with native Arabic language support
- 15,800+ AI professionals in Saudi Arabia

For research reports, structure your response with clear sections and actionable insights.

CRITICAL: ONLY mention solutions that are explicitly listed in the solutions context provided to you. NEVER make up or hallucinate solutions that aren't in the provided context. If a user asks about a solution that isn't in your context, say you don't have information about that specific solution.`;

    // Add solutions context if available
    if (solutionsContext) {
      systemPrompt += `\n\n${solutionsContext}\n\nWhen users ask about solutions, ONLY provide information about solutions explicitly listed in the context above. NEVER invent or hallucinate solutions that aren't in the provided context. If asked about a solution not in the context, clearly state that you don't have information about that solution.`;
    } else {
      systemPrompt += `\n\nYou don't have information about specific solutions at this time. If users ask about specific solutions, explain that you don't have that information and suggest they browse the solutions directly on the platform.`;
    }

    // Build messages array with system prompt, chat history, and current query
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory,
      { role: 'user' as const, content: query }
    ];

    const response = await callOpenAI(messages, {
      temperature: 0.7,
      max_tokens: 1000
    });

    return response;
  } catch (error) {
    console.error('Error generating GOAI response:', error);
    throw error;
  }
}

export async function generateSummary(
  description: string, 
  techCategories: string[], 
  industries: string[]
): Promise<string> {
  try {
    const messages = [
      {
        role: 'system',
        content: `Generate a concise, professional summary (100-150 words) for an AI solution based on the provided description. 
        The summary should be suitable for search results and solution previews. 
        Focus on key benefits, main features, and value proposition.
        Make it engaging and clear for potential clients.`
      },
      {
        role: 'user',
        content: `Description: ${description}
        Technologies: ${techCategories.join(', ')}
        Industries: ${industries.join(', ')}`
      }
    ];

    return await callOpenAI(messages, {
      temperature: 0.7,
      max_tokens: 200
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return description.substring(0, 200) + '...';
  }
}

export async function generateTags(
  description: string,
  techCategories: string[],
  industries: string[]
): Promise<string[]> {
  try {
    const messages = [
      {
        role: 'system',
        content: `Generate 5-8 relevant tags for an AI solution based on the provided description and categories. 
        Tags should be:
        - Short and descriptive (1-3 words each)
        - Relevant to the solution's functionality and target market
        - Mix of technical and business-focused terms
        - Suitable for search and categorization
        
        Return the tags as a JSON array of strings.`
      },
      {
        role: 'user',
        content: `Description: ${description}
        Technologies: ${techCategories.join(', ')}
        Industries: ${industries.join(', ')}`
      }
    ];

    const response = await callOpenAI(messages, {
      temperature: 0.7,
      max_tokens: 150
    });

    // Clean and parse the response
    const cleanedResponse = cleanJsonResponse(response);
    
    try {
      // Try parsing as JSON directly
      const parsed = JSON.parse(cleanedResponse);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.tags && Array.isArray(parsed.tags)) {
        return parsed.tags;
      }
    } catch (e) {
      // If not valid JSON, try to extract array-like content
      const match = cleanedResponse.match(/\[(.*)\]/s);
      if (match) {
        try {
          return JSON.parse(`[${match[1]}]`);
        } catch (e2) {
          // If still fails, extract quoted strings
          const tags = [];
          const regex = /"([^"]*)"/g;
          let m;
          while ((m = regex.exec(match[1])) !== null) {
            tags.push(m[1]);
          }
          if (tags.length > 0) {
            return tags;
          }
        }
      }
    }
    
    // Fallback: split by commas and clean up
    return cleanedResponse
      .replace(/[\[\]"']/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 8);
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

export async function analyzeMessage(message: string, step: number): Promise<any> {
  try {
    let systemPrompt = '';
    
    switch (step) {
      case 1:
        systemPrompt = `Extract the following information from the user's message about their AI solution:
          - solutionName (the name/title of their AI product/service)
          - description (comprehensive explanation of what the solution does, how it works, problems it solves, features, benefits, use cases)
          - companyName (if mentioned)
          - contactEmail (if mentioned)
          
          IMPORTANT: The description should capture ALL details provided by the user about their solution.
          
          Format the response as JSON with these exact keys: solutionName, description, companyName, contactEmail
          Only include keys that have actual values from the user's message.`;
        break;
      case 2:
        systemPrompt = `Extract the following information from the user's message:
          - website (company website URL)
          - techCategory - map user's descriptions to these exact options: ["NLP", "Computer Vision", "Machine Learning", "Predictive Analytics", "IoT", "Edge AI", "RPA", "Deep Learning", "Neural Networks", "GenAI", "Blockchain", "Cloud Computing", "VR/AR", "Quantum Computing"]
          - industryFocus - map user's descriptions to these exact options: ["Government", "Healthcare", "Education", "Finance", "Smart Cities", "Energy", "Transportation", "Security", "Defense", "Retail", "Manufacturing", "Agriculture", "Media", "Telecommunications", "Business"]
          
          IMPORTANT: 
          - For techCategory: Match user's technical descriptions to the exact strings from the list above
          - For industryFocus: Match user's industry mentions to the exact strings from the list above
          - If user mentions "government", "public sector", "gov" -> use "Government"
          - If user mentions "AI", "artificial intelligence", "machine learning", "ML" -> use "Machine Learning"
          - If user mentions "vision", "image", "video", "visual" -> use "Computer Vision"
          - If user mentions "language", "text", "speech", "NLP" -> use "NLP"
          - If user mentions "website", "site", "web" -> extract the URL for website field
          
          Format as JSON with keys: website, techCategory (array), industryFocus (array)
          Only include keys that have actual values from the user's message.`;
        break;
      case 3:
        systemPrompt = `Extract deployment and language support information:
          - deploymentStatus - map to one of these exact options: ["Production", "Pilot", "Development", "Planning", "Concept", "Proof of Concept"]
          - clients (if they mention current clients or deployments)
          - arabicSupport (boolean - true if they mention Arabic support, false if they say no, undefined if not mentioned)
          - arabicDetails (if they provide specifics about Arabic capabilities)
          
          IMPORTANT: For deploymentStatus, map user descriptions:
          - "live", "deployed", "in production", "customers using" -> "Production"
          - "pilot", "testing", "trial" -> "Pilot"
          - "developing", "building", "coding" -> "Development"
          - "planning", "designing" -> "Planning"
          - "idea", "concept" -> "Concept"
          - "proof of concept", "POC", "prototype" -> "Proof of Concept"
          
          Format as JSON with keys: deploymentStatus, clients, arabicSupport, arabicDetails
          Only include keys that have actual values from the user's message.`;
        break;
      case 4:
        systemPrompt = `Extract Saudi market specific information:
          - ksaCustomization (boolean - true if they mention Saudi/KSA specific features, false if they say no)
          - ksaCustomizationDetails (specific details about Saudi market adaptations)
          
          Format as JSON with keys: ksaCustomization, ksaCustomizationDetails
          Only include keys that have actual values from the user's message.`;
        break;
      default:
        throw new Error('Invalid step number');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const response = await callOpenAI(messages, {
      temperature: 0.3,
      max_tokens: 500
    });

    // Clean and parse the response
    const cleanedResponse = cleanJsonResponse(response);
    
    try {
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Cleaned response:', cleanedResponse);
      throw new Error('Failed to parse response from OpenAI');
    }
  } catch (error) {
    console.error('Error analyzing message:', error);
    throw error;
  }
}

export async function generateRecommendation(
  solution: any,
  userNeed: string
): Promise<any> {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are an AI solution recommendation expert. Analyze the provided solution details and user needs to generate a detailed compatibility assessment. Include:
          1. Overall fit score (0-100%)
          2. Key strengths that match the needs
          3. Potential gaps or limitations
          4. Implementation considerations
          Return the analysis as a JSON object with these exact keys: score, strengths, gaps, considerations, summary`
      },
      {
        role: 'user',
        content: `Solution Details:
          Name: ${solution.solution_name}
          Summary: ${solution.summary}
          Description: ${solution.description || ''}
          Technologies: ${solution.tech_categories.join(', ')}
          Industry Focus: ${solution.industry_focus.join(', ')}
          Arabic Support: ${solution.arabic_support ? 'Yes' : 'No'}
          Deployment Model: ${solution.deployment_model || ''}
          
          User Need:
          ${userNeed}`
      }
    ];

    const response = await callOpenAI(messages, {
      temperature: 0.7,
      max_tokens: 1000
    });

    // Clean and parse the response
    const cleanedResponse = cleanJsonResponse(response);
    
    try {
      const result = JSON.parse(cleanedResponse);
      
      // Ensure the result has the expected structure
      return {
        score: result.score || '0',
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        gaps: Array.isArray(result.gaps) ? result.gaps : [],
        considerations: Array.isArray(result.considerations) ? result.considerations : [],
        summary: result.summary || 'No summary available'
      };
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Cleaned response:', cleanedResponse);
      throw new Error('Failed to parse recommendation from OpenAI');
    }
  } catch (error) {
    console.error('Error generating recommendation:', error);
    throw error;
  }
}