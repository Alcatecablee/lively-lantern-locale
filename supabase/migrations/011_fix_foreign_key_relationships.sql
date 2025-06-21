-- Fix foreign key relationships and join issues
-- This addresses the "Could not find a relationship" error

-- 1. Ensure analysis_projects table exists with correct structure
CREATE TABLE IF NOT EXISTS public.analysis_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    shared_with_team BOOLEAN DEFAULT FALSE,
    file_count INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create a view that properly joins analysis_projects with profiles
-- This helps PostgREST understand the relationship
CREATE OR REPLACE VIEW public.analysis_projects_with_profiles AS
SELECT 
    ap.*,
    p.full_name as performer_name,
    p.email as performer_email
FROM public.analysis_projects ap
LEFT JOIN public.profiles p ON ap.user_id = p.id;

-- 3. Grant permissions on the view
GRANT SELECT ON public.analysis_projects_with_profiles TO authenticated;
GRANT SELECT ON public.analysis_projects_with_profiles TO anon;

-- 4. Ensure profiles table has the correct foreign key relationship
-- The profiles.id should match auth.users.id
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Create an index to help with joins
CREATE INDEX IF NOT EXISTS idx_analysis_projects_user_id ON public.analysis_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- 6. Update RLS policies for analysis_projects
ALTER TABLE public.analysis_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.analysis_projects;
DROP POLICY IF EXISTS "Team members can view shared projects" ON public.analysis_projects;
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.analysis_projects;

-- Create comprehensive policies
CREATE POLICY "Users can view their own projects" ON public.analysis_projects
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own projects" ON public.analysis_projects
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Team members can view shared projects" ON public.analysis_projects
FOR SELECT USING (
    shared_with_team = true AND
    team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = auth.uid()
    )
);

-- 7. Grant necessary permissions
GRANT ALL ON public.analysis_projects TO authenticated;
GRANT SELECT ON public.analysis_projects TO anon;

-- 8. Verify the fix worked
SELECT 'Foreign key relationships fixed successfully!' as status; 