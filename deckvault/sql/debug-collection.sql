-- Debug Collection Issues
-- Run this in your Supabase SQL Editor to diagnose collection problems

-- 1. Check if users have collections
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

-- 2. Check collection items for a specific user (replace with your user ID)
-- First, let's see all users and their collections
SELECT 
    u.id as user_id,
    u.email,
    c.id as collection_id,
    c.created_at as collection_created
FROM auth.users u
LEFT JOIN collections c ON u.id = c.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. Check if there are any collection items
SELECT 
    'Total collection items' as check_type,
    COUNT(*) as count
FROM collection_items

UNION ALL

SELECT 
    'Collection items with valid collections' as check_type,
    COUNT(*) as count
FROM collection_items ci
INNER JOIN collections c ON ci.collection_id = c.id

UNION ALL

SELECT 
    'Collection items with valid card sets' as check_type,
    COUNT(*) as count
FROM collection_items ci
INNER JOIN card_sets cs ON ci.card_set_id = cs.id;

-- 4. Check RLS policies
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
WHERE tablename IN ('collections', 'collection_items', 'cards', 'card_sets')
ORDER BY tablename, policyname;

-- 5. Check if tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('collections', 'collection_items', 'cards', 'card_sets', 'profiles')
AND schemaname = 'public';

-- 6. Test inserting a collection item (this will help identify RLS issues)
-- Note: This is just a test query, not an actual insert
SELECT 
    'Test: Can insert into collections' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM collections 
            WHERE user_id = auth.uid() 
            LIMIT 1
        ) THEN 'PASS - User has collection'
        ELSE 'FAIL - User has no collection'
    END as result

UNION ALL

SELECT 
    'Test: Can view collection items' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM collection_items ci
            INNER JOIN collections c ON ci.collection_id = c.id
            WHERE c.user_id = auth.uid()
            LIMIT 1
        ) THEN 'PASS - Can view collection items'
        ELSE 'FAIL - Cannot view collection items'
    END as result;

-- 7. Check for any recent collection items (last 24 hours)
SELECT 
    ci.id,
    ci.quantity,
    ci.created_at,
    c.user_id,
    cs.set_code,
    card.name as card_name
FROM collection_items ci
INNER JOIN collections c ON ci.collection_id = c.id
INNER JOIN card_sets cs ON ci.card_set_id = cs.id
INNER JOIN cards card ON cs.card_id = card.id
WHERE ci.created_at > NOW() - INTERVAL '24 hours'
ORDER BY ci.created_at DESC
LIMIT 10;
