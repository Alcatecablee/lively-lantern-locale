-- Test Admin Features - Run this to verify admin functionality is working
-- This will help diagnose why admin shortcuts might show for non-admin users

-- 1. Check current user roles
SELECT 'Current user roles:' as info;
SELECT p.email, ur.role, ur.user_id 
FROM profiles p 
LEFT JOIN user_roles ur ON p.id = ur.user_id 
ORDER BY p.email;

-- 2. Test the is_admin function for your user
SELECT 'Testing is_admin function:' as info;
SELECT 
  p.email,
  ur.role,
  is_admin(p.id) as admin_check
FROM profiles p 
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'clivemakazhu@gmail.com';

-- 3. Check if there are any duplicate or conflicting roles
SELECT 'Checking for duplicate roles:' as info;
SELECT user_id, COUNT(*) as role_count
FROM user_roles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 4. Check all admin users
SELECT 'All admin users:' as info;
SELECT p.email, ur.role, ur.user_id
FROM profiles p 
JOIN user_roles ur ON p.id = ur.user_id 
WHERE ur.role = 'admin';

-- 5. Fix any issues: Remove non-admin roles for admin users
DELETE FROM user_roles 
WHERE user_id IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
) AND role != 'admin';

-- 6. Ensure your user is admin (fixed approach without ON CONFLICT)
-- First, try to update existing role
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'clivemakazhu@gmail.com');

-- If no row was updated (user doesn't have a role yet), insert new one
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'clivemakazhu@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = (SELECT id FROM profiles WHERE email = 'clivemakazhu@gmail.com')
);

-- 7. Final verification
SELECT 'Final verification:' as info;
SELECT 
  p.email,
  ur.role,
  is_admin(p.id) as admin_function_result
FROM profiles p 
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.email;

SELECT 'Admin feature test completed!' as status; 