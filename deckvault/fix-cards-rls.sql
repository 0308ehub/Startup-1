-- Fix Cards Table RLS Policies
-- Run this in your Supabase SQL editor

-- First, let's see what RLS policies exist on the cards table
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
WHERE tablename = 'cards';

-- Drop existing RLS policies on cards table (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON cards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cards;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON cards;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cards;

-- Enable RLS on cards table
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cards table
-- Allow all users to read cards (public data)
CREATE POLICY "Enable read access for all users" ON cards
    FOR SELECT USING (true);

-- Allow authenticated users to insert cards
CREATE POLICY "Enable insert for authenticated users" ON cards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update cards they created (if needed)
CREATE POLICY "Enable update for authenticated users" ON cards
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete cards (if needed)
CREATE POLICY "Enable delete for authenticated users" ON cards
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
WHERE tablename = 'cards'
ORDER BY policyname;
