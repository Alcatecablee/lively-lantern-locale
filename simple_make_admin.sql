-- Simple admin setup - Run after login is working
-- Replace 'your-email@example.com' with your actual email

-- First, see all users
SELECT 'All users in the system:' as info;
SELECT p.id, p.email, p.full_name, ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.email;

-- Make yourself admin (uncomment and replace email)
-- UPDATE user_roles SET role = 'admin' WHERE user_id = (SELECT id FROM profiles WHERE email = 'your-email@example.com');

-- If the user doesn't have a role yet, insert it
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'admin' FROM profiles WHERE email = 'your-email@example.com'
-- WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT id FROM profiles WHERE email = 'your-email@example.com'));

-- If the above doesn't work, try this update version:
-- UPDATE user_roles SET role = 'admin' WHERE user_id = (SELECT id FROM profiles WHERE email = 'your-email@example.com');

-- Verify admin status
-- SELECT 'Admin check:' as info;
-- SELECT p.email, ur.role, is_admin(p.id) as is_admin_function_result
-- FROM profiles p
-- LEFT JOIN user_roles ur ON p.id = ur.user_id
-- WHERE p.email = 'your-email@example.com';

-- Instructions:
-- 1. First run fix_login.sql
-- 2. Try to login to your app
-- 3. Once login works, come back here
-- 4. Uncomment the lines above and replace your-email@example.com with your actual email  
-- 5. Run this script to make yourself admin 