"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import AddCardModal from '../../../components/AddCardModal';
import Image from 'next/image';

interface CollectionItem {
  id: string;
  cardId: string;
  cardName: string;
  cardImage: string;
  setCode: string;
  cardNumber: string;
  rarity: string;
  language: string;
  quantity: number;
  price: number;
  priceChange?: number;
  lastUpdated: string;
  cardType?: string; // Monster, Spell, Trap
  level?: number; // Monster level (1-12)
  attribute?: string; // Monster attribute
  race?: string; // Monster race
}

type CardTypeFilter = 'all' | 'monster' | 'spell' | 'trap';
type LevelFilter = 'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [sortField, setSortField] = useState<'cardNumber' | 'cardName' | 'price' | 'rarity' | 'language'>('cardNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState<CardTypeFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch real collection data from API
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/collection', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched collection data:', data);
          setCollection(data.items || []);
        } else {
          console.error('Failed to fetch collection:', response.status);
          setCollection([]);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setCollection([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, []);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCollection = [...collection].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'price') {
      aValue = a.price;
      bValue = b.price;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredCollection = sortedCollection.filter(item => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      item.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cardNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Card type filter
    const matchesCardType = cardTypeFilter === 'all' || 
      (item.cardType && item.cardType.toLowerCase() === cardTypeFilter);
    
    // Level filter (only applies to monsters)
    const matchesLevel = levelFilter === 'all' || 
      (cardTypeFilter === 'monster' && item.level && item.level.toString() === levelFilter);
    
    return matchesSearch && matchesCardType && matchesLevel;
  });

  const clearFilters = () => {
    setCardTypeFilter('all');
    setLevelFilter('all');
    setSearchTerm('');
  };

  const totalCards = collection.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = collection.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const valueChange = collection.reduce((sum, item) => sum + (item.priceChange || 0) * item.quantity, 0);

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      'UR': 'bg-yellow-100 text-yellow-800',
      'SCR': 'bg-purple-100 text-purple-800',
      'SLR': 'bg-pink-100 text-pink-800',
      'GHR': 'bg-gray-100 text-gray-800',
      'PGR': 'bg-blue-100 text-blue-800',
      'QCSCR': 'bg-orange-100 text-orange-800'
    };
    return colors[rarity] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Public</span>
            <span>Edited just now</span>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="flex gap-4">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span className="text-lg font-semibold">{totalCards.toLocaleString()}</span>
            </div>
            <span className="text-sm text-gray-600">Cards</span>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-lg font-semibold">${totalValue.toFixed(2)}</span>
            </div>
            <span className="text-sm text-gray-600">Sum</span>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${valueChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className={`text-lg font-semibold ${valueChange >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {valueChange >= 0 ? '+' : ''}${valueChange.toFixed(2)}
              </span>
            </div>
            <span className="text-sm text-gray-600">Shift (1M)</span>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Enter name, card number or set number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
            {(cardTypeFilter !== 'all' || levelFilter !== 'all') && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {(cardTypeFilter !== 'all' ? 1 : 0) + (levelFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          {(cardTypeFilter !== 'all' || levelFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
          </button>
        </div>
        
        <Button 
          onClick={() => setIsAddCardModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add cards
        </Button>
        
        <Button variant="secondary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filter
        </Button>
        
        <div className="flex items-center gap-2">
          <input type="checkbox" id="fullscreen" className="rounded" />
          <label htmlFor="fullscreen" className="text-sm">Fullscreen</label>
        </div>
        
        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Customize column
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border mb-4">
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

      {/* Collection Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('cardNumber')}
                  >
                    <div className="flex items-center gap-1">
                      NUMBER
                      {sortField === 'cardNumber' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                                     <th 
                     className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                     onClick={() => handleSort('cardName')}
                   >
                     <div className="flex items-center gap-1">
                       NAME
                       {sortField === 'cardName' && (
                         <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                         </svg>
                       )}
                     </div>
                   </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      PRICE
                      {sortField === 'price' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rarity')}
                  >
                    <div className="flex items-center gap-1">
                      RARITY
                      {sortField === 'rarity' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('language')}
                  >
                    <div className="flex items-center gap-1">
                      LANGUAGE
                      {sortField === 'language' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCollection.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-black text-white px-2 py-1 rounded-full text-xs font-medium">
                        {item.quantity}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.cardNumber}
                    </td>
                                         <td className="px-4 py-3">
                       <div className="relative w-12 h-16">
                         <Image 
                           src={item.cardImage} 
                           alt={item.cardName}
                           fill
                           className="object-cover rounded"
                         />
                       </div>
                     </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.cardName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                        {item.priceChange !== undefined && (
                          <span className={`text-xs ${item.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.priceChange >= 0 ? '+' : ''}{item.priceChange.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{item.language}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

             {/* Add Card Modal */}
       <AddCardModal
         isOpen={isAddCardModalOpen}
         onClose={() => setIsAddCardModalOpen(false)}
         onAddCard={async (cardData: { card: { id: string; name: string; imageUrl: string }; quantity: number }) => {
           try {
             // Add card to collection via API
             const response = await fetch('/api/collection/items', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               credentials: 'include',
               body: JSON.stringify({
                 cardId: cardData.card.id,
                 cardName: cardData.card.name,
                 cardImage: cardData.card.imageUrl,
                 quantity: cardData.quantity
               })
             });

             if (response.ok) {
               console.log('Card added successfully');
               // Refresh collection data
               const collectionResponse = await fetch('/api/collection', {
                 credentials: 'include'
               });
               
               if (collectionResponse.ok) {
                 const data = await collectionResponse.json();
                 setCollection(data.items || []);
               }
             } else {
               console.error('Failed to add card:', response.status);
               const error = await response.text();
               console.error('Error details:', error);
             }
           } catch (error) {
             console.error('Error adding card:', error);
           }
           
           setIsAddCardModalOpen(false);
         }}
       />
    </div>
  );
}