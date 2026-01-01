import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';
import { HourlyData } from '../services/weatherApi';

interface HourlyForecastProps {
  hourlyData: HourlyData[];
}

export function HourlyForecast({ hourlyData }: HourlyForecastProps) {
  return (
    <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
      <div className="flex items-center gap-2 mb-4 text-white/80 text-sm">
        <span>每小时天气预报</span>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
        {hourlyData.map((hour, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3 min-w-[60px]"
          >
            <div className="text-white">{hour.time}</div>
            <div className="text-white">
              {hour.icon === 'sun' && <Sun className="w-7 h-7" />}
              {hour.icon === 'cloud' && <Cloud className="w-7 h-7" />}
              {hour.icon === 'rain' && <CloudRain className="w-7 h-7" />}
              {hour.icon === 'drizzle' && <CloudRain className="w-7 h-7" />}
            </div>
            <div className="text-white">{hour.temp}°</div>
            <div className="flex items-center gap-1 text-white/70 text-xs">
              <Wind className="w-3 h-3" />
              <span>{hour.windSpeed}级</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}