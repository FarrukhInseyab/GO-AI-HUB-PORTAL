import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, LoadingSpinner } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { resetPassword } from '../lib/auth';
import { validateToken } from '../utils/security';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { translations, language } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Missing reset token');
          setIsValidToken(false);
          setIsVerifying(false);
          return;
        }
        
        if (!validateToken(token)) {
          setError('Invalid token format');
          setIsValidToken(false);
          setIsVerifying(false);
          return;
        }
        
        // Token format is valid, allow password reset
        setIsValidToken(true);
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying token:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setIsValidToken(false);
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const token = searchParams.get('token');
      console.log('Reset password token:', token?.substring(0, 5) + '...');
      
      if (!token) {
        throw new Error('Missing reset token');
      }
      
      if (formData.password !== formData.confirmPassword) {
        throw new Error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      }
      
      if (formData.password.length < 6) {
        throw new Error(language === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      }
      
      const success = await resetPassword(token, formData.password);
      console.log('Password reset result:', success);
      
      if (success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      } else {
        throw new Error(language === 'ar' ? 'فشل إعادة تعيين كلمة المرور' : 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
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
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8 text-center">
            {isVerifying ? (
              <>
                <LoadingSpinner size="lg" />
                <h2 className="text-xl font-semibold text-white mt-4 mb-2">
                  {language === 'ar' ? 'جاري التحقق من الرمز...' : 'Verifying Token...'}
                </h2>
                <p className="text-gray-300">
                  {language === 'ar' ? 'يرجى الانتظار بينما نتحقق من صحة الرمز.' : 'Please wait while we verify your reset token.'}
                </p>
              </>
            ) : isSuccess ? (
              <>
                <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'تم إعادة تعيين كلمة المرور بنجاح!' : 'Password Reset Successful!'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {language === 'ar' 
                    ? 'تم تغيير كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.' 
                    : 'Your password has been changed. You can now sign in with your new password.'}
                </p>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : isValidToken ? (
              <>
                <div className="bg-primary-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {language === 'ar' 
                    ? 'الرجاء إدخال كلمة المرور الجديدة الخاصة بك أدناه.' 
                    : 'Please enter your new password below.'}
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm text-left">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="text-left">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 text-sm"
                      required
                      disabled={isSubmitting}
                      placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                      minLength={6}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 text-sm"
                      required
                      disabled={isSubmitting}
                      placeholder={language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'}
                      minLength={6}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    className="w-full"
                  >
                    {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'رمز غير صالح' : 'Invalid Token'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {error || (language === 'ar' 
                    ? 'الرمز الذي قدمته غير صالح أو منتهي الصلاحية. يرجى طلب إعادة تعيين كلمة المرور مرة أخرى.' 
                    : 'The token you provided is invalid or has expired. Please request a new password reset.')}
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

export default ResetPassword;