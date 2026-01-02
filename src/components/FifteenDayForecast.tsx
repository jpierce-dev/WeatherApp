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
                            <div className="grid grid-cols-[2.8rem_1.5rem_3.5rem_1fr] md:flex md:items-center md:justify-between items-center gap-2 flex-1 min-w-0">
                                <div className="text-white text-sm font-medium whitespace-nowrap">{day.day}</div>
                                <div className="text-white flex justify-center">
                                    {day.icon === 'sun' && <Sun className="w-5 h-5 text-yellow-300" />}
                                    {day.icon === 'cloud' && <Cloud className="w-5 h-5 text-white/80" />}
                                    {day.icon === 'rain' && <CloudRain className="w-5 h-5 text-blue-300" />}
                                    {day.icon === 'drizzle' && <CloudDrizzle className="w-5 h-5 text-blue-200" />}
                                </div>
                                <div className="flex items-center gap-1 text-white/70 text-[11px] sm:text-xs">
                                    <Wind className="w-3 h-3" />
                                    <span>{day.windSpeed}级</span>
                                </div>

                                <div className="flex items-center gap-2 justify-end min-w-0">
                                    <div className="text-white text-sm w-7 text-right font-medium">{day.low}°</div>
                                    <div className="flex-1 max-w-[120px] min-w-[60px] h-1.5 bg-black/20 rounded-full relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 via-yellow-300 to-orange-500 rounded-full absolute shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-500"
                                            style={{
                                                left: `${barLeft}%`,
                                                width: `${Math.max(barWidth, 8)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="text-white text-sm w-7 text-left font-medium">{day.high}°</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
