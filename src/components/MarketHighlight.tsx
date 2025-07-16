import React from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface MarketHighlightProps {
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  isAnimated?: boolean;
}

const MarketHighlight: React.FC<MarketHighlightProps> = ({
  title,
  value,
  description,
  trend,
  isAnimated = false,
}) => {
  return (
    <div 
      className={`relative bg-[#016774] backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-[#4CEADB]/30 hover:border-[#4CEADB]/50 transition-all duration-500 group ${
        isAnimated ? 'transform scale-105 border-[#4CEADB]/50' : ''
      }`}
    >
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#049394]/5 to-[#4CEADB]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Trend indicator */}
      <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
        <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-[#4CEADB] transition-colors duration-300">
          {title}
        </h3>
        <div className={`p-2 sm:p-3 rounded-xl ${
          trend === 'up' 
            ? 'bg-[#4CEADB]/10 border border-[#4CEADB]/30' 
            : trend === 'down' 
            ? 'bg-red-500/10 border border-red-500/30'
            : 'bg-gradient-to-br from-[#4CEADB]/20 to-[#049394]/20 border border-[#4CEADB]/30'
        }`}>
          {trend === 'up' && <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#4CEADB]" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />}
          {trend === 'neutral' && <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#4CEADB]" />}
        </div>
      </div>
      
      {/* Value */}
      <div className="relative z-10 mb-3 sm:mb-4">
        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#049394] to-[#4CEADB] bg-clip-text text-transparent mb-1 sm:mb-2">
          {value}
        </p>
        
        {/* Animated underline */}
        <div className={`h-1 bg-gradient-to-r from-[#049394] to-[#4CEADB] rounded-full transition-all duration-1000 ${
          isAnimated ? 'w-full' : 'w-0 group-hover:w-full'
        }`}></div>
      </div>
      
      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed relative z-10 group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
      
      {/* Floating particles effect */}
    </div>
  );
};

export default MarketHighlight;