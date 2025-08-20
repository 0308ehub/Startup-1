-- Fix Authentication Cookie Issues
-- Run this in your Supabase SQL Editor to check authentication setup

-- Check if RLS is properly configured for auth tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('auth.users', 'profiles', 'collections')
ORDER BY tablename;

-- Check if there are any users in the auth.users table
SELECT 
    'Total users' as check_type,
    COUNT(*) as count
FROM auth.users

UNION ALL

SELECT 
    'Users with profiles' as check_type,
    COUNT(*) as count
FROM auth.users u
INNER JOIN profiles p ON u.id = p.id

UNION ALL

SELECT 
    'Users with collections' as check_type,
    COUNT(*) as count
FROM auth.users u
INNER JOIN collections c ON u.id = c.user_id;

-- Check for any recent user activity
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    updated_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Verify RLS policies are working
SELECT 
    'RLS Policies Check' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('profiles', 'collections', 'collection_items')
AND schemaname = 'public';
