import { useAppSelector } from '../../redux/hooks';
import { motion } from 'framer-motion';

// Weather condition to background mapping
const weatherBackgrounds: Record<string, string> = {
  'Cerah': 'from-blue-400 to-sky-100',
  'Berawan': 'from-slate-500 to-slate-200',
  'Berawan Sebagian': 'from-blue-500 to-gray-200',
  'Hujan Ringan': 'from-blue-700 to-slate-400',
  'Hujan Deras': 'from-blue-900 to-slate-600'
};

export default function WeatherBackground() {
  const { isActive, condition } = useAppSelector((state) => state.ui.weather);
  
  if (!isActive) return null;
  
  const bgGradient = condition && weatherBackgrounds[condition] 
    ? weatherBackgrounds[condition] 
    : 'from-blue-400 to-blue-100';
  
  // Function to get appropriate time of day image
  const getTimeBasedImage = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return 'url("/assets/day-clouds.svg")';
    }
    return 'url("/assets/night-clouds.svg")';
  };

  return (
    <motion.div 
      className={`fixed inset-0 bg-gradient-to-br ${bgGradient} -z-10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: getTimeBasedImage(),
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Optional subtle patterns based on weather */}
      {condition?.includes('Hujan') && (
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%)',
          backgroundSize: '20px 20px',
          animation: 'rain 0.5s linear infinite'
        }} />
      )}
    </motion.div>
  );
}
