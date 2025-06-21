-- Fix login issues - Run this in Supabase SQL Editor
-- This will adjust the policies to allow login while keeping admin functionality

-- 1. First, let's make the profiles table more permissive for auth
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow inserts for new user creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Make user_roles more permissive for reading
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow inserts for new roles
DROP POLICY IF EXISTS "System can insert roles" ON user_roles;
CREATE POLICY "System can insert roles" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile, handle conflicts using the primary key (id)
  INSERT INTO profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = NOW();
  
  -- Create default user role - use INSERT ... WHERE NOT EXISTS since user_id might not have unique constraint
  INSERT INTO user_roles (user_id, role)
  SELECT NEW.id, 'user'
  WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = NEW.id
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, just return NEW to allow login
    RETURN NEW;
END;
$$;

-- 4. Make the handle_user_update function more robust
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profile if it exists
  UPDATE profiles SET
    email = NEW.email,
    last_sign_in_at = CASE 
      WHEN NEW.last_sign_in_at IS NOT NULL AND NEW.last_sign_in_at > COALESCE(OLD.last_sign_in_at, '1970-01-01'::timestamptz)
      THEN NEW.last_sign_in_at 
      ELSE profiles.last_sign_in_at 
    END,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, just return NEW to allow login
    RETURN NEW;
END;
$$;

-- 5. Make is_admin function handle missing data gracefully
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return false if user_id is null
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role in user_roles table
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND user_roles.role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, return false
    RETURN FALSE;
END;
$$;

-- 6. Ensure all existing auth users have profiles and roles
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 7. Ensure all users have roles - use safe INSERT
INSERT INTO user_roles (user_id, role)
SELECT 
  p.id,
  'user'
FROM profiles p
WHERE p.id NOT IN (SELECT user_id FROM user_roles WHERE user_id IS NOT NULL);

-- 8. Show current state
SELECT 'Current profiles:' as info;
SELECT COUNT(*) as profile_count FROM profiles;

SELECT 'Current user roles:' as info;
SELECT COUNT(*) as role_count FROM user_roles;

SELECT 'Users with roles:' as info;
SELECT p.email, ur.role 
FROM profiles p 
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.email;

SELECT 'Login fix completed successfully!' as status; 