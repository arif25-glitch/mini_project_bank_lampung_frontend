/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAppDispatch } from '../redux/hooks';
import { setWeatherCondition } from '../redux/features/uiSlice';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import ButtonSpinner from '../components/ButtonSpinner/ButtonSpinner';

// Define accent colors for different weather conditions
const weatherAccentColors: Record<string, { from: string, to: string }> = {
  'Clear': { from: '#f59e0b', to: '#ef4444' },
  'Clouds': { from: '#64748b', to: '#475569' },
  'Scattered Clouds': { from: '#3b82f6', to: '#64748b' },
  'Broken Clouds': { from: '#3b82f6', to: '#64748b' },
  'Few Clouds': { from: '#3b82f6', to: '#64748b' },
  'Rain': { from: '#3b82f6', to: '#6366f1' },
  'Thunderstorm': { from: '#4f46e5', to: '#7e22ce' },
  'Snow': { from: '#e2e8f0', to: '#cbd5e1' },
  'Mist': { from: '#9ca3af', to: '#6b7280' },
  'Default': { from: '#64748b', to: '#334155' }
};

// Weather icons mapping
const weatherIcons: Record<string, string> = {
  'Clear': '☀️',
  'Clouds': '☁️',
  'Scattered Clouds': '⛅',
  'Broken Clouds': '⛅',
  'Few Clouds': '⛅',
  'Rain': '🌧️',
  'Thunderstorm': '⛈️',
  'Snow': '❄️',
  'Mist': '🌫️',
  'Default': '🌡️'
};

// Map API weather conditions to our display conditions
const mapWeatherCondition = (apiCondition: string): string => {
  const conditionMap: Record<string, string> = {
    'clear sky': 'Clear',
    'few clouds': 'Few Clouds',
    'scattered clouds': 'Scattered Clouds',
    'broken clouds': 'Broken Clouds',
    'overcast clouds': 'Clouds',
    'light rain': 'Rain',
    'moderate rain': 'Rain',
    'heavy intensity rain': 'Rain',
    'thunderstorm': 'Thunderstorm',
    'snow': 'Snow',
    'mist': 'Mist',
    'fog': 'Mist'
  };

  return conditionMap[apiCondition] || 'Default';
};

// Define interface for CityDropdown props
interface CityDropdownProps {
  cities: Array<{ id: number; name: string; [key: string]: any }>;
  selectedCity: number | null;
  onChange: (cityId: number) => void;
  onSearch: (cityName: string) => void;
  isLoading: boolean;
}

