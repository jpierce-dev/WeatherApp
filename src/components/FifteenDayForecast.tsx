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
            <div className="flex items-center gap-2 mb-6 text-white/80 text-sm">
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
                            className="flex items-center gap-3 py-5 border-b border-white/10 last:border-b-0"
                        >
                            {/* Prefix info with fixed widths */}
                            <div className="text-white text-sm font-medium w-11 flex-shrink-0 whitespace-nowrap text-ellipsis overflow-hidden">{day.day}</div>

                            <div className="text-white w-8 flex-shrink-0 flex justify-center">
                                {day.icon === 'sun' && <Sun className="w-5 h-5 text-yellow-300" />}
                                {day.icon === 'cloud' && <Cloud className="w-5 h-5 text-white/80" />}
                                {day.icon === 'rain' && <CloudRain className="w-5 h-5 text-blue-300" />}
                                {day.icon === 'drizzle' && <CloudDrizzle className="w-5 h-5 text-blue-200" />}
                            </div>

                            <div className="flex items-center gap-0.5 text-white/70 text-[10px] w-12 flex-shrink-0">
                                <Wind className="w-3 h-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{day.windSpeed}级</span>
                            </div>

                            {/* Temperature section taking remaining space */}
                            <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                                <div className="text-white text-sm w-7 text-right font-medium flex-shrink-0">{day.low}°</div>
                                <div className="flex-1 max-w-[120px] h-1.5 bg-white/20 rounded-full overflow-hidden relative min-w-[30px]">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-300 to-orange-300 rounded-full absolute"
                                        style={{
                                            left: `${barLeft}%`,
                                            width: `${Math.max(barWidth, 5)}%`
                                        }}
                                    />
                                </div>
                                <div className="text-white text-sm w-7 text-left font-medium flex-shrink-0">{day.high}°</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
