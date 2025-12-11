-- ============================================
-- RevenuePilot AI - Database Schema
-- ============================================
-- Version: 1.1 (Fixed)
-- Date: December 11, 2025
-- Description: Complete database schema for RevenuePilot AI
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- FUNCTIONS (Create before triggers)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TABLES
-- ============================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Generated results table
CREATE TABLE IF NOT EXISTS generated_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID,
  agent_id TEXT NOT NULL CHECK (char_length(agent_id) >= 1),
  user_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1),
  inputs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business', 'enterprise')),
  credits_remaining INTEGER DEFAULT 1000 CHECK (credits_remaining >= 0),
  total_generations INTEGER DEFAULT 0 CHECK (total_generations >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Usage analytics table (for tracking)
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('generate', 'refine', 'save', 'export')),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  result_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, result_id)
);

-- ============================================
-- ADD FOREIGN KEYS (After tables exist)
-- ============================================

-- Add foreign keys to projects
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'projects_user_id_fkey'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign keys to generated_results
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'generated_results_project_id_fkey'
  ) THEN
    ALTER TABLE generated_results ADD CONSTRAINT generated_results_project_id_fkey 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'generated_results_user_id_fkey'
  ) THEN
    ALTER TABLE generated_results ADD CONSTRAINT generated_results_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign keys to user_profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_id_fkey'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign keys to usage_analytics
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'usage_analytics_user_id_fkey'
  ) THEN
    ALTER TABLE usage_analytics ADD CONSTRAINT usage_analytics_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign keys to favorites
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'favorites_user_id_fkey'
  ) THEN
    ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'favorites_result_id_fkey'
  ) THEN
    ALTER TABLE favorites ADD CONSTRAINT favorites_result_id_fkey 
      FOREIGN KEY (result_id) REFERENCES generated_results(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm ON projects USING gin(name gin_trgm_ops);

-- Generated results indexes
CREATE INDEX IF NOT EXISTS idx_results_project_id ON generated_results(project_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON generated_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_agent_id ON generated_results(agent_id);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON generated_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_content_trgm ON generated_results USING gin(content gin_trgm_ops);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON user_profiles(created_at DESC);

-- Usage analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_agent_id ON usage_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON usage_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_action_type ON usage_analytics(action_type);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_result_id ON favorites(result_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROJECTS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Create new policies
CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - GENERATED RESULTS
-- ============================================

DROP POLICY IF EXISTS "Users can view own results" ON generated_results;
DROP POLICY IF EXISTS "Users can create own results" ON generated_results;
DROP POLICY IF EXISTS "Users can delete own results" ON generated_results;

CREATE POLICY "Users can view own results" 
  ON generated_results FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own results" 
  ON generated_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own results" 
  ON generated_results FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - USER PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - USAGE ANALYTICS
-- ============================================

DROP POLICY IF EXISTS "Users can view own analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Users can create own analytics" ON usage_analytics;

CREATE POLICY "Users can view own analytics" 
  ON usage_analytics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics" 
  ON usage_analytics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - FAVORITES
-- ============================================

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites" 
  ON favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" 
  ON favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" 
  ON favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for projects updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for tables (ignore errors if already enabled)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE projects;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE generated_results;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE favorites;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- VIEWS (Optional - for analytics)
-- ============================================

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  up.id,
  up.email,
  up.subscription_tier,
  up.credits_remaining,
  up.total_generations,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT gr.id) as total_results,
  COUNT(DISTINCT f.id) as total_favorites,
  up.created_at as user_since
FROM user_profiles up
LEFT JOIN projects p ON p.user_id = up.id
LEFT JOIN generated_results gr ON gr.user_id = up.id
LEFT JOIN favorites f ON f.user_id = up.id
GROUP BY up.id, up.email, up.subscription_tier, up.credits_remaining, up.total_generations, up.created_at;

-- View for popular agents
CREATE OR REPLACE VIEW popular_agents AS
SELECT 
  agent_id,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate,
  AVG(execution_time_ms) as avg_execution_time_ms
FROM usage_analytics
GROUP BY agent_id
ORDER BY usage_count DESC;

-- ============================================
-- GRANTS (if needed)
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Database schema setup complete!';
  RAISE NOTICE '📊 Tables created: projects, generated_results, user_profiles, usage_analytics, favorites';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '⚡ Indexes created for optimal performance';
  RAISE NOTICE '🔄 Triggers configured for auto-updates';
  RAISE NOTICE '📡 Realtime enabled for live updates';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your database is ready to use!';
END $$;
