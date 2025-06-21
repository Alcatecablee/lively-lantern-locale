-- NeuroLint Database Setup - Run this in Supabase SQL Editor
-- This will create all the necessary tables for team features

-- 1. Create Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_plan TEXT CHECK (subscription_plan IN ('team', 'enterprise')) DEFAULT 'team',
    subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trial')) DEFAULT 'trial',
    max_members INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Team Members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 3. Create Team Invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Custom Rules table
CREATE TABLE IF NOT EXISTS custom_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT CHECK (rule_type IN ('syntax', 'performance', 'accessibility', 'security', 'best-practices')) NOT NULL,
    severity TEXT CHECK (severity IN ('error', 'warning', 'info')) DEFAULT 'warning',
    ast_pattern JSONB NOT NULL DEFAULT '{}',
    auto_fixable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Analysis Projects table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS analysis_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    shared_with_team BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add team columns to analysis_projects if they don't exist
ALTER TABLE analysis_projects 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS shared_with_team BOOLEAN DEFAULT FALSE;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_rules_user_id ON custom_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_rules_team_id ON custom_rules(team_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_projects ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies

-- Teams policies
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
CREATE POLICY "Users can view teams they belong to" ON teams
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.team_id = teams.id 
            AND team_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
CREATE POLICY "Team owners can update their teams" ON teams
    FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
CREATE POLICY "Authenticated users can create teams" ON teams
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Team members policies
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
CREATE POLICY "Team members can view team members" ON team_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
CREATE POLICY "Team admins can manage members" ON team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM teams t 
            WHERE t.id = team_members.team_id 
            AND t.owner_id = auth.uid()
        )
    );

-- Custom rules policies
DROP POLICY IF EXISTS "Users can manage their custom rules" ON custom_rules;
CREATE POLICY "Users can manage their custom rules" ON custom_rules
    FOR ALL USING (user_id = auth.uid());

-- Analysis projects policies
DROP POLICY IF EXISTS "Users can view their own and team projects" ON analysis_projects;
CREATE POLICY "Users can view their own and team projects" ON analysis_projects
    FOR SELECT USING (
        user_id = auth.uid() OR
        (shared_with_team AND EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = analysis_projects.team_id 
            AND tm.user_id = auth.uid()
        ))
    );

DROP POLICY IF EXISTS "Users can manage their own projects" ON analysis_projects;
CREATE POLICY "Users can manage their own projects" ON analysis_projects
    FOR ALL USING (user_id = auth.uid());

-- Success message
SELECT 'Database setup completed successfully! All tables and policies have been created.' as status; 