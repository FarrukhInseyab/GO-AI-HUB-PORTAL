import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SuccessStoryProps {
  title: string;
  description: string;
  impact: string;
  active: boolean;
}

const SuccessStory: React.FC<SuccessStoryProps> = ({
  title,
  description,
  impact,
  active,
}) => {
  const { translations } = useLanguage();
  return (
    <div 
      className={`absolute inset-0 transition-all duration-1000 ${
        active ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-full'
      }`}
    >
      <div className="relative h-full bg-gradient-to-br from-gray-900 via-[#016774]/30 to-[#049394]/30 p-4 sm:p-8 flex flex-col justify-center">
        <div className="absolute top-10 right-10 w-24 sm:w-32 h-24 sm:h-32 bg-[#049394]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-16 sm:w-24 h-16 sm:h-24 bg-[#4CEADB]/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-4xl">
          {/* Title */}
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-[#049394]/20 to-[#4CEADB]/20 rounded-xl border border-[#049394]/30 mr-3 sm:mr-4">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#049394]" />
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-white">{title}</h3>
          </div>
          
          {/* Description */}
          <p className="text-sm sm:text-lg text-gray-300 mb-4 sm:mb-8 leading-relaxed max-w-3xl line-clamp-3 sm:line-clamp-none">
            {description}
          </p>
          
          {/* Impact */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-[#049394]/20 p-4 sm:p-6 rounded-xl">
            <div className="flex items-center mb-2 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-[#049394] to-[#4CEADB] rounded-full mr-2 sm:mr-3"></div>
              <h4 className="font-semibold text-base sm:text-lg text-[#049394]">{translations.impact}:</h4>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{impact}</p>
            
            {/* Animated progress bar */}
            <div className="mt-3 sm:mt-4 h-1 bg-[#014952] rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-[#049394] to-[#4CEADB] rounded-full transition-all duration-2000 ${
                active ? 'w-full' : 'w-0'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStory;
