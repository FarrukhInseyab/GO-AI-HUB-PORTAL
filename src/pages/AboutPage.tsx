import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Building2, Globe, Handshake, Target, Users, Award, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage = () => {
  const { translations, language } = useLanguage();

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
              <div className="flex items-center mb-6">
                <Sparkles className="h-8 w-8 text-primary-500 mr-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {language === 'ar' ? translations.aboutTitle : 'About Us'}
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {translations.aboutSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
                <div className="flex items-center mb-6">
                  <Zap className="h-6 w-6 text-primary-500 mr-3" />
                  <h2 className="text-3xl font-bold text-white">{translations.ourMission}</h2>
                </div>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {translations.missionDescription}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group bg-gray-700/30 backdrop-blur-sm p-6 rounded-xl border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg border border-primary-500/30">
                        <Globe className="h-6 w-6 text-primary-500" />
                      </div>
                      <h3 className="text-xl font-semibold ml-3 text-white group-hover:text-primary-500 transition-colors duration-300">{translations.globalInnovation}</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {translations.globalInnovationDesc}
                    </p>
                  </div>
                  <div className="group bg-gray-700/30 backdrop-blur-sm p-6 rounded-xl border border-secondary-500/20 hover:border-secondary-400/40 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-lg border border-secondary-500/30">
                        <Building2 className="h-6 w-6 text-secondary-500" />
                      </div>
                      <h3 className="text-xl font-semibold ml-3 text-white group-hover:text-secondary-500 transition-colors duration-300">{translations.localImpact}</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {translations.localImpactDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-4">
                {translations.whatWeOffer}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Target, title: translations.curatedSolutions, desc: translations.curatedSolutionsDesc, color: 'from-primary-500 to-secondary-500' },
                { icon: Handshake, title: translations.directConnections, desc: translations.directConnectionsDesc, color: 'from-secondary-500 to-primary-500' },
                { icon: Users, title: translations.expertSupport, desc: translations.expertSupportDesc, color: 'from-green-400 to-teal-500' }
              ].map((feature, index) => (
                <div key={index} className="group text-center">
                  <div className="relative mb-6">
                    <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary-500 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision 2030 Alignment */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                    <Award className="h-8 w-8 text-amber-400" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">{translations.vision2030Alignment}</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {translations.vision2030Description}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;