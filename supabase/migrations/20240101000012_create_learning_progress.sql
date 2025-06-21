-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in public schema
BEGIN;

-- 1. Add missing columns to analysis_projects if table exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analysis_projects') THEN
        ALTER TABLE public.analysis_projects 
        ADD COLUMN IF NOT EXISTS total_issues INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS critical_issues INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create analysis_results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.analysis_projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_results_project_id ON public.analysis_results(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- Analysis Results policies
CREATE POLICY "Users can view their own project results" ON public.analysis_results
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM public.analysis_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create results for their own projects" ON public.analysis_results
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.analysis_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own project results" ON public.analysis_results
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM public.analysis_projects WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.analysis_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own project results" ON public.analysis_results
    FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM public.analysis_projects WHERE user_id = auth.uid()
        )
    );

-- Activity Logs policies
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own activity logs" ON public.activity_logs
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own activity logs" ON public.activity_logs
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own activity logs" ON public.activity_logs
    FOR DELETE
    USING (user_id = auth.uid());

-- 7. Grant appropriate permissions
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.analysis_results TO authenticated;
GRANT ALL ON public.activity_logs TO authenticated;

-- 8. Create or replace function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.analysis_results;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.analysis_results
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMIT; 