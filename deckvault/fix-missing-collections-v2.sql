-- Fix Missing Collections Issue - Version 2
-- Run this in your Supabase SQL Editor to fix the collection creation problem

-- First, let's check the current state
SELECT 
    'Current users' as check_type,
    COUNT(*) as count
FROM auth.users

UNION ALL

SELECT 
    'Users with collections' as check_type,
    COUNT(*) as count
FROM auth.users u
INNER JOIN collections c ON u.id = c.user_id

UNION ALL

SELECT 
    'Users without collections' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN collections c ON u.id = c.user_id
WHERE c.user_id IS NULL;

-- Show which users are missing collections
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    c.id as collection_id
FROM auth.users u
LEFT JOIN collections c ON u.id = c.user_id
WHERE c.user_id IS NULL
ORDER BY u.created_at DESC;

-- Fix 1: Ensure all existing users have collections (direct approach)
INSERT INTO collections (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM collections)
ON CONFLICT (user_id) DO NOTHING;

-- Fix 2: Ensure all existing users have profiles
INSERT INTO profiles (id, username, email)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    email
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Fix 3: Drop and recreate the trigger function to ensure it works properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create a more robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile with username from metadata
    INSERT INTO profiles (id, username, email, avatar_url)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert collection for the new user
    INSERT INTO collections (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Error creating profile/collection for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix 4: Create a safer function to ensure collection exists
CREATE OR REPLACE FUNCTION ensure_user_collection(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    collection_uuid UUID;
BEGIN
    -- Check if user_uuid is null
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'user_uuid cannot be null';
    END IF;
    
    -- Try to get existing collection
    SELECT id INTO collection_uuid 
    FROM collections 
    WHERE user_id = user_uuid;
    
    -- If no collection exists, create one
    IF collection_uuid IS NULL THEN
        INSERT INTO collections (user_id)
        VALUES (user_uuid)
        RETURNING id INTO collection_uuid;
        
        RAISE NOTICE 'Created collection % for user %', collection_uuid, user_uuid;
    END IF;
    
    RETURN collection_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 5: Create a simpler function that doesn't rely on auth.uid()
CREATE OR REPLACE FUNCTION get_or_create_collection(user_email TEXT)
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
    collection_uuid UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Try to get existing collection
    SELECT id INTO collection_uuid 
    FROM collections 
    WHERE user_id = user_uuid;
    
    -- If no collection exists, create one
    IF collection_uuid IS NULL THEN
        INSERT INTO collections (user_id)
        VALUES (user_uuid)
        RETURNING id INTO collection_uuid;
        
        RAISE NOTICE 'Created collection % for user %', collection_uuid, user_uuid;
    END IF;
    
    RETURN collection_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the fix worked
SELECT 
    'After fix - Users with collections' as check_type,
    COUNT(*) as count
FROM auth.users u
INNER JOIN collections c ON u.id = c.user_id

UNION ALL

SELECT 
    'After fix - Users without collections' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN collections c ON u.id = c.user_id
WHERE c.user_id IS NULL;

-- Show all users and their collections
SELECT 
    u.email,
    u.id as user_id,
    c.id as collection_id,
    c.created_at as collection_created,
    COUNT(ci.id) as item_count
FROM auth.users u
LEFT JOIN collections c ON u.id = c.user_id
LEFT JOIN collection_items ci ON c.id = ci.collection_id
GROUP BY u.email, u.id, c.id, c.created_at
ORDER BY u.created_at DESC;
