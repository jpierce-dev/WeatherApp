import { useState } from 'react';
import { MapPin, Plus, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const cities: City[] = [
  { id: '1', name: '北京', temp: 22, condition: '晴朗' },
  { id: '2', name: '上海', temp: 25, condition: '多云' },
  { id: '3', name: '广州', temp: 28, condition: '阴天' },
  { id: '4', name: '深圳', temp: 27, condition: '小雨' },
  { id: '5', name: '成都', temp: 20, condition: '多云' },
  { id: '6', name: '杭州', temp: 24, condition: '晴朗' },
];

export function CitySelector({ currentCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

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
              onClick={() => setIsOpen(false)}
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
                  <h3 className="text-gray-800">我的位置</h3>
                  <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        onCityChange(city);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                        currentCity === city.name
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
