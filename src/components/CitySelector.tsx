import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Search, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchCities, type CitySearchResult } from '../services/weatherApi';

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: { name: string, id: string }) => void;
}

export function CitySelector({ currentCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedCities, setSavedCities] = useState<string[]>(() => {
    const saved = localStorage.getItem('weather_saved_cities');
    return saved ? JSON.parse(saved) : ['北京', '上海', '广州', '深圳'];
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    localStorage.setItem('weather_saved_cities', JSON.stringify(savedCities));
  }, [savedCities]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchQuery]);

  const handleAddCity = (cityName: string) => {
    if (!savedCities.includes(cityName)) {
      setSavedCities([...savedCities, cityName]);
    }
    onCityChange({ name: cityName, id: cityName });
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveCity = (e: React.MouseEvent, city: string) => {
    e.stopPropagation();
    setSavedCities(savedCities.filter(c => c !== city));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
      >
        <MapPin className="w-5 h-5" />
        <span className="text-lg font-medium">{currentCity}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/40"
            >
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="搜索全球城市..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {searchQuery ? (
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleAddCity(result.name)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                        >
                          <div className="text-left">
                            <div className="text-gray-900 font-medium">{result.name}</div>
                            <div className="text-sm text-gray-500">
                              {[result.admin1, result.country].filter(Boolean).join(', ')}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))
                    ) : (
                      !isSearching && (
                        <div className="text-center py-8 text-gray-500">
                          未找到相关城市
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                      已保存的城市
                    </h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {savedCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            onCityChange({ name: city, id: city });
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group ${currentCity === city
                              ? 'bg-blue-100/50 text-blue-700'
                              : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                          <span className="font-medium">{city}</span>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleRemoveCity(e, city)}
                            className="p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
