import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3 sm:h-4 sm:w-4',
    md: 'h-6 w-6 sm:h-8 sm:w-8',
    lg: 'h-8 w-8 sm:h-12 sm:w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <Loader2 className={`animate-spin text-primary-500 ${sizeClasses[size]}`} />
        {/* Glowing effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-primary-500/20 rounded-full blur-md animate-pulse`}></div>
      </div>
      {text && (
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;