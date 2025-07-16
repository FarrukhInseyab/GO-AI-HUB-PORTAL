import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Mail, User, Building, Globe } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { COUNTRIES } from '../constants';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'sign-in' | 'sign-up';
  initialEmail?: string;
  redirectPath?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'sign-in', 
  initialEmail = '',
  redirectPath = '/'
}) => {
  const { user, setUser } = useUser();
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(mode === 'sign-in');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
    confirmPassword: '',
    contactName: '',
    companyName: '',
    country: '',
  });

  // Close modal and redirect when user is authenticated
  useEffect(() => {
    if (user && isOpen) {
      console.log('User authenticated, closing modal and redirecting:', user);
      onClose();
      
      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        navigate(redirectPath);
      }, 100);
    }
  }, [user, isOpen, onClose, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let authenticatedUser;
      
      if (isSignIn) {
        console.log('Attempting sign in for:', formData.email);
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
      
      // Set user in context - this will trigger the useEffect above
      setUser(authenticatedUser);
      
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  // Reset form when switching between sign in/up
  useEffect(() => {
    setError(null);
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: '',
      contactName: '',
      companyName: '',
      country: '',
    }));
  }, [isSignIn]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#014952]/70 backdrop-blur-sm flex items-center justify-center z-[200]"
      onClick={(e) => {
        // Close when clicking the backdrop (but not when loading)
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="bg-[#014952] border border-[#4CEADB]/30 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isSignIn ? translations.signIn : translations.createAccount}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-[#4CEADB] p-2 rounded-lg hover:bg-[#016774] transition-all duration-300 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg flex items-start bg-[#016774]">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

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
                className="w-full pl-10 pr-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
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
                    className="w-full pl-10 pr-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
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
                    className="w-full pl-10 pr-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
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
                    className="w-full pl-10 pr-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white text-sm appearance-none"
                    required
                    disabled={isLoading}
                  >
                    <option value="">{translations.selectCountry}</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country} className="bg-[#016774] text-white">
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
              className="w-full px-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
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
                className="w-full px-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 text-sm"
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
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-[#4CEADB] hover:text-[#4CEADB]/80 text-sm transition-colors duration-300"
              disabled={isLoading}
            >
              {isSignIn ? translations.dontHaveAccount : translations.alreadyHaveAccount}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;