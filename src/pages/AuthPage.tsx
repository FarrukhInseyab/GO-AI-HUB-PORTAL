import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, User, Building, Globe, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { COUNTRIES } from '../constants';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AuthPage = () => {
  const { user, setUser } = useUser();
  const { translations, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from URL query params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contactName: '',
    companyName: '',
    country: '',
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    debugger;
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let authenticatedUser;
      
      if (isSignIn) {
        console.log('Attempting sign in for:', formData.email);
        debugger;
        authenticatedUser = await signIn(formData.email, formData.password);
      } else {
        // Validation for sign up
        if (formData.password !== formData.confirmPassword) {
          throw new Error(translations.passwordsDoNotMatch);
        }
        if (formData.password.length < 6) {
          throw new Error(translations.passwordTooShort);
        }
        if (!formData.contactName.trim()) {
          throw new Error('Contact name is required');
        }
        if (!formData.companyName.trim()) {
          throw new Error('Company name is required');
        }
        if (!formData.country) {
          throw new Error('Country is required');
        }
        
        console.log('Attempting sign up for:', formData.email);
        authenticatedUser = await signUp(formData.email, formData.password, {
          contact_name: formData.contactName.trim(),
          company_name: formData.companyName.trim(),
          country: formData.country,
        });
      }
      
      console.log('Authentication successful:', authenticatedUser);
      if(authenticatedUser.email_confirmed == true){
      // Set user in context
      setUser(authenticatedUser);
      
      // Navigate to redirect path
      
      navigate(redirectPath, { replace: true });
      }else{
        setError('Confirmation email sent. Please check your inbox to verify your account.');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#014952]">
      <Header />
      
      <main className="flex-grow pt-20 flex items-center justify-center relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[#014952]"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center text-[#4CEADB] hover:text-[#4CEADB]/80 mb-4 transition-colors duration-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
              </Link>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isSignIn ? translations.signIn : translations.createAccount}
              </h1>
              <p className="text-gray-300">
                {isSignIn 
                  ? language === 'ar' ? 'قم بتسجيل الدخول للوصول إلى حسابك' : 'Sign in to access your account' 
                  : language === 'ar' ? 'أنشئ حسابًا جديدًا للبدء' : 'Create a new account to get started'}
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg flex items-start bg-[#016774]">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div className="bg-[#016774] rounded-lg border border-[#4CEADB]/30 p-6 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {translations.email} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
                      required
                      disabled={isLoading}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {!isSignIn && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {translations.contactName} *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
                          required
                          disabled={isLoading}
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {translations.companyName} *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
                          required
                          disabled={isLoading}
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {translations.country} *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white text-sm appearance-none"
                          required
                          disabled={isLoading}
                        >
                          <option value="">{translations.selectCountry}</option>
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country} className="bg-[#014952] text-white">
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {translations.password} *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
                    required
                    disabled={isLoading}
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>

                {!isSignIn && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {translations.confirmPassword} *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
                      required
                      disabled={isLoading}
                      placeholder="Confirm your password"
                      minLength={6}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#4CEADB] hover:bg-[#4CEADB]/80 text-[#014952] py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-all duration-300 text-sm font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {isSignIn ? translations.signingIn : translations.creatingAccount}
                    </>
                  ) : (
                    <span>
                      {isSignIn ? translations.signIn : translations.createAccount}
                    </span>
                  )}
                </button>

                <div className="text-center mt-4">
            
            {isSignIn && (
              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-[#4CEADB] hover:text-[#4CEADB]/80 text-sm transition-colors duration-300"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </Link>
              </div>
            )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignIn(!isSignIn);
                      setError(null);
                      setFormData({
                        ...formData,
                        password: '',
                        confirmPassword: '',
                        contactName: '',
                        companyName: '',
                        country: '',
                      });
                    }}
                    className="text-[#4CEADB] hover:text-[#4CEADB]/80 text-sm transition-colors duration-300"
                    disabled={isLoading}
                  >
                    {isSignIn ? translations.dontHaveAccount : translations.alreadyHaveAccount}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthPage;