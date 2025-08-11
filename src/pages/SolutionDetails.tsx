import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { getSolutionById, createInterest, updateSolution, type Solution } from '../lib/supabase';
import { ArrowLeft, Globe, Mail, Building2, Users, Calendar, Check, ExternalLink, Loader2, X, Sparkles, Image, ChevronLeft, ChevronRight, Grid, DollarSign, Briefcase, Award, Layers, Server, FileText, MapPin, Hash } from 'lucide-react';
import { useTranslatedSolution } from '../hooks/useTranslation';
import TranslatedText from '../components/ui/TranslatedText';

const SolutionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translations, language } = useLanguage();
  const { user } = useUser();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    message: ''
  });

  // Image gallery state
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isChangingHeaderImage, setIsChangingHeaderImage] = useState(false);

  useEffect(() => {
    loadSolution();
  }, [id]);

  useEffect(() => {
    // Pre-fill form data when user is available
    if (user) {
      setFormData(prev => ({
        ...prev,
        company_name: user.company_name || '',
        contact_name: user.contact_name || '',
        contact_email: user.email || ''
      }));
    }
  }, [user]);

  // Handle successful authentication
  useEffect(() => {
    if (user) {
      setShowInterestForm(true);
    }
  }, [user]);

  const loadSolution = async () => {
    if (!id) return;
    
    try {
      const data = await getSolutionById(id);
      setSolution(data);
    } catch (error) {
      console.error('Error loading solution:', error);
      setError(translations.errorLoadingSolutions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestClick = () => {
    if (!user) {
      navigate(`/auth?redirect=/solutions/${id}`);
    } else {
      setShowInterestForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createInterest({
        solution_id: id,
        user_id: user.id,
        ...formData
      });

      setShowSuccess(true);
      setShowInterestForm(false);
      
      // Reset form
      setFormData({
        company_name: user.company_name || '',
        contact_name: user.contact_name || '',
        contact_email: user.email || '',
        contact_phone: '',
        message: ''
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting interest:', error);
      setError(translations.errorSubmittingInterest);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use translation hook for the solution
  const { translatedSolution, isTranslating: isTranslatingSolution } = useTranslatedSolution(solution);

  const handleSelectHeaderImage = async (imageUrl: string) => {
    if (!translatedSolution || !user) return;
    
    try {
      // Find the index of the selected image
      const imageIndex = translatedSolution.product_images.findIndex(img => img === imageUrl);
      if (imageIndex === -1) return;
      
      // Move the selected image to the first position
      const updatedImages = [...translatedSolution.product_images];
      const [selectedImage] = updatedImages.splice(imageIndex, 1);
      updatedImages.unshift(selectedImage);
      
      // Update the solution with the new image order
      await updateSolution(translatedSolution.id, {
        product_images: updatedImages
      });
      
      // Update local state
      setSolution({
        ...translatedSolution,
        product_images: updatedImages
      });
      
      setIsChangingHeaderImage(false);
    } catch (error) {
      console.error('Error updating header image:', error);
    }
  };

  const handleNextImage = () => {
    if (!translatedSolution?.product_images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % translatedSolution.product_images.length);
  };

  const handlePrevImage = () => {
    if (!translatedSolution?.product_images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + translatedSolution.product_images.length) % translatedSolution.product_images.length);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInterestForm) setShowInterestForm(false);
        if (showImageGallery) setShowImageGallery(false);
        if (isChangingHeaderImage) setIsChangingHeaderImage(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showInterestForm, showImageGallery, isChangingHeaderImage]);

  if (isLoading) {
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
          
          <div className="text-center relative z-10">
            <div className="relative">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary-500 mx-auto mb-4" />
              <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 bg-primary-500/20 rounded-full blur-md animate-pulse mx-auto"></div>
            </div>
            <p className="text-gray-300">{translations.loadingSolutionDetails}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !translatedSolution) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Header />
        <main className="flex-grow pt-20 flex items-center justify-center relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-primary-900/20"></div>
          
          <div className="text-center relative z-10">
            <p className="text-red-400 mb-4">{error || 'Solution not found'}</p>
            <Link
              to="/discover"
              className="text-primary-500 hover:text-primary-400 flex items-center justify-center gap-2 transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              {translations.backToSolutions}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

        {showSuccess && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500/20 border border-green-500/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg z-50 max-w-xs sm:max-w-md text-center">
            <div className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              <p className="text-sm sm:text-base text-green-300">{translations.interestSubmitted}</p>
            </div>
          </div>
        )}

        {showInterestForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-primary-500/20 rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl shadow-primary-500/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-white">{translations.expressInterest}</h3>
                <button
                  onClick={() => setShowInterestForm(false)}
                  className="text-gray-400 hover:text-primary-500 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {translations.companyName} *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {translations.contactName} *
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

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {translations.message} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                      placeholder={translations.describeInterest}
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-red-400">{error}</p>
                )}

                <div className="mt-4 sm:mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInterestForm(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-400 hover:text-gray-300 transition-colors duration-300 text-sm"
                  >
                    {translations.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg disabled:opacity-50 flex items-center transition-all gap-2 duration-300 shadow-lg shadow-primary-500/25 text-sm"
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

        <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
          <Link
            to="/discover"
            className="inline-flex gap-2 items-center text-primary-500 hover:text-primary-400 mb-4 sm:mb-6 transition-colors duration-300 text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            {translations.backToSolutions}
          </Link>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
            {translatedSolution.product_images && translatedSolution.product_images.length > 0 && (
              <div className="h-48 sm:h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${translatedSolution.product_images[0]})` }}>
                <div className="h-full bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Image gallery button */}
                {translatedSolution.product_images.length > 1 && (
                  <button
                    onClick={() => setShowImageGallery(true)}
                    className="absolute bottom-4 right-4 bg-gray-900/70 hover:bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center text-xs transition-all duration-300 border border-gray-700/50 group"
                  >
                    <Grid className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform duration-300" />
                    <span>{language === 'ar' ? 'معرض الصور' : 'View Gallery'}</span>
                  </button>
                )}
                
                {/* Change header image button (only for solution owner) */}
                {user && user.id === translatedSolution.user_id && (
                  <button
                    onClick={() => setIsChangingHeaderImage(true)}
                    className="absolute bottom-4 left-4 bg-gray-900/70 hover:bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center text-xs transition-all duration-300 border border-gray-700/50"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {language === 'ar' ? 'تغيير صورة الغلاف' : 'Change Header Image'}
                  </button>
                )}
              </div>
            )}

            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <div className="flex items-center mb-3 sm:mb-4 gap-3">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                    <h1 className="text-xl sm:text-3xl font-bold text-white">
                      <TranslatedText text={translatedSolution.solution_name} sourceLanguage="auto" showTranslationIndicator />
                    </h1>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm gap-2">
                    <Building2 className="h-4 w-4" />
                    <TranslatedText text={translatedSolution.company_name} sourceLanguage="auto" />
                  </div>
                </div>

                <button
                  onClick={handleInterestClick}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 text-sm sm:text-base"
                >
                  {translations.imInterested}
                </button>

                <div className="flex flex-wrap gap-2">
                  {translatedSolution.arabic_support && (
                    <div className="flex items-center text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {translations.arabicSupported}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full border border-gray-600/50">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {new Date(translatedSolution.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Product Images Gallery Preview */}
              {translatedSolution.product_images && translatedSolution.product_images.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary-500 flex items-center gap-2">
                    <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                    {language === 'ar' ? 'صور المنتج' : 'Product Images'}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                    {translatedSolution.product_images.map((img, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-700/50 group cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setShowImageGallery(true);
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`${translatedSolution.solution_name} - Image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 right-1 bg-primary-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                            {language === 'ar' ? 'رئيسية' : 'Main'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary-500">{translations.overview}</h2>
                      <div className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                        <TranslatedText text={translatedSolution.summary} sourceLanguage="auto" />
                      </div>
                    </div>

                    {translatedSolution.description && (
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-primary-500">{translations.detailedDescription}</h3>
                        <div className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                          <TranslatedText text={translatedSolution.description} sourceLanguage="auto" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-primary-500">{translations.industryFocus}</h3>
                        <div className="flex flex-wrap gap-2">
                          {translatedSolution.industry_focus.map((industry) => (
                            <span
                              key={industry}
                              className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs border border-primary-500/30"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-secondary-500">{translations.technologies}</h3>
                        <div className="flex flex-wrap gap-2">
                          {translatedSolution.tech_categories.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-secondary-500/20 text-secondary-300 rounded-full text-xs border border-secondary-500/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {translatedSolution.auto_tags.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-primary-500">{translations.featuresCapabilities}</h3>
                        <div className="flex flex-wrap gap-2">
                          {translatedSolution.auto_tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs border border-gray-600/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {translatedSolution.ksa_customization && translatedSolution.ksa_customization_details && (
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-primary-500">{translations.saudiMarketCustomization}</h3>
                        <div className="text-sm sm:text-base text-gray-300 leading-relaxed">
                          <TranslatedText text={translatedSolution.ksa_customization_details} sourceLanguage="auto" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary-500">{translations.companyInformation}</h3>
                    <div className="space-y-3 sm:space-y-4 mb-4">
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium mr-1">{translations.companyName}:</span>
                        <span><TranslatedText text={translatedSolution.company_name || 'N/A'} sourceLanguage="auto" /></span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium mr-1">{language === 'ar' ? 'البلد:' : 'Country'}:</span>
                        <span><TranslatedText text={translatedSolution.country || 'N/A'} sourceLanguage="auto" /></span>
                      </div>
                      
                      <div className="flex items-center text-sm gap-2 text-gray-300">
                        <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium mr-1">{translations.website}:</span>
                        {translatedSolution.website ? (
                          <a
                            href={translatedSolution.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-400 transition-colors duration-300 flex items-center"
                          >
                            {translatedSolution.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          </a>
                        ) : (
                          <span>N/A</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium">LinkedIn:</span>
                        {translatedSolution.linkedin ? (
                          <a
                            href={translatedSolution.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-400 transition-colors duration-300 flex items-center"
                          >
                            {translatedSolution.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(company|in)\//, '')}
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          </a>
                        ) : (
                          <span>N/A</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium">{translations.employees}:</span>
                        <span>{translatedSolution.employees || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium">{language === 'ar' ? 'الإيرادات:' : 'Revenue'}:</span>
                        <span>{translatedSolution.revenue || 'N/A'}</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 mt-4 text-primary-500">{language === 'ar' ? 'معلومات النشر والتطوير' : 'Deployment & Development'}</h3>
                    <div className="space-y-3 sm:space-y-4 mb-4">
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <Server className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium">{language === 'ar' ? 'نموذج النشر:' : 'Deployment Model'}:</span>
                        <span><TranslatedText text={translatedSolution.deployment_model || 'N/A'} sourceLanguage="auto" /></span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium">{language === 'ar' ? 'حالة النشر:' : 'Deployment Status'}:</span>
                        <span><TranslatedText text={translatedSolution.deployment_status || 'N/A'} sourceLanguage="auto" /></span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300 gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium">{language === 'ar' ? 'مستوى جاهزية التكنولوجيا:' : 'TRL Level'}:</span>
                        <span><TranslatedText text={translatedSolution.trl || 'N/A'} sourceLanguage="auto" /></span>
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-300 gap-2">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-primary-400 flex-shrink-0" />
                        <span className="font-medium">{language === 'ar' ? 'العملاء الحاليين:' : 'Current Clients'}:</span>
                        <span className="flex-1">
                          <TranslatedText text={translatedSolution.clients || 'N/A'} sourceLanguage="auto" />
                        </span>
                      </div>
                    </div>

                    <hr className="my-3 sm:my-4 border-gray-600/50" />

                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary-500">{translations.contactInformation}</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        <TranslatedText text={translatedSolution.contact_name} sourceLanguage="auto" />
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        <TranslatedText text={translatedSolution.position || 'N/A'} sourceLanguage="auto" />
                      </p>
                      <a
                        href={`mailto:${translatedSolution.contact_email}`}
                        className="flex items-center gap-2 text-primary-500 hover:text-primary-400 mt-2 transition-colors duration-300 text-sm"
                      >
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                        {translations.contactViaEmail}
                      </a>
                    </div>

                    {(translatedSolution.demo_video || translatedSolution.pitch_deck) && (
                      <>
                        <hr className="my-3 sm:my-4 border-gray-600/50" />
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary-500">{translations.additionalResources}</h3>
                        <div className="space-y-2">
                          {translatedSolution.demo_video && (
                            <a
                              href={translatedSolution.demo_video.startsWith('http') ? translatedSolution.demo_video : `https://${translatedSolution.demo_video}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary-500 transition-colors duration-300"
                            >
                              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                              {translations.watchDemoVideo}
                            </a>
                          )}
                          {translatedSolution.pitch_deck && (
                            <a
                              href={translatedSolution.pitch_deck}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary-500 transition-colors duration-300"
                            >
                              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                              {translations.viewPitchDeck}
                            </a>
                          )}
                          {!translatedSolution.demo_video && !translatedSolution.pitch_deck && (
                            <p className="text-sm text-gray-500 italic">N/A</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Image Gallery Modal */}
      {showImageGallery && translatedSolution.product_images && translatedSolution.product_images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-gray-900/30 backdrop-blur-md rounded-xl border border-gray-700/30 overflow-hidden">
            <button
              onClick={() => setShowImageGallery(false)}
              className="absolute top-2 right-2 z-20 text-gray-400 hover:text-white p-2 rounded-full bg-gray-900/50 hover:bg-gray-800/70 transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="relative flex-grow flex items-center justify-center p-4">
              <img 
                src={translatedSolution.product_images[currentImageIndex]} 
                alt={`${translatedSolution.solution_name} - Image ${currentImageIndex + 1}`}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
              />
              
              {translatedSolution.product_images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 p-2 rounded-full bg-gray-900/70 hover:bg-gray-800/90 text-white transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 p-2 rounded-full bg-gray-900/70 hover:bg-gray-800/90 text-white transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              
              <div className="absolute top-2 left-2 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-300">
                {currentImageIndex + 1} / {translatedSolution.product_images.length}
              </div>
            </div>
            
            {translatedSolution.product_images.length > 1 && (
              <div className="mt-2 flex justify-center gap-2 overflow-x-auto p-4 bg-gray-900/50">
                {translatedSolution.product_images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                      currentImageIndex === index 
                        ? 'border-primary-500 scale-105' 
                        : 'border-gray-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Change Header Image Modal */}
      {isChangingHeaderImage && translatedSolution.product_images && translatedSolution.product_images.length > 0 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-primary-500/20 rounded-xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl shadow-primary-500/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {language === 'ar' ? 'اختر صورة الغلاف' : 'Select Header Image'}
              </h3>
              <button
                onClick={() => setIsChangingHeaderImage(false)}
                className="text-gray-400 hover:text-primary-500 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-300 mb-4">
              {language === 'ar' 
                ? 'اختر الصورة التي تريد عرضها كصورة رئيسية لحلك. هذه الصورة ستظهر في صفحة التفاصيل وفي نتائج البحث.'
                : 'Select the image you want to display as the main image for your solution. This image will appear on the details page and in search results.'}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto p-1">
              {translatedSolution.product_images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectHeaderImage(img)}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-video ${
                    index === 0 
                      ? 'border-primary-500 ring-2 ring-primary-500/50' 
                      : 'border-gray-700 hover:border-primary-500/50'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Solution image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-primary-500/80 text-white text-xs px-2 py-1 rounded-full">
                      {language === 'ar' ? 'الحالية' : 'Current'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span className="text-white text-sm font-medium">
                      {language === 'ar' ? 'اختر كصورة رئيسية' : 'Set as header'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default SolutionDetails;