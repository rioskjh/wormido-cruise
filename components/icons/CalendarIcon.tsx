interface CalendarIconProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export function CalendarIcon({ className = "size-5", color = "#222222", strokeWidth = 2 }: CalendarIconProps) {
  return (
    <div className={className}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g>
          <path 
            d="M17 3H5C2.79086 3 1 4.79086 1 7V17C1 19.2091 2.79086 21 5 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3Z" 
            stroke={color}
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={strokeWidth} 
          />
          <path 
            d="M7 1V5M15 1V5M1 9H21" 
            stroke={color}
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={strokeWidth} 
          />
        </g>
      </svg>
    </div>
  );
}
