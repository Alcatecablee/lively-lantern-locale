-- Debug auth.users table to understand foreign key constraint issue

-- Check if we can see auth.users table
SELECT 'Auth users table exists' as status;

-- Try to see auth.users structure (may fail due to permissions)
-- This is just for debugging - it might not work
DO $$
BEGIN
    -- Try to check if any users exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        RAISE NOTICE 'auth.users table exists';
    ELSE
        RAISE NOTICE 'auth.users table does not exist or not accessible';
    END IF;
END $$;

-- Create a simple test to verify team creation works without foreign keys
INSERT INTO teams (name, description, owner_id, subscription_plan) 
VALUES ('Test Team', 'Test description', gen_random_uuid(), 'team')
ON CONFLICT DO NOTHING; 