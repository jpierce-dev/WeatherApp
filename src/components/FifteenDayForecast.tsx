import { Cloud, Sun, CloudRain, CloudDrizzle, Calendar, Wind } from 'lucide-react';
import { DailyData } from '../services/weatherApi';

interface FifteenDayForecastProps {
    dailyData: DailyData[];
}

export function FifteenDayForecast({ dailyData }: FifteenDayForecastProps) {
    const minTemp = Math.min(...dailyData.map(d => d.low));
    const maxTemp = Math.max(...dailyData.map(d => d.high));
    const totalRange = maxTemp - minTemp;

    return (
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-2 mb-4 text-white/80 text-sm">
                <Calendar className="w-4 h-4" />
                <span>15 天预报</span>
            </div>
            <div className="space-y-1">
                {dailyData.map((day, index) => {
                    const barLeft = totalRange === 0 ? 0 : ((day.low - minTemp) / totalRange) * 100;
                    const barWidth = totalRange === 0 ? 100 : ((day.high - day.low) / totalRange) * 100;

                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="text-white w-9 text-sm font-medium whitespace-nowrap">{day.day}</div>
                                <div className="text-white flex-shrink-0">
                                    {day.icon === 'sun' && <Sun className="w-4 h-4 text-yellow-300" />}
                                    {day.icon === 'cloud' && <Cloud className="w-4 h-4 text-white/80" />}
                                    {day.icon === 'rain' && <CloudRain className="w-4 h-4 text-blue-300" />}
                                    {day.icon === 'drizzle' && <CloudDrizzle className="w-4 h-4 text-blue-200" />}
                                </div>
                                <div className="flex items-center gap-1 text-white/50 text-xs w-10 flex-shrink-0">
                                    <Wind className="w-2.5 h-2.5" />
                                    <span>{day.windSpeed}级</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end flex-shrink-0">
                                <div className="text-white text-xs w-7 text-right opacity-80">{day.low}°</div>
                                <div className="w-14 sm:w-20 h-1.5 bg-black/20 rounded-full overflow-hidden relative flex-shrink-0">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 via-yellow-400 to-orange-500 rounded-full absolute shadow-sm"
                                        style={{
                                            left: `${barLeft}%`,
                                            width: `${Math.max(barWidth, 5)}%`
                                        }}
                                    />
                                </div>
                                <div className="text-white text-xs w-7 text-left font-medium">{day.high}°</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
