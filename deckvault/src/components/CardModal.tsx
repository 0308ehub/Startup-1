"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TCGPLAYER_CONFIG } from '@/lib/tcgplayer/config';

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

interface CardModalProps {
  card: CardWithPrice | null;
  isOpen: boolean;
  onClose: () => void;
  allCards: CardWithPrice[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function CardModal({ 
  card, 
  isOpen, 
  onClose, 
  allCards, 
  currentIndex, 
  onNavigate
}: CardModalProps) {
  const [imageError, setImageError] = useState(false);

  // Reset image error when card changes
  useEffect(() => {
    setImageError(false);
  }, [card?.id]);

  // Handle escape key and arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('next');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen || !card) return null;

  const tcgPlayerLink = TCGPLAYER_CONFIG.generateCardLink(card.name, card.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allCards.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation Arrows */}
        {hasPrev && (
          <button
            onClick={() => onNavigate('prev')}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous card"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {hasNext && (
          <button
            onClick={() => onNavigate('next')}
            className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Next card"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div className="flex flex-col lg:flex-row h-full">
          {/* Left side - Card Image */}
          <div className="lg:w-1/2 p-6 flex items-center justify-center bg-gray-50">
            <div className="relative w-full max-w-sm aspect-[3/4]">
              {card.imageUrl && !imageError ? (
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-contain rounded-lg shadow-lg"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-16 h-20 bg-gray-400 rounded mx-auto mb-2"></div>
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Card Details */}
          <div className="lg:w-1/2 p-6 flex flex-col">
            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{card.name}</h2>
              <p className="text-gray-600">Product ID: {card.id}</p>
              {/* Navigation indicator */}
              <p className="text-sm text-gray-500 mt-1">
                {currentIndex + 1} of {allCards.length}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Add to List
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Portfolio
              </button>
            </div>

            {/* Pricing Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Market Pricing</h3>
              
              {/* Raw Card Pricing */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Raw</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TCGPlayer (Lowest)</span>
                    <span className="font-semibold">
                      {card.price !== undefined ? `$${card.price.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">eBay</span>
                    <span className="font-semibold">Market Price</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card Market</span>
                    <span className="font-semibold">Market Price</span>
                  </div>
                </div>
              </div>

              {/* PSA Graded Pricing */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">PSA</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">PSA 10</span>
                    <span className="font-semibold">Market Price</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PSA 9</span>
                    <span className="font-semibold">Market Price</span>
                  </div>
                </div>
              </div>

              {/* Population History (Collapsed) */}
              <div className="border-t pt-3">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Population History</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* TCGPlayer Link */}
            <div className="mt-auto">
              <a
                href={tcgPlayerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View on TCGPlayer
              </a>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Opens in new tab • Affiliate link
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
