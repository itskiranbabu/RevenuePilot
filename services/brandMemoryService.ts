// ============================================================================
// BRAND MEMORY SERVICE
// ============================================================================
// Manages brand context, learns from user behavior, and enriches AI prompts
// ============================================================================

import { supabase } from '../lib/supabase';
import {
  BrandProfile,
  TargetAudience,
  Product,
  Campaign,
  ContentPerformance,
  UserPreferences,
  ContentTemplate,
  BrandContext,
  EnrichedPrompt,
  BrandAnalytics,
  CreateBrandProfileRequest,
  UpdateBrandProfileRequest,
  CreateTargetAudienceRequest,
  CreateProductRequest,
  PaginatedResponse
} from '../types/brandMemory';

// ============================================================================
// BRAND PROFILE OPERATIONS
// ============================================================================

export const brandMemoryService = {
  // Create Brand Profile
  async createBrandProfile(data: CreateBrandProfileRequest): Promise<BrandProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: brand, error } = await supabase
      .from('brand_profiles')
      .insert({
        user_id: user.id,
        ...data,
        tone_adjectives: data.tone_adjectives || [],
        vocabulary_preferences: data.vocabulary_preferences || [],
        vocabulary_avoid: data.vocabulary_avoid || [],
        example_content: data.example_content || []
      })
      .select()
      .single();

    if (error) throw error;
    return brand;
  },

  // Get Brand Profiles
  async getBrandProfiles(userId?: string): Promise<BrandProfile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get Single Brand Profile
  async getBrandProfile(brandId: string): Promise<BrandProfile | null> {
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('id', brandId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // Update Brand Profile
  async updateBrandProfile(id: string, updates: Partial<BrandProfile>): Promise<BrandProfile> {
    const { data, error } = await supabase
      .from('brand_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete Brand Profile
  async deleteBrandProfile(id: string): Promise<void> {
    const { error } = await supabase
      .from('brand_profiles')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // TARGET AUDIENCE OPERATIONS
  // ============================================================================

  async createTargetAudience(data: CreateTargetAudienceRequest): Promise<TargetAudience> {
    const { data: audience, error } = await supabase
      .from('target_audiences')
      .insert({
        ...data,
        pain_points: data.pain_points || [],
        core_desires: data.core_desires || [],
        goals: data.goals || [],
        challenges: data.challenges || [],
        common_objections: data.common_objections || []
      })
      .select()
      .single();

    if (error) throw error;
    return audience;
  },

  async getTargetAudiences(brandId: string): Promise<TargetAudience[]> {
    const { data, error } = await supabase
      .from('target_audiences')
      .select('*')
      .eq('brand_id', brandId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPrimaryAudience(brandId: string): Promise<TargetAudience | null> {
    const { data, error } = await supabase
      .from('target_audiences')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_primary', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async updateTargetAudience(id: string, updates: Partial<TargetAudience>): Promise<TargetAudience> {
    const { data, error } = await supabase
      .from('target_audiences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTargetAudience(id: string): Promise<void> {
    const { error } = await supabase
      .from('target_audiences')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...data,
        features: data.features || [],
        unique_selling_points: data.unique_selling_points || [],
        competitive_advantages: data.competitive_advantages || [],
        competitors: data.competitors || []
      })
      .select()
      .single();

    if (error) throw error;
    return product;
  },

  async getProducts(brandId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // CAMPAIGN OPERATIONS
  // ============================================================================

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        ...data,
        content_pieces: data.content_pieces || [],
        metrics: data.metrics || {},
        what_worked: data.what_worked || [],
        what_didnt_work: data.what_didnt_work || []
      })
      .select()
      .single();

    if (error) throw error;
    return campaign;
  },

  async getCampaigns(brandId: string, limit: number = 10): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================================
  // CONTENT PERFORMANCE OPERATIONS
  // ============================================================================

  async trackContentPerformance(data: Partial<ContentPerformance>): Promise<ContentPerformance> {
    // Calculate derived metrics
    const ctr = data.impressions && data.clicks 
      ? (data.clicks / data.impressions) * 100 
      : undefined;
    
    const conversion_rate = data.clicks && data.conversions
      ? (data.conversions / data.clicks) * 100
      : undefined;

    const { data: performance, error } = await supabase
      .from('content_performance')
      .insert({
        ...data,
        ctr,
        conversion_rate,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        conversions: data.conversions || 0,
        revenue: data.revenue || 0
      })
      .select()
      .single();

    if (error) throw error;
    return performance;
  },

  async getTopPerformingContent(brandId: string, limit: number = 10): Promise<ContentPerformance[]> {
    const { data, error } = await supabase
      .from('content_performance')
      .select('*')
      .eq('brand_id', brandId)
      .order('performance_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // ============================================================================
  // USER PREFERENCES OPERATIONS
  // ============================================================================

  async getUserPreferences(brandId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('brand_id', brandId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async updateUserPreferences(brandId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        brand_id: brandId,
        ...updates
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Learn from user edit
  async learnFromEdit(brandId: string, original: string, edited: string): Promise<void> {
    const preferences = await this.getUserPreferences(brandId);
    
    const commonEdits = preferences?.common_edits || [];
    const existingEdit = commonEdits.find(e => e.original === original);
    
    if (existingEdit) {
      existingEdit.edited = edited;
      existingEdit.frequency += 1;
    } else {
      commonEdits.push({ original, edited, frequency: 1 });
    }

    await this.updateUserPreferences(brandId, { common_edits: commonEdits });
  },

  // ============================================================================
  // CONTENT TEMPLATE OPERATIONS
  // ============================================================================

  async createTemplate(data: Partial<ContentTemplate>): Promise<ContentTemplate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: template, error } = await supabase
      .from('content_templates')
      .insert({
        user_id: user.id,
        ...data,
        variables: data.variables || [],
        usage_count: 0,
        is_public: data.is_public || false,
        is_featured: false
      })
      .select()
      .single();

    if (error) throw error;
    return template;
  },

  async getTemplates(filters?: { brandId?: string; type?: string; publicOnly?: boolean }): Promise<ContentTemplate[]> {
    let query = supabase.from('content_templates').select('*');

    if (filters?.brandId) {
      query = query.eq('brand_id', filters.brandId);
    }
    if (filters?.type) {
      query = query.eq('template_type', filters.type);
    }
    if (filters?.publicOnly) {
      query = query.eq('is_public', true);
    }

    query = query.order('usage_count', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async incrementTemplateUsage(templateId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: templateId
    });

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: template } = await supabase
        .from('content_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (template) {
        await supabase
          .from('content_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId);
      }
    }
  },

  // ============================================================================
  // BRAND CONTEXT FOR AI
  // ============================================================================

  async getBrandContext(brandId: string): Promise<BrandContext> {
    const [brand, audiences, products, campaigns, topContent, preferences] = await Promise.all([
      this.getBrandProfile(brandId),
      this.getTargetAudiences(brandId),
      this.getProducts(brandId),
      this.getCampaigns(brandId, 5),
      this.getTopPerformingContent(brandId, 5),
      this.getUserPreferences(brandId)
    ]);

    if (!brand) throw new Error('Brand not found');

    return {
      brand,
      audiences,
      products,
      recentCampaigns: campaigns,
      topPerformingContent: topContent,
      preferences
    };
  },

  // Enrich prompt with brand context
  enrichPrompt(originalPrompt: string, context: BrandContext): EnrichedPrompt {
    const { brand, audiences, products, topPerformingContent, preferences } = context;

    // Build context sections
    const brandVoice = `
Brand Voice: ${brand.voice_description || 'Not specified'}
Tone: ${brand.tone_adjectives.join(', ')}
Writing Style: ${brand.writing_style || 'Not specified'}
Preferred Words: ${brand.vocabulary_preferences.join(', ')}
Avoid: ${brand.vocabulary_avoid.join(', ')}
`.trim();

    const primaryAudience = audiences.find(a => a.is_primary) || audiences[0];
    const targetAudience = primaryAudience ? `
Target Audience: ${primaryAudience.persona_name}
Demographics: ${primaryAudience.age_range || 'Not specified'}, ${primaryAudience.occupation?.join(', ') || 'Not specified'}
Pain Points: ${primaryAudience.pain_points.join(', ')}
Core Desires: ${primaryAudience.core_desires.join(', ')}
Common Objections: ${primaryAudience.common_objections.join(', ')}
`.trim() : '';

    const primaryProduct = products[0];
    const productInfo = primaryProduct ? `
Product: ${primaryProduct.product_name}
Description: ${primaryProduct.description || 'Not specified'}
USPs: ${primaryProduct.unique_selling_points.join(', ')}
Price: ${primaryProduct.price_point || 'Not specified'}
`.trim() : '';

    const pastPerformance = topPerformingContent.length > 0 ? `
Top Performing Content Insights:
${topPerformingContent.slice(0, 3).map(c => 
  `- ${c.content_type}: Score ${c.performance_score}/100 ${c.ai_insights ? `(${c.ai_insights})` : ''}`
).join('\n')}
`.trim() : '';

    const userPrefs = preferences ? `
User Preferences:
- Preferred Length: ${preferences.preferred_length || 'Not specified'}
- Emoji Usage: ${preferences.emoji_usage || 'Not specified'}
- Formatting: ${preferences.formatting_style || 'Not specified'}
`.trim() : '';

    // Combine into enriched prompt
    const enrichedPrompt = `
${originalPrompt}

BRAND CONTEXT:
${brandVoice}

${targetAudience}

${productInfo}

${pastPerformance}

${userPrefs}

IMPORTANT: Maintain the brand voice and tone throughout. Address the target audience's pain points and desires. Incorporate insights from past high-performing content.
`.trim();

    return {
      originalPrompt,
      enrichedPrompt,
      context: {
        brandVoice,
        targetAudience,
        productInfo,
        pastPerformance,
        userPreferences: userPrefs
      }
    };
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getBrandAnalytics(brandId: string): Promise<BrandAnalytics> {
    const [campaigns, content] = await Promise.all([
      this.getCampaigns(brandId, 100),
      this.getTopPerformingContent(brandId, 100)
    ]);

    const totalCampaigns = campaigns.length;
    const totalContent = content.length;
    
    const avgPerformanceScore = content.length > 0
      ? content.reduce((sum, c) => sum + (c.performance_score || 0), 0) / content.length
      : 0;

    // Group by content type
    const typePerformance = content.reduce((acc, c) => {
      if (!acc[c.content_type]) {
        acc[c.content_type] = { scores: [], count: 0 };
      }
      acc[c.content_type].scores.push(c.performance_score || 0);
      acc[c.content_type].count += 1;
      return acc;
    }, {} as Record<string, { scores: number[]; count: number }>);

    const topPerformingTypes = Object.entries(typePerformance)
      .map(([type, data]) => ({
        type,
        avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
        count: data.count
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (avgPerformanceScore < 60) {
      recommendations.push('Consider A/B testing different approaches to improve performance');
    }
    if (topPerformingTypes.length > 0) {
      recommendations.push(`Focus more on ${topPerformingTypes[0].type} - it's your best performing content type`);
    }
    if (totalContent < 10) {
      recommendations.push('Generate more content to build better performance insights');
    }

    return {
      totalCampaigns,
      totalContent,
      avgPerformanceScore,
      topPerformingTypes,
      recentTrends: [], // TODO: Implement trend analysis
      recommendations
    };
  }
};

export default brandMemoryService;
