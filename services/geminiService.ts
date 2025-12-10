import { GoogleGenerativeAI } from "@google/generative-ai";

// Vite uses import.meta.env instead of process.env
const getApiKey = () => {
  return import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 500ms between requests

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limiter
const rateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
};

// Retry with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> => {
  try {
    await rateLimit();
    return await fn();
  } catch (error: any) {
    if (retries === 0) {
      throw error;
    }

    // Check if error is retryable (503, 429, network errors)
    const isRetryable = 
      error?.message?.includes('503') ||
      error?.message?.includes('overloaded') ||
      error?.message?.includes('429') ||
      error?.message?.includes('rate limit') ||
      error?.message?.includes('ECONNRESET') ||
      error?.message?.includes('ETIMEDOUT');

    if (!isRetryable) {
      throw error;
    }

    console.warn(`Retrying after ${delay}ms... (${retries} retries left)`);
    await sleep(delay);
    
    // Exponential backoff with jitter
    const nextDelay = Math.min(delay * 2 + Math.random() * 1000, MAX_RETRY_DELAY);
    return retryWithBackoff(fn, retries - 1, nextDelay);
  }
};

// Enhanced error messages
const getErrorMessage = (error: any): string => {
  const errorStr = error?.message || String(error);
  
  if (errorStr.includes('503') || errorStr.includes('overloaded')) {
    return "The AI service is currently experiencing high demand. Please try again in a few moments.";
  }
  
  if (errorStr.includes('429') || errorStr.includes('rate limit')) {
    return "Rate limit exceeded. Please wait a moment before trying again.";
  }
  
  if (errorStr.includes('API key')) {
    return "API Key is missing or invalid. Please check your configuration.";
  }
  
  if (errorStr.includes('ECONNRESET') || errorStr.includes('ETIMEDOUT')) {
    return "Network connection issue. Please check your internet and try again.";
  }
  
  return "An error occurred while generating content. Please try again.";
};

export const generateContent = async (
  modelName: string,
  prompt: string,
  systemInstruction?: string,
  config?: any
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          ...config
        },
        systemInstruction: systemInstruction
      });

      const response = result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error("No content generated. Please try again.");
      }
      
      return text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(getErrorMessage(error));
    }
  });
};

// Streaming version for real-time output
export const generateContentStream = async (
  modelName: string,
  prompt: string,
  systemInstruction?: string,
  onChunk?: (text: string) => void,
  config?: any
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: modelName });
    let fullText = "";
    
    try {
      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          ...config
        },
        systemInstruction: systemInstruction
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        if (onChunk) onChunk(fullText);
      }

      if (!fullText || fullText.trim().length === 0) {
        throw new Error("No content generated. Please try again.");
      }

      return fullText;
    } catch (error: any) {
      console.error("Gemini API Streaming Error:", error);
      throw new Error(getErrorMessage(error));
    }
  });
};

// Advanced: Multi-turn conversation
export const generateConversation = async (
  modelName: string,
  history: Array<{ role: 'user' | 'model', parts: string }>,
  systemInstruction?: string
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    try {
      const chat = model.startChat({
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts }]
        })),
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192
        }
      });

      const result = await chat.sendMessage(systemInstruction || "Continue the conversation");
      const text = result.response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error("No content generated. Please try again.");
      }
      
      return text;
    } catch (error: any) {
      console.error("Gemini Conversation Error:", error);
      throw new Error(getErrorMessage(error));
    }
  });
};

// AI-powered content analysis
export const analyzeContent = async (
  content: string,
  analysisType: 'sentiment' | 'readability' | 'seo' | 'engagement'
): Promise<any> => {
  const prompts = {
    sentiment: `Analyze the sentiment and emotional tone of this content. Provide a score from 1-10 and key insights:\n\n${content}`,
    readability: `Analyze the readability of this content. Provide Flesch Reading Ease score, grade level, and suggestions:\n\n${content}`,
    seo: `Analyze this content for SEO. Provide keyword density, meta description suggestion, and SEO score:\n\n${content}`,
    engagement: `Analyze the engagement potential of this content. Rate hooks, CTAs, and emotional triggers:\n\n${content}`
  };

  const systemInstructions = {
    sentiment: "You are a sentiment analysis expert. Provide structured JSON output.",
    readability: "You are a readability expert. Provide structured JSON output.",
    seo: "You are an SEO expert. Provide structured JSON output.",
    engagement: "You are a content engagement expert. Provide structured JSON output."
  };

  try {
    const result = await generateContent(
      'gemini-2.0-flash-exp',
      prompts[analysisType],
      systemInstructions[analysisType]
    );
    
    // Try to parse as JSON, fallback to text
    try {
      return JSON.parse(result);
    } catch {
      return { analysis: result };
    }
  } catch (error: any) {
    console.error("Content Analysis Error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// AI-powered suggestions
export const getSuggestions = async (
  content: string,
  agentType: string
): Promise<string[]> => {
  const prompt = `Based on this ${agentType} content, provide 5 specific improvement suggestions:\n\n${content}\n\nProvide only the suggestions as a numbered list.`;
  
  try {
    const result = await generateContent(
      'gemini-2.0-flash-exp',
      prompt,
      "You are an expert marketing consultant providing actionable suggestions."
    );
    
    // Parse numbered list
    return result.split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  } catch (error: any) {
    console.error("Suggestions Error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// Health check
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await generateContent(
      'gemini-2.0-flash-exp',
      'Say "OK" if you can read this.',
      'You are a health check bot. Respond with exactly "OK".'
    );
    return true;
  } catch (error) {
    console.error("API Health Check Failed:", error);
    return false;
  }
};
