import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MarketHighlight from '../components/MarketHighlight';
import { BarChart3, TrendingUp, Calendar, Globe, Target, Zap, AlertCircle, Brain, ExternalLink, Sparkles, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { 
  currentMarketHighlights, 
  industryAdoptionData, 
  growthMetrics, 
  keyTrends, 
  globalContext, 
  updateInfo,
  aiMarketPerspective,
  sourceReferences
} from '../data/marketInsightsData';
import { getMarketInsightsUpdateStatus, updateMarketInsights, MarketInsightsUpdateStatus } from '../lib/marketInsights';
import { Button } from '../components/ui';

const MarketInsightsPage = () => {
  const { language, translations } = useLanguage();
  const { user } = useUser();
  const [updateStatus, setUpdateStatus] = useState<MarketInsightsUpdateStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadUpdateStatus();
  }, []);

  const loadUpdateStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getMarketInsightsUpdateStatus();
      console.log('Loaded update status:', status);
      setUpdateStatus(status);
    } catch (error) {
      console.error('Error loading update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!updateStatus?.updateNeeded) {
      setUpdateMessage({
        type: 'error',
        text: language === 'ar' 
          ? 'لا يلزم التحديث حتى الآن. التحديث التالي مجدول في ' + formatDate(updateStatus?.nextUpdate || new Date())
          : 'Update not needed yet. Next update scheduled for ' + formatDate(updateStatus?.nextUpdate || new Date())
      });
      
      setTimeout(() => {
        setUpdateMessage(null);
      }, 5000);
      
      return;
    }
    
    setIsUpdating(true);
    setUpdateMessage(null);
    
    try {
      const result = await updateMarketInsights();
      
      if (result.success) {
        setUpdateMessage({
          type: 'success',
          text: language === 'ar' 
            ? 'تم تحديث بيانات السوق بنجاح'
            : 'Market data updated successfully'
        });
        
        // Reload the update status
        await loadUpdateStatus();
      } else {
        setUpdateMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error updating market insights:', error);
      setUpdateMessage({
        type: 'error',
        text: language === 'ar' 
          ? 'فشل تحديث بيانات السوق'
          : 'Failed to update market data'
      });
    } finally {
      setIsUpdating(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 5000);
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return language === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
      }
      
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return language === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
    }
  };

  const isEvaluator = user?.role === 'Evaluator';

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
        <div className="relative py-8 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center mb-3 sm:mb-4 gap-2 sm:gap-4">
                
                {(isEvaluator || user?.role === 'Admin') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isUpdating || isLoading || (updateStatus && !updateStatus.updateNeeded)}
                  >
                    {isUpdating ? (
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    )}
                    {language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
                  </Button>
                )}
              </div>
              
              <div className="flex items-center mb-4 sm:mb-6">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mr-2 sm:mr-4" />
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {translations.marketInsightsTitle}
                </h1>
              </div>
              <p className="text-base sm:text-xl text-gray-300 mb-3 sm:mb-4">
                {translations.marketInsightsSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
          {/* AI-Generated Market Perspective */}
          <section className="mb-8 sm:mb-16">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-secondary-500/20 shadow-xl shadow-secondary-500/10 p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex items-center">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl border border-secondary-500/30">
                    <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-500" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold ml-3 sm:ml-4 text-white">
                    {language === 'ar' ? 'منظور الذكاء الاصطناعي للسوق' : 'AI Market Perspective'}
                  </h2>
                </div>
                <span className="bg-secondary-500/20 text-secondary-300 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border border-secondary-500/30 self-start sm:self-auto">
                  {language === 'ar' ? 'مُولد بالذكاء الاصطناعي' : 'AI Generated'}
                </span>
              </div>
              <div className="bg-gray-700/30 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-gray-600/50">
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {aiMarketPerspective[language]}
                </p>
              </div>
            </div>
          </section>

          {/* Current Market Highlights */}
          <section className="mb-8 sm:mb-16">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                {language === 'ar' ? 'أبرز إحصائيات السوق الحالية' : 'Current Market Highlights'}
              </h2>
              <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {currentMarketHighlights.map((highlight, index) => (
                <MarketHighlight
                  key={index}
                  title={highlight.title[language]}
                  value={highlight.value}
                  description={highlight.description[language]}
                  trend={highlight.trend}
                />
              ))}
            </div>
          </section>

          {/* Industry Adoption & Growth Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-16 mb-8 sm:mb-16">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-4 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold ml-3 sm:ml-4 text-white">{translations.industryAdoption}</h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {industryAdoptionData.map((industry, index) => (
                  <div key={index} className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-300 font-medium">{industry.industry[language]}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base text-primary-500 font-semibold">{industry.percentage}%</span>
                        <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                          industry.trend === 'up' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {industry.trend === 'up' ? '+' : ''}{industry.change}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 sm:h-2.5 rounded-full transition-all duration-1000" 
                        style={{ width: `${industry.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-4 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl border border-green-500/30">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold ml-3 sm:ml-4 text-white">{translations.growthForecast}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {growthMetrics.map((metric, index) => (
                  <div key={index} className="bg-gray-700/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-600/50 group hover:border-primary-500/30 transition-all duration-300">
                    <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">{metric.value}</div>
                    <div className="text-xs sm:text-sm text-gray-400 mb-2">{metric.metric[language]}</div>
                    <div className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full inline-block ${
                      metric.trend === 'up' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Market Trends */}
          <section className="mb-8 sm:mb-16">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-4 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold ml-3 sm:ml-4 text-white">
                  {language === 'ar' ? 'الاتجاهات الرئيسية للسوق' : 'Key Market Trends'}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {keyTrends.trends.map((trend, index) => (
                  <div key={index} className="group bg-gray-700/30 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-gray-600/50 hover:border-primary-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-primary-500 transition-colors duration-300">{trend.title[language]}</h3>
                      <span className="bg-green-500/20 text-green-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium border border-green-500/30">
                        {trend.growth}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{trend.description[language]}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Global Context */}
          <section className="mb-8 sm:mb-16">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-4 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl border border-secondary-500/30">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-500" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold ml-3 sm:ml-4 text-white">
                  {language === 'ar' ? 'السياق العالمي' : 'Global Context'}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {globalContext.metrics.map((metric, index) => (
                  <div key={index} className="group text-center p-4 sm:p-6 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50 hover:border-primary-500/30 transition-all duration-300">
                    <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">{metric.value}</div>
                    <div className="text-base sm:text-lg font-semibold text-white mb-1 group-hover:text-primary-500 transition-colors duration-300">{metric.title[language]}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{metric.description[language]}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Data Sources & References */}
          <section className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-4 sm:p-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {language === 'ar' ? 'مصادر البيانات والمراجع' : 'Data Sources & References'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-6">
              <div>
                <h4 className="font-medium text-sm sm:text-base text-primary-500 mb-3 sm:mb-4">
                  {language === 'ar' ? 'المصادر الأساسية' : 'Primary Sources'}
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {sourceReferences.primary.map((source, index) => (
                    <div key={index} className="bg-gray-700/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-gray-600/50 group hover:border-primary-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <h5 className="font-medium text-sm sm:text-base text-white group-hover:text-primary-500 transition-colors duration-300">{source.name}</h5>
                        <span className="text-xs text-gray-400">{source.reliability}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs bg-primary-500/20 text-primary-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-primary-500/30 inline-block">{source.type}</span>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-400 text-xs flex items-center transition-colors duration-300"
                        >
                          {language === 'ar' ? 'زيارة الموقع' : 'Visit Site'}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm sm:text-base text-secondary-500 mb-3 sm:mb-4">
                  {language === 'ar' ? 'المصادر الثانوية' : 'Secondary Sources'}
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {sourceReferences.secondary.map((source, index) => (
                    <div key={index} className="bg-gray-700/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-gray-600/50 group hover:border-secondary-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <h5 className="font-medium text-sm sm:text-base text-white group-hover:text-secondary-500 transition-colors duration-300">{source.name}</h5>
                        <span className="text-xs text-gray-400">{source.reliability}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs bg-secondary-500/20 text-secondary-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-secondary-500/30 inline-block">{source.type}</span>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-secondary-500 hover:text-secondary-400 text-xs flex items-center transition-colors duration-300"
                        >
                          {language === 'ar' ? 'زيارة الموقع' : 'Visit Site'}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MarketInsightsPage;