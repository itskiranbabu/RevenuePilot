/**
 * Multi-Provider AI Service with Automatic Fallback
 * 
 * Providers (in priority order):
 * 1. Google Gemini (Primary) - gemini-2.0-flash-exp
 * 2. Groq (Fallback 1) - llama-3.3-70b-versatile (Free, very fast)
 * 3. Together AI (Fallback 2) - Meta-Llama-3.1-70B-Instruct-Turbo (Free tier)
 * 4. Hugging Face (Fallback 3) - Meta-Llama-3-70B-Instruct (Free inference)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AIProvider {
  name: string;
  priority: number;
  isAvailable: () => boolean;
  generate: (prompt: string, systemInstruction?: string, config?: any) => Promise<string>;
  healthCheck: () => Promise<boolean>;
}

interface ProviderConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  rateLimit: {
    requestsPerMinute: number;
    lastRequestTime: number;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const getEnvVar = (key: string): string | undefined => {
  return import.meta.env[key] || import.meta.env[`VITE_${key}`];
};

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  gemini: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    rateLimit: { requestsPerMinute: 15, lastRequestTime: 0 }
  },
  groq: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    rateLimit: { requestsPerMinute: 30, lastRequestTime: 0 }
  },
  together: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    rateLimit: { requestsPerMinute: 20, lastRequestTime: 0 }
  },
  huggingface: {
    maxRetries: 3,
    retryDelay: 2000,
    timeout: 60000,
    rateLimit: { requestsPerMinute: 10, lastRequestTime: 0 }
  }
};

// ============================================================================
// UTILITIES
// ============================================================================

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkRateLimit = async (providerName: string): Promise<void> => {
  const config = PROVIDER_CONFIGS[providerName];
  const now = Date.now();
  const timeSinceLastRequest = now - config.rateLimit.lastRequestTime;
  const minInterval = 60000 / config.rateLimit.requestsPerMinute;

  if (timeSinceLastRequest < minInterval) {
    await sleep(minInterval - timeSinceLastRequest);
  }

  config.rateLimit.lastRequestTime = Date.now();
};

const isRetryableError = (error: any): boolean => {
  const errorStr = error?.message || String(error);
  return (
    errorStr.includes('503') ||
    errorStr.includes('overloaded') ||
    errorStr.includes('429') ||
    errorStr.includes('rate limit') ||
    errorStr.includes('quota') ||
    errorStr.includes('ECONNRESET') ||
    errorStr.includes('ETIMEDOUT') ||
    errorStr.includes('timeout')
  );
};

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

/**
 * Google Gemini Provider (Primary)
 */
class GeminiProvider implements AIProvider {
  name = "Google Gemini";
  priority = 1;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = getEnvVar('API_KEY') || getEnvVar('GEMINI_API_KEY');
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'test' }] }] });
      return true;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, systemInstruction?: string, config?: any): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    await checkRateLimit('gemini');

    const genAI = new GoogleGenerativeAI(this.apiKey!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        ...config
      },
      systemInstruction
    });

    const text = result.response.text();
    if (!text || text.trim().length === 0) {
      throw new Error('No content generated');
    }

    return text;
  }
}

/**
 * Groq Provider (Fallback 1) - Free, very fast
 * Get API key: https://console.groq.com/keys
 */
class GroqProvider implements AIProvider {
  name = "Groq";
  priority = 2;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = getEnvVar('GROQ_API_KEY');
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Groq API key not configured');
    }

    await checkRateLimit('groq');

    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.9,
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('No content generated');
    }

    return text;
  }
}

/**
 * Together AI Provider (Fallback 2) - Free tier available
 * Get API key: https://api.together.xyz/settings/api-keys
 */
class TogetherProvider implements AIProvider {
  name = "Together AI";
  priority = 3;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = getEnvVar('TOGETHER_API_KEY');
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const response = await fetch('https://api.together.xyz/v1/models', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Together AI API key not configured');
    }

    await checkRateLimit('together');

    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages,
        temperature: 0.9,
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Together AI error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('No content generated');
    }

    return text;
  }
}

