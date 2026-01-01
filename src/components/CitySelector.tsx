import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, ChevronDown, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchCities, fetchCurrentWeatherSimple, type SearchResult } from '../services/weatherApi';

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

  // Load cities from local storage or use defaults
  useEffect(() => {
    const loadCities = async () => {
      const stored = localStorage.getItem('weather_saved_cities');
      let initialCities = stored ? JSON.parse(stored) : DEFAULT_CITIES;

      // Update weather for all saved cities
      const updatedCities = await Promise.all(
        initialCities.map(async (city: City) => {
          const weather = await fetchCurrentWeatherSimple(city.name);
          return { ...city, ...weather };
        })
      );

      setSavedCities(updatedCities);
    };

    loadCities();
  }, []);

  // Save cities to local storage whenever they change
  useEffect(() => {
    if (savedCities.length > 0) {
      localStorage.setItem('weather_saved_cities', JSON.stringify(savedCities));
    }
  }, [savedCities]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCities(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCity = async (result: SearchResult) => {
    // Check if already exists
    if (savedCities.some(c => c.name === result.name)) {
      setIsAdding(false);
      setSearchQuery('');
      return;
    }

    const weather = await fetchCurrentWeatherSimple(result.name);
    const newCity: City = {
      id: Date.now().toString(),
      name: result.name,
      ...weather
    };

    const newCities = [...savedCities, newCity];
    setSavedCities(newCities);
    onCityChange(newCity);
    setIsAdding(false);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleDeleteCity = (e: React.MouseEvent, cityId: string) => {
    e.stopPropagation();
    const newCities = savedCities.filter(c => c.id !== cityId);
    setSavedCities(newCities);
    if (newCities.length === 0) {
      // Keep at least one city if user deletes all, maybe revert to default
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
      >
        <MapPin className="w-5 h-5" />
        <span>{currentCity}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setIsAdding(false);
              }}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/30"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-800 font-medium">我的位置</h3>
                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`p-1 rounded-full transition-colors ${isAdding ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                  >
                    {isAdding ? <X className="w-5 h-5 text-gray-600" /> : <Plus className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>

                {isAdding && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索全球城市..."
                        className="w-full bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 animate-spin" />
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto bg-white rounded-lg border border-gray-100 shadow-sm">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleAddCity(result)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="font-medium">{result.name}</div>
                            <div className="text-xs text-gray-400">
                              {[result.admin1, result.country].filter(Boolean).join(', ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {savedCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        onCityChange(city);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group relative ${currentCity === city.name
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div className="text-left">
                          <div className="text-gray-800">{city.name}</div>
                          <div className="text-sm text-gray-500">{city.condition}</div>
                        </div>
                      </div>
                      <div className="text-2xl text-gray-800">{city.temp}°</div>

                      {/* Delete button (visible on hover) */}
                      {savedCities.length > 1 && (
                        <div
                          onClick={(e) => handleDeleteCity(e, city.id)}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-all"
                        >
                          <X className="w-3 h-3 text-gray-400" />
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
