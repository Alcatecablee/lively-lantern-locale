-- Educational Modules System
-- This migration adds educational functionality without modifying existing tables

-- 1. Educational Modules Table
CREATE TABLE IF NOT EXISTS educational_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    concept_level TEXT CHECK (concept_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
    category TEXT NOT NULL, -- React, TypeScript, Performance, Security, etc.
    issue_type TEXT NOT NULL, -- Links to CodeIssue.type
    examples JSONB NOT NULL, -- CodeExample structure
    quiz JSONB NOT NULL, -- Array of QuizQuestion
    related_resources JSONB DEFAULT '[]'::jsonb,
    times_shown INTEGER DEFAULT 0,
    completion_rate DECIMAL DEFAULT 0,
    average_score DECIMAL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Learning Progress Table
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES educational_modules(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
    quiz_attempts JSONB DEFAULT '[]'::jsonb,
    time_spent INTEGER DEFAULT 0, -- in seconds
    concepts_mastered TEXT[] DEFAULT '{}',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- 3. Learning Analytics Table
CREATE TABLE IF NOT EXISTS learning_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES educational_modules(id) ON DELETE CASCADE,
    event TEXT NOT NULL CHECK (event IN ('module_started', 'quiz_attempted', 'module_completed', 'concept_mastered')),
    metadata JSONB DEFAULT '{}'::jsonb,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Code Issue Educational Mapping Table
-- This links existing code issues to educational modules without modifying the core analysis
CREATE TABLE IF NOT EXISTS code_issue_education_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_type TEXT NOT NULL UNIQUE, -- Maps to CodeIssue.type
    module_id UUID REFERENCES educational_modules(id) ON DELETE SET NULL,
    has_educational_content BOOLEAN DEFAULT false,
    concept_name TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    learning_priority INTEGER CHECK (learning_priority BETWEEN 1 AND 10) DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_educational_modules_issue_type ON educational_modules(issue_type);
CREATE INDEX IF NOT EXISTS idx_educational_modules_category ON educational_modules(category);
CREATE INDEX IF NOT EXISTS idx_educational_modules_concept_level ON educational_modules(concept_level);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_module_id ON user_learning_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_status ON user_learning_progress(status);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_event ON learning_analytics(event);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_created_at ON learning_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_code_issue_education_mapping_issue_type ON code_issue_education_mapping(issue_type);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE educational_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_issue_education_mapping ENABLE ROW LEVEL SECURITY;

-- Educational modules are readable by all authenticated users
CREATE POLICY "Educational modules are viewable by authenticated users" ON educational_modules
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Users can only see their own learning progress
CREATE POLICY "Users can view own learning progress" ON user_learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning progress" ON user_learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress" ON user_learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own analytics
CREATE POLICY "Users can view own learning analytics" ON learning_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning analytics" ON learning_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Code issue education mapping is readable by all authenticated users
CREATE POLICY "Code issue education mapping is viewable by authenticated users" ON code_issue_education_mapping
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- 7. Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_educational_modules_updated_at BEFORE UPDATE ON educational_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_issue_education_mapping_updated_at BEFORE UPDATE ON code_issue_education_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Function to get educational content for a code issue
CREATE OR REPLACE FUNCTION get_educational_content_for_issue(issue_type_param TEXT)
RETURNS TABLE (
    module_id UUID,
    title TEXT,
    description TEXT,
    concept_level TEXT,
    category TEXT,
    has_content BOOLEAN,
    learning_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        em.id as module_id,
        em.title,
        em.description,
        em.concept_level,
        em.category,
        cem.has_educational_content as has_content,
        cem.learning_priority
    FROM code_issue_education_mapping cem
    LEFT JOIN educational_modules em ON cem.module_id = em.id
    WHERE cem.issue_type = issue_type_param 
    AND cem.is_active = true
    AND (em.is_active = true OR em.is_active IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to track learning progress
CREATE OR REPLACE FUNCTION track_learning_event(
    p_user_id UUID,
    p_module_id UUID,
    p_event TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert analytics event
    INSERT INTO learning_analytics (user_id, module_id, event, metadata, session_id)
    VALUES (p_user_id, p_module_id, p_event, p_metadata, p_session_id);
    
    -- Update module statistics
    UPDATE educational_modules 
    SET times_shown = times_shown + 1
    WHERE id = p_module_id;
    
    -- Update user progress if needed
    INSERT INTO user_learning_progress (user_id, module_id, status, last_accessed)
    VALUES (p_user_id, p_module_id, 'in_progress', NOW())
    ON CONFLICT (user_id, module_id) 
    DO UPDATE SET 
        last_accessed = NOW(),
        status = CASE 
            WHEN user_learning_progress.status = 'not_started' THEN 'in_progress'
            ELSE user_learning_progress.status
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON educational_modules TO authenticated;
GRANT ALL ON user_learning_progress TO authenticated;
GRANT INSERT ON learning_analytics TO authenticated;
GRANT SELECT ON code_issue_education_mapping TO authenticated;
GRANT EXECUTE ON FUNCTION get_educational_content_for_issue(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_learning_event(UUID, UUID, TEXT, JSONB, TEXT) TO authenticated; 