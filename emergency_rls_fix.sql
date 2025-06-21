-- Emergency RLS Fix - Run this to stop recursion errors immediately
-- This temporarily disables problematic policies so your app works

-- 1. Temporarily disable RLS on team_members to stop recursion
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- 2. Also disable RLS on teams to prevent issues there
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- 3. Keep profiles RLS but make it simple
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Simple non-recursive policies for profiles
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- 4. Keep user_roles RLS but make it simple
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "System can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can view roles" ON user_roles;
DROP POLICY IF EXISTS "System can manage roles" ON user_roles;

-- Simple non-recursive policies for user_roles
CREATE POLICY "user_roles_select_policy" ON user_roles FOR SELECT USING (true);
CREATE POLICY "user_roles_manage_policy" ON user_roles FOR ALL USING (true);

-- 5. Ensure your user has admin role
-- First check if you already have a role
DO $$
BEGIN
  -- Make sure your user has admin role
  INSERT INTO user_roles (user_id, role)
  SELECT 'a2ec497c-752f-40fd-bcf1-8e1b48a98cc8', 'admin'
  WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = 'a2ec497c-752f-40fd-bcf1-8e1b48a98cc8'
  );
  
  -- If user already exists, update to admin
  UPDATE user_roles 
  SET role = 'admin' 
  WHERE user_id = 'a2ec497c-752f-40fd-bcf1-8e1b48a98cc8';
END $$;

-- 6. Fix the is_admin function to be simpler
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple check without recursion risk
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = COALESCE(is_admin.user_id, auth.uid())
    AND user_roles.role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;

SELECT 'Emergency RLS fix applied - recursion should be stopped!' as status; 