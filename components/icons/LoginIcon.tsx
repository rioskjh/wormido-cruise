interface LoginIconProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export function LoginIcon({ className = "size-5", color = "#222222", strokeWidth = 2 }: LoginIconProps) {
  return (
    <div className={className}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 22">
        <g>
          <path 
            d="M14 9V5C14 3.93913 13.5786 2.92172 12.8284 2.17157C12.0783 1.42143 11.0609 1 10 1C8.93913 1 7.92172 1.42143 7.17157 2.17157C6.42143 2.92172 6 3.93913 6 5V9" 
            stroke={color}
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={strokeWidth} 
          />
          <path 
            d="M17 9H3C1.89543 9 1 9.89543 1 11V19C1 20.1046 1.89543 21 3 21H17C18.1046 21 19 20.1046 19 19V11C19 9.89543 18.1046 9 17 9Z" 
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
