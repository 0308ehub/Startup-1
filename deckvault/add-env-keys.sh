#!/bin/bash

# Add TCGplayer API keys to .env.local
echo "Adding TCGplayer API keys to .env.local..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

# Add TCGplayer keys if they don't already exist
if ! grep -q "TCGPLAYER_PUBLIC_KEY" .env.local; then
    echo "" >> .env.local
    echo "# TCGplayer API" >> .env.local
    echo "TCGPLAYER_PUBLIC_KEY=b17d9903-5004-4258-a6c3-56e35dd00605" >> .env.local
    echo "TCGPLAYER_PRIVATE_KEY=0c3a6514-a658-4b53-bee7-8aaebcd0c668" >> .env.local
    echo "✅ TCGplayer API keys added to .env.local"
else
    echo "⚠️  TCGplayer API keys already exist in .env.local"
fi

echo "Done! You can now test the catalog page with real Yu-Gi-Oh! card data."
