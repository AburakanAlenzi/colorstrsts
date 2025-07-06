import React from 'react';

interface TestTubeIconProps {
  className?: string;
  size?: number;
}

export function TestTubeIcon({ className = "h-8 w-8", size }: TestTubeIconProps) {
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
        <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Test Tube 1 */}
      <rect 
        x="6" 
        y="4" 
        width="3" 
        height="16" 
        rx="1.5" 
        fill="url(#tubeGradient)" 
        stroke="currentColor" 
        strokeWidth="0.5"
      />
      
      {/* Liquid in Tube 1 */}
      <rect 
        x="6.5" 
        y="12" 
        width="2" 
        height="7" 
        rx="1" 
        fill="url(#liquidGradient)"
      />
      
      {/* Tube Top 1 */}
      <rect 
        x="5.5" 
        y="3" 
        width="4" 
        height="2" 
        rx="0.5" 
        fill="currentColor"
      />
      
      {/* Test Tube 2 */}
      <rect 
        x="12" 
        y="6" 
        width="3" 
        height="14" 
        rx="1.5" 
        fill="url(#tubeGradient)" 
        stroke="currentColor" 
        strokeWidth="0.5"
      />
      
      {/* Liquid in Tube 2 */}
      <rect 
        x="12.5" 
        y="14" 
        width="2" 
        height="5" 
        rx="1" 
        fill="#10B981" 
        fillOpacity="0.8"
      />
      
      {/* Tube Top 2 */}
      <rect 
        x="11.5" 
        y="5" 
        width="4" 
        height="2" 
        rx="0.5" 
        fill="currentColor"
      />
      
      {/* Test Tube 3 */}
      <rect 
        x="18" 
        y="5" 
        width="3" 
        height="15" 
        rx="1.5" 
        fill="url(#tubeGradient)" 
        stroke="currentColor" 
        strokeWidth="0.5"
      />
      
      {/* Liquid in Tube 3 */}
      <rect 
        x="18.5" 
        y="13" 
        width="2" 
        height="6" 
        rx="1" 
        fill="#8B5CF6" 
        fillOpacity="0.8"
      />
      
      {/* Tube Top 3 */}
      <rect 
        x="17.5" 
        y="4" 
        width="4" 
        height="2" 
        rx="0.5" 
        fill="currentColor"
      />
      
      {/* Bubbles */}
      <circle cx="7.5" cy="14" r="0.3" fill="#FBBF24" fillOpacity="0.8"/>
      <circle cx="13.5" cy="16" r="0.3" fill="#FBBF24" fillOpacity="0.8"/>
      <circle cx="19.5" cy="15" r="0.3" fill="#FBBF24" fillOpacity="0.8"/>
      
      {/* Chemical Formula */}
      <text 
        x="12" 
        y="2" 
        textAnchor="middle" 
        fontSize="3" 
        fontFamily="Arial, sans-serif" 
        fill="currentColor" 
        opacity="0.7"
      >
        C₁₂H₁₅NO₂
      </text>
    </svg>
  );
}

export default TestTubeIcon;
