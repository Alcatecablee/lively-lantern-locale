-- Fix for 406 Not Acceptable error on profiles table
-- This policy grants access to specific columns for authenticated users.

-- 1. Ensure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing select policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

-- 3. Create a policy that allows users to read their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. Grant select permissions on specific columns to the authenticated role
-- This is the key part that fixes the 406 error
GRANT SELECT (id, full_name, subscription_plan, subscription_status) 
ON public.profiles 
TO authenticated; 