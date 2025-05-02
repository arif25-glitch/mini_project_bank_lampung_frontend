import React from 'react';

interface ButtonSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({
  size = 16,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <div 
      className={`inline-block ${className}`}
      style={{ 
        width: size, 
        height: size 
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg" 
        style={{ 
          animation: 'spin 1s linear infinite',
          width: '100%',
          height: '100%' 
        }}
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color} 
          strokeWidth="4" 
          fill="none" 
          strokeDasharray="31.4 31.4" 
          strokeLinecap="round" 
          style={{ opacity: 0.2 }} 
        />
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color} 
          strokeWidth="4" 
          fill="none" 
          strokeDasharray="31.4 31.4" 
          strokeDashoffset="31.4" 
          strokeLinecap="round"
        />
      </svg>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ButtonSpinner;