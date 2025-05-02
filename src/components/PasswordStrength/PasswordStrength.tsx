import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type StrengthLevel = {
  label: string;
  color: string;
  width: number;
};

const strengthLevels: StrengthLevel[] = [
  { label: 'Lemah', color: '#f87171', width: 25 },
  { label: 'Cukup', color: '#fbbf24', width: 50 },
  { label: 'Baik', color: '#34d399', width: 75 },
  { label: 'Kuat', color: '#10b981', width: 100 }
];

export default function PasswordStrength({ password }: { password: string }) {
  const [strength, setStrength] = useState<StrengthLevel>(strengthLevels[0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!password) {
      setVisible(false);
      return;
    }
    
    setVisible(true);
    
    // Calculate password strength
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const length = password.length;
    
    let score = 0;
    if (length > 6) score += 1;
    if (length > 10) score += 1;
    if (hasLowerCase) score += 1;
    if (hasUpperCase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecialChars) score += 1;
    
    // Set strength level based on score
    if (score <= 2) {
      setStrength(strengthLevels[0]);
    } else if (score <= 3) {
      setStrength(strengthLevels[1]);
    } else if (score <= 4) {
      setStrength(strengthLevels[2]);
    } else {
      setStrength(strengthLevels[3]);
    }
  }, [password]);

  if (!visible) return null;

  return (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          Kekuatan kata sandi: {strength.label}
        </span>
        <span className="text-xs" style={{ color: strength.color }}>
          {strength.width}%
        </span>
      </div>
      
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: strength.color }}
          initial={{ width: 0 }}
          animate={{ width: `${strength.width}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {strength.label === 'Lemah' && (
        <motion.div 
          className="mt-1 text-xs text-red-500"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Coba tambahkan angka, simbol, dan campuran huruf besar dan kecil.
        </motion.div>
      )}
      
      {/* Password criteria indicators */}
      <motion.div 
        className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { label: "Minimal 8 karakter", test: password.length >= 8 },
          { label: "Berisi huruf besar", test: /[A-Z]/.test(password) },
          { label: "Berisi angka", test: /\d/.test(password) },
          { label: "Berisi simbol", test: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
        ].map((criterion, idx) => (
          <div key={idx} className="flex items-center">
            <motion.div 
              className={`w-3 h-3 rounded-full mr-1.5 flex-shrink-0 ${
                criterion.test ? 'bg-green-500' : 'bg-gray-300'
              }`}
              animate={{ 
                scale: criterion.test ? [1, 1.2, 1] : 1,
                backgroundColor: criterion.test ? '#10b981' : '#d1d5db'
              }}
              transition={{ duration: 0.3 }}
            />
            <span className="text-xs text-gray-600">{criterion.label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
