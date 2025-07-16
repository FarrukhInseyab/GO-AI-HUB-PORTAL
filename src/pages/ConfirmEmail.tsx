import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, LoadingSpinner } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { verifyEmailConfirmation } from '../lib/auth';
import { validateToken } from '../utils/security';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { translations, language } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Missing confirmation token');
          setIsVerifying(false);
          return;
        }
        
        if (!validateToken(token)) {
          setError('Invalid confirmation token format');
          setIsVerifying(false);
          return;
        }
        
        const success = await verifyEmailConfirmation(token);
        
        setIsSuccess(success);
        if (!success) {
          setError('Failed to verify email. The token may be invalid or expired.');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

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
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8 text-center">
            {isVerifying ? (
              <>
                <LoadingSpinner size="lg" />
                <h2 className="text-xl font-semibold text-white mt-4 mb-2">
                  {language === 'ar' ? 'جاري التحقق من بريدك الإلكتروني...' : 'Verifying Your Email...'}
                </h2>
                <p className="text-gray-300">
                  {language === 'ar' ? 'يرجى الانتظار بينما نتحقق من بريدك الإلكتروني.' : 'Please wait while we verify your email address.'}
                </p>
              </>
            ) : isSuccess ? (
              <>
                <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'تم تأكيد البريد الإلكتروني بنجاح!' : 'Email Confirmed Successfully!'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {language === 'ar' 
                    ? 'شكرًا لتأكيد بريدك الإلكتروني. يمكنك الآن استخدام جميع ميزات المنصة.' 
                    : 'Thank you for confirming your email address. You can now use all features of the platform.'}
                </p>
                <Button onClick={() => navigate('/')} className="w-full">
                  {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home Page'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  {error?.includes('expired') ? (
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-400" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'فشل تأكيد البريد الإلكتروني' : 'Email Confirmation Failed'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {error || (language === 'ar' 
                    ? 'حدث خطأ أثناء تأكيد بريدك الإلكتروني. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.' 
                    : 'There was an error confirming your email. Please try again or contact support.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')} 
                    className="flex-1"
                  >
                    {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Return Home'}
                  </Button>
                  <Link 
                    to="/auth" 
                    className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                  >
                    {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ConfirmEmail;