import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { successStories } from '../data/landingPageData';

const SuccessStoriesPage = () => {
  const { language, translations } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      
      <main className="flex-grow pt-20 relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-secondary-900/10 to-primary-900/10"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 175, 175, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 175, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Hero Section */}
        <div className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center mb-6 gap-3">
                <Sparkles className="h-8 w-8 text-primary-500" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {translations.successStoriesPageTitle}
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {translations.successStoriesPageSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="space-y-16">
            {successStories.map((story, index) => (
              <div key={index} className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-primary-500/30 shadow-lg hover:shadow-primary-500/20 overflow-hidden transition-all duration-500">
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="p-8 relative z-10">
                  <div className="flex items-center mb-6 gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30 mr-4">
                      <Zap className="h-6 w-6 text-primary-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white group-hover:text-primary-500 transition-colors duration-300">{story.title[language]}</h2>
                  </div>
                  <p className="text-lg text-gray-300 max-w-2xl mb-6 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{story.description[language]}</p>
                  <div className="bg-gray-700/30 backdrop-blur-sm p-6 rounded-xl border border-primary-500/20">
                    <div className="flex items-center mb-4 gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                      <h3 className="text-xl font-semibold text-primary-500">{translations.impact}:</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{story.impact[language]}</p>
                    
                    {/* Animated progress bar */}
                    <div className="mt-4 h-1 bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full w-full transition-all duration-2000"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SuccessStoriesPage;