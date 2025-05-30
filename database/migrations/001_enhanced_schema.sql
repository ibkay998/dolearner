-- Enhanced Database Schema for Dynamic Content Management
-- This migration creates the new tables while preserving existing data

-- Create path categories table
CREATE TABLE IF NOT EXISTS path_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id UUID REFERENCES path_categories(id) ON DELETE SET NULL,
    difficulty_level VARCHAR(50) DEFAULT 'beginner',
    icon_name VARCHAR(100),
    color_scheme VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced challenges table (keeping legacy compatibility)
CREATE TABLE IF NOT EXISTS challenges_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id VARCHAR(255) UNIQUE, -- For backward compatibility
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    starter_code TEXT,
    solution_code TEXT,
    difficulty VARCHAR(50) DEFAULT 'easy',
    challenge_type VARCHAR(100) DEFAULT 'component',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced challenge tests table
CREATE TABLE IF NOT EXISTS challenge_tests_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges_new(id) ON DELETE CASCADE,
    test_type VARCHAR(100) DEFAULT 'unit', -- 'unit', 'integration', 'dsa_case', 'performance'
    description TEXT,
    test_code TEXT, -- For React/CSS: test function code; For DSA: not used
    expected_result JSONB,
    test_config JSONB DEFAULT '{}',
    -- DSA-specific fields
    input_data JSONB, -- For DSA: test case inputs
    expected_output JSONB, -- For DSA: expected function output
    time_limit_ms INTEGER DEFAULT 5000, -- For DSA: execution time limit
    memory_limit_mb INTEGER DEFAULT 128, -- For DSA: memory limit
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced user path enrollments table
CREATE TABLE IF NOT EXISTS user_path_enrollments_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    progress_data JSONB DEFAULT '{}',
    UNIQUE(user_id, path_id)
);

-- Create enhanced challenge completions table
CREATE TABLE IF NOT EXISTS challenge_completions_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges_new(id) ON DELETE CASCADE,
    submitted_code TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_data JSONB DEFAULT '{}',
    UNIQUE(user_id, challenge_id)
);

-- Create enhanced submissions table
CREATE TABLE IF NOT EXISTS submissions_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges_new(id) ON DELETE CASCADE,
    code TEXT,
    is_correct BOOLEAN DEFAULT false,
    test_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(100) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON learning_paths(category_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON learning_paths(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_path ON challenges_new(path_id);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges_new(is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_tests_challenge ON challenge_tests_new(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user ON user_path_enrollments_new(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_path ON user_path_enrollments_new(path_id);
CREATE INDEX IF NOT EXISTS idx_completions_user ON challenge_completions_new(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_challenge ON challenge_completions_new(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions_new(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions_new(challenge_id);

-- Insert default categories
INSERT INTO path_categories (name, description, slug, order_index) VALUES
('Frontend Development', 'Learn frontend technologies and frameworks', 'frontend', 1),
('Data Structures & Algorithms', 'Master computer science fundamentals', 'dsa', 2),
('Backend Development', 'Build server-side applications and APIs', 'backend', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert default learning paths
INSERT INTO learning_paths (name, description, slug, category_id, difficulty_level, icon_name, color_scheme, order_index)
SELECT
    'React Development',
    'Learn React by building UI components from scratch',
    'react',
    (SELECT id FROM path_categories WHERE slug = 'frontend'),
    'beginner',
    'Code',
    'from-blue-600 to-indigo-600',
    1
WHERE NOT EXISTS (SELECT 1 FROM learning_paths WHERE slug = 'react');

INSERT INTO learning_paths (name, description, slug, category_id, difficulty_level, icon_name, color_scheme, order_index)
SELECT
    'CSS Mastery',
    'Master CSS by completing styling challenges',
    'css',
    (SELECT id FROM path_categories WHERE slug = 'frontend'),
    'beginner',
    'Palette',
    'from-purple-600 to-pink-600',
    2
WHERE NOT EXISTS (SELECT 1 FROM learning_paths WHERE slug = 'css');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_path_categories_updated_at BEFORE UPDATE ON path_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_new_updated_at BEFORE UPDATE ON challenges_new FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_tests_new_updated_at BEFORE UPDATE ON challenge_tests_new FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE path_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_tests_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_path_enrollments_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access to learning content
CREATE POLICY "Public read access to path categories" ON path_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access to learning paths" ON learning_paths FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access to challenges" ON challenges_new FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access to challenge tests" ON challenge_tests_new FOR SELECT USING (is_active = true);

-- Create RLS policies for user-specific data
CREATE POLICY "Users can manage their own enrollments" ON user_path_enrollments_new FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own completions" ON challenge_completions_new FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own submissions" ON submissions_new FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for admin access
CREATE POLICY "Admins can manage all content" ON path_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage learning paths" ON learning_paths FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage challenges" ON challenges_new FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage challenge tests" ON challenge_tests_new FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view all user data" ON user_path_enrollments_new FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view all completions" ON challenge_completions_new FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view all submissions" ON submissions_new FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage admin users" ON admin_users FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin')
);
