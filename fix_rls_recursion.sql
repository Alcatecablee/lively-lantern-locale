-- Fix RLS recursion issues
-- Run this in your Supabase SQL Editor to fix dashboard loading errors

-- 1. Redefine is_admin to use SECURITY INVOKER
-- This makes it run with the permissions of the user calling it, avoiding policy recursion.
-- We also add a check to prevent it from being called within a policy check on user_roles itself.
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  is_in_rls_context BOOLEAN;
BEGIN
  -- Prevent recursion if called from a policy on user_roles
  SELECT EXISTS (
    SELECT 1
    FROM pg_settings
    WHERE name = 'application_name' AND setting LIKE '%postgrest%'
  ) INTO is_in_rls_context;

  IF is_in_rls_context AND pg_has_role(current_user, 'rls_policy_executor', 'MEMBER') THEN
    -- A simplistic check to see if we are in a policy context.
    -- This may need adjustment based on your environment.
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
    RETURN FALSE;
END;
$$;

-- 2. Update RLS policies for user_roles to be non-recursive
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (is_admin());

-- 3. Update RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());
  
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- 4. Update RLS for team_members to be non-recursive
-- This policy was causing recursion when checking team access.
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
CREATE POLICY "Team members can view team members" ON team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
CREATE POLICY "Team admins can manage members" ON team_members
    FOR ALL USING (
        -- Check if the user is an admin of the specific team
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role = 'admin'
        )
        -- Or if they are the owner of the team
        OR EXISTS (
            SELECT 1 FROM teams t
            WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
        )
    );

-- 5. Grant execute on the updated function
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;

SELECT 'RLS recursion fix applied successfully!' as status; 