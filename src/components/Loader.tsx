import React from 'react';

interface LoaderProps {
  size?: number;
  color?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 40, 
  color = '#0a8f6c' 
}) => {
  return (
    <div className="loader-container">
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animation: 'rotate 1s linear infinite' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          style={{
            animation: 'dash 1.5s ease-in-out infinite',
            strokeDasharray: '90, 150',
            strokeDashoffset: -35,
          }}
        />
      </svg>
    </div>
  );
}; 