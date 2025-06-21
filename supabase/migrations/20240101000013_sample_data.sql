-- Insert sample data for testing
BEGIN;

-- Function to safely insert sample data
CREATE OR REPLACE FUNCTION insert_sample_data()
RETURNS void AS $$
DECLARE
    test_user_id UUID;
    test_project_id UUID;
BEGIN
    -- Get or create a test user (only if auth.users exists and is empty)
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'users'
    ) THEN
        SELECT id INTO test_user_id FROM auth.users LIMIT 1;
        
        -- If no users exist, we'll skip sample data
        IF test_user_id IS NULL THEN
            RAISE NOTICE 'No users found in auth.users. Skipping sample data insertion.';
            RETURN;
        END IF;

        -- Create a sample project
        INSERT INTO public.analysis_projects (
            id,
            name,
            user_id,
            total_issues,
            critical_issues,
            created_at
        ) VALUES (
            uuid_generate_v4(),
            'Sample Project',
            test_user_id,
            10,
            3,
            NOW()
        )
        RETURNING id INTO test_project_id;

        -- Insert sample analysis results
        INSERT INTO public.analysis_results (
            project_id,
            file_name,
            results
        ) VALUES (
            test_project_id,
            'src/App.tsx',
            '{"warnings": 5, "errors": 2, "suggestions": 3}'::jsonb
        );

        -- Insert sample activity logs
        INSERT INTO public.activity_logs (
            user_id,
            action,
            details
        ) VALUES (
            test_user_id,
            'Project Created',
            '{"project_name": "Sample Project", "status": "success"}'::jsonb
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT insert_sample_data();

-- Clean up
DROP FUNCTION IF EXISTS insert_sample_data();

COMMIT; 