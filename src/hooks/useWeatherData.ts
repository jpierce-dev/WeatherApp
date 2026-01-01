import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData, type WeatherData } from '../services/weatherApi';

/**
 * Custom hook to manage weather data fetching logic
 * @param city The city name to fetch weather for
 */
export function useWeatherData(city: string) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = useCallback(async (isManual = false) => {
    try {
      if (!isManual) setLoading(true);
      setError(null);

      const data = await fetchWeatherData(city);
      setWeatherData(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : '无法加载天气数据');
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const refetch = useCallback(() => {
    loadWeatherData(true);
  }, [loadWeatherData]);

  return {
    weatherData,
    loading,
    error,
    refetch
  };
}
