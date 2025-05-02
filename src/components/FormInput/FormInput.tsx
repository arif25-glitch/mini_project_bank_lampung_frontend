import { useState } from 'react';
import { motion } from 'framer-motion';

type FormInputProps = {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

export default function FormInput({
  id,
  name,
  type,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine actual input type based on showPassword state
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className="relative">
      <label 
        htmlFor={id} 
        className={`block text-gray-700 mb-2 transition-all duration-200 ${
          isFocused ? 'text-[#0600ad] font-medium transform -translate-y-1' : ''
        }`}
      >
        {label}
      </label>
      
      <div className="relative">
        <motion.input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0600ad] focus:ring-2 focus:ring-[#0600ad]/20 transition-all duration-200 outline-none"
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        
        {/* Password visibility toggle button */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#0600ad] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              // Hide password icon (eye-slash)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              // Show password icon (eye)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        
        {/* Animated bottom border that appears on focus */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-0.5 bg-[#0600ad]"
          initial={{ width: 0 }}
          animate={{ 
            width: isFocused ? '100%' : 0,
            x: isFocused ? '-50%' : 0
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Floating icon animations based on input type */}
        {type === 'email' && !isFocused && (
          <motion.div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            animate={{ 
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? '#0600ad' : '#9CA3AF'
            }}
          >
            @
          </motion.div>
        )}
      </div>
      
      {/* Input animation */}
      {isFocused && (
        <motion.div
          className="absolute -z-10 rounded-full bg-[#0600ad]/5"
          initial={{ width: 0, height: 0, x: '50%', y: '50%', opacity: 0 }}
          animate={{ 
            width: '120%', 
            height: '160%', 
            x: '-10%', 
            y: '-30%', 
            opacity: 0.07 
          }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}
