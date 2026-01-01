// 天气 API 服务
// 使用 OpenWeatherMap API 格式
// 获取真实 API key: https://openweathermap.org/api

const API_KEY = 'YOUR_API_KEY_HERE'; // 替换为您的 OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

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

// 模拟 API 响应 - 在实际使用时，取消注释下面的真实 API 调用
export async function fetchWeatherData(city: string): Promise<WeatherData> {
  // 真实 API 调用示例（需要有效的 API key）:
  /*
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=zh_cn`
    );
    const data = await response.json();
    
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=zh_cn`
    );
    const forecastData = await forecastResponse.json();
    
    return transformApiData(data, forecastData);
  } catch (error) {
    console.error('获取天气数据失败:', error);
    return getMockWeatherData(city);
  }
  */
  
  // 模拟数据
  return getMockWeatherData(city);
}

function getMockWeatherData(city: string): WeatherData {
  const mockData: Record<string, WeatherData> = {
    '北京': {
      location: '北京',
      temp: 22,
      condition: '晴朗',
      high: 25,
      low: 18,
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      feelsLike: 23,
      sunrise: '06:12',
      sunset: '18:45',
      hourly: generateHourlyData('晴朗'),
      daily: generateDailyData(),
    },
    '上海': {
      location: '上海',
      temp: 25,
      condition: '多云',
      high: 27,
      low: 21,
      humidity: 70,
      windSpeed: 15,
      pressure: 1012,
      visibility: 8,
      uvIndex: 4,
      feelsLike: 26,
      sunrise: '05:58',
      sunset: '18:32',
      hourly: generateHourlyData('多云'),
      daily: generateDailyData(),
    },
    '广州': {
      location: '广州',
      temp: 28,
      condition: '阴天',
      high: 30,
      low: 24,
      humidity: 75,
      windSpeed: 10,
      pressure: 1011,
      visibility: 7,
      uvIndex: 3,
      feelsLike: 30,
      sunrise: '06:24',
      sunset: '18:28',
      hourly: generateHourlyData('阴天'),
      daily: generateDailyData(),
    },
    '深圳': {
      location: '深圳',
      temp: 27,
      condition: '小雨',
      high: 29,
      low: 23,
      humidity: 80,
      windSpeed: 18,
      pressure: 1010,
      visibility: 6,
      uvIndex: 2,
      feelsLike: 29,
      sunrise: '06:26',
      sunset: '18:30',
      hourly: generateHourlyData('小雨'),
      daily: generateDailyData(),
    },
    '成都': {
      location: '成都',
      temp: 20,
      condition: '多云',
      high: 23,
      low: 17,
      humidity: 68,
      windSpeed: 8,
      pressure: 1014,
      visibility: 9,
      uvIndex: 4,
      feelsLike: 21,
      sunrise: '06:45',
      sunset: '19:12',
      hourly: generateHourlyData('多云'),
      daily: generateDailyData(),
    },
    '杭州': {
      location: '杭州',
      temp: 24,
      condition: '晴朗',
      high: 26,
      low: 20,
      humidity: 62,
      windSpeed: 11,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      feelsLike: 25,
      sunrise: '06:08',
      sunset: '18:38',
      hourly: generateHourlyData('晴朗'),
      daily: generateDailyData(),
    },
  };

  return mockData[city] || mockData['北京'];
}

function generateHourlyData(condition: string): HourlyData[] {
  const hours = ['现在', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
  const icons = condition === '晴朗' ? 'sun' : condition === '小雨' ? 'rain' : 'cloud';
  
  return hours.map((time, index) => ({
    time,
    temp: 22 - index,
    icon: index > 6 && condition === '晴朗' ? 'cloud' : icons,
    windSpeed: 8 + Math.floor(Math.random() * 10),
  }));
}

function generateDailyData(): DailyData[] {
  const days = ['今天', '周四', '周五', '周六', '周日', '周一', '周二', '周三', '周四', '周五'];
  const icons = ['sun', 'cloud', 'rain', 'drizzle', 'cloud', 'sun', 'sun', 'cloud', 'rain', 'cloud'];
  
  return days.map((day, index) => ({
    day,
    icon: icons[index],
    low: 16 + index,
    high: 22 + index,
    windSpeed: 10 + Math.floor(Math.random() * 15),
  }));
}

// 转换真实 API 数据为应用数据格式
function transformApiData(weatherData: any, forecastData: any): WeatherData {
  return {
    location: weatherData.name,
    temp: Math.round(weatherData.main.temp),
    condition: mapWeatherCondition(weatherData.weather[0].main),
    high: Math.round(weatherData.main.temp_max),
    low: Math.round(weatherData.main.temp_min),
    humidity: weatherData.main.humidity,
    windSpeed: Math.round(weatherData.wind.speed * 3.6), // m/s 转 km/h
    pressure: weatherData.main.pressure,
    visibility: Math.round(weatherData.visibility / 1000), // 米转公里
    uvIndex: 5, // UV 指数需要额外的 API 调用
    feelsLike: Math.round(weatherData.main.feels_like),
    sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    hourly: forecastData.list.slice(0, 10).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      icon: mapWeatherIcon(item.weather[0].main),
      windSpeed: Math.round(item.wind.speed * 3.6),
    })),
    daily: generateDailyData(),
  };
}

function mapWeatherCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    'Clear': '晴朗',
    'Clouds': '多云',
    'Rain': '小雨',
    'Drizzle': '小雨',
    'Thunderstorm': '雷雨',
    'Snow': '雪',
    'Mist': '雾',
    'Fog': '雾',
  };
  return conditionMap[condition] || '多云';
}

function mapWeatherIcon(condition: string): string {
  const iconMap: Record<string, string> = {
    'Clear': 'sun',
    'Clouds': 'cloud',
    'Rain': 'rain',
    'Drizzle': 'drizzle',
    'Thunderstorm': 'rain',
    'Snow': 'cloud',
  };
  return iconMap[condition] || 'cloud';
}