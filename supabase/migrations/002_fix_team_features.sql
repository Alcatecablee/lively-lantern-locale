-- Fix team collaboration features migration
-- This migration safely handles existing objects

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Team members can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Users can manage their custom rules" ON custom_rules;
DROP POLICY IF EXISTS "Team members can view team rules" ON custom_rules;
DROP POLICY IF EXISTS "Users can view their own and team projects" ON analysis_projects;
DROP POLICY IF EXISTS "Team members can view team analysis history" ON team_analysis_history;

-- Create tables with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id TEXT,
    subscription_plan TEXT CHECK (subscription_plan IN ('team', 'enterprise')) DEFAULT 'team',
    subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trial')) DEFAULT 'trial',
    max_members INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES profiles(id),
    UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
    invited_by UUID REFERENCES profiles(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT CHECK (rule_type IN ('syntax', 'performance', 'accessibility', 'security', 'best-practices')) NOT NULL,
    severity TEXT CHECK (severity IN ('error', 'warning', 'info')) DEFAULT 'warning',
    ast_pattern JSONB NOT NULL,
    auto_fixable BOOLEAN DEFAULT FALSE,
    fix_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES profiles(id),
    analysis_type TEXT DEFAULT 'standard',
    metrics JSONB,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_rule_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES custom_rules(id) ON DELETE CASCADE,
    project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fixes_applied INTEGER DEFAULT 0,
    issues_found INTEGER DEFAULT 0
);

-- Add columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add team columns to analysis_projects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_projects' AND column_name = 'team_id') THEN
        ALTER TABLE analysis_projects ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_projects' AND column_name = 'shared_with_team') THEN
        ALTER TABLE analysis_projects ADD COLUMN shared_with_team BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_projects' AND column_name = 'visibility') THEN
        ALTER TABLE analysis_projects ADD COLUMN visibility TEXT CHECK (visibility IN ('private', 'team', 'public')) DEFAULT 'private';
    END IF;

    -- Add team columns to user_api_keys if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_api_keys') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'team_id') THEN
            ALTER TABLE user_api_keys ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'key_type') THEN
            ALTER TABLE user_api_keys ADD COLUMN key_type TEXT CHECK (key_type IN ('personal', 'team')) DEFAULT 'personal';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'permissions') THEN
            ALTER TABLE user_api_keys ADD COLUMN permissions JSONB DEFAULT '{"read": true, "write": false, "admin": false}';
        END IF;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_custom_rules_user_id ON custom_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_rules_team_id ON custom_rules(team_id);
CREATE INDEX IF NOT EXISTS idx_analysis_projects_team_id ON analysis_projects(team_id);
CREATE INDEX IF NOT EXISTS idx_team_analysis_history_team_id ON team_analysis_history(team_id);

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_analysis_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view teams they belong to" ON teams
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.team_id = teams.id 
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Team owners can update their teams" ON teams
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create teams" ON teams
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team members can view team members" ON team_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid()
        )
    );

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

CREATE POLICY "Team members can view invitations" ON team_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM teams t 
            WHERE t.id = team_invitations.team_id 
            AND t.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their custom rules" ON custom_rules
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Team members can view team rules" ON custom_rules
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = custom_rules.team_id 
            AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own and team projects" ON analysis_projects
    FOR SELECT USING (
        user_id = auth.uid() OR
        (shared_with_team AND EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = analysis_projects.team_id 
            AND tm.user_id = auth.uid()
        ))
    );

CREATE POLICY "Team members can view team analysis history" ON team_analysis_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_analysis_history.team_id 
            AND tm.user_id = auth.uid()
        )
    );

-- Create or replace functions
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    role TEXT,
    member_count BIGINT,
    owner_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as team_id,
        t.name as team_name,
        tm.role,
        (SELECT COUNT(*) FROM team_members tm2 WHERE tm2.team_id = t.id) as member_count,
        p.full_name as owner_name
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN profiles p ON t.owner_id = p.id
    WHERE tm.user_id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION can_access_team_feature(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_plan TEXT;
    has_team_access BOOLEAN := FALSE;
BEGIN
    -- Check if user has team membership
    SELECT EXISTS (
        SELECT 1 FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        WHERE tm.user_id = user_uuid
        AND t.subscription_status = 'active'
    ) INTO has_team_access;
    
    RETURN has_team_access;
END;
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS trigger_teams_updated_at ON teams;
CREATE TRIGGER trigger_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_custom_rules_updated_at ON custom_rules;
CREATE TRIGGER trigger_custom_rules_updated_at
    BEFORE UPDATE ON custom_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 