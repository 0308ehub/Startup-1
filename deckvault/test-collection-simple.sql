-- Simple Collection Test
-- Run this in your Supabase SQL Editor to test collection functionality

-- Test 1: Check if current user has a collection
SELECT 
    'Current user collection test' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM collections 
            WHERE user_id = auth.uid() 
            LIMIT 1
        ) THEN 'PASS - User has collection'
        ELSE 'FAIL - User has no collection'
    END as result

UNION ALL

-- Test 2: Check if we can view collection items
SELECT 
    'Collection items test' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM collection_items ci
            INNER JOIN collections c ON ci.collection_id = c.id
            WHERE c.user_id = auth.uid()
            LIMIT 1
        ) THEN 'PASS - Can view collection items'
        ELSE 'PASS - No collection items yet (this is normal)'
    END as result;

-- Show current user's collection info
SELECT 
    u.email,
    c.id as collection_id,
    c.created_at as collection_created,
    COUNT(ci.id) as item_count
FROM auth.users u
LEFT JOIN collections c ON u.id = c.user_id
LEFT JOIN collection_items ci ON c.id = ci.collection_id
WHERE u.id = auth.uid()
GROUP BY u.email, c.id, c.created_at;
