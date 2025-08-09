import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, Modal, LoadingSpinner, Input } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/formatting';
import { Loader2, AlertCircle, Sparkles, Zap, User, Building2, Calendar, Check, X, Edit, Trash2, ExternalLink, MessageCircle, Save } from 'lucide-react';
import type { Solution, Interest } from '../types';
import { validateUrl, validateLinkedIn } from '../utils/validation';
import { COUNTRIES } from '../constants';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui';

const UserProfile = () => {
  const { translations, language } = useLanguage();
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestedUsers, setInterestedUsers] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'solution' | 'interest' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'solutions' | 'interests' | 'interestedUsers'>('solutions');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    contact_name: '',
    company_name: '',
    country: '',
    email: ''
  });

  // Pagination for solutions
  const solutionsPagination = usePagination(solutions, 6);
  
  // Pagination for interests
  const interestsPagination = usePagination(interests, 6);
  
  // Pagination for interested users
  const interestedUsersPagination = usePagination(interestedUsers, 6);

  useEffect(() => {
    if (user) {
      loadUserData();
      // Initialize edit form with user data
      setEditFormData({
        contact_name: user.contact_name || '',
        company_name: user.company_name || '',
        country: user.country || '',
        email: user.email || ''
      });
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load user's solutions
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solutions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (solutionsError) throw solutionsError;
      
      // Load user's interests
      const { data: interestsData, error: interestsError } = await supabase
        .from('interests')
        .select(`
          *,
          solutions:solution_id (
            id,
            solution_name,
            company_name,
            status,
            tech_approval_status,
            business_approval_status
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (interestsError) throw interestsError;
      
      // Load interests in user's solutions
      const { data: interestedUsersData, error: interestedUsersError } = await supabase
        .from('interests')
        .select(`
          *,
          solutions:solution_id (
            id,
            solution_name
          )
        `)
        .in('solution_id', solutionsData.map(s => s.id) || [])
        .order('created_at', { ascending: false });
      
      if (interestedUsersError) throw interestedUsersError;
      
      setSolutions(solutionsData || []);
      setInterests(interestsData || []);
      setInterestedUsers(interestedUsersData || []);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError(translations.errorLoadingProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string, type: 'solution' | 'interest') => {
    // Check if solution is approved before allowing deletion
    if (type === 'solution') {
      const solution = solutions.find(s => s.id === id);
      if (solution && solution.status === 'approved') {
        setError('Approved solutions cannot be deleted. Please contact an administrator for assistance.');
        return;
      }
    }
    
    setItemToDelete({ id, type });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const { id, type } = itemToDelete;
      
      if (type === 'solution') {
        const { error } = await supabase
          .from('solutions')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setSolutions(prev => prev.filter(s => s.id !== id));
      } else {
        const { error } = await supabase
          .from('interests')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setInterests(prev => prev.filter(i => i.id !== id));
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(type === 'solution' ? translations.errorDeletingSolution : translations.errorDeletingInterest);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData({
      contact_name: user?.contact_name || '',
      company_name: user?.company_name || '',
      country: user?.country || '',
      email: user?.email || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate inputs
      if (!editFormData.contact_name.trim()) {
        throw new Error(translations.nameRequired);
      }
      if (!editFormData.company_name.trim()) {
        throw new Error(translations.companyRequired);
      }
      
      // Update user profile
      const { data, error } = await supabase
        .from('users')
        .update({
          contact_name: editFormData.contact_name.trim(),
          company_name: editFormData.company_name.trim(),
          country: editFormData.country,
          // Email is not updated as it requires auth changes
        })
        .eq('user_id', user.user_id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update user context
      if (data && setUser) {
        setUser({
          ...user,
          contact_name: data.contact_name,
          company_name: data.company_name,
          country: data.country
        });
      }
      
      setIsEditing(false);
      setSuccessMessage(translations.profileUpdated);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to check if a solution needs resubmission
  const needsResubmission = (solution: Solution) => {
    return solution.status === 'resubmit' || 
           solution.tech_approval_status === 'resubmit' || 
           solution.business_approval_status === 'resubmit';
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
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary-500 mx-auto mb-4" />
              <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 bg-primary-500/20 rounded-full blur-md animate-pulse mx-auto"></div>
            </div>
            <p className="text-gray-300">{translations.loadingProfile}</p>
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

        <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* User Profile Header */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-4 sm:p-6 mb-6 sm:mb-8">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center mb-4 gap-3">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label={translations.contactName}
                        name="contact_name"
                        value={editFormData.contact_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Input
                        label={translations.companyName}
                        name="company_name"
                        value={editFormData.company_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Input
                        label={translations.email}
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        disabled
                        helperText={language === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                        {translations.country}
                      </label>
                      <select
                        name="country"
                        value={editFormData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 text-sm"
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
                  
                  {error && (
                    <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg flex items-start gap-2 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      {translations.cancel}
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isSaving}
                      loading={isSaving}
                    >
                      {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : translations.save}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full p-4 sm:p-6 border border-primary-500/30">
                      <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary-500" />
                    </div>
                    
                    <div className="flex-grow text-center sm:text-left">
                      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{user?.contact_name}</h1>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-400 text-sm">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Building2 className="h-4 w-4" />
                          {user?.company_name}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Calendar className="h-4 w-4" />
                          {translations.memberSince} {formatDate(user?.created_at || '')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleEditClick}
                    className="self-center sm:self-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                  </Button>
                </div>
              )}
              
              {successMessage && (
                <div className="mt-4 p-3 sm:p-4 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg flex items-start gap-2 backdrop-blur-sm">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}
            </div>
            
            {error && !isEditing && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg flex items-start gap-2 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {/* Tabs */}
            <div className="flex border-b border-gray-700/50 mb-4 sm:mb-6 overflow-x-auto">
              <button
                className={`px-3 py-2 font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'solutions' 
                    ? 'text-primary-500 border-b-2 border-primary-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('solutions')}
              >
                {translations.mySolutions} ({solutions.length})
              </button>
              <button
                className={`px-3 py-2 font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'interests' 
                    ? 'text-primary-500 border-b-2 border-primary-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('interests')}
              >
                {translations.solutionsImInterestedIn} ({interests.length})
              </button>
              <button
                className={`px-3 py-2 font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'interestedUsers' 
                    ? 'text-primary-500 border-b-2 border-primary-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('interestedUsers')}
              >
                {translations.interestedUsers} ({interestedUsers.length})
              </button>
            </div>
            
            {/* My Solutions Tab */}
            {activeTab === 'solutions' && (
              <div>
                {solutionsPagination.data.length === 0 && solutions.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 sm:p-8 text-center">
                    <p className="text-gray-400 mb-4 sm:mb-6">{translations.noSolutionsYet}</p>
                    <Link 
                      to="/vendor-onboarding"
                      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 text-sm"
                    >
                      {translations.submitSolution}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {solutionsPagination.data.map((solution) => (
                      <div 
                        key={solution.id} 
                        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-primary-500/30 overflow-hidden transition-all duration-500 shadow-lg hover:shadow-primary-500/20"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{solution.solution_name}</h3>
                              <p className="text-xs sm:text-sm text-gray-400">{translations.submitted}: {formatDate(solution.created_at)}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                solution.status === 'approved' 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : solution.status === 'pending' 
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : solution.status === 'resubmit'
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {solution.status === 'approved' 
                                  ? translations.approved 
                                  : solution.status === 'pending' 
                                  ? translations.pending
                                  : solution.status === 'resubmit'
                                  ? 'Resubmit'
                                  : translations.rejected}
                              </div>
                              
                              {solution.tech_approval_status && (
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                  solution.tech_approval_status === 'approved' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : solution.tech_approval_status === 'pending' 
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                    : solution.tech_approval_status === 'resubmit'
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                  Tech: {solution.tech_approval_status}
                                </div>
                              )}
                              
                              {solution.business_approval_status && (
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                  solution.business_approval_status === 'approved' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : solution.business_approval_status === 'pending' 
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                    : solution.business_approval_status === 'resubmit'
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                  Business: {solution.business_approval_status}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-3 sm:mb-4 line-clamp-2">{solution.summary}</p>
                          
                          {/* Feedback section for resubmit status */}
                          {needsResubmission(solution) && (
                            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-700/30 rounded-lg border border-orange-500/30">
                              <div className="flex items-center mb-2 gap-2">
                                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                                <h4 className="font-medium text-sm text-orange-300">Evaluator Feedback</h4>
                              </div>
                              {solution.tech_feedback && (
                                <div className="mb-2">
                                  <p className="text-xs sm:text-sm text-gray-300"><span className="text-orange-300">Technical:</span> {solution.tech_feedback}</p>
                                </div>
                              )}
                              {solution.business_feedback && (
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-300"><span className="text-orange-300">Business:</span> {solution.business_feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            <Link
                              to={`/solutions/${solution.id}`}
                              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-primary-500/30 text-gray-300 hover:text-primary-500 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                            >
                              {translations.viewSolution}
                            </Link>
                            
                            {needsResubmission(solution) && (
                              <Link
                                to={{
                                  pathname: "/submission-form",
                                  search: `?id=${solution.id}`
                                }}
                                className="inline-flex gap-2 items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-lg shadow-orange-500/25"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                Resubmit
                              </Link>
                            )}
                            
                            <button
                              onClick={() => handleDeleteClick(solution.id, 'solution')}
                              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700/50 hover:bg-red-900/30 border border-gray-600/50 hover:border-red-500/30 text-gray-300 hover:text-red-400 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                              disabled={solution.status === 'approved'}
                            >
                              {translations.removeSolution}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination for solutions */}
                    {solutions.length > 6 && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={solutionsPagination.pagination.page}
                          totalPages={solutionsPagination.totalPages}
                          onPageChange={solutionsPagination.goToPage}
                          showPageSizeSelector={true}
                          pageSize={solutionsPagination.pagination.pageSize}
                          onPageSizeChange={solutionsPagination.setPageSize}
                          className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Interests Tab */}
            {activeTab === 'interests' && (
              <div>
                {interestsPagination.data.length === 0 && interests.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 sm:p-8 text-center">
                    <p className="text-gray-400 mb-4 sm:mb-6">{translations.noInterestsYet}</p>
                    <Link 
                      to="/discover"
                      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 text-sm"
                    >
                      {translations.discoverSolutions}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {interestsPagination.data.map((interest) => (
                      <div 
                        key={interest.id} 
                        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-primary-500/30 overflow-hidden transition-all duration-500 shadow-lg hover:shadow-primary-500/20"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                                {interest.solutions?.solution_name || 'Unknown Solution'}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-400">
                                {translations.interestShownOn}: {formatDate(interest.created_at)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                interest.status === 'Lead Initiated' 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}>
                                {interest.status === 'Lead Initiated' 
                                  ? translations.leadInitiated 
                                  : translations.newInterest}
                              </div>
                              
                              {interest.solutions?.status && (
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                  interest.solutions.status === 'approved' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : interest.solutions.status === 'pending' 
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                  Solution: {interest.solutions.status}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-3 sm:mb-4 line-clamp-3">{interest.message}</p>
                          
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            <Link
                              to={`/solutions/${interest.solution_id}`}
                              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-primary-500/30 text-gray-300 hover:text-primary-500 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                            >
                              {translations.viewSolution}
                            </Link>
                            
                            <button
                              onClick={() => handleDeleteClick(interest.id, 'interest')}
                              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700/50 hover:bg-red-900/30 border border-gray-600/50 hover:border-red-500/30 text-gray-300 hover:text-red-400 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                            >
                              {translations.removeInterest}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination for interests */}
                    {interests.length > 6 && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={interestsPagination.pagination.page}
                          totalPages={interestsPagination.totalPages}
                          onPageChange={interestsPagination.goToPage}
                          showPageSizeSelector={true}
                          pageSize={interestsPagination.pagination.pageSize}
                          onPageSizeChange={interestsPagination.setPageSize}
                          className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Interested Users Tab */}
            {activeTab === 'interestedUsers' && (
              <div>
                {interestedUsersPagination.data.length === 0 && interestedUsers.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 sm:p-8 text-center">
                    <p className="text-gray-400">No users have shown interest in your solutions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {interestedUsersPagination.data.map((interest) => (
                      <div 
                        key={interest.id} 
                        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-primary-500/30 overflow-hidden transition-all duration-500 shadow-lg hover:shadow-primary-500/20"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                                {interest.contact_name} - {interest.company_name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-400">
                                {translations.received}: {formatDate(interest.created_at)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-400">
                                Solution: {interest.solutions?.solution_name || 'Unknown Solution'}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                interest.status === 'Lead Initiated' 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}>
                                {interest.status === 'Lead Initiated' 
                                  ? translations.leadInitiated 
                                  : translations.newInterest}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-700/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-gray-600/50 mb-3 sm:mb-4">
                            <h4 className="font-medium text-sm text-gray-300 mb-1 sm:mb-2">Message:</h4>
                            <p className="text-xs sm:text-sm text-gray-400">{interest.message}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            <a
                              href={`mailto:${interest.contact_email}`}
                              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                            >
                              Reply via Email
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                            </a>
                            
                            <Link
                              to={`/solutions/${interest.solution_id}`}
                              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-primary-500/30 text-gray-300 hover:text-primary-500 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                            >
                              View Solution
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination for interested users */}
                    {interestedUsers.length > 6 && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={interestedUsersPagination.pagination.page}
                          totalPages={interestedUsersPagination.totalPages}
                          onPageChange={interestedUsersPagination.goToPage}
                          showPageSizeSelector={true}
                          pageSize={interestedUsersPagination.pagination.pageSize}
                          onPageSizeChange={interestedUsersPagination.setPageSize}
                          className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={itemToDelete?.type === 'solution' ? translations.deleteSolution : translations.deleteInterest}
        size="sm"
      >
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-300">
            {translations.deletionWarning} {itemToDelete?.type === 'solution' ? 'this solution' : 'this interest'}?
          </p>
          
          {itemToDelete?.type === 'solution' && (
            <p className="text-xs sm:text-sm text-gray-400">
              {translations.solutionDeletionNote}
            </p>
          )}
          
          <p className="text-xs sm:text-sm text-red-400">
            {translations.cannotBeUndone}
          </p>
          
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              size="sm"
            >
              {translations.cancel}
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
              size="sm"
            >
              {isDeleting ? translations.deleting : translations.delete}
            </Button>
          </div>
        </div>
      </Modal>
      
      <Footer />
    </div>
  );
};

export default UserProfile;