// Enhanced dropdown component with search
const CityDropdown = ({ cities, selectedCity, onChange, onSearch, isLoading }: CityDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCityData = selectedCity ? cities.find(city => city.id === selectedCity) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      onSearch(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm('');
      // Reset the searching state after a moment to prevent flickering
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full neu-button px-4 py-3 rounded-xl text-left flex items-center justify-between"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        <div className="flex items-center">
          <span className="text-xl mr-2 text-[#0600ad]">🏙️</span>
          {isLoading ? (
            <SkeletonLoader type="text" width={120} height={20} />
          ) : (
            <span className="font-medium text-gray-800">{selectedCityData?.name || "Pilih Kota..."}</span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[#0600ad]"
        >
          {isLoading ? (
            <ButtonSpinner size={20} color="#0600ad" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
            </svg>
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full neu-dropdown rounded-xl overflow-hidden"
          >
            <div className="p-2">
              <div className="flex mb-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari kota..."
                  className="flex-1 px-3 py-2 rounded-l-lg neu-input text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <motion.button
                  onClick={handleSearch}
                  className="bg-[#0600ad] text-white px-3 py-2 rounded-r-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? <ButtonSpinner size={16} color="white" /> : '🔍'}
                </motion.button>
              </div>
              
              <div className="text-xs text-gray-500 mb-2 px-2">Kota Populer:</div>
              <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
                {cities.map((city) => (
                  <motion.button
                    key={city.id}
                    className={`w-full px-4 py-3 text-left flex items-center transition-all ${
                      selectedCity === city.id 
                        ? 'bg-[#0600ad]/10 text-[#0600ad] font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      onChange(city.id);
                      setIsOpen(false);
                    }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-6 mr-2 text-center">
                      {selectedCity === city.id && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[#0600ad]"
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>
                    {city.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple inline pattern SVG component for cards
const CardPattern = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden opacity-[0.03] pointer-events-none">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
        </pattern>
        <pattern id="dots" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="white"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  </div>
);

// Weather Skeleton Loader Component
const WeatherSkeleton = () => (
  <div className="space-y-8">
    <div className="neu-card p-6 md:p-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r bg-gray-200"/>
      
      <div className="flex flex-col md:flex-row justify-between items-start relative z-10 mt-2">
        <div className="mb-6 md:mb-0">
          <SkeletonLoader type="title" width={180} className="mb-3" />
          <SkeletonLoader type="text" width={240} className="mb-4" />
          <SkeletonLoader type="circle" width={80} height={80} className="mb-3" />
          <SkeletonLoader type="text" width={120} />
        </div>

        <div className="text-right">
          <SkeletonLoader type="title" width={100} height={80} />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center relative z-10">
        {[1, 2, 3].map((item) => (
          <div key={item} className="neu-pressed-light p-3 rounded-xl">
            <SkeletonLoader type="circle" width={40} height={40} className="mx-auto mb-2" />
            <SkeletonLoader type="text" width={60} className="mx-auto mb-1" />
            <SkeletonLoader type="text" width={80} className="mx-auto" />
          </div>
        ))}
      </div>
    </div>

    <div>
      <SkeletonLoader type="title" width={160} className="mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((day) => (
          <div key={day} className="neu-card p-4 text-center relative overflow-hidden">
            <SkeletonLoader type="text" width={80} className="mx-auto mb-2" />
            <SkeletonLoader type="circle" width={40} height={40} className="mx-auto my-2" />
            <SkeletonLoader type="text" width={60} className="mx-auto mb-2" />
            <SkeletonLoader type="text" width={80} className="mx-auto" />
          </div>
        ))}
      </div>
    </div>

    <div className="neu-flat-light p-5 rounded-xl relative overflow-hidden">
      <SkeletonLoader type="title" width={140} className="mb-3" />
      <SkeletonLoader type="text" count={3} />
    </div>
  </div>
);

export default function Weather() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [customCityName, setCustomCityName] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load preset cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await api.getWeatherCities();
        setCities(citiesData);
        // Default to Jakarta
        setSelectedCity(1);
      } catch (err) {
        setError('Gagal memuat daftar kota');
      }
    };
    loadCities();
  }, []);
  
  // Handler for searching a custom city by name
  const handleCitySearch = async (cityName: string) => {
    setLoading(true);
    setError(null);
    setSelectedCity(null);
    setCustomCityName(cityName);
    
    try {
      const weatherData = await api.getWeatherForCity(cityName);
      processWeatherData(weatherData);
    } catch (err) {
      setError(`Gagal memuat data cuaca untuk ${cityName}`);
      dispatch(setWeatherCondition(null)); // Reset background on error
    } finally {
      setLoading(false);
    }
  };
  
  // Process the weather API response
  const processWeatherData = (apiData: any) => {
    if (!apiData || !apiData.weather || apiData.weather.length === 0) {
      setError('Data cuaca tidak lengkap');
      return;
    }
    
    const condition = mapWeatherCondition(apiData.weather[0].description);
    const formattedData = {
      city: apiData.name,
      coordinates: apiData.coord,
      condition,
      temperature: Math.round(apiData.main.temp),
      humidity: apiData.main.humidity,
      wind: apiData.wind.speed,
      // Since we don't have real forecast data, we create a mock one based on current conditions
      forecast: Array(5).fill(null).map((_, i) => ({
        day: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { weekday: 'long' }),
        condition,
        tempHigh: Math.round(apiData.main.temp) + Math.floor(Math.random() * 3),
        tempLow: Math.round(apiData.main.temp) - Math.floor(Math.random() * 5)
      }))
    };
    
    setWeather(formattedData);
    dispatch(setWeatherCondition(condition));
  };

  // Load weather data when selected city changes
  useEffect(() => {
    if (!selectedCity) return;
    
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      setCustomCityName(null);
      
      try {
        const city = cities.find(c => c.id === selectedCity);
        if (!city) {
          setError('Kota tidak ditemukan');
          return;
        }
        
        const weatherData = await api.getWeatherForCity(city.name);
        processWeatherData(weatherData);
      } catch (err) {
        setError('Gagal memuat data cuaca');
        dispatch(setWeatherCondition(null)); // Reset background on error
      } finally {
        setLoading(false);
      }
    };
    
    loadWeather();
  }, [selectedCity, cities, dispatch]);

  const handleCityChange = (cityId: number) => {
    setSelectedCity(cityId);
  };

  const getAccentColors = (condition: string | null) => {
    if (!condition || !weatherAccentColors[condition]) {
      return weatherAccentColors['Default'];
    }
    return weatherAccentColors[condition];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Info Cuaca <span className="text-[#0600ad]">Terkini</span>
          </h1>
          <div className="w-full md:w-auto min-w-[250px]">
            <CityDropdown
              cities={cities}
              selectedCity={selectedCity}
              onChange={handleCityChange}
              onSearch={handleCitySearch}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Loading State with Skeleton */}
        {loading && <WeatherSkeleton />}

        {/* Error State */}
        <AnimatePresence>
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center"
              role="alert"
            >
              <strong className="font-bold">Oops!</strong>
              <span className="block sm:inline"> {error}. Mohon coba lagi.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weather Data Display */}
        <AnimatePresence>
          {!loading && !error && weather && (
            <motion.div
              key="weather-data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Main Weather Card */}
              <motion.div
                className="neu-card p-6 md:p-8 overflow-hidden relative"
                style={{
                  '--accent-color-from': getAccentColors(weather.condition).from,
                  '--accent-color-to': getAccentColors(weather.condition).to
                } as React.CSSProperties}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r" 
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${getAccentColors(weather.condition).from}, ${getAccentColors(weather.condition).to})` 
                  }}
                />
                
                <div className="flex flex-col md:flex-row justify-between items-start relative z-10 mt-2">
                  {/* Left Side: City, Date, Icon */}
                  <div className="mb-6 md:mb-0">
                    <h2 className="text-3xl font-bold mb-1 text-gray-800">
                      {customCityName || weather.city}
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <motion.div
                      className="text-6xl md:text-7xl"
                      initial={{ scale: 0.5, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                    >
                      {weatherIcons[weather.condition] || weatherIcons['Default']}
                    </motion.div>
                    
                    <motion.p
                      className="text-xl font-medium capitalize mt-2"
                      style={{ color: getAccentColors(weather.condition).from }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {weather.condition}
                    </motion.p>
                  </div>

                  {/* Right Side: Temperature */}
                  <div className="text-right">
                    <motion.div
                      className="text-6xl md:text-7xl font-extrabold mb-1"
                      style={{ color: getAccentColors(weather.condition).from }}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {weather.temperature}°<span className="text-5xl md:text-6xl font-medium">C</span>
                    </motion.div>
                  </div>
                </div>

                {/* Bottom Details: Humidity, Wind, Coords */}
                <motion.div
                  className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[
                    { icon: '💧', label: 'Kelembaban', value: `${weather.humidity}%` },
                    { icon: '🌬️', label: 'Angin', value: `${weather.wind} km/h` },
                    { icon: '📍', label: 'Koordinat', value: `${weather.coordinates.lat.toFixed(1)}, ${weather.coordinates.lon.toFixed(1)}` }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="neu-pressed-light p-3 rounded-xl"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-gray-700">{item.value}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Forecast Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Prakiraan 5 Hari</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {weather.forecast.map((day: any, index: number) => {
                    const accentColors = getAccentColors(day.condition);
                    
                    return (
                      <motion.div
                        key={day.day}
                        className="neu-card p-4 text-center relative overflow-hidden"
                        style={{ 
                          '--gradient-from': accentColors.from, 
                          '--gradient-to': accentColors.to 
                        } as React.CSSProperties}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.03 }}
                      >
                        <div className="gradient-border absolute inset-0 rounded-xl pointer-events-none"></div>
                        <div className="relative z-10">
                          <div className="text-sm font-medium mb-2 text-gray-700">{day.day}</div>
                          <div className="text-4xl my-2">
                            {weatherIcons[day.condition] || weatherIcons['Default']}
                          </div>
                          <div className="text-xs capitalize mb-2" style={{ color: accentColors.from }}>{day.condition}</div>
                          <div className="flex justify-center items-baseline space-x-2 text-sm">
                            <span className="font-semibold text-gray-800">{day.tempHigh}°</span>
                            <span className="text-gray-400">{day.tempLow}°</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Weather Tips Section */}
              <motion.div
                className="neu-flat-light p-5 rounded-xl relative overflow-hidden"
                style={{
                  '--accent-color-from': getAccentColors(weather.condition).from,
                  '--accent-color-to': getAccentColors(weather.condition).to
                } as React.CSSProperties}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="neu-accent-left"></div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <span className="text-xl mr-2">💡</span> Tips Cuaca Hari Ini
                </h3>
                <p className="text-gray-700 text-sm">
                  {weather.condition === 'Clear' && "Hari yang cerah! Sempurna untuk aktivitas luar. Jangan lupa kacamata hitam dan tabir surya."}
                  {weather.condition === 'Clouds' && "Cuaca berawan, suhu mungkin nyaman. Bawa jaket ringan untuk berjaga-jaga."}
                  {weather.condition === 'Few Clouds' && "Campuran matahari dan awan. Nikmati saat cerah, tapi siap jika mendung."}
                  {weather.condition === 'Scattered Clouds' && "Campuran matahari dan awan tersebar. Cuaca cukup cerah dengan sedikit bayangan."}
                  {weather.condition === 'Broken Clouds' && "Awan terputus-putus, matahari masih bisa mengintip. Suhu cenderung hangat."}
                  {weather.condition === 'Rain' && "Hujan diperkirakan turun. Bawalah payung atau jas hujan jika bepergian."}
                  {weather.condition === 'Thunderstorm' && "Badai petir diperkirakan. Lebih baik tetap di dalam ruangan dan hindari area terbuka."}
                  {weather.condition === 'Snow' && "Salju turun di area Anda. Kenakan pakaian hangat dan hati-hati saat berkendara."}
                  {weather.condition === 'Mist' && "Kabut tipis mengurangi jarak pandang. Hati-hati saat berkendara dan gunakan lampu yang tepat."}
                  {!['Clear', 'Clouds', 'Few Clouds', 'Scattered Clouds', 'Broken Clouds', 'Rain', 'Thunderstorm', 'Snow', 'Mist'].includes(weather.condition) && "Periksa kondisi cuaca secara berkala dan berpakaian sesuai."}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
