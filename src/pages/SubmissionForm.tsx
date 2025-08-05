import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, Input, LoadingSpinner } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { createSolution, uploadFile, getSolutionById, updateSolution } from '../lib/supabase';
import { generateSummary, generateTags } from '../lib/openai';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Video, 
  Building2,
  Sparkles,
  Zap,
  Brain,
  RefreshCw,
  Globe
} from 'lucide-react';
import { 
  FORM_OPTIONS,
  COUNTRIES 
} from '../constants';
import type { FormData } from '../types';

const SubmissionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { translations } = useLanguage();
  const { user } = useUser();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isResubmission, setIsResubmission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [solutionId, setSolutionId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<null | 'registration' | 'pitchDeck' | 'productImages'>(null);

  
  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    companyName: user?.company_name || '',
    website: '',
    revenue: '',
    employees: '',
    registration: null,
    linkedin: '',
    country: user?.country || '',
    
    // Solution Overview
    solutionName: '',
    summary: '',
    description: '',
    industryFocus: [],
    techCategory: [],
    aiTags: [],
    deploymentModel: '',
    arabicSupport: false,
    productImages: [],
    
    // Deployment & Maturity
    trl: '',
    deploymentStatus: '',
    clients: '',
    ksaCustomization: false,
    ksaCustomizationDetails: '',
    
    // Attachments & Legal
    pitchDeck: null,
    demoVideo: '',
    contactName: user?.contact_name || '',
    position: '',
    contactEmail: user?.email || '',
    legalTerms: false,
  });

  // Check for solution ID in URL params (for resubmission)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSolutionId(id);
      setIsResubmission(true);
      loadSolutionData(id);
    }
  }, [searchParams]);

  // Load solution data for resubmission
  const loadSolutionData = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const solution = await getSolutionById(id);
      
      // Map solution data to form data
      setFormData({
        companyName: solution.company_name || user?.company_name || '',
        website: solution.website || '',
        revenue: solution.revenue || '',
        employees: solution.employees || '',
        registration: solution.registration_doc || null,
        linkedin: solution.linkedin || '',
        country: solution.country || user?.country || '',
        
        solutionName: solution.solution_name || '',
        summary: solution.summary || '',
        description: solution.description || '',
        industryFocus: solution.industry_focus || [],
        techCategory: solution.tech_categories || [],
        aiTags: solution.auto_tags || [],
        deploymentModel: solution.deployment_model || '',
        arabicSupport: solution.arabic_support || false,
        productImages: solution.product_images || [],
        
        trl: solution.trl || '',
        deploymentStatus: solution.deployment_status || '',
        clients: solution.clients || '',
        ksaCustomization: solution.ksa_customization || false,
        ksaCustomizationDetails: solution.ksa_customization_details || '',
        
        pitchDeck: solution.pitch_deck || null,
        demoVideo: solution.demo_video || '',
        contactName: solution.contact_name || user?.contact_name || '',
        position: solution.position || '',
        contactEmail: solution.contact_email || user?.email || '',
        legalTerms: true,
        
        // For resubmission
        isResubmission: true,
        solutionId: solution.id,
        techFeedback: solution.tech_feedback || '',
        businessFeedback: solution.business_feedback || '',
      });
      
      console.log('Loaded solution data for resubmission:', solution);
    } catch (error) {
      console.error('Error loading solution data:', error);
      setError('Failed to load solution data for resubmission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data from chatbot if available
  useEffect(() => {
    if (location.state?.formData && !isResubmission) {
      const chatbotData = location.state.formData;
      setFormData(prev => ({
        ...prev,
        ...chatbotData,
        companyName: chatbotData.companyName || user?.company_name || '',
        contactName: user?.contact_name || '',
        contactEmail: user?.email || '',
        country: user?.country || '',
      }));
    }
  }, [location.state, user, isResubmission]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleArrayChange = (field: 'industryFocus' | 'techCategory', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleFileUpload = async (field: 'registration' | 'pitchDeck' | 'productImages', file: File) => {
  try {
    setUploadingField(field); // Start loader
    let bucket = '';
    if (field === 'registration') bucket = 'registration';
    else if (field === 'pitchDeck') bucket = 'pitch-decks';
    else if (field === 'productImages') bucket = 'product-images';

    const url = await uploadFile(file, bucket);

    if (field === 'productImages') {
      handleInputChange('productImages', [...(formData.productImages || []), url]);
    } else {
      handleInputChange(field, url);
    }
  } catch (error) {
    console.error('File upload error:', error);
    setError(`Failed to upload ${field}. Please try again.`);
  } finally {
    setUploadingField(null); // Stop loader
  }
};


  const generateAIContent = async () => {
    if (!formData.description?.length) {
      setError('Please provide a description and select at least one technology category before generating AI content.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const [summary, tags] = await Promise.all([
        generateSummary(formData.description, formData.techCategory, formData.industryFocus || []),
        generateTags(formData.description, formData.techCategory, formData.industryFocus || [])
      ]);

      setFormData(prev => ({
        ...prev,
        summary,
        aiTags: tags
      }));
    } catch (error) {
      console.error('AI generation error:', error);
      setError('Failed to generate AI content. Please try again or fill manually.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateAITags = async () => {
    if (!formData.description || !formData.techCategory?.length) {
      setError('Please provide a description and select at least one technology category before generating AI tags.');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const tags = await generateTags(
        formData.description, 
        formData.techCategory, 
        formData.industryFocus || []
      );

      setFormData(prev => ({
        ...prev,
        aiTags: tags
      }));
    } catch (error) {
      console.error('AI tags generation error:', error);
      setError('Failed to generate AI tags. Please try again or add tags manually.');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.companyName && formData.contactName && formData.contactEmail && formData.country);
      case 2:
        return !!(formData.solutionName && formData.description && formData.summary &&
                 formData.industryFocus?.length && formData.techCategory?.length);
      case 3:
        return !!(formData.trl && formData.deploymentStatus);
      case 4: 
        return !!(formData.position && formData.legalTerms);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError(null);
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError('Please complete all required fields.');
      return;
    }

    if (!user) {
      setError('You must be logged in to submit a solution.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const solutionData = {
        user_id: user.id,
        company_name: formData.companyName,
        country: formData.country || user.country,
        website: formData.website || null,
        revenue: formData.revenue || null,
        employees: formData.employees || null,
        registration_doc: formData.registration || null,
        linkedin: formData.linkedin || null,
        solution_name: formData.solutionName,
        summary: formData.summary,
        description: formData.description || null,
        industry_focus: formData.industryFocus || [],
        tech_categories: formData.techCategory || [],
        auto_tags: formData.aiTags || [],
        deployment_model: formData.deploymentModel || null,
        arabic_support: formData.arabicSupport || false,
        product_images: formData.productImages || [],
        trl: formData.trl || null,
        deployment_status: formData.deploymentStatus || null,
        clients: formData.clients || null,
        ksa_customization: formData.ksaCustomization || false,
        ksa_customization_details: formData.ksaCustomizationDetails || null,
        pitch_deck: formData.pitchDeck || null,
        demo_video: formData.demoVideo || null,
        contact_name: formData.contactName,
        position: formData.position || null,
        contact_email: formData.contactEmail,
        status: 'pending',
        tech_approval_status: 'pending',
        business_approval_status: 'pending'
      };

      if (isResubmission && solutionId) {
        // Update existing solution
        await updateSolution(solutionId, solutionData);
      } else {
        // Create new solution
        await createSolution(solutionData);
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <LoadingSpinner size="lg" text="Loading solution data..." />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Header />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-300 mb-4">You must be logged in to submit a solution.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Header />
        <main className="flex-grow pt-20 flex items-center justify-center relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-green-900/20 to-primary-900/20"></div>
          
          <div className="text-center relative z-10 max-w-md mx-4">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-xl shadow-green-500/10 p-6 sm:p-8">
              <div className="bg-green-500/20 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 border border-green-500/30">
                <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Success!</h2>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">{translations.formSubmitSuccess}</p>
              <div className="text-xs sm:text-sm text-gray-400">Redirecting to your profile...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-primary-500 mb-3 sm:mb-4">{translations.basicInfo}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label={`${translations.companyName} *`}
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required
              />
              
              <Input
                label={translations.website}
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {translations.revenue}
                </label>
                <select
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white backdrop-blur-sm text-sm"
                >
                  <option value="">{translations.selectRevenue}</option>
                  {FORM_OPTIONS.revenue.map((option) => (
                    <option key={option} value={option} className="bg-gray-800 text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {translations.employees}
                </label>
                <select
                  value={formData.employees}
                  onChange={(e) => handleInputChange('employees', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white backdrop-blur-sm text-sm"
                >
                  <option value="">{translations.selectEmployees}</option>
                  {FORM_OPTIONS.employees.map((option) => (
                    <option key={option} value={option} className="bg-gray-800 text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {translations.country} *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white backdrop-blur-sm transition-all duration-300 text-sm"
                    required
                  >
                    <option value="">{translations.selectCountry}</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country} className="bg-gray-800 text-white">
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Input
                label={translations.linkedin}
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
              
              <Input
                label={`${translations.contactName} *`}
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                required
              />
              
              <Input
                label={`${translations.contactEmail} *`}
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                required
              />
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {translations.registration}
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 cursor-pointer bg-gray-800/50 border border-gray-700/50 hover:border-primary-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center transition-all duration-300">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload('registration', file);
                          }
                        }}
                      />
                      <div className="flex items-center justify-center">
                        {uploadingField === 'registration' ? (
                          <svg className="animate-spin h-5 w-5 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                        ) : (
                          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                        )}
                        <span className="text-gray-400 text-sm">
                          {uploadingField === 'registration' ? 'Uploading...' : translations.uploadFile}
                        </span>
                      </div>
                    </label>

                  
                  {formData.registration && (
                    <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" />
                      <span className="text-gray-300 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">Uploaded</span>
                      <button
                        onClick={() => handleInputChange('registration', null)}
                        className="ml-1 sm:ml-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{translations.registrationHelp}</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-primary-500">{translations.solutionOverview}</h3>
            </div>
            
            <Input
              label={`${translations.solutionName} *`}
              value={formData.solutionName}
              onChange={(e) => handleInputChange('solutionName', e.target.value)}
              required
            />
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                {translations.description} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={5}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                placeholder={translations.descriptionPlaceholder}
                required
              />
            </div>
            
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2 gap-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-300">
                  {translations.summary} *
                  {formData.aiTags?.length > 0 && (
                    <span className="ml-2 text-xs bg-secondary-500/20 text-secondary-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-secondary-500/30">
                      {translations.aiGenerated}
                    </span>
                  )}
                </label>
                <Button
                  onClick={generateAIContent}
                  disabled={isGeneratingAI || !formData.description?.length}
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs"
                >
                  {isGeneratingAI ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  )}
                  {isGeneratingAI ? 'Generating...' : 'Generate AI Summary'}
                </Button>
              </div>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                placeholder={translations.summaryPlaceholder}
                required
              />
            </div>
            
            {/* Industry Focus - Single Row */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                {translations.industryFocus} *
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                {FORM_OPTIONS.industries.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleArrayChange('industryFocus', industry)}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all duration-300 ${
                      formData.industryFocus?.includes(industry)
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-600/50 hover:border-primary-500/30'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.industryFocus?.length || 0} industries
              </p>
            </div>
            
            {/* Technology Categories - Single Row */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                {translations.techCategory} *
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                {FORM_OPTIONS.techCategories.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleArrayChange('techCategory', tech)}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all duration-300 ${
                      formData.techCategory?.includes(tech)
                        ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white shadow-lg shadow-secondary-500/25'
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-600/50 hover:border-secondary-500/30'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.techCategory?.length || 0} technologies
              </p>
            </div>
            
            {/* AI-Generated Tags */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2 gap-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-300">
                  {translations.aiTags}
                  {formData.aiTags?.length > 0 && (
                    <span className="ml-2 text-xs bg-secondary-500/20 text-secondary-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-secondary-500/30">
                      {translations.aiGenerated}
                    </span>
                  )}
                </label>
                <Button
                  onClick={generateAITags}
                  disabled={isGeneratingTags || !formData.description || !formData.techCategory?.length}
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs"
                >
                  {isGeneratingTags ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  )}
                  {isGeneratingTags ? 'Generating...' : 'Generate AI Tags'}
                </Button>
              </div>
              
              <div className="p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 min-h-[60px]">
                {formData.aiTags && formData.aiTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.aiTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gradient-to-r from-secondary-500/20 to-primary-500/20 text-secondary-300 rounded-full text-xs border border-secondary-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-10 sm:h-12 text-gray-500 text-xs">
                    {isGeneratingTags ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Generating tags...</span>
                      </div>
                    ) : (
                      <span>
                        {translations.aiTagsHelp}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {translations.aiTagsTooltip}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {translations.deploymentModel}
                </label>
                <select
                  value={formData.deploymentModel}
                  onChange={(e) => handleInputChange('deploymentModel', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white backdrop-blur-sm text-sm"
                >
                  <option value="">{translations.selectDeploymentModel}</option>
                  {FORM_OPTIONS.deploymentModels.map((model) => (
                    <option key={model} value={model} className="bg-gray-800 text-white">
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.arabicSupport}
                    onChange={(e) => handleInputChange('arabicSupport', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-all duration-300 ${
                    formData.arabicSupport 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 border-primary-500' 
                      : 'border-gray-600 bg-gray-800/50'
                  }`}>
                    {formData.arabicSupport && (
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                  <span className="ml-2 sm:ml-3 text-sm text-gray-300">{translations.arabicSupport}</span>
                </label>
              </div>
            </div>
            
            {/* Product Images */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Product Images
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {formData.productImages && formData.productImages.length > 0 && (
                  formData.productImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Product ${index + 1}`} 
                        className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-700/50"
                      />
                      <button
                        onClick={() => {
                          const newImages = [...formData.productImages!];
                          newImages.splice(index, 1);
                          handleInputChange('productImages', newImages);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  ))
                )}
                
                <label className="w-16 h-16 sm:w-24 sm:h-24 flex flex-col items-center justify-center bg-gray-800/50 border border-gray-700/50 hover:border-primary-500/30 rounded-lg cursor-pointer transition-all duration-300">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload('productImages', file);
                      }
                    }}
                  />
                  {uploadingField === 'productImages' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mb-1 sm:mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span className="text-xs text-primary-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400 mb-1 sm:mb-2" />
                      <span className="text-xs text-gray-400">Add Image</span>
                    </>
                  )}
                </label>

              </div>
              <p className="text-xs text-gray-500 mt-1">Upload product screenshots or images (max 2MB each)</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-primary-500 mb-3 sm:mb-4">{translations.deploymentMaturity}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {translations.trl} *
                </label>
                <select
                  value={formData.trl}
                  onChange={(e) => handleInputChange('trl', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white backdrop-blur-sm text-sm"
                  required
                >
                  <option value="">{translations.selectTRL}</option>
                  {FORM_OPTIONS.trlLevels.map((level) => (
                    <option key={level} value={level} className="bg-gray-800 text-white">
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {translations.deploymentStatus} *
                </label>
                <select
                  value={formData.deploymentStatus}
                  onChange={(e) => handleInputChange('deploymentStatus', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white backdrop-blur-sm text-sm"
                  required
                >
                  <option value="">{translations.selectDeploymentStatus}</option>
                  {FORM_OPTIONS.deploymentStatus.map((status) => (
                    <option key={status} value={status} className="bg-gray-800 text-white">
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                {translations.clients}
              </label>
              <textarea
                value={formData.clients}
                onChange={(e) => handleInputChange('clients', e.target.value)}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                placeholder={translations.clientsPlaceholder}
              />
            </div>
            
            <div className="flex items-center mb-3 sm:mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ksaCustomization}
                  onChange={(e) => handleInputChange('ksaCustomization', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-all duration-300 ${
                  formData.ksaCustomization 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 border-primary-500' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}>
                  {formData.ksaCustomization && (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
                <span className="ml-2 sm:ml-3 text-sm text-gray-300">{translations.ksaCustomization}</span>
              </label>
            </div>
            
            {formData.ksaCustomization && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  KSA Customization Details
                </label>
                <textarea
                  value={formData.ksaCustomizationDetails}
                  onChange={(e) => handleInputChange('ksaCustomizationDetails', e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm"
                  placeholder={translations.ksaCustomizationPlaceholder}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-primary-500 mb-3 sm:mb-4">{translations.attachmentsLegal}</h3>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                {translations.pitchDeck}
              </label>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <label className="flex-1 cursor-pointer bg-gray-800/50 border border-gray-700/50 hover:border-primary-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center transition-all duration-300">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload('pitchDeck', file);
                    }
                  }}
                />
                <div className="flex items-center justify-center">
                  {uploadingField === 'pitchDeck' ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span className="text-primary-400 text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                      <span className="text-gray-400 text-sm">{translations.uploadFile}</span>
                    </>
                  )}
                </div>
              </label>

                
                {formData.pitchDeck && (
                  <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" />
                    <span className="text-gray-300 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">Uploaded</span>
                    <button
                      onClick={() => handleInputChange('pitchDeck', null)}
                      className="ml-1 sm:ml-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{translations.pitchDeckHelp}</p>
            </div>
            
            <Input
              label={translations.demoVideo}
              value={formData.demoVideo}
              onChange={(e) => handleInputChange('demoVideo', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                {translations.position} *
              </label>
              <select
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white backdrop-blur-sm text-sm"
                required
              >
                <option value="">{translations.selectPosition}</option>
                {FORM_OPTIONS.positions.map((position) => (
                  <option key={position} value={position} className="bg-gray-800 text-white">
                    {position}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.legalTerms}
                  onChange={(e) => handleInputChange('legalTerms', e.target.checked)}
                  className="sr-only"
                  required
                />
                <div className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-all duration-300 mt-0.5 ${
                  formData.legalTerms 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 border-primary-500' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}>
                  {formData.legalTerms && (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
                <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-300">
                  {translations.legalTerms}{' '}
                  <a href="/privacy" className="text-primary-500 hover:text-primary-400 transition-colors duration-300">
                    {translations.privacyPolicy}
                  </a>{' '}
                  {translations.and}{' '}
                  <a href="/cookies" className="text-primary-500 hover:text-primary-400 transition-colors duration-300">
                    {translations.cookiePolicy}
                  </a>
                  {' *'}
                </span>
              </label>
            </div>
            
            {/* Show feedback for resubmission */}
            {isResubmission && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <h4 className="font-semibold text-sm text-orange-300 mb-2">Evaluator Feedback for Resubmission</h4>
                
                {formData.techFeedback && (
                  <div className="mb-2 sm:mb-3">
                    <p className="text-xs sm:text-sm font-medium text-orange-300">Technical Feedback:</p>
                    <p className="text-xs sm:text-sm text-gray-300">{formData.techFeedback}</p>
                  </div>
                )}
                
                {formData.businessFeedback && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-orange-300">Business Feedback:</p>
                    <p className="text-xs sm:text-sm text-gray-300">{formData.businessFeedback}</p>
                  </div>
                )}
                
                <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3">
                  Please address the feedback above before resubmitting your solution.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

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

        <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 via-secondary-900/30 to-primary-900/30 p-4 sm:p-6 border-b border-primary-500/20">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mr-2 sm:mr-3" />
                  <h1 className="text-lg sm:text-2xl font-bold text-white">
                    {isResubmission ? 'Resubmit Solution' : translations.submissionFormTitle}
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                  {isResubmission 
                    ? 'Update your solution based on evaluator feedback' 
                    : translations.submissionFormSubtitle}
                </p>
                
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                        step <= currentStep 
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25' 
                          : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                      }`}>
                        {step < currentStep ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                          step < currentStep 
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500' 
                            : 'bg-gray-700/50'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-xs sm:text-sm text-gray-400">
                  Step {currentStep} of 4
                </div>
              </div>
              
              <div className="p-4 sm:p-8">
                {error && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg flex items-start backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                {renderStepContent()}
                
                <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700/50">
                  <Button
                    variant="ghost"
                    onClick={currentStep === 1 ? () => navigate(-1) : prevStep}
                    className="flex items-center"
                    size="sm"
                  >
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {currentStep === 1 ? translations.back : translations.back}
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      className="flex items-center"
                      disabled={!validateStep(currentStep)}
                      size="sm"
                    >
                      {translations.next}
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !validateStep(4)}
                      loading={isSubmitting}
                      className="flex items-center"
                      size="sm"
                    >
                      {isSubmitting ? translations.submitting : (isResubmission ? 'Resubmit' : translations.submit)}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubmissionForm;