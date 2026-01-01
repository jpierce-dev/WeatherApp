import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  description: string;
  detailedInfo?: {
    title: string;
    content: React.ReactNode;
  };
}

export function WeatherDetailCard({
  icon,
  label,
  value,
  unit,
  description,
  detailedInfo,
}: DetailCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={`bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 p-4 ${
          detailedInfo ? 'cursor-pointer hover:bg-white/25 transition-colors' : ''
        }`}
        onClick={() => detailedInfo && setIsModalOpen(true)}
      >
        <div className="flex items-center gap-2 mb-3 text-white/70 text-sm">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-white text-3xl mb-1">
          {value}
          {unit && <span className="text-xl ml-1">{unit}</span>}
        </div>
        <div className="text-white/70 text-sm">{description}</div>
      </div>

      <AnimatePresence>
        {isModalOpen && detailedInfo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-500">{icon}</div>
                    <h2 className="text-gray-800">{detailedInfo.title}</h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 text-gray-700 max-h-96 overflow-y-auto">
                  {detailedInfo.content}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
