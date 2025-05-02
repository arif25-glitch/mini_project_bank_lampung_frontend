import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate random position and size for shapes
  const getRandomPosition = (max: number) => Math.random() * max;
  const getRandomSize = () => 20 + Math.random() * 60;
  
  // Generate circles data
  const generateShapes = (count: number) => {
    const shapes = [];
    for (let i = 0; i < count; i++) {
      shapes.push({
        x: getRandomPosition(100),
        y: getRandomPosition(100),
        size: getRandomSize(),
        duration: 20 + Math.random() * 40,
        delay: Math.random() * 5,
        opacity: 0.02 + Math.random() * 0.08
      });
    }
    return shapes;
  };

  const circles = generateShapes(15);
  const squares = generateShapes(10);

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 bg-gradient-to-br from-indigo-50 to-white">
      {/* Grid overlay - creates a subtle pattern */}
      <div className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(6, 0, 173, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 0, 173, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} 
      />
      
      {/* Abstract shapes */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Floating circles */}
        {circles.map((circle, index) => (
          <motion.ellipse
            key={`circle-${index}`}
            cx={`${circle.x}%`}
            cy={`${circle.y}%`}
            rx={circle.size}
            ry={circle.size}
            fill="#0600ad"
            opacity={circle.opacity}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: [1, 1.1, 0.9, 1.2, 1],
              x: [0, 10, -10, 15, 0],
              y: [0, -15, 10, -5, 0]
            }}
            transition={{ 
              duration: circle.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: circle.delay
            }}
          />
        ))}
        
        {/* Floating squares */}
        {squares.map((square, index) => (
          <motion.rect
            key={`square-${index}`}
            x={`${square.x}%`}
            y={`${square.y}%`}
            width={square.size}
            height={square.size}
            fill="#0600ad"
            opacity={square.opacity}
            initial={{ rotate: 0 }}
            animate={{ 
              rotate: [0, 45, 0, -45, 0],
              scale: [1, 1.2, 0.8, 1.1, 1],
              x: [0, 20, -10, 5, 0],
              y: [0, -10, 20, -5, 0]
            }}
            transition={{ 
              duration: square.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: square.delay
            }}
          />
        ))}
        
        {/* Large decorative circle */}
        <motion.circle
          cx="5%"
          cy="85%"
          r="100"
          fill="url(#gradient1)"
          initial={{ opacity: 0.1 }}
          animate={{ 
            opacity: [0.1, 0.15, 0.08, 0.12, 0.1],
            scale: [1, 1.05, 0.98, 1.02, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Large decorative circle */}
        <motion.circle
          cx="90%"
          cy="10%"
          r="120"
          fill="url(#gradient2)"
          initial={{ opacity: 0.1 }}
          animate={{ 
            opacity: [0.1, 0.15, 0.08, 0.12, 0.1],
            scale: [1, 1.03, 0.99, 1.01, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Gradients */}
        <defs>
          <radialGradient id="gradient1">
            <stop offset="0%" stopColor="#0600ad" />
            <stop offset="100%" stopColor="#0600ad" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gradient2">
            <stop offset="0%" stopColor="#0600ad" />
            <stop offset="100%" stopColor="#0600ad" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Wave effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <motion.div
          className="relative h-16 bg-gradient-to-r from-[#0600ad]/10 to-[#0600ad]/5"
          initial={{ y: 20 }}
          animate={{ y: [0, -5, 0, -8, 0] }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: "loop"
          }}
          style={{ 
            borderTopLeftRadius: '50% 100%',
            borderTopRightRadius: '50% 100%',
            transform: 'scaleX(1.5)'
          }}
        />
      </div>
    </div>
  );
}
