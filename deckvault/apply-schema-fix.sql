-- Apply schema fixes to resolve authentication and collection issues
-- Run this in your Supabase SQL editor

-- First, drop conflicting triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_profile() CASCADE;

-- Create the consolidated trigger function
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

-- Create the consolidated trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to ensure collection exists for a user
CREATE OR REPLACE FUNCTION ensure_user_collection(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    collection_uuid UUID;
BEGIN
    -- Try to get existing collection
    SELECT id INTO collection_uuid 
    FROM collections 
    WHERE user_id = user_uuid;
    
    -- If no collection exists, create one
    IF collection_uuid IS NULL THEN
        INSERT INTO collections (user_id)
        VALUES (user_uuid)
        RETURNING id INTO collection_uuid;
    END IF;
    
    RETURN collection_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all existing users have collections
INSERT INTO collections (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM collections)
ON CONFLICT (user_id) DO NOTHING;

-- Ensure all existing users have profiles
INSERT INTO profiles (id, username, email)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    email
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 
    'Users without profiles' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Users without collections' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN collections c ON u.id = c.user_id
WHERE c.user_id IS NULL;
