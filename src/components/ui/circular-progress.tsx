
'use client';

import * as React from 'react';

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number | null;
}

export const CircularProgress = ({ value, ...props }: CircularProgressProps) => {
  const GAUGE_MAX_VALUE = 100;
  const circumference = 2 * Math.PI * 45; // 2 * pi * r
  const strokeDashoffset = value === null ? 0 : circumference - (value / GAUGE_MAX_VALUE) * circumference;

  return (
    <svg
      height="100"
      width="100"
      viewBox="0 0 100 100"
      className="transform -rotate-90"
      {...props}
    >
      <circle
        className="text-muted"
        strokeWidth="10"
        stroke="currentColor"
        fill="transparent"
        r="45"
        cx="50"
        cy="50"
      />
      <circle
        className="text-primary transition-[stroke-dashoffset]"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r="45"
        cx="50"
        cy="50"
      />
       {value !== null && (
         <text 
            x="50" 
            y="50" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="transform rotate-90 origin-center fill-primary-foreground font-bold text-lg"
        >
            {`${Math.round(value)}%`}
        </text>
       )}
    </svg>
  );
};
