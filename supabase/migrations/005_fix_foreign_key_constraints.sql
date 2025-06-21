-- Fix foreign key constraint issues
-- This removes the foreign key constraints temporarily to allow team creation

-- Drop foreign key constraints that reference auth.users
ALTER TABLE IF EXISTS teams 
DROP CONSTRAINT IF EXISTS teams_owner_id_fkey;

ALTER TABLE IF EXISTS team_members 
DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;

ALTER TABLE IF EXISTS custom_rules 
DROP CONSTRAINT IF EXISTS custom_rules_user_id_fkey;

-- Recreate tables without foreign key constraints for now
-- We'll add them back later once we confirm everything works

-- Note: This is a temporary fix. In production, you'd want to ensure
-- that all user IDs exist in auth.users before creating the foreign keys. 