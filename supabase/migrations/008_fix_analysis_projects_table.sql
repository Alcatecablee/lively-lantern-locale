-- Fix analysis_projects table structure
-- Add missing columns and ensure table is properly configured

-- 1. Add missing columns to analysis_projects if they don't exist
DO $$
BEGIN
    -- Add analysis_results column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analysis_projects' 
        AND column_name = 'analysis_results'
    ) THEN
        ALTER TABLE analysis_projects ADD COLUMN analysis_results JSONB;
    END IF;

    -- Add shared_with_team column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analysis_projects' 
        AND column_name = 'shared_with_team'
    ) THEN
        ALTER TABLE analysis_projects ADD COLUMN shared_with_team BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add team_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analysis_projects' 
        AND column_name = 'team_id'
    ) THEN
        ALTER TABLE analysis_projects ADD COLUMN team_id UUID;
    END IF;
END $$;

-- 2. Create sample data now that columns exist
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
        
        RAISE NOTICE 'Sample data created successfully for team % and user %', sample_team_id, sample_user_id;
    ELSE
        RAISE NOTICE 'No teams found, skipping sample data creation';
    END IF;
END $$; 