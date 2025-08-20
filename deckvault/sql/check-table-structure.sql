-- Check the current structure of the cards table
-- Run this in your Supabase SQL Editor to see what columns exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND table_schema = 'public'
ORDER BY ordinal_position;
