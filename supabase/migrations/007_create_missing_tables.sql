-- Create missing tables referenced in team dashboard

-- 1. Create profiles table (user profile information)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create analysis_projects table (for code analysis projects)
CREATE TABLE IF NOT EXISTS analysis_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    shared_with_team BOOLEAN DEFAULT FALSE,
    analysis_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable RLS on new tables for now (consistent with other tables)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_projects DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON analysis_projects TO authenticated;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_projects_user_id ON analysis_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_projects_team_id ON analysis_projects(team_id);
CREATE INDEX IF NOT EXISTS idx_analysis_projects_shared ON analysis_projects(shared_with_team);

-- 6. Insert sample data to test the team dashboard
DO $$
DECLARE
    sample_user_id UUID;
    sample_team_id UUID;
BEGIN
    -- Get the first team (if any exists)
    SELECT id INTO sample_team_id FROM teams LIMIT 1;
    
    -- Get the owner of that team
    IF sample_team_id IS NOT NULL THEN
        SELECT owner_id INTO sample_user_id FROM teams WHERE id = sample_team_id;
        
        -- Create a profile for the user if it doesn't exist
        INSERT INTO profiles (id, full_name, email)
        SELECT sample_user_id, 'Demo User', 'demo@example.com'
        WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = sample_user_id);
        
        -- Create a sample analysis project
        INSERT INTO analysis_projects (name, user_id, team_id, shared_with_team, analysis_results)
        VALUES (
            'Sample Code Analysis',
            sample_user_id,
            sample_team_id,
            TRUE,
            '{"issues": 5, "warnings": 12, "suggestions": 8}'::jsonb
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$; 