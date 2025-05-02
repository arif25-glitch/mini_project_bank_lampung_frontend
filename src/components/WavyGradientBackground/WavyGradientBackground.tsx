import { useEffect, useRef } from 'react';

export default function WavyGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let time = 0;
    
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const drawWave = () => {
      setCanvasSize();
      
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(237, 242, 255, 1)'); // Light indigo
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)'); // White
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw base blue accent
      const drawAccent = (x: number, y: number, radius: number, color: string) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.filter = 'blur(80px)';
        ctx.fill();
        ctx.filter = 'none';
      };
      
      // Draw multiple accent circles
      drawAccent(width * 0.1, height * 0.8, width * 0.2, 'rgba(6, 0, 173, 0.15)');
      drawAccent(width * 0.8, height * 0.2, width * 0.25, 'rgba(6, 0, 173, 0.1)');
      
      // Draw multiple waves with different amplitudes, frequencies, and phases
      const drawWaves = () => {
        const layers = 3;
        
        for (let l = 0; l < layers; l++) {
          const amplitude = 15 + l * 10; // Different amplitude for each layer
          const frequency = 0.005 + l * 0.002; // Different frequency for each layer
          const speed = 0.001 + l * 0.0005; // Different speed for each layer
          const phase = time * speed; // Phase changes with time
          const opacity = 0.06 - l * 0.01; // Decreasing opacity for deeper layers
          
          // Each wave has its own path
          ctx.beginPath();
          ctx.moveTo(0, height * 0.5);
          
          // Draw wave points
          for (let x = 0; x < width; x += 5) {
            const y = height * 0.5 + 
                      amplitude * Math.sin(x * frequency + phase) +
                      amplitude * 0.7 * Math.cos(x * frequency * 0.8 + phase * 1.2);
            ctx.lineTo(x, y);
          }
          
          // Complete path to cover bottom of canvas
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          
          // Fill with gradient
          const waveGradient = ctx.createLinearGradient(0, height * 0.3, 0, height);
          waveGradient.addColorStop(0, `rgba(6, 0, 173, ${opacity})`); // Theme color
          waveGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = waveGradient;
          ctx.fill();
        }
      };
      
      drawWaves();
      
      // Continue animation
      time += 1;
      animationFrameId = requestAnimationFrame(drawWave);
    };
    
    window.addEventListener('resize', setCanvasSize);
    drawWave();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
