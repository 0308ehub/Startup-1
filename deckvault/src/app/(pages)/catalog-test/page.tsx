"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';

interface Card {
  id: string;
  name: string;
  cleanName: string;
  imageUrl: string;
  categoryId: number;
  groupId: number;
  url: string;
  modifiedOn: string;
  imageCount: number;
  price?: number;
}

export default function CatalogTestPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);

  // Mock card data with known working product IDs
  const mockCards: Card[] = useMemo(() => [
    {
      id: "21715",
      name: "4-Starred Ladybug of Doom",
      cleanName: "4 Starred Ladybug of Doom",
      imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21715_200w.jpg",
      categoryId: 2,
      groupId: 1,
      url: "",
      modifiedOn: new Date().toISOString(),
      imageCount: 1,
    },
    {
      id: "21716",
      name: "7 Colored Fish",
      cleanName: "7 Colored Fish",
      imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21716_200w.jpg",
      categoryId: 2,
      groupId: 1,
      url: "",
      modifiedOn: new Date().toISOString(),
      imageCount: 1,
    },
    {
      id: "21717",
      name: "7 Completed",
      cleanName: "7 Completed",
      imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21717_200w.jpg",
      categoryId: 2,
      groupId: 1,
      url: "",
      modifiedOn: new Date().toISOString(),
      imageCount: 1,
    },
    {
      id: "21718",
      name: "8-Claws Scorpion",
      cleanName: "8 Claws Scorpion", 
      imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21718_200w.jpg",
      categoryId: 2,
      groupId: 1,
      url: "",
      modifiedOn: new Date().toISOString(),
      imageCount: 1,
    },
    {
      id: "21719",
      name: "A Cat of Ill Omen",
      cleanName: "A Cat of Ill Omen",
      imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21719_200w.jpg",
      categoryId: 2,
      groupId: 1,
      url: "",
      modifiedOn: new Date().toISOString(),
      imageCount: 1,
    },
    {
      id: "21720",
      name: "A Feint Plan",
      cleanName: "A Feint Plan",
      imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21720_200w.jpg",
      categoryId: 2,
      groupId: 1,
      url: "",
      modifiedOn: new Date().toISOString(),
      imageCount: 1,
    }
  ], []);

  const fetchPrices = useCallback(async (cardIds: string[]) => {
    try {
      setPricesLoading(true);
      const productIds = cardIds.map(id => parseInt(id));
      
      const response = await fetch('/api/tcgplayer/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update cards with price information
        setCards(prevCards => 
          prevCards.map(card => ({
            ...card,
            price: data.data[parseInt(card.id)] || undefined
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialize with mock cards
    setCards(mockCards);
    
    // Fetch prices for the mock cards
    const cardIds = mockCards.map(card => card.id);
    fetchPrices(cardIds);
  }, [fetchPrices, mockCards]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🧪 Catalog Pricing Test</h1>
        <p className="text-gray-600 mb-4">
          This page demonstrates the working pricing functionality using our updated TCGPlayer API.
          The prices are fetched in real-time from TCGPlayer using the correct pricing endpoint.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">✅ What&apos;s Working:</h2>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Authentication with TCGPlayer API</li>
            <li>• Direct pricing endpoint integration</li>
            <li>• Best price selection (market price priority)</li>
            <li>• Multiple product price fetching</li>
            <li>• Real-time price updates</li>
          </ul>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="relative aspect-[3/4] bg-gray-100">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  onError={(e) => {
                    // Handle image error
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-12 h-16 bg-gray-400 rounded mx-auto mb-2"></div>
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm leading-tight line-clamp-2" title={card.name}>
                {card.name}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">ID: {card.id}</p>
                {card.price !== undefined ? (
                  <div className="text-right">
                    <span className="text-sm font-semibold text-green-600">
                      ${card.price.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500">Market</p>
                  </div>
                ) : pricesLoading ? (
                  <div className="text-right">
                    <div className="animate-pulse bg-gray-200 h-4 w-12 rounded mb-1"></div>
                    <div className="animate-pulse bg-gray-200 h-3 w-8 rounded"></div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No price</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => {
            const cardIds = cards.map(card => card.id);
            fetchPrices(cardIds);
          }}
          disabled={pricesLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pricesLoading ? 'Loading Prices...' : 'Refresh Prices'}
        </button>
      </div>

      {/* Technical Details */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="font-semibold text-gray-800 mb-4">🔧 Technical Implementation</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>API Endpoint:</strong> <code>/api/tcgplayer/prices</code></p>
          <p><strong>Authentication:</strong> OAuth 2.0 with client credentials flow</p>
          <p><strong>Pricing Strategy:</strong> Market price → Mid price → Low price (best available)</p>
          <p><strong>Data Source:</strong> TCGPlayer API v1.39.0 pricing endpoint</p>
          <p><strong>Update Logic:</strong> Real-time price fetching on component mount and manual refresh</p>
        </div>
      </div>
    </div>
  );
}
