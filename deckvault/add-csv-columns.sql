-- Add missing CSV columns to the existing cards table
-- Run this in your Supabase SQL Editor

-- Add all the missing columns from the CSV
ALTER TABLE cards ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS clean_name TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS modified_on TIMESTAMP WITH TIME ZONE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_count INTEGER;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ext_rarity TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ext_number TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ext_sub_type TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ext_oracle_text TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS low_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS mid_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS high_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS market_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS direct_low_price DECIMAL(10,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS sub_type_name TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ext_p TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ext_t TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ext_flavor_text TEXT;

-- Add unique constraint on product_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cards_product_id_key'
    ) THEN
        ALTER TABLE cards ADD CONSTRAINT cards_product_id_key UNIQUE (product_id);
    END IF;
END $$;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_cards_clean_name ON cards(clean_name);
CREATE INDEX IF NOT EXISTS idx_cards_product_id ON cards(product_id);
CREATE INDEX IF NOT EXISTS idx_cards_category_id ON cards(category_id);
CREATE INDEX IF NOT EXISTS idx_cards_group_id ON cards(group_id);
CREATE INDEX IF NOT EXISTS idx_cards_ext_rarity ON cards(ext_rarity);
CREATE INDEX IF NOT EXISTS idx_cards_ext_sub_type ON cards(ext_sub_type);

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND table_schema = 'public'
AND column_name IN (
    'product_id', 'clean_name', 'image_url', 'category_id', 'group_id', 
    'url', 'modified_on', 'image_count', 'ext_rarity', 'ext_number', 
    'ext_sub_type', 'ext_oracle_text', 'low_price', 'mid_price', 
    'high_price', 'market_price', 'direct_low_price', 'sub_type_name', 
    'ext_p', 'ext_t', 'ext_flavor_text'
)
ORDER BY column_name;
