// ============================================================================
// BRAND MEMORY SYSTEM - TypeScript Types
// ============================================================================

export interface BrandProfile {
  id: string;
  user_id: string;
  
  // Basic Info
  brand_name: string;
  industry?: string;
  website?: string;
  description?: string;
  
  // Brand Voice
  tone_adjectives: string[];
  voice_description?: string;
  vocabulary_preferences: string[];
  vocabulary_avoid: string[];
  writing_style?: string;
  
  // Examples
  example_content: string[];
  
  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TargetAudience {
  id: string;
  brand_id: string;
  
  // Basic Info
  persona_name: string;
  description?: string;
  
  // Demographics
  age_range?: string;
  gender?: string;
  location?: string[];
  income_range?: string;
  education_level?: string;
  occupation?: string[];
  
  // Psychographics
  interests?: string[];
  values?: string[];
  lifestyle?: string;
  personality_traits?: string[];
  
  // Pain Points & Desires
  pain_points: string[];
  core_desires: string[];
  goals: string[];
  challenges: string[];
  
  // Behavior
  online_behavior?: {
    platforms?: string[];
    content_types?: string[];
    influencers?: string[];
    communities?: string[];
  };
  buying_behavior?: string;
  decision_factors?: string[];
  
  // Objections
  common_objections: string[];
  
  // Metadata
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  
  // Basic Info
  product_name: string;
  product_type?: string;
  description?: string;
  tagline?: string;
  
  // Features & Benefits
  features: Array<{
    feature: string;
    benefit: string;
  }>;
  unique_selling_points: string[];
  competitive_advantages: string[];
  
  // Pricing
  pricing_model?: string;
  price_point?: string;
  pricing_tiers?: Array<{
    name: string;
    price: string;
    features: string[];
  }>;
  
  // Positioning
  category?: string;
  positioning_statement?: string;
  
  // Competitors
  competitors: string[];
  
  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  brand_id: string;
  product_id?: string;
  
  // Campaign Info
  campaign_name: string;
  campaign_type?: string;
  objective?: string;
  
  // Content
  content_pieces: Array<{
    type: string;
    content: string;
    url?: string;
  }>;
  
  // Performance Metrics
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    revenue?: number;
    [key: string]: any;
  };
  
  // Insights
  what_worked?: string[];
  what_didnt_work?: string[];
  lessons_learned?: string;
  
  // Dates
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPerformance {
  id: string;
  brand_id: string;
  campaign_id?: string;
  generated_result_id?: string;
  
  // Content Info
  content_type: string;
  content_text?: string;
  
  // Performance Metrics
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  
  // Calculated Metrics
  ctr?: number;
  conversion_rate?: number;
  roi?: number;
  
  // AI Analysis
  performance_score?: number;
  ai_insights?: string;
  improvement_suggestions?: string[];
  
  // Metadata
  tracked_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  brand_id: string;
  
  // Content Preferences
  preferred_length?: string;
  preferred_structure?: any;
  
  // Style Preferences
  emoji_usage?: string;
  formatting_style?: string;
  
  // Edit Patterns
  common_edits: Array<{
    original: string;
    edited: string;
    frequency: number;
  }>;
  rejected_suggestions: string[];
  accepted_suggestions: string[];
  
  // AI Learning
  learning_data?: any;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  brand_id?: string;
  user_id: string;
  
  // Template Info
  template_name: string;
  template_type: string;
  description?: string;
  
  // Template Content
  template_structure: any;
  variables: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: any;
  }>;
  
  // Performance
  usage_count: number;
  success_rate?: number;
  avg_performance_score?: number;
  
  // Sharing
  is_public: boolean;
  is_featured: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateBrandProfileRequest {
  brand_name: string;
  industry?: string;
  website?: string;
  description?: string;
  tone_adjectives?: string[];
  voice_description?: string;
  vocabulary_preferences?: string[];
  vocabulary_avoid?: string[];
  writing_style?: string;
  example_content?: string[];
}

export interface UpdateBrandProfileRequest extends Partial<CreateBrandProfileRequest> {
  id: string;
}

export interface CreateTargetAudienceRequest {
  brand_id: string;
  persona_name: string;
  description?: string;
  age_range?: string;
  gender?: string;
  location?: string[];
  income_range?: string;
  education_level?: string;
  occupation?: string[];
  interests?: string[];
  values?: string[];
  lifestyle?: string;
  personality_traits?: string[];
  pain_points?: string[];
  core_desires?: string[];
  goals?: string[];
  challenges?: string[];
  online_behavior?: any;
  buying_behavior?: string;
  decision_factors?: string[];
  common_objections?: string[];
  is_primary?: boolean;
}

export interface CreateProductRequest {
  brand_id: string;
  product_name: string;
  product_type?: string;
  description?: string;
  tagline?: string;
  features?: Array<{ feature: string; benefit: string }>;
  unique_selling_points?: string[];
  competitive_advantages?: string[];
  pricing_model?: string;
  price_point?: string;
  pricing_tiers?: Array<{ name: string; price: string; features: string[] }>;
  category?: string;
  positioning_statement?: string;
  competitors?: string[];
}

// ============================================================================
// BRAND CONTEXT FOR AI
// ============================================================================

export interface BrandContext {
  brand: BrandProfile;
  audiences: TargetAudience[];
  products: Product[];
  recentCampaigns: Campaign[];
  topPerformingContent: ContentPerformance[];
  preferences: UserPreferences | null;
}

export interface EnrichedPrompt {
  originalPrompt: string;
  enrichedPrompt: string;
  context: {
    brandVoice: string;
    targetAudience: string;
    productInfo: string;
    pastPerformance: string;
    userPreferences: string;
  };
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface BrandAnalytics {
  totalCampaigns: number;
  totalContent: number;
  avgPerformanceScore: number;
  topPerformingTypes: Array<{
    type: string;
    avgScore: number;
    count: number;
  }>;
  recentTrends: Array<{
    date: string;
    score: number;
    volume: number;
  }>;
  recommendations: string[];
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type BrandMemoryEntity = 
  | BrandProfile 
  | TargetAudience 
  | Product 
  | Campaign 
  | ContentPerformance 
  | UserPreferences 
  | ContentTemplate;

export interface BrandMemoryFilters {
  brand_id?: string;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
