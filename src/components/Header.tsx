import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Zap, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { language, toggleLanguage, translations } = useLanguage();
  const { user, signOut } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset auth modal state when location changes
  useEffect(() => {
    // Reset any state when location changes
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent, dropdownName: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const aboutMenuItems = [
    { label: translations.about, path: '/about' },
    { label: translations.howItWorks, path: '/how-it-works' },
    { label: translations.goAdvantage, path: '/go-advantage' },
    { label: translations.successStories, path: '/success-stories' },
    { label: translations.faq, path: '/faq' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isLandingPage 
          ? 'bg-[#014952]/90 backdrop-blur-xl border-b border-[#049394]/30' 
          : 'bg-transparent'
      }`}
    >
      {/* Simple background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#014952]/90 to-[#4CEADB]/90"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <Logo color={isScrolled || !isLandingPage ? 'text-primary-500' : 'text-white'} />
              <div className="absolute inset-0 bg-primary-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${language === 'ar' ? 'space-x-reverse space-x-6' : 'space-x-6'}`}>
            <Link 
              to="/discover" 
              className={`relative font-medium transition-all duration-300 hover:text-primary-500 group text-sm ${
                isScrolled || !isLandingPage ? 'text-white' : 'text-white'
              }`}
            >
              {translations.discover}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></div>
            </Link>

            <Link 
              to="/vendor-onboarding" 
              className={`relative font-medium transition-all duration-300 hover:text-primary-500 group text-sm ${
                isScrolled || !isLandingPage ? 'text-white' : 'text-white'
              }`}
            >
              {translations.getListedShort}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
            
            <Link 
              to="/market-insights" 
              className={`relative font-medium transition-all duration-300 hover:text-primary-500 group text-sm ${
                isScrolled || !isLandingPage ? 'text-white' : 'text-white'
              }`}
            >
              {translations.marketInsights}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></div>
            </Link>

            {/* GOAI Link - Show for all users but require auth on click */}
            <Link 
              to={user ? "/goai-agent" : "#"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  navigate('/auth?redirect=/goai-agent');
                }
              }}
              className={`relative font-medium transition-all duration-300 hover:text-primary-500 group text-sm ${
                isScrolled || !isLandingPage ? 'text-white' : 'text-white'
              }`}
            >
              GO.Ai | رُوَّاد
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></div>
            </Link>

            {/* About Dropdown */}
            <div className="relative group">
              <button 
                onClick={(e) => handleDropdownClick(e, 'about')}
                className={`flex items-center font-medium group-hover:text-primary-500 transition-all duration-300 text-sm ${
                  isScrolled || !isLandingPage ? 'text-white' : 'text-white'
                }`}
              >
                {language === 'ar' ? translations.about : 'About Us'}
                <ChevronDown className={`w-4 h-4 ${language === 'ar' ? 'mr-1' : 'ml-1'} transition-transform duration-300 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-gray-900/90 backdrop-blur-xl rounded-lg border border-gray-700/50 overflow-hidden z-10 transition-all duration-300 ${
                activeDropdown === 'about' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}>
                {aboutMenuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-all duration-200 border-b border-gray-800/50 last:border-b-0"
                    onClick={() => setActiveDropdown(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Language Toggle Icon */}
            <button 
              onClick={() => toggleLanguage()}
              className={`p-2 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-all duration-300 ${
                isScrolled || !isLandingPage ? 'text-white' : 'text-white'
              }`}
              aria-label="Toggle language"
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Languages className="h-5 w-5" />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button 
                  onClick={(e) => handleDropdownClick(e, 'user')}
                  className={`flex items-center font-medium group-hover:text-primary-500 transition-all duration-300 px-3 py-2 rounded-lg border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-sm ${
                    isScrolled || !isLandingPage ? 'text-white' : 'text-white'
                  }`}
                >
                  <User className={`w-4 h-4 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="max-w-[100px] truncate">{user.contact_name}</span>
                  <ChevronDown className={`w-4 h-4 ${language === 'ar' ? 'mr-1' : 'ml-1'} transition-transform duration-300 ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-gray-900/90 backdrop-blur-xl rounded-lg border border-gray-700/50 overflow-hidden z-10 transition-all duration-300 ${
                  activeDropdown === 'user' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-all duration-200 border-b border-gray-800/50"
                    onClick={() => setActiveDropdown(null)}
                  >
                    {translations.myProfile}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setActiveDropdown(null);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                  >
                    {translations.signOut}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg border border-gray-700/50 bg-primary-500/10 hover:bg-primary-500/20 text-sm ${
                  isScrolled || !isLandingPage ? 'text-white hover:text-primary-500' : 'text-white hover:text-primary-500'
                }`}
              >
                {translations.signIn}
              </Link>
            )}
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => toggleLanguage()} 
              className={`p-2 mr-2 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-all duration-300 ${
                isScrolled || !isLandingPage ? 'text-white' : 'text-white'
              }`}
              aria-label="Toggle language"
            >
              <Languages className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`p-2 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-all duration-300 ${
                isScrolled || !isLandingPage ? 'text-white' : 'text-white'
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-[#014952]/95 backdrop-blur-xl border-b border-[#049394]/30 transition-all duration-500 overflow-hidden ${
          isMenuOpen ? 'max-h-screen py-4' : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex flex-col space-y-2">
            <Link 
              to="/discover" 
              className="font-medium text-white hover:text-primary-500 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-primary-500/10"
              onClick={() => setIsMenuOpen(false)}
            >
              {translations.discover}
            </Link>
            <Link 
              to="/vendor-onboarding" 
              className="font-medium text-white hover:text-primary-500 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-primary-500/10"
              onClick={() => setIsMenuOpen(false)}
            >
              {translations.getListedShort}
            </Link>
            <Link 
              to="/market-insights" 
              className="font-medium text-white hover:text-primary-500 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-primary-500/10"
              onClick={() => setIsMenuOpen(false)}
            >
              {translations.marketInsights}
            </Link>
            
            {/* GOAI Link - Show for all users but require auth on click */}
            <Link 
              to={user ? "/goai-agent" : "#"}
              onClick={() => {
                setIsMenuOpen(false);
                if (!user) {
                  navigate('/auth?redirect=/goai-agent');
                }
              }}
              className="font-medium text-white hover:text-primary-500 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-primary-500/10"
            >
              GOAI | رُوَّاد
            </Link>
            
            {/* About submenu items */}
            <div className="border-t border-gray-800/50 pt-2">
              <p className="text-sm font-semibold text-gray-500 mb-1 px-4">{translations.about}</p>
              {aboutMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="font-medium text-white hover:text-primary-500 transition-all duration-300 py-2 pl-8 pr-4 block rounded-lg hover:bg-primary-500/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="border-t border-gray-800/50 pt-2">
                <Link
                  to="/profile"
                  className="font-medium text-white hover:text-primary-500 transition-all duration-300 py-2 px-4 block rounded-lg hover:bg-primary-500/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translations.myProfile}
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="font-medium text-white hover:text-red-400 transition-all duration-300 py-2 px-4 text-left w-full rounded-lg hover:bg-red-500/10"
                >
                  {translations.signOut}
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMenuOpen(false)}
                className="font-medium text-white hover:text-primary-500 transition-all duration-300 py-2 px-4 text-left rounded-lg hover:bg-primary-500/10"
              >
                {translations.signIn}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;