import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, LoadingSpinner } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { requestPasswordReset } from '../lib/auth';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { translations, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (!email.trim()) {
        throw new Error(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(language === 'ar' ? 'صيغة البريد الإلكتروني غير صالحة' : 'Invalid email format');
      }
      
      const success = await requestPasswordReset(email);
      
      if (success) {
        setIsSuccess(true);
      } else {
        throw new Error(language === 'ar' ? 'فشل في إرسال رابط إعادة تعيين كلمة المرور' : 'Failed to send password reset link');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      
      <main className="flex-grow pt-20 flex items-center justify-center relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-secondary-900/20 to-primary-900/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 175, 175, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 175, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-md w-full mx-4 relative z-10">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
            <Link to="/auth" className="inline-flex items-center text-primary-500 hover:text-primary-400 mb-6 transition-colors duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to Sign In'}
            </Link>
            
            {isSuccess ? (
              <div className="text-center">
                <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'تم إرسال رابط إعادة التعيين!' : 'Reset Link Sent!'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {language === 'ar' 
                    ? `لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}. يرجى التحقق من بريدك الإلكتروني واتباع التعليمات.` 
                    : `We've sent a password reset link to ${email}. Please check your email and follow the instructions.`}
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  {language === 'ar' 
                    ? 'إذا لم تستلم البريد الإلكتروني، يرجى التحقق من مجلد البريد العشوائي أو المحاولة مرة أخرى.' 
                    : 'If you don\'t receive the email, please check your spam folder or try again.'}
                </p>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  {language === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Return to Sign In'}
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {language === 'ar' 
                    ? 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.' 
                    : 'Enter your email address and we\'ll send you a link to reset your password.'}
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 text-sm"
                        required
                        disabled={isSubmitting}
                        placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    className="w-full"
                  >
                    {language === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;