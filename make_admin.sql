-- Make a user admin by email
-- Replace 'your-email@example.com' with your actual email address

-- First, let's see what users exist
SELECT 'Current users in profiles table:' as info;
SELECT id, email, full_name, created_at FROM profiles ORDER BY created_at;

SELECT 'Current user roles:' as info;
SELECT ur.user_id, ur.role, p.email 
FROM user_roles ur 
JOIN profiles p ON ur.user_id = p.id 
ORDER BY ur.created_at;

-- Make user admin (replace with your email)
-- SELECT make_user_admin('your-email@example.com');

-- Verify admin status
-- SELECT 'Admin status check:' as info;
-- SELECT is_admin() as is_current_user_admin;

-- To make a specific user admin, uncomment and modify this line:
-- SELECT make_user_admin('your-email@example.com');

-- Instructions:
-- 1. First run the missing_functions.sql file
-- 2. Then uncomment the make_user_admin line above and replace with your email
-- 3. Run this script to make yourself an admin 