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
                            className="flex items-center gap-2 py-3 border-b border-white/10 last:border-b-0 min-w-0"
                        >
                            {/* Day Label */}
                            <div className="text-white w-9 text-sm font-medium flex-shrink-0">{day.day}</div>

                            {/* Icon */}
                            <div className="text-white w-6 flex justify-center flex-shrink-0">
                                {day.icon === 'sun' && <Sun className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.4)]" />}
                                {day.icon === 'cloud' && <Cloud className="w-5 h-5 text-white/90" />}
                                {day.icon === 'rain' && <CloudRain className="w-5 h-5 text-blue-300" />}
                                {day.icon === 'drizzle' && <CloudDrizzle className="w-5 h-5 text-blue-200" />}
                            </div>

                            {/* Wind */}
                            <div className="flex items-center gap-1 text-white/70 text-[10px] w-10 flex-shrink-0">
                                <Wind className="w-3 h-3" />
                                <span>{day.windSpeed}级</span>
                            </div>

                            {/* Temperature Bar Section */}
                            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                                <div className="text-white text-sm w-7 text-right font-medium">{day.low}°</div>
                                <div className="flex-1 max-w-[120px] min-w-[60px] h-1.5 bg-black/20 rounded-full relative overflow-visible">
                                    <div className="absolute inset-0 bg-white/5 rounded-full" />
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 via-yellow-300 to-orange-500 rounded-full absolute transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                        style={{
                                            left: `${barLeft}%`,
                                            width: `${Math.max(barWidth, 10)}%`
                                        }}
                                    />
                                </div>
                                <div className="text-white text-sm w-7 text-left font-medium">{day.high}°</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
