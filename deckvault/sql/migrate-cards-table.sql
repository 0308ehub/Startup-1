-- Migration script to update cards table for CSV import
-- Run this in your Supabase SQL Editor

-- First, drop the existing cards table if it exists
DROP TABLE IF EXISTS cards CASCADE;

-- Recreate the cards table with the new structure
CREATE TABLE cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT UNIQUE,
    clean_name TEXT,
    image_url TEXT,
    category_id TEXT,
    group_id TEXT,
    url TEXT,
    modified_on TIMESTAMP WITH TIME ZONE,
    image_count INTEGER,
    ext_rarity TEXT,
    ext_number TEXT,
    ext_sub_type TEXT,
    ext_oracle_text TEXT,
    low_price DECIMAL(10,2),
    mid_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    market_price DECIMAL(10,2),
    direct_low_price DECIMAL(10,2),
    sub_type_name TEXT,
    ext_p TEXT,
    ext_t TEXT,
    ext_flavor_text TEXT,
    -- Keep original fields for compatibility
    name TEXT,
    slug TEXT,
    type TEXT,
    attribute TEXT,
    level INTEGER,
    archetype TEXT,
    legal_tcg BOOLEAN DEFAULT true,
    legal_ocg BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for the new structure
CREATE INDEX idx_cards_clean_name ON cards(clean_name);
CREATE INDEX idx_cards_product_id ON cards(product_id);
CREATE INDEX idx_cards_category_id ON cards(category_id);
CREATE INDEX idx_cards_group_id ON cards(group_id);
CREATE INDEX idx_cards_ext_rarity ON cards(ext_rarity);
CREATE INDEX idx_cards_ext_sub_type ON cards(ext_sub_type);
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_slug ON cards(slug);
CREATE INDEX idx_cards_archetype ON cards(archetype);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Anyone can view cards" ON cards FOR SELECT USING (true);
