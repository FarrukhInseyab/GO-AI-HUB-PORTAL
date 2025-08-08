import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Cookie, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CookiePolicy = () => {
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
                  {translations.cookiePolicyTitle}
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {translations.cookiePolicySubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
              <div className="flex items-center mb-8">
                <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                  <Cookie className="h-8 w-8 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold ml-4 text-white">{translations.understandingCookieUsage}</h2>
              </div>

              <div className="space-y-8 text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-primary-500 mb-4">{translations.whatAreCookies}</h3>
                  <p className="mb-4">{translations.whatAreCookiesDesc}</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2"></div>
                      {translations.rememberingPreferences}
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2"></div>
                      {translations.understandingUsage}
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2"></div>
                      {translations.keepingSignedIn}
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2"></div>
                      {translations.protectingSecurity}
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-primary-500 mb-4">{translations.typesOfCookies}</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-lg border border-gray-600/50">
                      <h4 className="font-semibold text-white mb-2">{translations.essentialCookies}</h4>
                      <p>{translations.essentialCookiesDesc}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-lg border border-gray-600/50">
                      <h4 className="font-semibold text-white mb-2">{translations.functionalCookies}</h4>
                      <p>{translations.functionalCookiesDesc}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-lg border border-gray-600/50">
                      <h4 className="font-semibold text-white mb-2">{translations.analyticsCookies}</h4>
                      <p>{translations.analyticsCookiesDesc}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-lg border border-gray-600/50">
                      <h4 className="font-semibold text-white mb-2">{translations.authenticationCookies}</h4>
                      <p>{translations.authenticationCookiesDesc}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-primary-500 mb-4">{translations.managingCookies}</h3>
                  <p>{translations.managingCookiesDesc}</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-primary-500 mb-4">{translations.thirdPartyCookies}</h3>
                  <p className="mb-4">{translations.thirdPartyCookiesDesc}</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2"></div>
                      {translations.analyticsPerformance}
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2"></div>
                      {translations.securityFraud}
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2"></div>
                      {translations.featureEnhancement}
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-primary-500 mb-4">{translations.updatesToPolicy}</h3>
                  <p>{translations.updatesPolicyDesc}</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-primary-500 mb-4">{translations.contactUs}</h3>
                  <p className="mb-4">If you have questions about our cookie usage, please contact us at:</p>
                  <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-lg border border-gray-600/50">
                    <p className="text-primary-500">Email: privacy@goaihub.ai</p>
                    <p className="text-primary-500">Address: 3758 King Abdullah Road, Al Maghrazat District, Riyadh 12482 6514, Riyadh 12431</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;