-- Comprehensive cleanup script for Supabase database
-- Run this FIRST before running the main schema

-- Disable triggers temporarily to avoid conflicts
SET session_replication_role = replica;

-- Drop all triggers first (with CASCADE to handle dependencies)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles CASCADE;
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections CASCADE;
DROP TRIGGER IF EXISTS update_collection_items_updated_at ON collection_items CASCADE;
DROP TRIGGER IF EXISTS update_decks_updated_at ON decks CASCADE;
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables (in reverse order of dependencies)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS prices CASCADE;
DROP TABLE IF EXISTS deck_slots CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS card_sets CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all indexes (they should be dropped with tables, but just in case)
DROP INDEX IF EXISTS idx_profiles_username CASCADE;
DROP INDEX IF EXISTS idx_profiles_email CASCADE;
DROP INDEX IF EXISTS idx_collections_user_id CASCADE;
DROP INDEX IF EXISTS idx_cards_name CASCADE;
DROP INDEX IF EXISTS idx_cards_slug CASCADE;
DROP INDEX IF EXISTS idx_cards_archetype CASCADE;
DROP INDEX IF EXISTS idx_card_sets_card_id CASCADE;
DROP INDEX IF EXISTS idx_card_sets_set_code CASCADE;
DROP INDEX IF EXISTS idx_collection_items_collection_id CASCADE;
DROP INDEX IF EXISTS idx_collection_items_card_set_id CASCADE;
DROP INDEX IF EXISTS idx_decks_user_id CASCADE;
DROP INDEX IF EXISTS idx_deck_slots_deck_id CASCADE;
DROP INDEX IF EXISTS idx_prices_card_set_id CASCADE;
DROP INDEX IF EXISTS idx_prices_as_of CASCADE;
DROP INDEX IF EXISTS idx_listings_seller_id CASCADE;
DROP INDEX IF EXISTS idx_listings_card_set_id CASCADE;
DROP INDEX IF EXISTS idx_listings_status CASCADE;
DROP INDEX IF EXISTS idx_orders_buyer_id CASCADE;
DROP INDEX IF EXISTS idx_orders_listing_id CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify cleanup
SELECT 'Cleanup completed successfully' as status;
