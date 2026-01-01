import { useState, useEffect } from 'react';
import { fetchWeatherData, type WeatherData } from '../services/weatherApi';

export function useWeatherData(city: string) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWeatherData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWeatherData(city);
        
        if (isMounted) {
          setWeatherData(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('无法加载天气数据');
          setLoading(false);
        }
      }
    }

    loadWeatherData();

    return () => {
      isMounted = false;
    };
  }, [city]);

  return { weatherData, loading, error };
}
