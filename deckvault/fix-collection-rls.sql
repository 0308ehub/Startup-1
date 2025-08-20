-- Fix Collection RLS Policies
-- Run this in your Supabase SQL Editor to fix collection data persistence issues

-- First, let's drop all existing RLS policies for collections and related tables
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;

DROP POLICY IF EXISTS "Users can view own collection items" ON collection_items;
DROP POLICY IF EXISTS "Users can insert own collection items" ON collection_items;
DROP POLICY IF EXISTS "Users can update own collection items" ON collection_items;
DROP POLICY IF EXISTS "Users can delete own collection items" ON collection_items;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate RLS policies with proper permissions

-- Collections policies
CREATE POLICY "Users can view own collections" ON collections 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections 
FOR DELETE USING (auth.uid() = user_id);

-- Collection items policies (simplified for better performance)
CREATE POLICY "Users can view own collection items" ON collection_items 
FOR SELECT USING (
    collection_id IN (
        SELECT id FROM collections WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own collection items" ON collection_items 
FOR INSERT WITH CHECK (
    collection_id IN (
        SELECT id FROM collections WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own collection items" ON collection_items 
FOR UPDATE USING (
    collection_id IN (
        SELECT id FROM collections WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own collection items" ON collection_items 
FOR DELETE USING (
    collection_id IN (
        SELECT id FROM collections WHERE user_id = auth.uid()
    )
);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure all existing users have collections and profiles
INSERT INTO collections (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM collections)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO profiles (id, username, email)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    email
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

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

-- Test the policies
SELECT 
    'RLS Policies Fixed' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('collections', 'collection_items', 'profiles')
AND schemaname = 'public';

-- Verify collections exist for all users
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
