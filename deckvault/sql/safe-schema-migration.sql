-- Safe Schema Migration - Only adds missing columns and functions
-- Run this in your Supabase SQL editor

-- First, let's check what columns exist in the cards table
-- (This will help us understand the current structure)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to cards table if they don't exist
DO $$
BEGIN
    -- Add clean_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'clean_name') THEN
        ALTER TABLE cards ADD COLUMN clean_name TEXT;
    END IF;
    
    -- Add category_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'category_id') THEN
        ALTER TABLE cards ADD COLUMN category_id TEXT;
    END IF;
    
    -- Add group_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'group_id') THEN
        ALTER TABLE cards ADD COLUMN group_id TEXT;
    END IF;
    
    -- Add url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'url') THEN
        ALTER TABLE cards ADD COLUMN url TEXT;
    END IF;
    
    -- Add modified_on column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'modified_on') THEN
        ALTER TABLE cards ADD COLUMN modified_on TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add image_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'image_count') THEN
        ALTER TABLE cards ADD COLUMN image_count INTEGER;
    END IF;
    
    -- Add ext_rarity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'ext_rarity') THEN
        ALTER TABLE cards ADD COLUMN ext_rarity TEXT;
    END IF;
    
    -- Add ext_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'ext_number') THEN
        ALTER TABLE cards ADD COLUMN ext_number TEXT;
    END IF;
    
    -- Add ext_sub_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'ext_sub_type') THEN
        ALTER TABLE cards ADD COLUMN ext_sub_type TEXT;
    END IF;
    
    -- Add ext_oracle_text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'ext_oracle_text') THEN
        ALTER TABLE cards ADD COLUMN ext_oracle_text TEXT;
    END IF;
    
    -- Add low_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'low_price') THEN
        ALTER TABLE cards ADD COLUMN low_price DECIMAL(10,2);
    END IF;
    
    -- Add mid_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'mid_price') THEN
        ALTER TABLE cards ADD COLUMN mid_price DECIMAL(10,2);
    END IF;
    
    -- Add high_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'high_price') THEN
        ALTER TABLE cards ADD COLUMN high_price DECIMAL(10,2);
    END IF;
    
    -- Add market_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'market_price') THEN
        ALTER TABLE cards ADD COLUMN market_price DECIMAL(10,2);
    END IF;
    
    -- Add direct_low_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'direct_low_price') THEN
        ALTER TABLE cards ADD COLUMN direct_low_price DECIMAL(10,2);
    END IF;
    
    -- Add sub_type_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'sub_type_name') THEN
        ALTER TABLE cards ADD COLUMN sub_type_name TEXT;
    END IF;
    
    -- Add ext_p column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'ext_p') THEN
        ALTER TABLE cards ADD COLUMN ext_p TEXT;
    END IF;
    
    -- Add ext_t column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'ext_t') THEN
        ALTER TABLE cards ADD COLUMN ext_t TEXT;
    END IF;
    
    -- Add ext_flavor_text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'ext_flavor_text') THEN
        ALTER TABLE cards ADD COLUMN ext_flavor_text TEXT;
    END IF;
    
END $$;

-- Drop conflicting triggers and functions
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

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    -- Check if trigger exists before creating
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_collections_updated_at') THEN
        CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_collection_items_updated_at') THEN
        CREATE TRIGGER update_collection_items_updated_at BEFORE UPDATE ON collection_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_decks_updated_at') THEN
        CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_listings_updated_at') THEN
        CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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
