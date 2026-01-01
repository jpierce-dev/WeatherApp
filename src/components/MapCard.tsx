import { MapPin } from 'lucide-react';

interface MapCardProps {
  location: string;
  temp: number;
  condition: string;
}

export function MapCard({ location, temp, condition }: MapCardProps) {
  return (
    <div className="bg-white/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/30">
      <div className="relative h-64 bg-gradient-to-br from-blue-300 to-green-200">
        {/* Simulated map with location marker */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <div className="text-2xl">{temp}°</div>
              <div className="text-sm text-gray-600">{condition}</div>
            </div>
          </div>
        </div>
        {/* Grid overlay to simulate map */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <div className="text-white/80 text-sm">查看更多信息</div>
      </div>
    </div>
  );
}