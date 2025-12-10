/**
 * AI Service - Multi-Provider with Automatic Fallback
 * 
 * This service provides a unified interface for AI content generation
 * with automatic fallback across multiple providers.
 * 
 * Backward compatible with existing code - just import and use as before!
 */

import { generateContent as generateWithFallback, getProviderStatus, aiManager } from './aiProviders';

// ============================================================================
// MAIN EXPORTS (Backward Compatible)
// ============================================================================

/**
 * Generate content with automatic provider fallback
 * @param modelName - Model name (kept for compatibility, uses best available provider)
 * @param prompt - The prompt to generate content from
 * @param systemInstruction - Optional system instruction
 * @param config - Optional generation config
 */
export const generateContent = async (
  modelName: string,
  prompt: string,
  systemInstruction?: string,
  config?: any
): Promise<string> => {
  try {
    return await generateWithFallback(modelName, prompt, systemInstruction, config);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Generate content with streaming support
 * Falls back to non-streaming if provider doesn't support it
 */
export const generateContentStream = async (
  modelName: string,
  prompt: string,
  systemInstruction?: string,
  onChunk?: (text: string) => void,
  config?: any
): Promise<string> => {
  try {
    // For now, use non-streaming with simulated chunks
    // TODO: Implement true streaming for providers that support it
    const result = await generateWithFallback(modelName, prompt, systemInstruction, config);
    
    if (onChunk) {
      // Simulate streaming by sending chunks
      const words = result.split(' ');
      let accumulated = '';
      
      for (let i = 0; i < words.length; i++) {
        accumulated += (i > 0 ? ' ' : '') + words[i];
        onChunk(accumulated);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return result;
  } catch (error: any) {
    console.error('AI Streaming Error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Multi-turn conversation support
 */
export const generateConversation = async (
  modelName: string,
  history: Array<{ role: 'user' | 'model', parts: string }>,
  systemInstruction?: string
): Promise<string> => {
  try {
    // Convert history to a single prompt
    const conversationPrompt = history
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.parts}`)
      .join('\n\n');
    
    const fullPrompt = `${conversationPrompt}\n\nAssistant:`;
    
    return await generateWithFallback(modelName, fullPrompt, systemInstruction);
  } catch (error: any) {
    console.error('AI Conversation Error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * AI-powered content analysis
 */
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
    const result = await generateWithFallback(
      'analysis',
      prompts[analysisType],
      systemInstructions[analysisType]
    );

    // Try to parse as JSON, fallback to raw text
    try {
      return JSON.parse(result);
    } catch {
      return { analysis: result };
    }
  } catch (error: any) {
    console.error('Content Analysis Error:', error);
    throw new Error(getErrorMessage(error));
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error: any): string => {
  const errorStr = error?.message || String(error);
  
  if (errorStr.includes('No AI providers configured')) {
    return "AI service not configured. Please add API keys in Settings.";
  }
  
  if (errorStr.includes('All AI providers failed')) {
    return "All AI services are currently unavailable. Please try again in a few moments.";
  }
  
  if (errorStr.includes('503') || errorStr.includes('overloaded')) {
    return "AI service is experiencing high demand. Trying alternative providers...";
  }
  
  if (errorStr.includes('429') || errorStr.includes('rate limit') || errorStr.includes('quota')) {
    return "Rate limit reached. Switching to alternative provider...";
  }
  
  if (errorStr.includes('API key')) {
    return "API Key is missing or invalid. Please check your configuration.";
  }
  
  if (errorStr.includes('ECONNRESET') || errorStr.includes('ETIMEDOUT') || errorStr.includes('timeout')) {
    return "Network connection issue. Please check your internet and try again.";
  }
  
  return "An error occurred while generating content. Please try again.";
};

/**
 * Check which AI providers are available and healthy
 */
export const checkProviderStatus = async (): Promise<{
  available: string[];
  health: Record<string, boolean>;
  recommendation: string;
}> => {
  const status = await getProviderStatus();
  
  let recommendation = '';
  
  if (status.available.length === 0) {
    recommendation = 'No AI providers configured. Add at least one API key to get started.';
  } else if (status.available.length === 1) {
    recommendation = 'Only one provider configured. Add more providers for better reliability.';
  } else {
    const healthyCount = Object.values(status.health).filter(h => h).length;
    if (healthyCount === 0) {
      recommendation = 'All providers are currently unhealthy. Please check your API keys and try again.';
    } else if (healthyCount < status.available.length) {
      recommendation = `${healthyCount}/${status.available.length} providers are healthy. Some providers may be experiencing issues.`;
    } else {
      recommendation = 'All providers are healthy and ready to use!';
    }
  }
  
  return {
    ...status,
    recommendation
  };
};

/**
 * Get recommended API keys to add
 */
export const getRecommendedAPIKeys = (): Array<{
  name: string;
  envVar: string;
  url: string;
  free: boolean;
  description: string;
}> => {
  return [
    {
      name: 'Google Gemini',
      envVar: 'VITE_API_KEY',
      url: 'https://aistudio.google.com/app/apikey',
      free: true,
      description: 'Primary provider - Fast and reliable (Free tier available)'
    },
    {
      name: 'Groq',
      envVar: 'VITE_GROQ_API_KEY',
      url: 'https://console.groq.com/keys',
      free: true,
      description: 'Fallback provider - Extremely fast inference (Free)'
    },
    {
      name: 'Together AI',
      envVar: 'VITE_TOGETHER_API_KEY',
      url: 'https://api.together.xyz/settings/api-keys',
      free: true,
      description: 'Fallback provider - Good quality (Free tier available)'
    },
    {
      name: 'Hugging Face',
      envVar: 'VITE_HUGGINGFACE_API_KEY',
      url: 'https://huggingface.co/settings/tokens',
      free: true,
      description: 'Fallback provider - Free inference API'
    }
  ];
};

// ============================================================================
// LEGACY EXPORTS (For backward compatibility)
// ============================================================================

// Re-export everything from aiProviders for advanced usage
export { aiManager, getProviderStatus } from './aiProviders';
