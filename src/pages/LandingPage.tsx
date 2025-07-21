import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SuccessStory from '../components/SuccessStory';
import MarketHighlight from '../components/MarketHighlight';
import { ArrowRight, Check, Zap, Building, Landmark, Cpu, Brain, Shield, Globe, Sparkles, Bot, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { successStories, marketHighlights } from '../data/landingPageData';

const LandingPage = () => {
  const { language, translations } = useLanguage();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);

  useEffect(() => {
    const storyInterval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
    }, 5000);

    const highlightInterval = setInterval(() => {
      setCurrentHighlightIndex((prev) => (prev + 1) % marketHighlights.length);
    }, 4000);

    return () => {
      clearInterval(storyInterval);
      clearInterval(highlightInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-r from-[#014952] to-[#049394]">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[#014952]"></div>
        
        <div className={`container px-4 z-10 relative ${language === 'ar' ? 'mr-[40px]' : 'ml-[40px]'}`}>
          <div className="max-w-4xl">
            {/* <div className="mb-4 sm:mb-6 flex items-center space-x-2">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#014952]/50 rounded-full border border-[#4CEADB]/30">
                <span className="text-[#4CEADB] text-xs sm:text-sm font-medium flex items-center">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {language === 'ar' ? 'مدعوم بواسطة رُوَّاد' : 'Powered by GO.Ai | رُوَّاد'}
                </span>
              </div>
            </div> */}
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-[#4CEADB] to-[#049394] text-transparent bg-clip-text">
                {translations.heroTitle.split(' ').slice(0, 3).join(' ')}
              </span>
              <br />
              <span className="text-white text-5xl">
                {translations.heroTitle.split(' ').slice(3,5).join(' ')}
              </span>
              <br />
               <span className="text-white text-5xl">
                {translations.heroTitle.split(' ').slice(5).join(' ')}
              </span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-1xl text-gray-300 mb-6 sm:mb-10 max-w-xl leading-relaxed">
              {translations.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
             <Link
                to="/vendor-onboarding"
                className="group relative text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-500 flex items-center justify-center transform hover:translate-y-[-2px] bg-gradient-to-r from-[#4CEADB] to-[#014952] bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:100%_50%]"
              >
                <Building className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                {translations.vendorCTA}
                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              
              <Link 
                to="/discover" 
                className="group relative text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-500 flex items-center justify-center transform hover:translate-y-[-2px] bg-gradient-to-r from-[#4CEADB] to-[#014952] bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:100%_50%]"
              >
                <Landmark className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                {translations.governmentCTA}
                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-[#4CEADB]/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#4CEADB] rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Market Highlights */}
      <section className="py-12 sm:py-20 bg-[#014952] relative">
        <div className="absolute inset-0 bg-[#014952]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              <span className="text-[#4CEADB]">
                {translations.marketHighlightsTitle}
              </span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-[#4CEADB] mx-auto rounded-full"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'رؤى السوق مدعومة بواسطة رُوَّاد، وكيل الذكاء الاصطناعي الذكي الذي يحلل البيانات في الوقت الفعلي من مصادر موثوقة.'
                : 'Market insights powered by GO.Ai | رُوَّاد, our intelligent AI agent that analyzes real-time data from trusted sources.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {marketHighlights.slice(0, 3).map((highlight, index) => (
              <div key={index} className="group">
                <MarketHighlight 
                  title={highlight.title[language]}
                  value={highlight.value}
                  description={highlight.description[language]}
                  trend={highlight.trend}
                  isAnimated={index === currentHighlightIndex}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-12 sm:py-20 bg-[#016774] relative">
        <div className="absolute inset-0 bg-[#016774]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              <span className="text-[#4CEADB]">
                {translations.successStoriesTitle}
              </span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-[#4CEADB] mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="relative h-[350px] sm:h-[500px] overflow-hidden rounded-lg border border-[#4CEADB]/30 bg-[#014952]">
              {successStories.map((story, index) => (
                <SuccessStory
                  key={index}
                  title={story.title[language]}
                  description={story.description[language]}
                  impact={story.impact[language]}
                  active={index === currentStoryIndex}
                />
              ))}
              
              {/* Story navigation */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
                {successStories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStoryIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentStoryIndex 
                        ? 'w-8 sm:w-12 h-2 sm:h-3 bg-[#4CEADB]' 
                        : 'w-2 sm:w-3 h-2 sm:h-3 bg-[#016774] hover:bg-[#049394]'
                    }`}
                    aria-label={`Go to story ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GOAI Agent Feature Section */}
      <section className="py-12 sm:py-20 bg-[#014952] relative">
        <div className="absolute inset-0 bg-[#014952]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-[#016774] rounded-lg border border-[#4CEADB]/30 mr-2 sm:mr-3">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-[#4CEADB]" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-[#4CEADB]">
                GO.Ai | رُوَّاد
              </h2>
            </div>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'ar'
                ? 'يعمل وكيل الذكاء الاصطناعي الذكي لدينا على تشغيل المنصة بأكملها، ويوفر توصيات مخصصة ورؤى سوقية وتقارير بحثية.'
                : 'Our intelligent AI agent powers the entire platform, providing personalized recommendations, market insights, and research reports.'}
            </p>
            <div className="w-16 sm:w-24 h-1 bg-[#4CEADB] mx-auto rounded-full mt-4 sm:mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="group bg-[#016774] rounded-lg p-6 sm:p-8 border border-[#4CEADB]/30 hover:border-[#4CEADB] transition-all duration-300 hover:transform hover:translate-y-[-4px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#014952] rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#4CEADB]/20">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-[#4CEADB]" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-[#4CEADB] transition-colors duration-300">
                {language === 'ar' ? 'تقارير بحثية بالذكاء الاصطناعي' : 'AI Research Reports'}
              </h3>
              
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'إنشاء تقارير بحثية شاملة عن تقنيات الذكاء الاصطناعي واتجاهات السوق وتطبيقات الصناعة في المملكة العربية السعودية.'
                  : 'Generate comprehensive research reports on AI technologies, market trends, and industry applications in Saudi Arabia.'}
              </p>
              
              <Link 
                to="/goai-agent" 
                className="text-[#4CEADB] hover:text-[#4CEADB]/80 flex items-center text-sm transition-colors duration-300"
              >
                {language === 'ar' ? 'إنشاء تقرير' : 'Generate a report'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="group bg-[#016774] rounded-lg p-6 sm:p-8 border border-[#4CEADB]/30 hover:border-[#4CEADB] transition-all duration-300 hover:transform hover:translate-y-[-4px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#014952] rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#4CEADB]/20">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-[#4CEADB]" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-[#4CEADB] transition-colors duration-300">
                {language === 'ar' ? 'رؤى السوق' : 'Market Insights'}
              </h3>
              
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'الوصول إلى التحليلات في الوقت الفعلي والرؤى المستندة إلى البيانات حول سوق الذكاء الاصطناعي السعودي، بدعم من وكيلنا الذكي.'
                  : 'Access real-time analytics and data-driven insights on the Saudi AI market, powered by our intelligent agent.'}
              </p>
              
              <Link 
                to="/market-insights" 
                className="text-[#4CEADB] hover:text-[#4CEADB]/80 flex items-center text-sm transition-colors duration-300"
              >
                {language === 'ar' ? 'استكشاف الرؤى' : 'Explore insights'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="group bg-[#016774] rounded-lg p-6 sm:p-8 border border-[#4CEADB]/30 hover:border-[#4CEADB] transition-all duration-300 hover:transform hover:translate-y-[-4px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#014952] rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#4CEADB]/20">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[#4CEADB]" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-[#4CEADB] transition-colors duration-300">
                {language === 'ar' ? 'مطابقة الحلول' : 'Solution Matching'}
              </h3>
              
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'احصل على توصيات مخصصة لحلول الذكاء الاصطناعي بناءً على احتياجاتك ومتطلباتك المحددة.'
                  : 'Get personalized AI solution recommendations based on your specific needs and requirements.'}
              </p>
              
              <Link 
                to="/discover" 
                className="text-[#4CEADB] hover:text-[#4CEADB]/80 flex items-center text-sm transition-colors duration-300"
              >
                {language === 'ar' ? 'البحث عن حلول' : 'Find solutions'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12 sm:py-20 bg-[#014952] relative">
        <div className="absolute inset-0 bg-[#014952]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-[#4CEADB] to-[#049394] text-transparent bg-clip-text">
                {translations.featuresTitle}
              </span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-[#4CEADB] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              { icon: Brain, color: 'from-primary-500 to-secondary-500' },
              { icon: Zap, color: 'from-secondary-500 to-primary-500' },
              { icon: Globe, color: 'from-green-400 to-teal-500' },
              { icon: Shield, color: 'from-orange-400 to-red-500' },
              { icon: Cpu, color: 'from-secondary-500 to-primary-500' },
              { icon: Sparkles, color: 'from-primary-500 to-secondary-500' }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-[#016774] rounded-lg p-6 sm:p-8 border border-[#4CEADB]/30 hover:border-[#4CEADB] transition-all duration-300 hover:transform hover:translate-y-[-4px]"
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-[#016774] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#016774] to-[#4CEADB] rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-[#4CEADB] transition-colors duration-300 relative z-10">
                  {translations[`featureTitle${index + 1}`]}
                </h3>
                
                <p className="text-sm text-white mb-4 sm:mb-6 leading-relaxed relative z-10">
                  {translations[`featureDescription${index + 1}`]}
                </p>
                
                <ul className="space-y-2 sm:space-y-3 relative z-10">
                  {[1, 2, 3].map((point) => (
                    <li key={point} className="flex items-start group/item">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#4CEADB] flex items-center justify-center mr-2 sm:mr-3 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                        <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm text-white group-hover/item:text-gray-300 transition-colors duration-300">
                        {translations[`featurePoint${index + 1}${point}`]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-[#016774] relative overflow-hidden">
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-8 text-white">
            <span className="text-[#4CEADB]">
              {translations.ctaTitle}
            </span>
          </h2>
          
          <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            {translations.ctaDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link 
              to="/vendor-onboarding" 
              className="group relative bg-[#4CEADB] hover:bg-[#4CEADB]/80 text-[#014952] font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:translate-y-[-2px]"
            >
              <Building className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {translations.vendorCTA}
              <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/discover" 
              className="group relative bg-[#014952] hover:bg-[#014952]/80 border border-[#4CEADB]/30 hover:border-[#4CEADB] text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:translate-y-[-2px]"
            >
              <Landmark className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {translations.governmentCTA}
              <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
      
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;