-- Fix Cards Table - Add Missing Columns
-- Run this in your Supabase SQL editor

-- Check current cards table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'image_url') THEN
        ALTER TABLE cards ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to cards table';
    ELSE
        RAISE NOTICE 'image_url column already exists';
    END IF;
    
    -- Add clean_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'clean_name') THEN
        ALTER TABLE cards ADD COLUMN clean_name TEXT;
        RAISE NOTICE 'Added clean_name column to cards table';
    ELSE
        RAISE NOTICE 'clean_name column already exists';
    END IF;
    
    -- Add product_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'product_id') THEN
        ALTER TABLE cards ADD COLUMN product_id TEXT UNIQUE;
        RAISE NOTICE 'Added product_id column to cards table';
    ELSE
        RAISE NOTICE 'product_id column already exists';
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'name') THEN
        ALTER TABLE cards ADD COLUMN name TEXT;
        RAISE NOTICE 'Added name column to cards table';
    ELSE
        RAISE NOTICE 'name column already exists';
    END IF;
    
END $$;

-- Verify the fix
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND table_schema = 'public'
AND column_name IN ('image_url', 'clean_name', 'product_id', 'name')
ORDER BY column_name;
