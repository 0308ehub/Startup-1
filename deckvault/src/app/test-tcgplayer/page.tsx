"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TCGPlayerCard {
  id: string;
  name: string;
  cleanName: string;
  imageUrl: string;
  categoryId: number;
  groupId: number;
  url: string;
  modifiedOn: string;
  imageCount: number;
}

export default function TestTCGPlayerPage() {
  const [cards, setCards] = useState<TCGPlayerCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCards = async (search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      params.append('limit', '20');
      
      const response = await fetch(`/api/tcgplayer/cards?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCards(data.data);
      } else {
        setError(data.error || 'Failed to fetch cards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCards(searchTerm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">TCGplayer API Test</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for Yu-Gi-Oh! cards..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading cards...</p>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {card.imageUrl && (
                <div className="relative w-full h-48">
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={() => {
                      // Handle image load error
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{card.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{card.cleanName}</p>
                <p className="text-xs text-gray-500">ID: {card.id}</p>
                <p className="text-xs text-gray-500">Images: {card.imageCount}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && cards.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          No cards found. Try searching for a specific card.
        </div>
      )}
    </div>
  );
}
