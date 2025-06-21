# Fix NeuroLint Admin Panel - Setup Guide

Your admin panel is showing incorrect user counts because some database functions and proper user synchronization are missing. Here's how to fix it:

## Step 1: Run the Missing Functions SQL

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `missing_functions.sql` 
4. Run the SQL script

This will create:
- `is_admin()` function to check admin status
- `make_user_admin()` function to promote users to admin
- Proper triggers to sync auth.users with profiles table
- Correct Row Level Security (RLS) policies

## Step 2: Make Yourself an Admin

1. In Supabase SQL Editor, run the contents of `make_admin.sql` first to see current users
2. Then uncomment and modify this line with your email:
   ```sql
   SELECT make_user_admin('your-email@example.com');
   ```
3. Run the script to make yourself an admin

## Step 3: Verify the Fix

1. Refresh your NeuroLint application
2. Sign out and sign back in
3. You should now see the Admin button in the header
4. Click on Admin Dashboard
5. Go to User Management - you should now see all 2 users from your Supabase database

## What Was Wrong

1. **Missing Database Functions**: The `is_admin()` function didn't exist, so admin status checks were failing
2. **No User Synchronization**: New users weren't being properly added to the `profiles` table
3. **Missing User Roles**: Users didn't have entries in the `user_roles` table
4. **Incorrect Data Fetching**: The admin panel wasn't properly joining user data with roles

## What's Fixed

1. ✅ **Real Database Connection**: No more mock data, everything connects to your actual Supabase database
2. ✅ **Proper User Sync**: New users are automatically added to profiles and given default 'user' role
3. ✅ **Admin Functions**: Working `is_admin()` and `make_user_admin()` functions
4. ✅ **Role Management**: Admins can now change user roles directly from the interface
5. ✅ **Accurate Counts**: Dashboard shows real user counts from database
6. ✅ **Refresh Button**: Added refresh button to reload data from database

## Troubleshooting

If you still don't see the correct data:

1. Check browser console for any errors
2. Verify your Supabase connection in the Network tab
3. Make sure you ran both SQL scripts successfully
4. Try the refresh button in the User Management section

Your admin panel should now show the correct 2 users from your Supabase database! 