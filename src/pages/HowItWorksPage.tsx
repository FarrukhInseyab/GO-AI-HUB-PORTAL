import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ClipboardList, Search, UserCheck, Rocket, Shield, Settings, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const HowItWorksPage = () => {
  const { translations } = useLanguage();

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
                  {translations.howItWorksTitle}
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {translations.howItWorksSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Process for Solution Providers */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-4">
                {translations.forSolutionProviders}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: ClipboardList, title: `1. ${translations.submitSolutionStep}`, desc: translations.submitSolutionDesc, color: 'from-primary-500 to-secondary-500' },
                  { icon: Shield, title: `2. ${translations.verificationStep}`, desc: translations.verificationDesc, color: 'from-secondary-500 to-primary-500' },
                  { icon: Rocket, title: `3. ${translations.goLiveStep}`, desc: translations.goLiveDesc, color: 'from-green-400 to-teal-500' }
                ].map((step, index) => (
                  <div key={index} className="group text-center">
                    <div className="relative mb-6">
                      <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <step.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary-500 transition-colors duration-300">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process for Organizations */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-4">
                {translations.forOrganizations}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Search, title: `1. ${translations.discoverStep}`, desc: translations.discoverDesc, color: 'from-orange-400 to-red-500' },
                  { icon: UserCheck, title: `2. ${translations.connectStep}`, desc: translations.connectDesc, color: 'from-secondary-500 to-primary-500' },
                  { icon: Settings, title: `3. ${translations.implementStep}`, desc: translations.implementDesc, color: 'from-primary-500 to-secondary-500' }
                ].map((step, index) => (
                  <div key={index} className="group text-center">
                    <div className="relative mb-6">
                      <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <step.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary-500 transition-colors duration-300">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30">
                    <Zap className="h-8 w-8 text-primary-500" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  {translations.whyChooseHub}
                </h2>
                <ul className="text-left space-y-4">
                  {[
                    translations.curatedSelection,
                    translations.directAccess,
                    translations.aiPoweredRecommendations,
                    translations.complianceWithRegulations,
                    translations.expertGuidance
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center group">
                      <div className="h-2 w-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                      <span className="text-gray-300 group-hover:text-primary-500 transition-colors duration-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorksPage;