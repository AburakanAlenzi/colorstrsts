import React from 'react';

interface ChemicalTestIconProps {
  className?: string;
  size?: number;
}

export function ChemicalTestIcon({ className = "h-6 w-6", size }: ChemicalTestIconProps) {
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
        <linearGradient id="flaskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Flask Body */}
      <path 
        d="M8 14L10 8V4H14V8L16 14C16.5 15 16 16 15 16H9C8 16 7.5 15 8 14Z" 
        fill="url(#flaskGradient)" 
        stroke="currentColor" 
        strokeWidth="1.5"
      />
      
      {/* Flask Neck */}
      <rect 
        x="10" 
        y="2" 
        width="4" 
        height="2" 
        rx="0.5" 
        fill="currentColor"
      />
      
      {/* Liquid */}
      <path 
        d="M9.5 14.5C9.5 14.5 10.5 13 12 13C13.5 13 14.5 14.5 14.5 14.5V15C14.5 15.3 14.3 15.5 14 15.5H10C9.7 15.5 9.5 15.3 9.5 15V14.5Z" 
        fill="url(#liquidGradient)"
      />
      
      {/* Bubbles */}
      <circle cx="11" cy="14" r="0.5" fill="#FBBF24" fillOpacity="0.8"/>
      <circle cx="13" cy="14.5" r="0.3" fill="#FBBF24" fillOpacity="0.6"/>
      <circle cx="12" cy="13.5" r="0.4" fill="#FBBF24" fillOpacity="0.7"/>
      
      {/* Test Tube on the side */}
      <rect 
        x="18" 
        y="6" 
        width="2" 
        height="12" 
        rx="1" 
        fill="currentColor" 
        fillOpacity="0.6"
      />
      
      {/* Liquid in test tube */}
      <rect 
        x="18.3" 
        y="12" 
        width="1.4" 
        height="5.5" 
        rx="0.7" 
        fill="#EF4444" 
        fillOpacity="0.8"
      />
      
      {/* Test tube top */}
      <rect 
        x="17.5" 
        y="5" 
        width="3" 
        height="1.5" 
        rx="0.3" 
        fill="currentColor"
      />
      
      {/* Droplet */}
      <path 
        d="M6 10C6 10 5 11 5 12C5 13 5.5 13.5 6 13.5C6.5 13.5 7 13 7 12C7 11 6 10 6 10Z" 
        fill="#10B981" 
        fillOpacity="0.7"
      />
    </svg>
  );
}

export default ChemicalTestIcon;
