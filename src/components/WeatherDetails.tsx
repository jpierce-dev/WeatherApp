import { Gauge, Wind, Droplets, Eye, Sunrise, Activity } from 'lucide-react';
import { WeatherData } from '../services/weatherApi';
import { WeatherDetailCard } from './WeatherDetailCard';

interface WeatherDetailsProps {
  weatherData: WeatherData;
}

export function WeatherDetails({ weatherData }: WeatherDetailsProps) {
  const dewPoint = Math.round(weatherData.temp - (100 - weatherData.humidity) / 5);
  
  const detailsData = [
    {
      icon: <Gauge className="w-4 h-4" />,
      label: 'UV 指数',
      value: weatherData.uvIndex.toString(),
      description: weatherData.uvIndex < 3 ? '低' : weatherData.uvIndex < 6 ? '中等' : weatherData.uvIndex < 8 ? '高' : '很高',
      detailedInfo: {
        title: 'UV 指数详情',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>当前等级：</span>
              <span className="font-medium">
                {weatherData.uvIndex < 3 ? '低 (0-2)' : weatherData.uvIndex < 6 ? '中等 (3-5)' : weatherData.uvIndex < 8 ? '高 (6-7)' : '很高 (8-10)'}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full"
                style={{ width: `${(weatherData.uvIndex / 11) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              {weatherData.uvIndex < 3 && '可以安全地待在户外，但仍建议使用防晒霜。'}
              {weatherData.uvIndex >= 3 && weatherData.uvIndex < 6 && '在中午时分需要采取防晒措施。'}
              {weatherData.uvIndex >= 6 && weatherData.uvIndex < 8 && '避免在中午时分暴露在阳光下，务必使用防晒霜。'}
              {weatherData.uvIndex >= 8 && '尽量待在阴凉处，必须使用高倍防晒霜。'}
            </p>
          </div>
        ),
      },
    },
    {
      icon: <Sunrise className="w-4 h-4" />,
      label: '日出',
      value: weatherData.sunrise,
      description: `日落: ${weatherData.sunset}`,
      detailedInfo: {
        title: '日照时间',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>日出时间：</span>
              <span className="font-medium">{weatherData.sunrise}</span>
            </div>
            <div className="flex justify-between">
              <span>日落时间：</span>
              <span className="font-medium">{weatherData.sunset}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2 text-gray-500">
                <span>00:00</span>
                <span>12:00</span>
                <span>24:00</span>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-slate-600"></div>
                  <div className="flex-[2] bg-yellow-400"></div>
                  <div className="flex-1 bg-slate-600"></div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      icon: <Wind className="w-4 h-4" />,
      label: '风速',
      value: weatherData.windSpeed.toString(),
      unit: 'km/h',
      description: '东北风',
      detailedInfo: {
        title: '风力详情',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>风速：</span>
              <span className="font-medium">{weatherData.windSpeed} km/h</span>
            </div>
            <div className="flex justify-between">
              <span>风力等级：</span>
              <span className="font-medium">
                {weatherData.windSpeed < 12 ? '1级 微风' : 
                 weatherData.windSpeed < 20 ? '2级 轻风' : 
                 weatherData.windSpeed < 29 ? '3级 微风' : 
                 weatherData.windSpeed < 39 ? '4级 和风' : '5级 清劲风'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>风向：</span>
              <span className="font-medium">东北</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  style={{ width: `${Math.min((weatherData.windSpeed / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      icon: <Droplets className="w-4 h-4" />,
      label: '降水量',
      value: '0',
      unit: 'mm',
      description: '过去 24 小时',
      detailedInfo: {
        title: '降水详情',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>过去 1 小时：</span>
              <span className="font-medium">0 mm</span>
            </div>
            <div className="flex justify-between">
              <span>过去 24 小时：</span>
              <span className="font-medium">0 mm</span>
            </div>
            <div className="flex justify-between">
              <span>降水概率：</span>
              <span className="font-medium">0%</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">未来 24 小时内预计无降水。</p>
          </div>
        ),
      },
    },
    {
      icon: <Activity className="w-4 h-4" />,
      label: '体感温度',
      value: `${weatherData.feelsLike}°`,
      description: weatherData.feelsLike === weatherData.temp ? '与实际温度相同' : `实际温度 ${weatherData.temp}°`,
      detailedInfo: {
        title: '体感温度说明',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>实际温度：</span>
              <span className="font-medium">{weatherData.temp}°</span>
            </div>
            <div className="flex justify-between">
              <span>体感温度：</span>
              <span className="font-medium">{weatherData.feelsLike}°</span>
            </div>
            <div className="flex justify-between">
              <span>温差：</span>
              <span className="font-medium">{Math.abs(weatherData.feelsLike - weatherData.temp)}°</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              体感温度考虑了风速、湿度等因素，反映人体实际感受到的温度。
              {weatherData.feelsLike > weatherData.temp && ' 湿度较高使体感温度高于实际温度。'}
              {weatherData.feelsLike < weatherData.temp && ' 风速较大使体感温度低于实际温度。'}
            </p>
          </div>
        ),
      },
    },
    {
      icon: <Droplets className="w-4 h-4" />,
      label: '湿度',
      value: `${weatherData.humidity}%`,
      description: `露点温度 ${dewPoint}°`,
      detailedInfo: {
        title: '湿度详情',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>相对湿度：</span>
              <span className="font-medium">{weatherData.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span>露点温度：</span>
              <span className="font-medium">{dewPoint}°</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-blue-500 rounded-full"
                style={{ width: `${weatherData.humidity}%` }}
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              {weatherData.humidity < 30 && '空气干燥，建议补充水分。'}
              {weatherData.humidity >= 30 && weatherData.humidity < 60 && '湿度适中，体感舒适。'}
              {weatherData.humidity >= 60 && weatherData.humidity < 80 && '湿度较高，可能感觉闷热。'}
              {weatherData.humidity >= 80 && '湿度很高，空气潮湿。'}
            </p>
          </div>
        ),
      },
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: '能见度',
      value: weatherData.visibility.toString(),
      unit: 'km',
      description: weatherData.visibility > 8 ? '非常清晰' : weatherData.visibility > 5 ? '良好' : '一般',
      detailedInfo: {
        title: '能见度详情',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>当前能见度：</span>
              <span className="font-medium">{weatherData.visibility} km</span>
            </div>
            <div className="flex justify-between">
              <span>能见度等级：</span>
              <span className="font-medium">
                {weatherData.visibility > 10 ? '优' : 
                 weatherData.visibility > 8 ? '良' : 
                 weatherData.visibility > 5 ? '中' : 
                 weatherData.visibility > 2 ? '较差' : '差'}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                style={{ width: `${Math.min((weatherData.visibility / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              {weatherData.visibility > 10 && '能见度极佳，适合户外活动和驾驶。'}
              {weatherData.visibility > 5 && weatherData.visibility <= 10 && '能见度良好，正常活动不受影响。'}
              {weatherData.visibility > 2 && weatherData.visibility <= 5 && '能见度一般，驾驶时需注意。'}
              {weatherData.visibility <= 2 && '能见度较差，请谨慎驾驶，减速慢行。'}
            </p>
          </div>
        ),
      },
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: '气压',
      value: weatherData.pressure.toString(),
      unit: 'hPa',
      description: weatherData.pressure > 1013 ? '高气压' : weatherData.pressure < 1013 ? '低气压' : '标准气压',
      detailedInfo: {
        title: '气压详情',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>当前气压：</span>
              <span className="font-medium">{weatherData.pressure} hPa</span>
            </div>
            <div className="flex justify-between">
              <span>标准气压：</span>
              <span className="font-medium">1013 hPa</span>
            </div>
            <div className="flex justify-between">
              <span>气压差：</span>
              <span className="font-medium">{weatherData.pressure - 1013} hPa</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mt-2 relative">
              <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-400"></div>
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full"
                style={{ 
                  width: `${Math.min(Math.max(((weatherData.pressure - 980) / 70) * 100, 0), 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              {weatherData.pressure > 1020 && '高气压通常带来晴朗天气。'}
              {weatherData.pressure > 1013 && weatherData.pressure <= 1020 && '气压略高，天气稳定。'}
              {weatherData.pressure >= 1006 && weatherData.pressure <= 1013 && '气压正常。'}
              {weatherData.pressure < 1006 && '低气压可能带来阴雨天气。'}
            </p>
          </div>
        ),
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {detailsData.map((detail, index) => (
        <WeatherDetailCard
          key={index}
          icon={detail.icon}
          label={detail.label}
          value={detail.value}
          unit={detail.unit}
          description={detail.description}
          detailedInfo={detail.detailedInfo}
        />
      ))}
    </div>
  );
}