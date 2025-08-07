import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

// X logo SVG component
const XLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 group-hover:text-primary-500 transition-colors duration-300">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
  </svg>
);

const Footer = () => {
  const { translations } = useLanguage();
  
  return (
    <footer className="relative bg-[#014952] text-white pt-12 sm:pt-16 pb-6 sm:pb-8 overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#049394]/5 via-[#4CEADB]/5 to-[#049394]/5"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#049394]/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#4CEADB]/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 relative z-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center group">
              <Logo color="text-[#049394]" />
            </div>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{translations.footerTagline}</p>
            <div className="flex space-x-3 sm:space-x-4">
              {[
                { icon: Facebook, href: "https://www.facebook.com/GOTelecomKSA" },
                { custom: XLogo, href: "https://twitter.com/GOTelecomKSA" },
                { icon: Linkedin, href: "https://www.linkedin.com/company/gotelecomksa" },
                { icon: Instagram, href: "https://www.instagram.com/gotelecomksa" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  className="group relative p-2 sm:p-3 rounded-lg border border-[#4CEADB]/20 hover:bg-[#016774] transition-all duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon ? (
                    <social.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#4CEADB] transition-colors duration-300" />
                  ) : social.custom ? (
                    <social.custom />
                  ) : null}
                  <div className="absolute inset-0 bg-[#049394]/20 rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-bold text-base sm:text-lg text-[#049394] flex items-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#049394]" />
              {translations.quickLinks}
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              {[
                { label: translations.home, path: "/" },
                { label: translations.discover, path: "/discover" },
                { label: translations.getListedShort, path: "/vendor-onboarding" },
                { label: translations.about, path: "/about" },
                { label: "How It Works", path: "/how-it-works" },
                { label: translations.faq, path: "/faq" }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-[#049394] transition-all duration-300 relative group inline-block"
                  >
                    {link.label}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#049394] to-[#4CEADB] group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-bold text-base sm:text-lg text-[#049394] flex items-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#049394]" />
              {translations.contact}
            </h3>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <li className="flex items-start group">
                <div className="p-1.5 sm:p-2 rounded-lg border border-[#049394]/20 bg-[#049394]/5 mr-2 sm:mr-3 mt-1">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#049394]" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm sm:text-base">
                  3758 King Abdullah Road, Al Maghrazat District, Riyadh 12482 6514, Riyadh 12431
                </span>
              </li>
              <li className="flex items-center group">
                <div className="p-1.5 sm:p-2 rounded-lg border border-[#049394]/20 bg-[#049394]/5 mr-2 sm:mr-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#049394]" />
                </div>
                <a 
                  href="mailto:info@goaihub.ai" 
                  className="text-gray-400 hover:text-[#049394] transition-all duration-300 text-sm sm:text-base"
                >
                  info@goaihub.ai
                </a>
              </li>
              {/* <li className="flex items-center group">
                <div className="p-1.5 sm:p-2 rounded-lg border border-[#049394]/20 bg-[#049394]/5 mr-2 sm:mr-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#049394]" />
                </div>
                <a 
                  href="tel:+966591364477" 
                  className="text-gray-400 hover:text-[#049394] transition-all duration-300 text-sm sm:text-base"
                >
                  +966 59 136 4477
                </a>
              </li> */}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#016774] pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs sm:text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} GO AI HUB. {translations.allRightsReserved}
          </p>
          <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
            <Link 
              to="/privacy" 
              className="text-gray-500 hover:text-[#049394] transition-all duration-300 relative group"
            >
              {translations.privacyPolicy}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#049394] to-[#4CEADB] group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link 
              to="/cookies" 
              className="text-gray-500 hover:text-[#049394] transition-all duration-300 relative group"
            >
              {translations.cookiePolicy}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#049394] to-[#4CEADB] group-hover:w-full transition-all duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;