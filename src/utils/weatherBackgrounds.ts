export type WeatherCondition = '晴朗' | '多云' | '阴天' | '小雨' | '大雨' | '雷雨' | '雪' | '雾';

interface BackgroundGradient {
  light: string;
  dark: string;
  lightColor: string;
  darkColor: string;
}

export const weatherBackgrounds: Record<WeatherCondition, BackgroundGradient> = {
  '晴朗': {
    light: 'bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300',
    dark: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700',
    lightColor: '#0ea5e9', // blue-500
    darkColor: '#0f172a',  // slate-900
  },
  '多云': {
    light: 'bg-gradient-to-b from-slate-400 via-slate-300 to-gray-200',
    dark: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700',
    lightColor: '#94a3b8', // slate-400
    darkColor: '#0f172a',  // slate-900
  },
  '阴天': {
    light: 'bg-gradient-to-b from-gray-500 via-gray-400 to-gray-300',
    dark: 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700',
    lightColor: '#6b7280', // gray-500
    darkColor: '#111827',  // gray-900
  },
  '小雨': {
    light: 'bg-gradient-to-b from-slate-500 via-slate-400 to-blue-300',
    dark: 'bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900',
    lightColor: '#64748b', // slate-500
    darkColor: '#0f172a',  // slate-900
  },
  '大雨': {
    light: 'bg-gradient-to-b from-slate-600 via-slate-500 to-blue-400',
    dark: 'bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950',
    lightColor: '#475569', // slate-600
    darkColor: '#020617',  // slate-950
  },
  '雷雨': {
    light: 'bg-gradient-to-b from-slate-700 via-purple-500 to-slate-500',
    dark: 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900',
    lightColor: '#334155', // slate-700
    darkColor: '#020617',  // slate-950
  },
  '雪': {
    light: 'bg-gradient-to-b from-blue-200 via-blue-100 to-white',
    dark: 'bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500',
    lightColor: '#bfdbfe', // blue-200
    darkColor: '#334155',  // slate-700
  },
  '雾': {
    light: 'bg-gradient-to-b from-gray-400 via-gray-300 to-gray-200',
    dark: 'bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600',
    lightColor: '#9ca3af', // gray-400
    darkColor: '#1f2937',  // gray-800
  },
};

export function getWeatherBackground(condition: WeatherCondition, isDark: boolean): string {
  return isDark ? weatherBackgrounds[condition].dark : weatherBackgrounds[condition].light;
}

export function getThemeColor(condition: WeatherCondition, isDark: boolean): string {
  return isDark ? weatherBackgrounds[condition].darkColor : weatherBackgrounds[condition].lightColor;
}
