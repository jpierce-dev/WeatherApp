
// OpenMeteo Weather API Implementation

// Geocoding API for city search
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
// Weather API
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
  location: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  hourly: HourlyData[];
  daily: DailyData[];
}

export interface HourlyData {
  time: string;
  temp: number;
  icon: string;
  windSpeed: number;
}

export interface DailyData {
  day: string;
  icon: string;
  low: number;
  high: number;
  windSpeed: number;
}

export interface CitySearchResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string; // State/Province
  latitude: number;
  longitude: number;
}

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `${GEO_API_URL}?name=${encodeURIComponent(query)}&count=10&language=zh&format=json`
    );
    const data = await response.json();

    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      admin1: item.admin1,
      latitude: item.latitude,
      longitude: item.longitude,
    }));
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

export async function fetchWeatherData(city: string): Promise<WeatherData> {
  try {
    // 1. Get coordinates for the city
    const geoResponse = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }

    const { latitude, longitude, name } = geoData.results[0];

    // 2. Get weather data
    const weatherResponse = await fetch(
      `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,wind_speed_10m_max&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather API error');
    }

    const weatherData = await weatherResponse.json();

    return transformOpenMeteoData(name, weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

function transformOpenMeteoData(cityName: string, data: any): WeatherData {
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  return {
    location: cityName,
    temp: Math.round(current.temperature_2m),
    condition: mapWeatherCodeToCondition(current.weather_code),
    high: Math.round(daily.temperature_2m_max[0]),
    low: Math.round(daily.temperature_2m_min[0]),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    pressure: Math.round(current.surface_pressure),
    visibility: Math.round(current.visibility / 1000), // convert meters to km
    uvIndex: Math.round(daily.uv_index_max[0]),
    feelsLike: Math.round(current.apparent_temperature),
    sunrise: new Date(daily.sunrise[0]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(daily.sunset[0]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    hourly: transformHourlyData(hourly, data.timezone),
    daily: transformDailyData(daily),
  };
}

function transformHourlyData(hourly: any, timezone: string): HourlyData[] {
  // A safe bet: find the index where time > now
  const nowTime = new Date().getTime();

  let startIndex = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]).getTime() >= nowTime) {
      startIndex = i;
      break;
    }
  }

  // Include current hour if possible
  if (startIndex > 0) startIndex--;

  const hours: HourlyData[] = [];
  for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
    hours.push({
      time: new Date(hourly.time[i]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(hourly.temperature_2m[i]),
      icon: mapWeatherCodeToIcon(hourly.weather_code[i]),
      windSpeed: Math.round(hourly.wind_speed_10m[i]),
    });
  }

  return hours;
}

function transformDailyData(daily: any): DailyData[] {
  const days: DailyData[] = [];
  for (let i = 0; i < 7 && i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);
    const dayName = i === 0 ? '今天' : date.toLocaleDateString('zh-CN', { weekday: 'short' });

    days.push({
      day: dayName,
      icon: mapWeatherCodeToIcon(daily.weather_code[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      high: Math.round(daily.temperature_2m_max[i]),
      windSpeed: Math.round(daily.wind_speed_10m_max[i]),
    });
  }
  return days;
}

function mapWeatherCodeToCondition(code: number): string {
  const map: Record<number, string> = {
    0: '晴朗',
    1: '晴朗',
    2: '多云',
    3: '阴天',
    45: '雾',
    48: '雾',
    51: '小雨',
    53: '小雨',
    55: '小雨',
    56: '雨夹雪',
    57: '雨夹雪',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '雨夹雪',
    67: '雨夹雪',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '小雪',
    80: '阵雨',
    81: '阵雨',
    82: '暴雨',
    85: '阵雪',
    86: '阵雪',
    95: '雷雨',
    96: '雷雨伴冰雹',
    99: '雷雨伴冰雹',
  };
  return map[code] || '多云';
}

function mapWeatherCodeToIcon(code: number): string {
  const map: Record<number, string> = {
    0: 'sun',
    1: 'sun',
    2: 'cloud',
    3: 'cloud',
    45: 'cloud',
    48: 'cloud',
    51: 'rain',
    53: 'rain',
    55: 'rain',
    56: 'rain',
    57: 'rain',
    61: 'rain',
    63: 'rain',
    65: 'rain',
    66: 'rain',
    67: 'rain',
    71: 'cloud',
    73: 'cloud',
    75: 'cloud',
    77: 'cloud',
    80: 'rain',
    81: 'rain',
    82: 'rain',
    85: 'cloud',
    86: 'cloud',
    95: 'rain',
    96: 'rain',
    99: 'rain',
  };
  return map[code] || 'cloud';
}