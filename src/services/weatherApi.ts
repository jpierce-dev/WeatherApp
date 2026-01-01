
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

export interface SearchResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
}

/**
 * Searches for cities by name using OpenMeteo Geocoding API
 */
export async function searchCities(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(
            `${GEO_API_URL}?name=${encodeURIComponent(query)}&count=5&language=zh&format=json`
        );
        const data = await response.json();

        if (!data.results) return [];

        return data.results.map((item: any) => ({
            id: item.id,
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            country: item.country,
            admin1: item.admin1
        }));
    } catch (error) {
        console.error('Search failed:', error);
        return [];
    }
}

/**
 * Fetches weather data by city name (performs geocoding first)
 */
export async function fetchWeatherData(city: string): Promise<WeatherData> {
    const searchResults = await searchCities(city);
    if (searchResults.length === 0) {
        throw new Error('City not found');
    }
    const { latitude, longitude, name } = searchResults[0];
    return fetchWeatherByCoords(latitude, longitude, name);
}

/**
 * Fetches weather data directy by coordinates
 */
export async function fetchWeatherByCoords(lat: number, lon: number, locationName: string): Promise<WeatherData> {
    const weatherResponse = await fetch(
        `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,wind_speed_10m_max&timezone=auto&forecast_days=16&wind_speed_unit=ms`
    );

    if (!weatherResponse.ok) {
        throw new Error('Weather data fetch failed');
    }

    const weatherData = await weatherResponse.json();
    return transformOpenMeteoData(locationName, weatherData);
}

/**
 * Helper to fetch minimal current weather info
 */
export async function fetchCurrentWeatherSimple(city: string): Promise<{ temp: number; condition: string }> {
    try {
        const data = await fetchWeatherData(city);
        return {
            temp: data.temp,
            condition: data.condition
        };
    } catch {
        return { temp: 0, condition: '未知' };
    }
}

function transformOpenMeteoData(cityName: string, data: any): WeatherData {
    const { current, daily, hourly } = data;

    return {
        location: cityName,
        temp: Math.round(current.temperature_2m),
        condition: mapWeatherCodeToCondition(current.weather_code),
        high: Math.round(daily.temperature_2m_max[0]),
        low: Math.round(daily.temperature_2m_min[0]),
        humidity: current.relative_humidity_2m,
        windSpeed: calculateWindLevel(current.wind_speed_10m),
        pressure: Math.round(current.surface_pressure),
        visibility: Math.round(current.visibility / 1000),
        uvIndex: Math.round(daily.uv_index_max[0]),
        feelsLike: Math.round(current.apparent_temperature),
        sunrise: formatLocalTime(daily.sunrise[0]),
        sunset: formatLocalTime(daily.sunset[0]),
        hourly: transformHourlyData(hourly),
        daily: transformDailyData(daily, hourly),
    };
}

function formatLocalTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function transformHourlyData(hourly: any): HourlyData[] {
    const nowTime = Date.now();
    let startIndex = hourly.time.findIndex((t: string) => new Date(t).getTime() >= nowTime);

    if (startIndex === -1) startIndex = 0;
    else if (startIndex > 0) startIndex--; // Include the current hour

    return hourly.time.slice(startIndex, startIndex + 12).map((time: string, i: number) => ({
        time: formatLocalTime(time),
        temp: Math.round(hourly.temperature_2m[startIndex + i]),
        icon: mapWeatherCodeToIcon(hourly.weather_code[startIndex + i]),
        windSpeed: calculateWindLevel(hourly.wind_speed_10m[startIndex + i]),
    }));
}

function transformDailyData(daily: any, hourly: any): DailyData[] {
    return daily.time.slice(0, 15).map((time: string, i: number) => {
        const date = new Date(time);
        const dayName = i === 0 ? '今天' : date.toLocaleDateString('zh-CN', { weekday: 'short' });

        // Calculate average wind speed for this day from hourly data
        const dayStart = i * 24;
        const dayEnd = dayStart + 24;
        const dayHourlyWind = hourly.wind_speed_10m.slice(dayStart, dayEnd);
        const avgWind = dayHourlyWind.length > 0
            ? dayHourlyWind.reduce((a: number, b: number) => a + b, 0) / dayHourlyWind.length
            : daily.wind_speed_10m_max[i];

        return {
            day: dayName,
            icon: mapWeatherCodeToIcon(daily.weather_code[i]),
            low: Math.round(daily.temperature_2m_min[i]),
            high: Math.round(daily.temperature_2m_max[i]),
            windSpeed: calculateWindLevel(avgWind),
        };
    });
}

function mapWeatherCodeToCondition(code: number): string {
    const map: Record<number, string> = {
        0: '晴朗', 1: '晴朗', 2: '多云', 3: '阴天',
        45: '雾', 48: '雾',
        51: '小雨', 53: '小雨', 55: '小雨',
        56: '雨夹雪', 57: '雨夹雪',
        61: '小雨', 63: '中雨', 65: '大雨',
        66: '雨夹雪', 67: '雨夹雪',
        71: '小雪', 73: '中雪', 75: '大雪', 77: '小雪',
        80: '阵雨', 81: '阵雨', 82: '暴雨',
        85: '阵雪', 86: '阵雪',
        95: '雷雨', 96: '雷雨伴冰雹', 99: '雷雨伴冰雹',
    };
    return map[code] || '多云';
}

function mapWeatherCodeToIcon(code: number): string {
    const map: Record<number, string> = {
        0: 'sun', 1: 'sun', 2: 'cloud', 3: 'cloud',
        45: 'cloud', 48: 'cloud',
        51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain',
        61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
        71: 'cloud', 73: 'cloud', 75: 'cloud', 77: 'cloud',
        80: 'rain', 81: 'rain', 82: 'rain',
        85: 'cloud', 86: 'cloud',
        95: 'rain', 96: 'rain', 99: 'rain',
    };
    return map[code] || 'cloud';
}

/**
 * Converts wind speed (m/s) to Beaufort scale level
 */
export function calculateWindLevel(ms: number): number {
    if (ms < 0.3) return 0;
    if (ms < 1.6) return 1;
    if (ms < 3.4) return 2;
    if (ms < 5.5) return 3;
    if (ms < 8.0) return 4;
    if (ms < 10.8) return 5;
    if (ms < 13.9) return 6;
    if (ms < 17.2) return 7;
    if (ms < 20.8) return 8;
    if (ms < 24.5) return 9;
    if (ms < 28.5) return 10;
    if (ms < 32.7) return 11;
    return 12;
}
