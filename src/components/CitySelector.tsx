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
        setSavedCities(updatedCities);
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
              className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/30"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 font-bold">我的城市</h3>
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
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索全球城市..."
                        className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 text-gray-400 animate-spin" />
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto bg-gray-50/50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleAddCity(result)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-white transition-colors flex flex-col"
                          >
                            <span className="font-semibold text-gray-900">{result.name}</span>
                            <span className="text-xs text-gray-500">
                              {[result.admin1, result.country].filter(Boolean).join(', ')}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {savedCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        onCityChange(city);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group relative ${currentCity === city.name ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <MapPin className={`w-4 h-4 flex-shrink-0 ${currentCity === city.name ? 'text-white/80' : 'text-gray-400'}`} />
                        <div className="text-left min-w-0">
                          <div className="font-bold leading-tight truncate">{city.name}</div>
                          <div className={`text-xs truncate ${currentCity === city.name ? 'text-white/70' : 'text-gray-500'}`}>{city.condition}</div>
                        </div>
                      </div>
                      <div className="text-2xl font-medium tracking-tighter flex-shrink-0 ml-2">{city.temp}°</div>

                      {savedCities.length > 1 && (
                        <div
                          onClick={(e) => handleDeleteCity(e, city.id)}
                          className={`absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 p-1 rounded-full shadow-sm transition-all transform hover:scale-110 ${currentCity === city.name ? 'bg-white text-blue-500' : 'bg-white border border-gray-100 text-gray-400'
                            }`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
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
