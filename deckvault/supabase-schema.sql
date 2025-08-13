-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    attribute TEXT,
    level INTEGER,
    archetype TEXT,
    image_url TEXT,
    legal_tcg BOOLEAN DEFAULT true,
    legal_ocg BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_sets table
CREATE TABLE IF NOT EXISTS card_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    set_code TEXT NOT NULL,
    set_name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    edition TEXT,
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_items table
CREATE TABLE IF NOT EXISTS collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
    card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    condition TEXT DEFAULT 'Near Mint',
    purchase_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, card_set_id)
);

-- Create decks table
CREATE TABLE IF NOT EXISTS decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'Advanced',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deck_slots table
CREATE TABLE IF NOT EXISTS deck_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE NOT NULL,
    section TEXT NOT NULL, -- 'main', 'extra', 'side'
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(deck_id, card_set_id, section)
);

-- Create prices table
CREATE TABLE IF NOT EXISTS prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL, -- 'TCGPlayer', 'CardMarket', etc.
    currency TEXT NOT NULL DEFAULT 'USD',
    value DECIMAL(10,2) NOT NULL,
    as_of TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SOLD', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_archetype ON cards(archetype);
CREATE INDEX IF NOT EXISTS idx_card_sets_card_id ON card_sets(card_id);
CREATE INDEX IF NOT EXISTS idx_card_sets_set_code ON card_sets(set_code);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_card_set_id ON collection_items(card_set_id);
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_deck_slots_deck_id ON deck_slots(deck_id);
CREATE INDEX IF NOT EXISTS idx_prices_card_set_id ON prices(card_set_id);
CREATE INDEX IF NOT EXISTS idx_prices_as_of ON prices(as_of);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_card_set_id ON listings(card_set_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Collections: Users can only see their own collections
CREATE POLICY "Users can view own collections" ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON collections FOR DELETE USING (auth.uid() = user_id);

-- Collection items: Users can only see items in their own collections
CREATE POLICY "Users can view own collection items" ON collection_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM collections 
        WHERE collections.id = collection_items.collection_id 
        AND collections.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own collection items" ON collection_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM collections 
        WHERE collections.id = collection_items.collection_id 
        AND collections.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own collection items" ON collection_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM collections 
        WHERE collections.id = collection_items.collection_id 
        AND collections.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own collection items" ON collection_items FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM collections 
        WHERE collections.id = collection_items.collection_id 
        AND collections.user_id = auth.uid()
    )
);

-- Decks: Users can only see their own decks
CREATE POLICY "Users can view own decks" ON decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decks" ON decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON decks FOR DELETE USING (auth.uid() = user_id);

-- Deck slots: Users can only see slots in their own decks
CREATE POLICY "Users can view own deck slots" ON deck_slots FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = deck_slots.deck_id 
        AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own deck slots" ON deck_slots FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = deck_slots.deck_id 
        AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own deck slots" ON deck_slots FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = deck_slots.deck_id 
        AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own deck slots" ON deck_slots FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = deck_slots.deck_id 
        AND decks.user_id = auth.uid()
    )
);

-- Cards and card_sets: Public read access
CREATE POLICY "Anyone can view cards" ON cards FOR SELECT USING (true);
CREATE POLICY "Anyone can view card sets" ON card_sets FOR SELECT USING (true);
CREATE POLICY "Anyone can view prices" ON prices FOR SELECT USING (true);

-- Listings: Public read access, authenticated users can create/update their own
CREATE POLICY "Anyone can view listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can create own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = seller_id);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email);
    
    INSERT INTO collections (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collection_items_updated_at BEFORE UPDATE ON collection_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
