-- Simple team setup migration - focuses on core functionality
-- Run this in Supabase SQL Editor

-- 1. Create teams table with simple structure
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_plan TEXT DEFAULT 'team',
    subscription_status TEXT DEFAULT 'active',
    max_members INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 3. Create custom_rules table
CREATE TABLE IF NOT EXISTS custom_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL,
    severity TEXT DEFAULT 'warning',
    ast_pattern JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Simple RLS policies for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Allow users to see teams they own or are members of
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams" ON teams
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Allow authenticated users to create teams
DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Allow team owners to update their teams
DROP POLICY IF EXISTS "Team owners can update teams" ON teams;
CREATE POLICY "Team owners can update teams" ON teams
    FOR UPDATE USING (owner_id = auth.uid());

-- 5. Simple RLS policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Allow users to see team members for teams they belong to
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
CREATE POLICY "Users can view team members" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members tm 
            WHERE tm.user_id = auth.uid()
        ) OR
        team_id IN (
            SELECT id FROM teams 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow team owners to manage members
DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;
CREATE POLICY "Team owners can manage members" ON team_members
    FOR ALL USING (
        team_id IN (
            SELECT id FROM teams 
            WHERE owner_id = auth.uid()
        )
    );

-- 6. Simple RLS policies for custom_rules
ALTER TABLE custom_rules ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own rules
DROP POLICY IF EXISTS "Users can manage their rules" ON custom_rules;
CREATE POLICY "Users can manage their rules" ON custom_rules
    FOR ALL USING (user_id = auth.uid());

-- Allow team members to view team rules
DROP POLICY IF EXISTS "Team members can view team rules" ON custom_rules;
CREATE POLICY "Team members can view team rules" ON custom_rules
    FOR SELECT USING (
        user_id = auth.uid() OR
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- 7. Create basic indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_rules_user_id ON custom_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_rules_team_id ON custom_rules(team_id);

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 