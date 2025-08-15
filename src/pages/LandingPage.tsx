import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SuccessStory from '../components/SuccessStory';
import MarketHighlight from '../components/MarketHighlight';
import { ArrowRight, Check, Zap, Building, Landmark, Cpu, Brain, Shield, Globe, Sparkles, Bot, TrendingUp, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { successStories, marketHighlights } from '../data/landingPageData';

const LandingPage = () => {
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [showCTAform, setshowCTAform] = useState(false);
  const [formData, setFormData] = useState({
        subject: 'CTA Form Submission – GO AI HUB',
        contact_name: '',
        contact_email: '',
        contact_phone: ''
      });

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

  useEffect(() => {
        
    setshowCTAform(false);
        
  }, []);

  const handleCTAclick = () => {
    
      setshowCTAform(true);
    
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);
   
      try {
        // Validate required fields
        if (!formData.contact_name.trim()) {
          throw new Error(language === 'ar' ? 'الاسم مطلوب' : 'Name is required');
        }
        if (!formData.contact_phone.trim()) {
          throw new Error(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
        }
        if (!formData.subject.trim()) {
          throw new Error(language === 'ar' ? 'الموضوع مطلوب' : 'Subject is required');
        }
        if (!formData.contact_email.trim()) {
          throw new Error(language === 'ar' ? 'الرسالة مطلوبة' : 'Message is required');
        }
   
        
   
        // Prepare email content
        const emailSubject = `${formData.subject}`;
  
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #00afaf;">CTA Form Submission</h1>
            </div>

            <p><strong>Name:</strong> ${formData.contact_name || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${formData.contact_phone || 'Not provided'}</p>
            <p><strong>Email:</strong> ${formData.contact_email || 'Not provided'}</p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
              <p>This CTA form was submitted through the GO AI HUB website.</p>
              <p>Best regards,<br>
              GO AI HUB Team<br>
              Email: <a href="mailto:support@goaihub.ai">support@goaihub.ai</a><br>
              Website: <a href="https://www.goaihub.ai" target="_blank">www.goaihub.ai</a><br>
              Working Hours: Sunday–Thursday, 9:00 AM – 5:00 PM (KSA Time)</p>
            </div>

            <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;">

            <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
              <h1 style="color: #00afaf;">تم إرسال نموذج الدعوة للإجراء</h1>
              <p><strong>الاسم:</strong> ${formData.contact_name || 'لم يتم التقديم'}</p>
              <p><strong>رقم الجوال:</strong> ${formData.contact_phone || 'لم يتم التقديم'}</p>
              <p><strong>البريد الإلكتروني:</strong> ${formData.contact_email || 'لم يتم التقديم'}</p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
                <p>تم إرسال هذا النموذج من خلال موقع GO AI HUB.</p>
                <p>مع أطيب التحيات،<br>
                فريق GO AI HUB<br>
                البريد الإلكتروني: <a href="mailto:support@goaihub.ai">support@goaihub.ai</a><br>
                الموقع الإلكتروني: <a href="https://www.goaihub.ai" target="_blank">www.goaihub.ai</a><br>
                ساعات العمل: الأحد–الخميس، 9:00 صباحًا – 5:00 مساءً (بتوقيت السعودية)</p>
              </div>
            </div>
          </div>
      `;
  
   
        // Send email using the email service
        const emailServiceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'https://goaihub.ai/email/api';
       
        const response = await fetch(`${emailServiceUrl}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: 'info@goaihub.ai',
            type: 'custom',
            subject: emailSubject,
            html: emailHtml
          })
        });
   
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to send message');
        }
   
        setShowSuccess(true);
       
        // Reset form
         setFormData({
            subject: '',
            
            contact_name: '',
            contact_email:'',
            contact_phone: ''

          });
    
          // Hide success message after 5 seconds
          setTimeout(() => {
            setShowSuccess(false);
          }, 5000);
   
        
   
      } catch (error) {
        console.error('Error sending contact form:', error);
        setError(error instanceof Error ? error.message : 'Failed to send message');
      } finally {
        setIsSubmitting(false);
      }
    };

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
                className="group relative text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-500 flex items-center justify-center gap-2 transform hover:translate-y-[-2px] bg-gradient-to-r from-[#4CEADB] to-[#014952] bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:100%_50%]"
              >
                <Building className="h-5 w-5 sm:h-6 sm:w-6" />
                {translations.vendorCTA}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              
              <Link 
                to="/discover" 
                className="group relative text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-500 flex items-center justify-center gap-2 transform hover:translate-y-[-2px] bg-gradient-to-r from-[#4CEADB] to-[#014952] bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:100%_50%]"
              >
                <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
                {translations.governmentCTA}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* <button
                  onClick={handleCTAclick}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 text-sm sm:text-base"
                >
                  {translations.ctaform}
                </button> */}
                
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
            <div className="inline-flex items-center mb-3 sm:mb-4 gap-3">
              <div className="p-2 sm:p-3 bg-[#016774] rounded-lg border border-[#4CEADB]/30">
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
      <section className="py-12 sm:py-20 bg-[#014952] relative">
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
                    <li key={point} className="flex items-start group/item gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#4CEADB] flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
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
              className="group relative bg-[#4CEADB] hover:bg-[#4CEADB]/80 text-[#014952] font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:translate-y-[-2px]"
            >
              <Building className="h-5 w-5 sm:h-6 sm:w-6" />
              {translations.vendorCTA}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/discover" 
              className="group relative bg-[#014952] hover:bg-[#014952]/80 border border-[#4CEADB]/30 hover:border-[#4CEADB] text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:translate-y-[-2px]"
            >
              <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
              {translations.governmentCTA}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      {showSuccess && (
                                    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500/20 border border-green-500/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg z-50 max-w-xs sm:max-w-md text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                        <p className="text-sm sm:text-base text-green-300">{translations.interestSubmitted}</p>
                                      </div>
                                    </div>
                                  )}
                {showCTAform && (
                          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-900/95 backdrop-blur-xl border border-primary-500/20 rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl shadow-primary-500/10">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg sm:text-xl font-semibold text-white">{translations.ctaform}</h3>
                                <button
                                  onClick={() => setshowCTAform(false)}
                                  className="text-gray-400 hover:text-primary-500 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                
                              <form onSubmit={handleSubmit}>
                                <div className="space-y-3 sm:space-y-4">
                                  
                
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                                      {translations.name} *
                                    </label>
                                    <input
                                      type="text"
                                      name="contact_name"
                                      value={formData.contact_name}
                                      onChange={handleInputChange}
                                      required
                                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                                    />
                                  </div>
                
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                                      {translations.email} *
                                    </label>
                                    <input
                                      type="email"
                                      name="contact_email"
                                      value={formData.contact_email}
                                      onChange={handleInputChange}
                                      required
                                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                                    />
                                  </div>
                
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                                      {translations.phone} *
                                    </label>
                                    <input
                                      type="tel"
                                      name="contact_phone"
                                      value={formData.contact_phone}
                                      onChange={handleInputChange}
                                      required
                                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                                    />
                                  </div>
                
                                  
                                </div>
                
                                {error && (
                                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-red-400">{error}</p>
                                )}
                
                                <div className="mt-4 sm:mt-6 flex justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setshowCTAform(false)}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-400 hover:text-gray-300 transition-colors duration-300 text-sm"
                                  >
                                    {translations.cancel}
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 transition-all duration-300 shadow-lg shadow-primary-500/25 text-sm"
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                        {translations.submitting}
                                      </>
                                    ) : (
                                      translations.submit
                                    )}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}
      
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