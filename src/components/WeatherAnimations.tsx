import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface WeatherAnimationsProps {
  condition: string;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function WeatherAnimations({ condition }: WeatherAnimationsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (condition === '小雨' || condition === '大雨' || condition === '雷雨') {
      // 生成雨滴
      const rainDrops = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.5 + Math.random() * 0.5,
        size: 1 + Math.random() * 2,
      }));
      setParticles(rainDrops);
    } else if (condition === '雪') {
      // 生成雪花
      const snowflakes = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        size: 2 + Math.random() * 4,
      }));
      setParticles(snowflakes);
    } else {
      setParticles([]);
    }
  }, [condition]);

  if (condition === '小雨' || condition === '大雨' || condition === '雷雨') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute bg-white/40 rounded-full"
            style={{
              left: `${drop.x}%`,
              top: '-10px',
              width: `${drop.size}px`,
              height: `${drop.size * 10}px`,
            }}
            animate={{
              y: ['0vh', '110vh'],
              opacity: [0.6, 0.8, 0],
            }}
            transition={{
              duration: drop.duration,
              delay: drop.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  if (condition === '雪') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((flake) => (
          <motion.div
            key={flake.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${flake.x}%`,
              top: '-20px',
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, Math.sin(flake.id) * 30, Math.sin(flake.id * 2) * -30, 0],
              opacity: [0.8, 1, 0.8, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: flake.duration,
              delay: flake.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  if (condition === '雾') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/10 to-transparent"
          animate={{
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  if (condition === '晴朗') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 阳光光线效果 */}
        <motion.div
          className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white/20 to-transparent"
          style={{ transform: 'rotate(15deg)' }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-white/20 to-transparent"
          style={{ transform: 'rotate(-15deg)' }}
          animate={{
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  return null;
}
