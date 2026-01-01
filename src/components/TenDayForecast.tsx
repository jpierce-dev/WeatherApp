import { Cloud, Sun, CloudRain, CloudDrizzle, Calendar, Wind } from 'lucide-react';
import { DailyData } from '../services/weatherApi';

interface TenDayForecastProps {
  dailyData: DailyData[];
}

export function TenDayForecast({ dailyData }: TenDayForecastProps) {
  return (
    <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
      <div className="flex items-center gap-2 mb-4 text-white/80 text-sm">
        <Calendar className="w-4 h-4" />
        <span>10 天预报</span>
      </div>
      <div className="space-y-2">
        {dailyData.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="text-white w-12">{day.day}</div>
              <div className="text-white">
                {day.icon === 'sun' && <Sun className="w-6 h-6" />}
                {day.icon === 'cloud' && <Cloud className="w-6 h-6" />}
                {day.icon === 'rain' && <CloudRain className="w-6 h-6" />}
                {day.icon === 'drizzle' && <CloudDrizzle className="w-6 h-6" />}
              </div>
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <Wind className="w-3 h-3" />
                <span>{day.windSpeed}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white/60">{day.low}°</div>
              <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-300 to-orange-300 rounded-full"
                  style={{ width: '70%', marginLeft: '15%' }}
                />
              </div>
              <div className="text-white">{day.high}°</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}