/**
 * Hugging Face Provider (Fallback 3) - Free inference API
 * Get API key: https://huggingface.co/settings/tokens
 */
class HuggingFaceProvider implements AIProvider {
  name = "Hugging Face";
  priority = 4;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = getEnvVar('HUGGINGFACE_API_KEY');
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const response = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Hugging Face API key not configured');
    }

    await checkRateLimit('huggingface');

    const fullPrompt = systemInstruction 
      ? `<|system|>${systemInstruction}</s>\n<|user|>${prompt}</s>\n<|assistant|>`
      : `<|user|>${prompt}</s>\n<|assistant|>`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-70B-Instruct',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 8192,
            temperature: 0.9,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data[0]?.generated_text || data.generated_text;

    if (!text || text.trim().length === 0) {
      throw new Error('No content generated');
    }

    return text;
  }
}

// ============================================================================
// PROVIDER MANAGER
// ============================================================================

class AIProviderManager {
  private providers: AIProvider[];
  private currentProviderIndex: number = 0;

  constructor() {
    this.providers = [
      new GeminiProvider(),
      new GroqProvider(),
      new TogetherProvider(),
      new HuggingFaceProvider()
    ].sort((a, b) => a.priority - b.priority);
  }

  getAvailableProviders(): AIProvider[] {
    return this.providers.filter(p => p.isAvailable());
  }

  async generateWithFallback(
    prompt: string,
    systemInstruction?: string,
    config?: any
  ): Promise<{ content: string; provider: string }> {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error(
        'No AI providers configured. Please add at least one API key:\n' +
        '- VITE_API_KEY (Gemini)\n' +
        '- VITE_GROQ_API_KEY (Groq - Free)\n' +
        '- VITE_TOGETHER_API_KEY (Together AI - Free)\n' +
        '- VITE_HUGGINGFACE_API_KEY (Hugging Face - Free)'
      );
    }

    const errors: Array<{ provider: string; error: string }> = [];

    for (const provider of availableProviders) {
      try {
        console.log(`🤖 Attempting generation with ${provider.name}...`);
        
        const content = await this.retryWithBackoff(
          () => provider.generate(prompt, systemInstruction, config),
          PROVIDER_CONFIGS[provider.name.toLowerCase().replace(/\s+/g, '')] || PROVIDER_CONFIGS.gemini
        );

        console.log(`✅ Successfully generated content with ${provider.name}`);
        return { content, provider: provider.name };

      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        console.warn(`❌ ${provider.name} failed: ${errorMsg}`);
        errors.push({ provider: provider.name, error: errorMsg });

        // If it's not a retryable error, try next provider immediately
        if (!isRetryableError(error)) {
          continue;
        }
      }
    }

    // All providers failed
    const errorSummary = errors.map(e => `${e.provider}: ${e.error}`).join('\n');
    throw new Error(
      `All AI providers failed:\n${errorSummary}\n\n` +
      'Please try again in a few moments or check your API keys.'
    );
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    config: ProviderConfig
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        if (attempt === config.maxRetries || !isRetryableError(error)) {
          throw error;
        }

        const delay = config.retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`⏳ Retrying in ${Math.round(delay)}ms... (${attempt + 1}/${config.maxRetries})`);
        await sleep(delay);
      }
    }

    throw lastError;
  }

  async checkProviderHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        health[provider.name] = await provider.healthCheck();
      } else {
        health[provider.name] = false;
      }
    }

    return health;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const aiManager = new AIProviderManager();

export const generateContent = async (
  modelName: string, // Kept for backward compatibility, but ignored
  prompt: string,
  systemInstruction?: string,
  config?: any
): Promise<string> => {
  const result = await aiManager.generateWithFallback(prompt, systemInstruction, config);
  return result.content;
};

export const getProviderStatus = async (): Promise<{
  available: string[];
  health: Record<string, boolean>;
}> => {
  const available = aiManager.getAvailableProviders().map(p => p.name);
  const health = await aiManager.checkProviderHealth();
  
  return { available, health };
};
