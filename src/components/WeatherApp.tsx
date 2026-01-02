import { useState, useEffect, useCallback, useMemo } from 'react';
import { HourlyForecast } from './HourlyForecast';
import { FifteenDayForecast } from './FifteenDayForecast';
import { WeatherDetails } from './WeatherDetails';
import { MapCard } from './MapCard';
import { ThemeToggle } from './ThemeToggle';
import { CitySelector } from './CitySelector';
import { WeatherAnimations } from './WeatherAnimations';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { getWeatherBackground, getThemeColor, type WeatherCondition } from '../utils/weatherBackgrounds';
import { useWeatherData } from '../hooks/useWeatherData';

interface City {
  id: string;
  name: string;
  temp: number;
  condition: string;
}

export function WeatherApp() {
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('weather_last_location') || '北京';
  });
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const { weatherData, loading, error, refetch } = useWeatherData(location);

  // Detect current city on mount if no last location is saved
  useEffect(() => {
    const hasLastLocation = localStorage.getItem('weather_last_location');

    const detectLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
            if (city) {
              const cityName = city.replace(/市|区|县/g, '');
              setLocation(cityName);
              if (!hasLastLocation) {
                localStorage.setItem('weather_last_location', cityName);
              }
            }
          } catch (err) {
            console.error("Geolocation failed to get city name", err);
          }
        }, (err) => {
          console.warn("Geolocation permission denied or failed", err);
        });
      }
    };

    if (!hasLastLocation) {
      detectLocation();
    }
  }, []);

  // Live time update
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleCityChange = useCallback((city: City) => {
    setLocation(city.name);
    localStorage.setItem('weather_last_location', city.name);
  }, []);

  const backgroundClass = useMemo(() =>
    getWeatherBackground((weatherData?.condition || '晴朗') as WeatherCondition, isDark),
    [weatherData?.condition, isDark]
  );

  // Dynamic theme color for Android/Chrome
  useEffect(() => {
    const color = getThemeColor((weatherData?.condition || '晴朗') as WeatherCondition, isDark);

    // Update theme-color meta tag
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', color);

    // Also update apple-mobile-web-app-status-bar-style if needed, 
    // although black-translucent usually handles it on iOS.
  }, [weatherData?.condition, isDark]);

  return (
    <div className={`min-h-screen ${backgroundClass} overflow-auto transition-colors duration-700 relative`}>
      <AnimatePresence>
        {loading && !weatherData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
          >
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <WeatherAnimations condition={weatherData?.condition || '晴朗'} />

      <div className="max-w-5xl mx-auto p-8 pt-[max(2rem,env(safe-area-inset-top))] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white mb-12"
        >
          <div className="flex items-center justify-between mb-2">
            <CitySelector currentCity={location} onCityChange={handleCityChange} />
            <div className="flex items-center gap-2">
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
              <button
                onClick={refetch}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="刷新"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>
          </div>

          {error ? (
            <div className="py-20 text-center">
              <p className="text-xl opacity-80 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors"
              >
                重试
              </button>
            </div>
          ) : weatherData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={location}
            >
              <div className="text-8xl font-extralight mb-2 tracking-tighter">{weatherData.temp}°</div>
              <div className="text-2xl mb-1 font-medium">{weatherData.condition}</div>
              <div className="text-lg opacity-90">
                最高 {weatherData.high}° 最低 {weatherData.low}°
              </div>
            </motion.div>
          )}
        </motion.div>

        {weatherData && !error && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4"
            >
              <HourlyForecast hourlyData={weatherData.hourly} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
            >
              <FifteenDayForecast dailyData={weatherData.daily} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-4"
            >
              <MapCard location={weatherData.location} temp={weatherData.temp} condition={weatherData.condition} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <WeatherDetails weatherData={weatherData} />
            </motion.div>

            <div className="text-center text-white/70 mt-8 pb-8">
              <div className="text-sm">{currentTime} 更新</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}