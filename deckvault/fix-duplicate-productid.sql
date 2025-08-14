-- Fix duplicate productId issue
-- Run this in your Supabase SQL Editor

-- First, drop the existing cards table
DROP TABLE IF EXISTS cards CASCADE;

-- Recreate the cards table WITHOUT unique constraint on productId
CREATE TABLE cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "productId" TEXT, -- Removed UNIQUE constraint
    "cleanName" TEXT,
    "imageUrl" TEXT,
    "categoryId" TEXT,
    "groupId" TEXT,
    "url" TEXT,
    "modifiedOn" TIMESTAMP WITH TIME ZONE,
    "imageCount" INTEGER,
    "extRarity" TEXT,
    "extNumber" TEXT,
    "extSubType" TEXT,
    "extOracleText" TEXT,
    "lowPrice" DECIMAL(10,2),
    "midPrice" DECIMAL(10,2),
    "highPrice" DECIMAL(10,2),
    "marketPrice" DECIMAL(10,2),
    "directLowPrice" DECIMAL(10,2),
    "subTypeName" TEXT,
    "extP" TEXT,
    "extT" TEXT,
    "extFlavorText" TEXT,
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
CREATE INDEX idx_cards_clean_name ON cards("cleanName");
CREATE INDEX idx_cards_product_id ON cards("productId");
CREATE INDEX idx_cards_category_id ON cards("categoryId");
CREATE INDEX idx_cards_group_id ON cards("groupId");
CREATE INDEX idx_cards_ext_rarity ON cards("extRarity");
CREATE INDEX idx_cards_ext_sub_type ON cards("extSubType");
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_slug ON cards(slug);
CREATE INDEX idx_cards_archetype ON cards(archetype);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Anyone can view cards" ON cards FOR SELECT USING (true);

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND table_schema = 'public'
ORDER BY ordinal_position;
