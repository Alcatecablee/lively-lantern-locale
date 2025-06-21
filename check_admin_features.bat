@echo off
echo =======================================================
echo NeuroLint Admin Features Diagnostic
echo =======================================================
echo.
echo This script will help you verify admin functionality.
echo.
echo To run the admin test script:
echo 1. Open Supabase Dashboard: https://supabase.com/dashboard
echo 2. Go to your project
echo 3. Click on "SQL Editor" in the left sidebar
echo 4. Copy and paste the contents of test_admin_features.sql
echo 5. Click "Run" to execute the script
echo.
echo The script will:
echo - Check current user roles
echo - Test the is_admin function
echo - Clean up duplicate roles
echo - Ensure your user is admin
echo - Verify the final admin status
echo.
echo After running the SQL script:
echo - Refresh your browser tab with the NeuroLint app
echo - Check if admin button still shows for non-admin users
echo - Try logging in as admin to test functionality
echo.
echo =======================================================
echo Checking current project status...
echo =======================================================
npm run dev 