-- ============================================================================
-- BRAND MEMORY SYSTEM - Database Schema
-- ============================================================================
-- This schema enables AI to remember brand context, learn from past campaigns,
-- and provide personalized, consistent content generation.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. BRAND PROFILES TABLE
-- ============================================================================
-- Stores core brand information and personality

CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  brand_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  description TEXT,
  
  -- Brand Voice
  tone_adjectives TEXT[] DEFAULT '{}', -- e.g., ['professional', 'friendly', 'witty']
  voice_description TEXT,
  vocabulary_preferences TEXT[] DEFAULT '{}', -- Words to use
  vocabulary_avoid TEXT[] DEFAULT '{}', -- Words to avoid
  writing_style TEXT, -- e.g., 'conversational', 'formal', 'technical'
  
  -- Examples
  example_content TEXT[], -- Sample content that represents brand voice
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_brand UNIQUE(user_id, brand_name)
);

-- ============================================================================
-- 2. TARGET AUDIENCES TABLE
-- ============================================================================
-- Stores detailed audience personas

CREATE TABLE target_audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  persona_name TEXT NOT NULL, -- e.g., "Tech-Savvy Marketer"
  description TEXT,
  
  -- Demographics
  age_range TEXT, -- e.g., "25-45"
  gender TEXT,
  location TEXT[],
  income_range TEXT,
  education_level TEXT,
  occupation TEXT[],
  
  -- Psychographics
  interests TEXT[],
  values TEXT[],
  lifestyle TEXT,
  personality_traits TEXT[],
  
  -- Pain Points & Desires
  pain_points TEXT[] DEFAULT '{}',
  core_desires TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  
  -- Behavior
  online_behavior JSONB, -- Where they hang out, what they read, etc.
  buying_behavior TEXT,
  decision_factors TEXT[],
  
  -- Objections
  common_objections TEXT[] DEFAULT '{}',
  
  -- Metadata
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. PRODUCT INFORMATION TABLE
-- ============================================================================
-- Stores product/service details

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  product_name TEXT NOT NULL,
  product_type TEXT, -- 'product', 'service', 'course', etc.
  description TEXT,
  tagline TEXT,
  
  -- Features & Benefits
  features JSONB DEFAULT '[]', -- [{feature: '', benefit: ''}]
  unique_selling_points TEXT[] DEFAULT '{}',
  competitive_advantages TEXT[] DEFAULT '{}',
  
  -- Pricing
  pricing_model TEXT, -- 'one-time', 'subscription', 'freemium', etc.
  price_point TEXT,
  pricing_tiers JSONB, -- [{name: '', price: '', features: []}]
  
  -- Positioning
  category TEXT,
  positioning_statement TEXT,
  
  -- Competitors
  competitors TEXT[] DEFAULT '{}',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CAMPAIGN HISTORY TABLE
-- ============================================================================
-- Stores past campaigns and their performance

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Campaign Info
  campaign_name TEXT NOT NULL,
  campaign_type TEXT, -- 'email', 'social', 'ads', 'content', etc.
  objective TEXT,
  
  -- Content
  content_pieces JSONB DEFAULT '[]', -- [{type: '', content: '', url: ''}]
  
  -- Performance Metrics
  metrics JSONB DEFAULT '{}', -- {impressions: 0, clicks: 0, conversions: 0, revenue: 0}
  
  -- Insights
  what_worked TEXT[],
  what_didnt_work TEXT[],
  lessons_learned TEXT,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CONTENT PERFORMANCE TABLE
-- ============================================================================
-- Tracks performance of individual content pieces

CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  generated_result_id UUID REFERENCES generated_results(id) ON DELETE CASCADE,
  
  -- Content Info
  content_type TEXT NOT NULL, -- 'ad_copy', 'email', 'social_post', etc.
  content_text TEXT,
  
  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated Metrics
  ctr DECIMAL(5, 2), -- Click-through rate
  conversion_rate DECIMAL(5, 2),
  roi DECIMAL(10, 2),
  
  -- AI Analysis
  performance_score INTEGER, -- 0-100
  ai_insights TEXT,
  improvement_suggestions TEXT[],
  
  -- Metadata
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. USER PREFERENCES TABLE
-- ============================================================================
-- Learns from user edits and preferences

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content Preferences
  preferred_length TEXT, -- 'short', 'medium', 'long'
  preferred_structure JSONB, -- Preferred content structure
  
  -- Style Preferences
  emoji_usage TEXT, -- 'none', 'minimal', 'moderate', 'heavy'
  formatting_style TEXT,
  
  -- Edit Patterns
  common_edits JSONB DEFAULT '[]', -- [{original: '', edited: '', frequency: 0}]
  rejected_suggestions TEXT[] DEFAULT '{}',
  accepted_suggestions TEXT[] DEFAULT '{}',
  
  -- AI Learning
  learning_data JSONB DEFAULT '{}', -- ML model data
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_brand_preferences UNIQUE(brand_id)
);

