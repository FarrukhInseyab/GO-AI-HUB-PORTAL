import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full px-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 transition-all duration-300 ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {/* Glowing effect on focus */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#049394]/20 to-[#4CEADB]/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm"></div>
      </div>
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;