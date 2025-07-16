import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  };
}

interface AnalyzeMessageRequest {
  message: string;
  step: number;
}

interface GenerateSummaryRequest {
  description: string;
  techCategories: string[];
  industries: string[];
}

interface GenerateTagsRequest {
  description: string;
  techCategories: string[];
  industries: string[];
}

interface GenerateRecommendationRequest {
  solution: any;
  userNeed: string;
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...payload } = await req.json()
    
    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    let result;

    switch (action) {
      case 'chat':
        result = await handleChatRequest(payload as ChatRequest, openaiApiKey);
        break;
      case 'analyzeMessage':
        result = await analyzeMessage(payload as AnalyzeMessageRequest, openaiApiKey);
        break;
      case 'generateSummary':
        result = await generateSummary(payload as GenerateSummaryRequest, openaiApiKey);
        break;
      case 'generateTags':
        result = await generateTags(payload as GenerateTagsRequest, openaiApiKey);
        break;
      case 'generateRecommendation':
        result = await generateRecommendation(payload as GenerateRecommendationRequest, openaiApiKey);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('OpenAI Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function handleChatRequest(
  { messages, options }: ChatRequest,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function analyzeMessage(
  { message, step }: AnalyzeMessageRequest, 
  apiKey: string
): Promise<any> {
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  // Clean and parse the response
  const cleanedResponse = cleanJsonResponse(analysis || '{}');
  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    console.error('Cleaned response:', cleanedResponse);
    throw new Error('Failed to parse response from OpenAI');
  }
}

async function generateSummary(
  { description, techCategories, industries }: GenerateSummaryRequest,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
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
      ],
      temperature: 0.7,
      max_tokens: 200
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content || description.substring(0, 200) + '...';
}

async function generateTags(
  { description, techCategories, industries }: GenerateTagsRequest,
  apiKey: string
): Promise<string[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
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
      ],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseContent = data.choices[0].message.content;
  
  // Clean and parse the response
  const cleanedResponse = cleanJsonResponse(responseContent);
  try {
    const result = JSON.parse(cleanedResponse);
    
    // Extract tags array from the response, handling different possible formats
    if (Array.isArray(result.tags)) {
      return result.tags;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      // Fallback: extract values from the object
      return Object.values(result).filter(val => typeof val === 'string').slice(0, 8);
    }
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    console.error('Cleaned response:', cleanedResponse);
    return [];
  }
}

async function generateRecommendation(
  { solution, userNeed }: GenerateRecommendationRequest,
  apiKey: string
): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
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
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseContent = data.choices[0].message.content;
  
  // Clean and parse the response
  const cleanedResponse = cleanJsonResponse(responseContent);
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
    return {
      score: '0',
      strengths: [],
      gaps: [],
      considerations: [],
      summary: 'Error generating recommendation'
    };
  }
}