import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/ui';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle auth callback
    const handleAuthCallback = async () => {
      try {
        // Get any redirect path from URL params
        const redirectTo = searchParams.get('redirect') || '/';
        
        // Small delay to ensure auth state is processed
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1000);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to home on error
        navigate('/', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

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
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-white mt-4 mb-2">
              Processing Authentication
            </h2>
            <p className="text-gray-300">
              Please wait while we complete your sign in...
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthCallback;