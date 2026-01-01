import { useState, useEffect } from 'react';
import { HourlyForecast } from './HourlyForecast';
import { TenDayForecast } from './TenDayForecast';
import { WeatherDetails } from './WeatherDetails';
import { MapCard } from './MapCard';
import { ThemeToggle } from './ThemeToggle';
import { CitySelector } from './CitySelector';
import { WeatherAnimations } from './WeatherAnimations';
import { motion } from 'motion/react';
import { MoreHorizontal } from 'lucide-react';
import { getWeatherBackground, type WeatherCondition } from '../utils/weatherBackgrounds';
import { useWeatherData } from '../hooks/useWeatherData';


export function WeatherApp() {
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('weather_last_city') || '北京';
  });
  const [isDark, setIsDark] = useState(false);
  const { weatherData, loading, error } = useWeatherData(location);

  useEffect(() => {
    localStorage.setItem('weather_last_city', location);
  }, [location]);

  const handleCityChange = (city: { name: string }) => {
    setLocation(city.name);
  };

  const currentTime = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-blue-100 flex items-center justify-center">
        <div className="text-white text-2xl">加载中...</div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-blue-100 flex items-center justify-center">
        <div className="text-white text-2xl">{error || '无法加载天气数据'}</div>
      </div>
    );
  }

  const backgroundClass = getWeatherBackground(weatherData.condition as WeatherCondition, isDark);

  return (
    <div className={`min-h-screen ${backgroundClass} overflow-auto transition-colors duration-700 relative`}>
      {/* Weather Animations */}
      <WeatherAnimations condition={weatherData.condition} />

      <div className="max-w-5xl mx-auto p-8 relative z-10">
        {/* Header */}
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
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="text-8xl font-extralight mb-2">{weatherData.temp}°</div>
          <div className="text-2xl mb-1">{weatherData.condition}</div>
          <div className="text-lg opacity-90">
            最高 {weatherData.high}° 最低 {weatherData.low}°
          </div>
        </motion.div>

        {/* Hourly Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4"
        >
          <HourlyForecast hourlyData={weatherData.hourly} />
        </motion.div>

        {/* 10-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4"
        >
          <TenDayForecast dailyData={weatherData.daily} />
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-4"
        >
          <MapCard location={weatherData.location} temp={weatherData.temp} condition={weatherData.condition} />
        </motion.div>

        {/* Weather Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <WeatherDetails weatherData={weatherData} />
        </motion.div>

        {/* Footer */}
        <div className="text-center text-white/70 mt-8 pb-8">
          <div className="text-sm">{currentTime} 更新</div>
        </div>
      </div>
    </div>
  );
}