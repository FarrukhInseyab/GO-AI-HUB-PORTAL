import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Users, Rocket, Globe, Check, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const GoAdvantagePage = () => {
  const { translations, language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 overflow-x-hidden">
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
                  {language === 'ar' ? translations.goAdvantageTitle : 'Why GO AI Hub?'}
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {translations.goAdvantageSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-primary-500/30 shadow-lg hover:shadow-primary-500/20 p-8 transition-all duration-500">
              <div className="flex items-center mb-6 gap-3">
                <div className="p-4 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30">
                  <Shield className="h-8 w-8 text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-primary-500 transition-colors duration-300">{translations.trustedVerification}</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {translations.trustedVerificationDesc}
              </p>
              <ul className="space-y-3">
                {[
                  translations.technicalCapabilityAssessment,
                  translations.securityComplianceVerification,
                  translations.performanceBenchmarking
                ].map((item, index) => (
                  <li key={index} className="flex items-start group/item gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover/item:text-primary-500 transition-colors duration-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-secondary-500/30 shadow-lg hover:shadow-secondary-500/20 p-8 transition-all duration-500">
              <div className="flex items-center mb-6 gap-3">
                <div className="p-4 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl border border-secondary-500/30">
                  <Users className="h-8 w-8 text-secondary-500" />
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-secondary-500 transition-colors duration-300">{translations.expertSupportTitle}</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {translations.expertSupportDesc}
              </p>
              <ul className="space-y-3">
                {[
                  translations.solutionSelectionGuidance,
                  translations.implementationSupport,
                  translations.ongoingOptimization
                ].map((item, index) => (
                  <li key={index} className="flex items-start group/item gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-secondary-500 to-primary-500 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover/item:text-secondary-500 transition-colors duration-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-8 gap-3">
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl border border-green-500/30">
                  <Rocket className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">{translations.acceleratedImplementation}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { value: "40%", label: translations.fasterDeployment, color: 'from-primary-500 to-secondary-500' },
                  { value: "60%", label: translations.costReduction, color: 'from-secondary-500 to-primary-500' },
                  { value: "90%", label: translations.successRate, color: 'from-green-400 to-teal-500' }
                ].map((metric, index) => (
                  <div key={index} className="group bg-gray-700/30 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50 hover:border-primary-500/30 transition-all duration-300">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      {metric.value}
                    </div>
                    <div className="text-gray-300 group-hover:text-primary-500 transition-colors duration-300">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
            <div className="flex items-center mb-8 gap-3">
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                <Globe className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{translations.globalNetwork}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-700/30 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50">
                <h3 className="text-xl font-semibold mb-4 text-primary-500">{translations.solutionProviders}</h3>
                <ul className="space-y-3">
                  {[
                    `200+ ${translations.verifiedProviders}`,
                    translations.globalLocalExpertise,
                    translations.diverseIndustryCoverage
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-300 group-hover:text-primary-500 transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-700/30 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50">
                <h3 className="text-xl font-semibold mb-4 text-secondary-500">{translations.implementationPartners}</h3>
                <ul className="space-y-3">
                  {[
                    `50+ ${translations.certifiedPartners}`,
                    translations.localPresenceSupport,
                    translations.provenTrackRecord
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-secondary-500 to-primary-500 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-300 group-hover:text-secondary-500 transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/discover" 
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
              <span className="relative z-10">{translations.exploreAISolutions}</span>
              <ArrowRight className="ml-2 h-5 w-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GoAdvantagePage;