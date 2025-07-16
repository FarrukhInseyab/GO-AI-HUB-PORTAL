import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#014952] to-[#049394] text-white hover:from-[#016774] hover:to-[#4CEADB] focus:ring-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500 focus:ring-gray-500 shadow-lg shadow-gray-500/25',
    outline: 'border border-[#049394]/50 text-[#049394] hover:bg-[#049394]/10 hover:border-[#4CEADB] focus:ring-[#049394] backdrop-blur-sm',
    ghost: 'text-gray-300 hover:bg-gray-800/50 hover:text-[#049394] focus:ring-[#049394]',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 focus:ring-red-500 shadow-lg shadow-red-500/25',
    neon: 'bg-gradient-to-r from-[#4CEADB] to-[#049394] text-white hover:from-[#4CEADB] hover:to-[#016774] focus:ring-[#4CEADB] shadow-lg shadow-[#4CEADB]/25 hover:shadow-[#4CEADB]/40'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
    md: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2',
    lg: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {loading && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;