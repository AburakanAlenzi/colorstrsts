import React from 'react';

interface TestResultIconProps {
  className?: string;
  size?: number;
  result?: 'positive' | 'negative' | 'neutral';
}

export function TestResultIcon({ 
  className = "h-6 w-6", 
  size, 
  result = 'neutral' 
}: TestResultIconProps) {
  const getResultColor = () => {
    switch (result) {
      case 'positive':
        return '#EF4444'; // Red
      case 'negative':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <svg 
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="resultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={getResultColor()} stopOpacity="0.8" />
          <stop offset="100%" stopColor={getResultColor()} stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Petri Dish */}
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      
      {/* Inner Circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="7" 
        fill="url(#resultGradient)" 
        fillOpacity="0.2"
      />
      
      {/* Color Spots */}
      <circle 
        cx="10" 
        cy="10" 
        r="1.5" 
        fill={getResultColor()} 
        fillOpacity="0.8"
      />
      
      <circle 
        cx="14" 
        cy="9" 
        r="1" 
        fill={getResultColor()} 
        fillOpacity="0.6"
      />
      
      <circle 
        cx="13" 
        cy="14" 
        r="1.2" 
        fill={getResultColor()} 
        fillOpacity="0.7"
      />
      
      <circle 
        cx="9" 
        cy="14" 
        r="0.8" 
        fill={getResultColor()} 
        fillOpacity="0.5"
      />
      
      {/* Result Indicator */}
      {result === 'positive' && (
        <path 
          d="M8 12L10 14L16 8" 
          stroke="#EF4444" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
      )}
      
      {result === 'negative' && (
        <path 
          d="M15 9L9 15M9 9L15 15" 
          stroke="#10B981" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      )}
      
      {result === 'neutral' && (
        <circle 
          cx="12" 
          cy="12" 
          r="2" 
          fill="none" 
          stroke="#6B7280" 
          strokeWidth="2"
        />
      )}
      
      {/* Magnifying Glass */}
      <g transform="translate(16, 4)">
        <circle 
          cx="0" 
          cy="0" 
          r="3" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        />
        <line 
          x1="2.1" 
          y1="2.1" 
          x2="4" 
          y2="4" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default TestResultIcon;
