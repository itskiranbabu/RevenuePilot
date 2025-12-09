import { GoogleGenerativeAI } from "@google/generative-ai";

// Vite uses import.meta.env instead of process.env
const getApiKey = () => {
  return import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
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
    return response.text() || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
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

    return fullText || "No content generated.";
  } catch (error) {
    console.error("Gemini API Streaming Error:", error);
    throw error;
  }
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
    return result.response.text() || "No content generated.";
  } catch (error) {
    console.error("Gemini Conversation Error:", error);
    throw error;
  }
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
  } catch (error) {
    console.error("Content Analysis Error:", error);
    throw error;
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
  } catch (error) {
    console.error("Suggestions Error:", error);
    return [];
  }
};
