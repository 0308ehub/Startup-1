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

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: { card: TCGPlayerCard; quantity: number }) => void;
}

export default function AddCardModal({ isOpen, onClose, onAddCard }: AddCardModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TCGPlayerCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TCGPlayerCard | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

    // Load initial cards when modal opens
  useEffect(() => {
    if (isOpen && searchTerm.length < 2) {
      const loadInitialCards = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.append('limit', '20'); // Load 20 popular cards initially

          const response = await fetch(`/api/tcgplayer/cards?${params}`);

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setSearchResults(data.data);
            }
          }
        } catch (error) {
          console.error('Error loading initial cards:', error);
        } finally {
          setLoading(false);
        }
      };

      loadInitialCards();
    }
  }, [isOpen, searchTerm.length]);

  // Search for cards
  useEffect(() => {
    const searchCards = async () => {
      if (searchTerm.length < 2) {
        // Don't clear results when search term is short - keep showing initial cards
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('search', searchTerm);
        params.append('limit', '20');
        
        const response = await fetch(`/api/tcgplayer/cards?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSearchResults(data.data);
          }
        }
      } catch (error) {
        console.error('Error searching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCards, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleCardSelect = (card: TCGPlayerCard) => {
    setSelectedCard(card);
  };

  const handleAddCard = () => {
    if (selectedCard) {
      onAddCard({ card: selectedCard, quantity });
      setSelectedCard(null);
      setQuantity(1);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-6">Add Card to Collection</h2>
          
          {/* Search Input */}
          <div className="mb-4">
            <label htmlFor="card-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search for a card
            </label>
            <input
              id="card-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter card name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="mb-4 flex-1 min-h-0">
            <h3 className="text-lg font-semibold mb-3">
              {searchTerm.length >= 2 ? 'Search Results' : 'Popular Cards'}
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">
                  {searchTerm.length >= 2 ? 'Searching...' : 'Loading cards...'}
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardSelect(card)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCard?.id === card.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 flex-shrink-0">
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{card.name}</h4>
                        <p className="text-sm text-gray-600">ID: {card.id}</p>
                      </div>
                      {selectedCard?.id === card.id && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                {searchTerm.length >= 2 ? 'No cards found' : 'No cards available'}
              </p>
            )}
          </div>

          {/* Selected Card Details */}
          {selectedCard && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Selected Card</h3>
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-32 flex-shrink-0">
                  {selectedCard.imageUrl ? (
                    <Image
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between h-32">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedCard.name}</h4>
                    <p className="text-sm text-gray-600">ID: {selectedCard.id}</p>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleAddCard}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add to Collection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
