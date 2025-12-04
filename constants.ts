import { AgentConfig, AgentCategory, InputType } from './types';

// Helper to create common inputs
const commonInputs = {
  productName: { name: 'productName', label: 'Product/Service Name', type: InputType.TEXT, required: true, placeholder: 'e.g. RevenuePilot AI' },
  targetAudience: { name: 'targetAudience', label: 'Target Audience', type: InputType.TEXT, required: true, placeholder: 'e.g. SaaS Founders, Marketing Managers' },
  tone: { name: 'tone', label: 'Tone of Voice', type: InputType.SELECT, options: ['Professional', 'Persuasive', 'Urgent', 'Friendly', 'Witty', 'Luxury'], defaultValue: 'Professional' },
};

export const AGENTS: AgentConfig[] = [
  // --- ADS & TRAFFIC ---
  {
    id: 'ad-copy',
    name: 'Ad Copy Agent',
    description: 'Generates high-converting ad copy for FB, Google, and LinkedIn.',
    category: AgentCategory.ADS,
    iconName: 'Megaphone',
    systemInstruction: 'You are a world-class direct response copywriter. Focus on hooks, benefits, and CTAs.',
    inputs: [
      commonInputs.productName,
      commonInputs.targetAudience,
      { name: 'platform', label: 'Platform', type: InputType.SELECT, options: ['Facebook/Instagram', 'Google Search', 'LinkedIn', 'Twitter/X', 'TikTok'] },
      { name: 'keyBenefit', label: 'Key Benefit/USP', type: InputType.TEXTAREA, placeholder: 'What makes it unique?' },
      commonInputs.tone
    ],
    promptTemplate: (data) => `Write 3 variations of ${data.platform} ad copy for ${data.productName}. 
    Target Audience: ${data.targetAudience}. 
    Key Benefit: ${data.keyBenefit}. 
    Tone: ${data.tone}.
    Include a Hook, Body, and Call to Action for each variation.`
  },
  {
    id: 'ad-hook',
    name: 'Ad Hook Agent',
    description: 'Brainstorms scroll-stopping hooks to capture attention immediately.',
    category: AgentCategory.ADS,
    iconName: 'Magnet',
    systemInstruction: 'You are an expert at viral marketing and psychology.',
    inputs: [
      commonInputs.productName,
      { name: 'painPoint', label: 'Customer Pain Point', type: InputType.TEXTAREA, required: true },
      commonInputs.targetAudience
    ],
    promptTemplate: (data) => `Generate 10 viral ad hooks for ${data.productName} targeting ${data.targetAudience} who suffer from: ${data.painPoint}. 
    Mix curiosity, shock, and direct benefit hooks.`
  },
  {
    id: 'audience-research',
    name: 'Audience Research Agent',
    description: 'Deep dives into customer avatars, demographics, and psychographics.',
    category: AgentCategory.ADS,
    iconName: 'Users',
    systemInstruction: 'You are a market research expert. Provide detailed personas.',
    inputs: [
      { name: 'niche', label: 'Niche/Industry', type: InputType.TEXT, required: true },
      commonInputs.productName
    ],
    promptTemplate: (data) => `Create a detailed customer avatar for ${data.productName} in the ${data.niche} industry. 
    Include: Demographics, Psychographics, Core Desires, Biggest Fears, Common Objections, and where they hang out online.`
  },

  // --- VIDEO & CREATIVE ---
  {
    id: 'video-ads',
    name: 'Video Ads Agent',
    description: 'Writes scripts and storyboards for high-retention video ads.',
    category: AgentCategory.VIDEO,
    iconName: 'Video',
    systemInstruction: 'You are a video marketing strategist. Focus on retention and visual storytelling.',
    inputs: [
      commonInputs.productName,
      { name: 'duration', label: 'Duration', type: InputType.SELECT, options: ['15 seconds', '30 seconds', '60 seconds'] },
      { name: 'goal', label: 'Video Goal', type: InputType.SELECT, options: ['Brand Awareness', 'Conversion', 'Retargeting'] },
      commonInputs.tone
    ],
    promptTemplate: (data) => `Write a split-screen script (Visuals vs. Audio) for a ${data.duration} video ad for ${data.productName}. 
    Goal: ${data.goal}. Tone: ${data.tone}. 
    Ensure the first 3 seconds are extremely catchy.`
  },

  // --- CONTENT & COPY ---
  {
    id: 'headline-agent',
    name: 'Headline Agent',
    description: 'Optimizes headlines for landing pages, emails, and articles.',
    category: AgentCategory.CONTENT,
    iconName: 'Type',
    systemInstruction: 'You are a conversion optimization specialist.',
    inputs: [
      { name: 'context', label: 'Where will this appear?', type: InputType.SELECT, options: ['Landing Page Hero', 'Email Subject Line', 'Blog Title', 'YouTube Title'] },
      commonInputs.productName,
      { name: 'promise', label: 'The Big Promise', type: InputType.TEXTAREA }
    ],
    promptTemplate: (data) => `Write 10 high-converting headlines for a ${data.context} for ${data.productName}. 
    The core promise is: ${data.promise}. 
    Use formulas like "How to...", "The Secret to...", and "Warning:..."`
  },
  {
    id: 'brand-voice',
    name: 'Brand Voice Agent',
    description: 'Defines and refines your brand personality and guidelines.',
    category: AgentCategory.CONTENT,
    iconName: 'Feather',
    systemInstruction: 'You are a brand identity expert.',
    inputs: [
      commonInputs.productName,
      { name: 'adjectives', label: '3 Adjectives to describe brand', type: InputType.TEXT },
      commonInputs.targetAudience
    ],
    promptTemplate: (data) => `Create a Brand Voice Guide for ${data.productName}. 
    Keywords: ${data.adjectives}. Audience: ${data.targetAudience}. 
    Include: Voice Persona, Dos and Don'ts, Vocabulary suggestions, and sample paragraphs.`
  },

  // --- STRATEGY & FUNNELS ---
  {
    id: 'sales-page',
    name: 'Sales Page Agent',
    description: 'Drafts comprehensive long-form sales letters.',
    category: AgentCategory.STRATEGY,
    iconName: 'LayoutTemplate',
    systemInstruction: 'You are a direct response copywriter specializing in landing pages.',
    inputs: [
      commonInputs.productName,
      { name: 'offer', label: 'The Offer Details', type: InputType.TEXTAREA },
      { name: 'guarantee', label: 'Guarantee', type: InputType.TEXT },
      { name: 'price', label: 'Price Point', type: InputType.TEXT }
    ],
    promptTemplate: (data) => `Write a long-form sales page structure for ${data.productName}. 
    Offer: ${data.offer}. Price: ${data.price}. Guarantee: ${data.guarantee}.
    Sections required: Hero, Problem Agitation, Solution, Authority/Social Proof, The Offer, Guarantee, FAQ, CTA.`
  },
  {
    id: 'funnel-builder',
    name: 'Funnel Builder Agent',
    description: 'Maps out full marketing funnel strategies.',
    category: AgentCategory.STRATEGY,
    iconName: 'GitMerge',
    systemInstruction: 'You are a ClickFunnels expert and marketing strategist.',
    inputs: [
      commonInputs.productName,
      { name: 'goal', label: 'Funnel Goal', type: InputType.SELECT, options: ['Lead Generation', 'Webinar Registration', 'High Ticket Sale', 'Low Ticket + Upsell'] }
    ],
    promptTemplate: (data) => `Outline a comprehensive marketing funnel strategy for ${data.productName} with the goal of ${data.goal}. 
    List every step of the customer journey, from Traffic Source -> Landing Page -> Emails -> Conversion. Suggest specific page types and email triggers.`
  },
  {
    id: 'offer-builder',
    name: 'Offer Builder Agent',
    description: 'Crafts irresistible "Grand Slam" offers.',
    category: AgentCategory.STRATEGY,
    iconName: 'Gift',
    systemInstruction: 'You are an expert like Alex Hormozi specializing in value creation.',
    inputs: [
      commonInputs.productName,
      { name: 'components', label: 'Current Offer Components', type: InputType.TEXTAREA }
    ],
    promptTemplate: (data) => `Take this offer for ${data.productName}: "${data.components}". 
    Enhance it to make it an "Irresistible Offer". 
    Add Scarcity, Urgency, Bonuses, Guarantees, and Naming conventions to increase perceived value.`
  },
  {
    id: 'webinar-agent',
    name: 'Webinar & Reminder Agent',
    description: 'Creates webinar registration pages and reminder sequences.',
    category: AgentCategory.STRATEGY,
    iconName: 'MonitorPlay',
    systemInstruction: 'You are a webinar funnel specialist.',
    inputs: [
      { name: 'topic', label: 'Webinar Topic', type: InputType.TEXT, required: true },
      { name: 'host', label: 'Host Name', type: InputType.TEXT, required: true },
      { name: 'date', label: 'Date/Time', type: InputType.TEXT, placeholder: 'Next Thursday at 7 PM EST' },
      { name: 'secrets', label: '3 Secrets/Takeaways', type: InputType.TEXTAREA, required: true }
    ],
    promptTemplate: (data) => `Write content for a Webinar funnel on topic: ${data.topic}. Host: ${data.host}.
    
    1. Registration Page Headline & Bullets (based on secrets: ${data.secrets}).
    2. Thank You Page script.
    3. 3 Reminder Emails (24h before, 1h before, Live now).
    Tone: Exciting and Urgent.`
  },

  // --- COMMUNICATION ---
  {
    id: 'email-agent',
    name: 'Email Agent',
    description: 'Writes sequences for cold outreach, nurturing, or launches.',
    category: AgentCategory.COMMUNICATION,
    iconName: 'Mail',
    systemInstruction: 'You are an email marketing specialist.',
    inputs: [
      commonInputs.productName,
      { name: 'type', label: 'Email Type', type: InputType.SELECT, options: ['Cold Outreach Sequence', 'Welcome Sequence', 'Product Launch', 'Newsletter'] },
      { name: 'cta', label: 'Call to Action', type: InputType.TEXT }
    ],
    promptTemplate: (data) => `Write a 3-email ${data.type} for ${data.productName}. 
    The goal is to get them to: ${data.cta}. 
    Email 1: Value/Hook. Email 2: Logic/Social Proof. Email 3: Scarcity/Action.`
  },
  {
    id: 'whatsapp-agent',
    name: 'WhatsApp Agent',
    description: 'Creates short, punchy messages for direct messaging.',
    category: AgentCategory.COMMUNICATION,
    iconName: 'MessageCircle',
    systemInstruction: 'You are a conversational marketing expert. Keep it short and personal.',
    inputs: [
      commonInputs.productName,
      { name: 'purpose', label: 'Message Purpose', type: InputType.TEXT }
    ],
    promptTemplate: (data) => `Write 5 variations of a WhatsApp message for ${data.productName}. Purpose: ${data.purpose}. 
    Keep it under 50 words. Sound personal, not like a bot.`
  },
  {
    id: 'crm-followup',
    name: 'CRM Follow-Up Agent',
    description: 'Scripts for sales teams to follow up with leads.',
    category: AgentCategory.COMMUNICATION,
    iconName: 'Phone',
    systemInstruction: 'You are a sales trainer.',
    inputs: [
      { name: 'leadStatus', label: 'Lead Status', type: InputType.SELECT, options: ['New Lead', 'No Show', 'Proposal Sent', 'Ghosted'] },
      commonInputs.productName
    ],
    promptTemplate: (data) => `Write a follow-up script (phone and email) for a lead who is status: ${data.leadStatus} regarding ${data.productName}. 
    Be persistent but polite.`
  },

  // --- ANALYTICS ---
  {
    id: 'analytics-agent',
    name: 'Analytics & A/B Agent',
    description: 'Analyzes campaign performance and suggests A/B tests.',
    category: AgentCategory.ANALYTICS,
    iconName: 'BarChart2',
    systemInstruction: 'You are a data scientist and CRO expert.',
    inputs: [
      { name: 'metric', label: 'Primary Metric to Improve', type: InputType.SELECT, options: ['CTR (Click Through Rate)', 'CPC (Cost Per Click)', 'CR (Conversion Rate)', 'ROAS (Return on Ad Spend)'] },
      { name: 'currentData', label: 'Current Performance Data', type: InputType.TEXTAREA, placeholder: 'e.g. Ad A has 1% CTR, Ad B has 0.5% CTR...' },
      { name: 'hypothesis', label: 'Your Hypothesis (Optional)', type: InputType.TEXT }
    ],
    promptTemplate: (data) => `Analyze this marketing data: "${data.currentData}". 
    Goal: Improve ${data.metric}. 
    Hypothesis: ${data.hypothesis || 'None provided'}.
    
    Provide:
    1. Data Analysis/Insights.
    2. 3 Specific A/B Test suggestions to improve ${data.metric}.
    3. Estimated impact.`
  },
];