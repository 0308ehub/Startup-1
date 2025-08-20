-- Fix Card Sets Table - Check Structure and RLS
-- Run this in your Supabase SQL editor

-- Check current card_sets table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'card_sets' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add card_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'card_sets' AND column_name = 'card_id') THEN
        ALTER TABLE card_sets ADD COLUMN card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL;
        RAISE NOTICE 'Added card_id column to card_sets table';
    ELSE
        RAISE NOTICE 'card_id column already exists';
    END IF;
    
    -- Add set_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'card_sets' AND column_name = 'set_code') THEN
        ALTER TABLE card_sets ADD COLUMN set_code TEXT NOT NULL;
        RAISE NOTICE 'Added set_code column to card_sets table';
    ELSE
        RAISE NOTICE 'set_code column already exists';
    END IF;
    
    -- Add set_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'card_sets' AND column_name = 'set_name') THEN
        ALTER TABLE card_sets ADD COLUMN set_name TEXT NOT NULL;
        RAISE NOTICE 'Added set_name column to card_sets table';
    ELSE
        RAISE NOTICE 'set_name column already exists';
    END IF;
    
    -- Add rarity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'card_sets' AND column_name = 'rarity') THEN
        ALTER TABLE card_sets ADD COLUMN rarity TEXT NOT NULL;
        RAISE NOTICE 'Added rarity column to card_sets table';
    ELSE
        RAISE NOTICE 'rarity column already exists';
    END IF;
    
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'card_sets' AND column_name = 'sku') THEN
        ALTER TABLE card_sets ADD COLUMN sku TEXT UNIQUE NOT NULL;
        RAISE NOTICE 'Added sku column to card_sets table';
    ELSE
        RAISE NOTICE 'sku column already exists';
    END IF;
    
END $$;

-- Check RLS policies on card_sets table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'card_sets';

-- Drop existing RLS policies on card_sets table (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON card_sets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON card_sets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON card_sets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON card_sets;

-- Enable RLS on card_sets table
ALTER TABLE card_sets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for card_sets table
-- Allow all users to read card_sets (public data)
CREATE POLICY "Enable read access for all users" ON card_sets
    FOR SELECT USING (true);

-- Allow authenticated users to insert card_sets
CREATE POLICY "Enable insert for authenticated users" ON card_sets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update card_sets
CREATE POLICY "Enable update for authenticated users" ON card_sets
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete card_sets
CREATE POLICY "Enable delete for authenticated users" ON card_sets
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'card_sets'
ORDER BY policyname;
