"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import CardModal from '@/components/CardModal';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

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
  cardType?: string; // Monster, Spell, Trap
  level?: number; // Monster level (1-12)
  attribute?: string; // Monster attribute
  race?: string; // Monster race
}

interface CardWithPrice extends TCGPlayerCard {
  price?: number;
}

type CardTypeFilter = 'all' | 'monster' | 'spell' | 'trap';
type LevelFilter = 'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

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
  const [cardTypeFilter, setCardTypeFilter] = useState<CardTypeFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [userCollection, setUserCollection] = useState<Set<string>>(new Set());

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

  // Filter cards based on search term, card type, and level
  const filteredCards = cards.filter(card => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.cleanName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Card type filter
    const matchesCardType = cardTypeFilter === 'all' || 
      (card.cardType && card.cardType.toLowerCase() === cardTypeFilter);
    
    // Level filter (only applies to monsters)
    const matchesLevel = levelFilter === 'all' || 
      (cardTypeFilter === 'monster' && card.level && card.level.toString() === levelFilter);
    
    return matchesSearch && matchesCardType && matchesLevel;
  });

  const clearFilters = () => {
    setCardTypeFilter('all');
    setLevelFilter('all');
    setSearchTerm('');
  };

  // Load user collection on component mount
  useEffect(() => {
    const loadUserCollection = async () => {
      try {
        const response = await fetch('/api/collection');
        if (response.ok) {
          const data = await response.json();
          const collectionIds = new Set<string>(data.items.map((item: { cardId: string }) => item.cardId));
          setUserCollection(collectionIds);
        }
      } catch (error) {
        console.error('Error loading user collection:', error);
      }
    };

    loadUserCollection();
  }, []);

  const handleAddToCollection = async (card: CardWithPrice) => {
    try {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/collection/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          cardId: card.id,
          cardName: card.name,
          cardImage: card.imageUrl,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Update local state
        setUserCollection(prev => new Set([...prev, card.id]));
      } else {
        throw new Error('Failed to add card to collection');
      }
    } catch (error) {
      console.error('Error adding card to collection:', error);
      throw error;
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
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
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

          {/* Filter Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
              {(cardTypeFilter !== 'all' || levelFilter !== 'all') && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {(cardTypeFilter !== 'all' ? 1 : 0) + (levelFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {(cardTypeFilter !== 'all' || levelFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'monster', 'spell', 'trap'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCardTypeFilter(type)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          cardTypeFilter === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter (only show for monsters) */}
                {cardTypeFilter === 'monster' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monster Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setLevelFilter(level)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            levelFilter === level
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {level === 'all' ? 'All Levels' : `${level}★`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Status */}
        {isSearching && (
          <p className="text-sm text-gray-600 mb-4">
            {searchTerm ? `Searching for "${searchTerm}"...` : 'Showing all cards...'}
          </p>
        )}

        {/* Filter Status */}
        {(cardTypeFilter !== 'all' || levelFilter !== 'all') && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <span>Filtered by:</span>
            {cardTypeFilter !== 'all' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {cardTypeFilter.charAt(0).toUpperCase() + cardTypeFilter.slice(1)}
              </span>
            )}
            {levelFilter !== 'all' && cardTypeFilter === 'monster' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Level {levelFilter}
              </span>
            )}
          </div>
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
            {filteredCards.map((card) => (
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
          {filteredCards.length > 0 && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Showing {filteredCards.length} of {cards.length} card{filteredCards.length !== 1 ? 's' : ''}
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
        allCards={filteredCards}
        currentIndex={selectedCardIndex}
        onNavigate={handleNavigate}
        onAddToCollection={handleAddToCollection}
        isInCollection={selectedCard ? userCollection.has(selectedCard.id) : false}
      />
    </div>
  );
}
