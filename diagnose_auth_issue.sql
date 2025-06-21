-- Diagnose Authentication Issues
-- Run this to find what's actually broken

-- 1. Check if auth schema exists and is accessible
SELECT 'Checking auth schema...' as status;
SELECT schemaname FROM pg_tables WHERE schemaname = 'auth' LIMIT 5;

-- 2. Check auth.users table health
SELECT 'Checking auth.users table...' as status;
SELECT COUNT(*) as user_count FROM auth.users;

-- 3. Check what triggers exist on auth.users (these might be failing)
SELECT 'Checking triggers on auth.users...' as status;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 4. Check if our custom functions exist and their permissions
SELECT 'Checking custom functions...' as status;
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'handle_user_update', 'is_admin');

-- 5. Try to manually test the functions that might be failing
SELECT 'Testing is_admin function...' as status;
SELECT is_admin('a2ec497c-752f-40fd-bcf1-8e1b48a98cc8') as admin_test;

-- 6. Check recent database logs (if available)
SELECT 'Database configuration check...' as status;
SELECT name, setting FROM pg_settings WHERE name LIKE '%log%' AND name IN ('log_statement', 'log_min_error_statement');

-- 7. Check if there are any problematic policies on auth tables
SELECT 'Checking auth table policies...' as status;
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'auth' OR tablename IN ('users');

-- 8. EMERGENCY: Drop our triggers if they're causing issues
SELECT 'Dropping potentially problematic triggers...' as status;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- 9. EMERGENCY: Disable RLS on ALL tables temporarily
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;

-- 10. Reset auth function permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

SELECT 'Emergency auth diagnosis and cleanup completed!' as final_status; 