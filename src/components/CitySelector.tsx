import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, X, ChevronDown, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchCities, fetchCurrentWeatherSimple, type SearchResult } from '../services/weatherApi';
import { useDebounce } from '../hooks/useDebounce';

interface City {
  id: string;
  name: string;
  temp: number;
  condition: string;
}

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: City) => void;
}

const STORAGE_KEY = 'weather_saved_cities';
const DEFAULT_CITIES: City[] = [
  { id: '1', name: '北京', temp: 0, condition: '加载中' },
  { id: '2', name: '上海', temp: 0, condition: '加载中' },
];

export function CitySelector({ currentCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedCities, setSavedCities] = useState<City[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load cities and update weather on mount
  useEffect(() => {
    const loadAndRefreshCities = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const initialCities: City[] = stored ? JSON.parse(stored) : DEFAULT_CITIES;

      setSavedCities(initialCities);

      try {
        const updatedCities = await Promise.all(
          initialCities.map(async (city) => {
            const weather = await fetchCurrentWeatherSimple(city.name);
            return { ...city, ...weather };
          })
        );
        // Filter out unknown cities
        setSavedCities(updatedCities.filter(c => c.condition !== '未知' && c.condition !== '加载中'));
      } catch (err) {
        console.error('Failed to refresh weather for saved cities', err);
      }
    };

    loadAndRefreshCities();
  }, []);

  // Persist cities to local storage
  useEffect(() => {
    if (savedCities.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCities));
    }
  }, [savedCities]);

  // Handle debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchCities(debouncedSearchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);

  const handleToggleAdding = useCallback(() => {
    setIsAdding(prev => !prev);
    if (isAdding) setSearchQuery('');
  }, [isAdding]);

  const handleAddCity = async (result: SearchResult) => {
    if (savedCities.some(c => c.name === result.name)) {
      setIsAdding(false);
      return;
    }

    const weather = await fetchCurrentWeatherSimple(result.name);
    if (weather.condition === '未知') return; // Don't add unknown cities

    const newCity: City = {
      id: `${Date.now()}-${result.id}`,
      name: result.name,
      ...weather
    };

    setSavedCities(prev => [...prev, newCity]);
    onCityChange(newCity);
    setIsAdding(false);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleDeleteCity = (e: React.MouseEvent, cityId: string) => {
    e.stopPropagation();
    setSavedCities(prev => prev.filter(c => c.id !== cityId));
  };

  const handleBackdropClick = useCallback(() => {
    setIsOpen(false);
    setIsAdding(false);
    setSearchQuery('');
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
      >
        <MapPin className="w-5 h-5" />
        <span className="font-medium">{currentCity}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-80 max-w-[calc(100vw-4rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/30 text-gray-900"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-800 font-bold">我的位置</h3>
                  <button
                    onClick={handleToggleAdding}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {isAdding ? <X className="w-5 h-5 text-gray-500" /> : <Plus className="w-5 h-5 text-gray-500" />}
                  </button>
                </div>

                {isAdding && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mb-4 space-y-2 overflow-hidden"
                  >
                    <div className="relative">
                      <div
                        className="absolute w-5 h-5 flex items-center justify-center"
                        style={{
                          left: '0.875rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#9CA3AF',
                          pointerEvents: 'none',
                          zIndex: 10
                        }}
                      >
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="搜索全球城市..."
                        className="w-full bg-gray-50/50 border border-gray-100 hover:bg-white focus:bg-white focus:border-gray-200 rounded-2xl text-base font-medium placeholder-gray-400 transition-all focus:outline-none shadow-sm"
                        style={{
                          color: '#111827',
                          paddingLeft: '2.75rem',
                          paddingRight: '2.5rem',
                          paddingTop: '0.625rem',
                          paddingBottom: '0.625rem',
                          height: '2.75rem',
                          lineHeight: '1.5rem'
                        }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {isSearching && (
                        <div
                          className="absolute flex items-center justify-center w-5 h-5"
                          style={{
                            right: '0.875rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10
                          }}
                        >
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#3B82F6' }} />
                        </div>
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="max-h-56 overflow-y-auto bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-100/50 divide-y divide-gray-100 shadow-sm">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleAddCity(result)}
                            className="w-full text-left hover:bg-white transition-all flex justify-between group"
                            style={{
                              padding: '0.75rem 1rem',
                              alignItems: 'center',
                              minHeight: '3.5rem'
                            }}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-base" style={{ color: '#111827' }}>{result.name}</span>
                              <span className="text-xs truncate" style={{ color: '#6B7280', marginTop: '0.125rem' }}>
                                {[result.admin1, result.country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" style={{ color: '#3B82F6' }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {savedCities.map((city, index) => (
                    <div
                      key={city.id}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-800 transition-colors group relative"
                    >
                      <button
                        onClick={() => {
                          onCityChange(city);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        {index === 0 ? (
                          <MapPin className="w-4 h-4 flex-shrink-0 text-blue-500" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCity(e as any, city.id);
                            }}
                            className="w-4 h-4 flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <div className="text-left min-w-0">
                          <div className="font-semibold leading-tight truncate">{city.name}</div>
                          <div className="text-xs truncate text-gray-500">{city.condition}</div>
                        </div>
                      </button>
                      <div className="text-2xl font-medium tracking-tighter flex-shrink-0 ml-2 text-gray-800">{city.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
