"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import CardModal from '@/components/CardModal';

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

interface CardWithPrice extends TCGPlayerCard {
  price?: number;
}

export default function CatalogPage() {
  const [cards, setCards] = useState<CardWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [pricesLoading, setPricesLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardWithPrice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  const ITEMS_PER_PAGE = 100;

  const loadCards = useCallback(async (offset: number = 0, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('offset', offset.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      
      const response = await fetch(`/api/tcgplayer/cards?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newCards = data.data.map((card: TCGPlayerCard) => ({ ...card, price: undefined }));
        
        if (reset) {
          setCards(newCards);
          setCurrentPage(0);
          setImageErrors(new Set()); // Reset image errors
        } else {
          setCards(prev => [...prev, ...newCards]);
        }
        setHasMore(data.data.length === ITEMS_PER_PAGE);
        
        // Fetch prices for the new cards
        const cardIds = data.data.map((card: TCGPlayerCard) => card.id);
        fetchPrices(cardIds);
      } else {
        setError(data.error || 'Failed to fetch cards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (search: string) => {
    try {
      setSearchLoading(true);
      setIsSearching(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('search', search);
      params.append('limit', '100');
      
      const response = await fetch(`/api/tcgplayer/cards?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newCards = data.data.map((card: TCGPlayerCard) => ({ ...card, price: undefined }));
        setCards(newCards);
        setCurrentPage(0);
        setHasMore(false); // Search results don't have pagination
        setImageErrors(new Set()); // Reset image errors
        
        // Fetch prices for the search results
        const cardIds = data.data.map((card: TCGPlayerCard) => card.id);
        fetchPrices(cardIds);
      } else {
        setError(data.error || 'Failed to search cards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        setIsSearching(false);
        loadCards(0, true); // Reset to first page
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch, loadCards]);

  const loadMore = () => {
    if (!isSearching && hasMore && !loading) {
      const nextOffset = (currentPage + 1) * ITEMS_PER_PAGE;
      setCurrentPage(prev => prev + 1);
      loadCards(nextOffset);
    }
  };

  const handleImageError = (cardId: string) => {
    setImageErrors(prev => new Set(prev).add(cardId));
  };

  const handleCardClick = (card: CardWithPrice) => {
    const index = cards.findIndex(c => c.id === card.id);
    setSelectedCardIndex(index);
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    let newIndex = selectedCardIndex;
    
    if (direction === 'prev' && selectedCardIndex > 0) {
      newIndex = selectedCardIndex - 1;
    } else if (direction === 'next' && selectedCardIndex < cards.length - 1) {
      newIndex = selectedCardIndex + 1;
    }
    
    if (newIndex !== selectedCardIndex) {
      setSelectedCardIndex(newIndex);
      setSelectedCard(cards[newIndex]);
    }
  };

  const fetchPrices = async (cardIds: string[]) => {
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
      // Don't show error to user for price fetching failures
    } finally {
      setPricesLoading(false);
    }
  };

  useEffect(() => {
    loadCards(0, true);
  }, [loadCards]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Yu-Gi-Oh! Card Catalog</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for cards (e.g., 'Blue-Eyes')..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Search Status */}
        {isSearching && (
          <p className="text-sm text-gray-600 mb-4">
            {searchTerm ? `Searching for "${searchTerm}"...` : 'Showing all cards...'}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Cards Grid */}
      {loading && cards.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading Yu-Gi-Oh! cards...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {cards.map((card) => (
              <div 
                key={card.id} 
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 bg-white cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleCardClick(card)}
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  {card.imageUrl && !imageErrors.has(card.id) ? (
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      onError={() => handleImageError(card.id)}
                      priority={cards.indexOf(card) < 10} // Prioritize first 10 images
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
                        <p className="text-xs text-gray-500">Lowest</p>
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

          {/* Load More Button */}
          {!isSearching && hasMore && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="px-8 py-3"
              >
                {loading ? 'Loading...' : 'Load More Cards'}
              </Button>
            </div>
          )}

          {/* No Results */}
          {cards.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? `No cards found matching "${searchTerm}"` : 'No cards available'}
              </p>
            </div>
          )}

          {/* Results Count */}
          {cards.length > 0 && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Showing {cards.length} card{cards.length !== 1 ? 's' : ''}
              {isSearching && searchTerm && ` for "${searchTerm}"`}
            </div>
          )}
        </>
      )}

      {/* Card Modal */}
      <CardModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        allCards={cards}
        currentIndex={selectedCardIndex}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