-- ============================================================================
-- 7. CONTENT TEMPLATES TABLE
-- ============================================================================
-- Stores successful content templates

CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Template Info
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'ad_copy', 'email', 'social', etc.
  description TEXT,
  
  -- Template Content
  template_structure JSONB NOT NULL, -- Template with variables
  variables JSONB DEFAULT '[]', -- [{name: '', type: '', required: true}]
  
  -- Performance
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2),
  avg_performance_score INTEGER,
  
  -- Sharing
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Brand Profiles
CREATE INDEX idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX idx_brand_profiles_active ON brand_profiles(is_active) WHERE is_active = true;

-- Target Audiences
CREATE INDEX idx_target_audiences_brand_id ON target_audiences(brand_id);
CREATE INDEX idx_target_audiences_primary ON target_audiences(brand_id, is_primary) WHERE is_primary = true;

-- Products
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_active ON products(brand_id, is_active) WHERE is_active = true;

-- Campaigns
CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);

-- Content Performance
CREATE INDEX idx_content_performance_brand_id ON content_performance(brand_id);
CREATE INDEX idx_content_performance_campaign_id ON content_performance(campaign_id);
CREATE INDEX idx_content_performance_score ON content_performance(performance_score DESC);
CREATE INDEX idx_content_performance_tracked_at ON content_performance(tracked_at DESC);

-- User Preferences
CREATE INDEX idx_user_preferences_brand_id ON user_preferences(brand_id);

-- Content Templates
CREATE INDEX idx_content_templates_user_id ON content_templates(user_id);
CREATE INDEX idx_content_templates_brand_id ON content_templates(brand_id);
CREATE INDEX idx_content_templates_type ON content_templates(template_type);
CREATE INDEX idx_content_templates_public ON content_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_content_templates_featured ON content_templates(is_featured) WHERE is_featured = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- Brand Profiles Policies
CREATE POLICY "Users can view own brand profiles" ON brand_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand profiles" ON brand_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand profiles" ON brand_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand profiles" ON brand_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Target Audiences Policies
CREATE POLICY "Users can view own audiences" ON target_audiences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brand_profiles 
      WHERE brand_profiles.id = target_audiences.brand_id 
      AND brand_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create audiences for own brands" ON target_audiences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_profiles 
      WHERE brand_profiles.id = target_audiences.brand_id 
      AND brand_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own audiences" ON target_audiences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM brand_profiles 
      WHERE brand_profiles.id = target_audiences.brand_id 
      AND brand_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own audiences" ON target_audiences
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM brand_profiles 
      WHERE brand_profiles.id = target_audiences.brand_id 
      AND brand_profiles.user_id = auth.uid()
    )
  );

-- Similar policies for other tables (products, campaigns, etc.)
-- [Policies follow same pattern - users can only access data for their own brands]

-- Content Templates Policies (includes public templates)
CREATE POLICY "Users can view own and public templates" ON content_templates
  FOR SELECT USING (
    auth.uid() = user_id OR is_public = true
  );

CREATE POLICY "Users can create own templates" ON content_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON content_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON content_templates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_audiences_updated_at BEFORE UPDATE ON target_audiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_performance_updated_at BEFORE UPDATE ON content_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample brand profile
-- INSERT INTO brand_profiles (user_id, brand_name, industry, tone_adjectives, voice_description)
-- VALUES (
--   'user-uuid-here',
--   'RevenuePilot',
--   'SaaS / Marketing Technology',
--   ARRAY['professional', 'innovative', 'results-driven'],
--   'Clear, confident, and action-oriented. We speak directly to marketers and entrepreneurs who want results, not fluff.'
-- );

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Run this schema in your Supabase SQL Editor
-- 2. Ensure auth.users table exists (Supabase default)
-- 3. Ensure generated_results table exists (from main schema)
-- 4. Update RLS policies based on your team/workspace requirements
-- 5. Consider adding more indexes based on query patterns
-- ============================================================================
