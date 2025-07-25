import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Filter, Grid, List, ArrowRight, Check, Loader2, Users, Sparkles, Image } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getSolutions, type Solution } from '../lib/supabase';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'highest-rated' | 'alphabetical';

const DiscoverPage = () => {
  const { translations } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    try {
      const data = await getSolutions();
      // Filter solutions that have both technical and business approval status as "approved"
      const approvedSolutions = data.filter(solution => 
        solution.tech_approval_status === 'approved' && 
        solution.business_approval_status === 'approved'
      );
      setSolutions(approvedSolutions);
    } catch (error) {
      console.error('Error loading solutions:', error);
      setError(translations.errorLoadingSolutions);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = searchQuery === '' || 
      solution.solution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = selectedIndustries.length === 0 || 
      (solution.industry_focus || []).some(industry => selectedIndustries.includes(industry));
    
    const matchesTechnology = selectedTechnologies.length === 0 || 
      (solution.tech_categories || []).some(tech => selectedTechnologies.includes(tech));
    
    return matchesSearch && matchesIndustry && matchesTechnology;
  });
  
  const sortedSolutions = [...filteredSolutions].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'highest-rated') {
      // Sort by interest count for "highest-rated"
      return (b.interest_count || 0) - (a.interest_count || 0);
    } else {
      return a.solution_name.localeCompare(b.solution_name);
    }
  });
  
  const allIndustries = Array.from(
    new Set(solutions.flatMap(solution => solution.industry_focus || []))
  );
  
  const allTechnologies = Array.from(
    new Set(solutions.flatMap(solution => solution.tech_categories || []))
  );

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
            <p className="text-gray-300">{translations.loadingSolutions}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Header />
        <main className="flex-grow pt-20 flex items-center justify-center relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-primary-900/20"></div>
          
          <div className="text-center relative z-10">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadSolutions}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-400 hover:to-secondary-400 transition-all duration-300 shadow-lg shadow-primary-500/25"
            >
              {translations.tryAgain}
            </button>
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#014952] to-[#016774]"></div>
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
          <div className="bg-[#016774] rounded-lg border border-[#4CEADB]/30 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center mb-4">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#4CEADB] mr-2 sm:mr-3" />
              <h1 className="text-xl sm:text-3xl font-bold text-[#4CEADB]">
                {translations.discoverTitle}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
              {translations.discoverSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translations.searchPlaceholder}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 transition-all duration-300 text-sm"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-[#014952] hover:bg-[#014952]/80 border border-[#4CEADB]/30 hover:border-[#4CEADB] px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 text-white hover:text-[#4CEADB] text-sm"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {translations.filters}
              </button>
              
              <div className="flex rounded-lg border border-[#4CEADB]/30 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-[#4CEADB] text-[#014952]' : 'bg-[#014952] text-gray-400 hover:text-[#4CEADB]'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-[#4CEADB] text-[#014952]' : 'bg-[#014952] text-gray-400 hover:text-[#4CEADB]'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-[#014952] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] text-white text-sm"
              >
                <option value="newest">{translations.sortNewest}</option>
                <option value="highest-rated">{translations.sortRating}</option>
                <option value="alphabetical">{translations.sortAlphabetical}</option>
              </select>
            </div>
            
            {showFilters && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#014952] rounded-lg border border-[#4CEADB]/30">
                <div className="flex flex-wrap items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-sm sm:text-base text-[#4CEADB]">
                    {translations.filterBy}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedIndustries([]);
                      setSelectedTechnologies([]);
                      setSearchQuery('');
                    }}
                    className="text-xs sm:text-sm text-[#4CEADB] hover:text-[#4CEADB]/80 transition-colors duration-300"
                  >
                    {translations.clearFilters}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-medium text-sm text-gray-300 mb-2">
                      {translations.industries}
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 sm:p-3 bg-[#014952] rounded-lg border border-[#4CEADB]/20">
                      {allIndustries.map((industry) => (
                        <button
                          key={industry}
                          onClick={() => {
                            setSelectedIndustries(prev => 
                              prev.includes(industry) 
                                ? prev.filter(i => i !== industry)
                                : [...prev, industry]
                            );
                          }}
                          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all duration-300 ${
                            selectedIndustries.includes(industry)
                              ? 'bg-[#4CEADB] text-[#014952]'
                              : 'bg-[#016774] text-white border border-[#4CEADB]/20 hover:bg-[#016774]/80 hover:border-[#4CEADB]/50'
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedIndustries.length || 0} industries
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-300 mb-2">
                      {translations.technologies}
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 sm:p-3 bg-[#014952] rounded-lg border border-[#4CEADB]/20">
                      {allTechnologies.map((tech) => (
                        <button
                          key={tech}
                          onClick={() => {
                            setSelectedTechnologies(prev => 
                              prev.includes(tech) 
                                ? prev.filter(t => t !== tech)
                                : [...prev, tech]
                            );
                          }}
                          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all duration-300 ${
                            selectedTechnologies.includes(tech)
                              ? 'bg-[#4CEADB] text-[#014952]'
                              : 'bg-[#016774] text-white border border-[#4CEADB]/20 hover:bg-[#016774]/80 hover:border-[#4CEADB]/50'
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedTechnologies.length || 0} technologies
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-4 sm:mb-6">
            <p className="text-sm text-gray-300">
              {translations.showing} <span className="font-semibold text-[#4CEADB]">{sortedSolutions.length}</span> {translations.results}
              {solutions.length > 0 && (
                <span className="text-gray-500 ml-2">
                  ({solutions.length} approved solutions available)
                </span>
              )}
            </p>
          </div>
          
          {sortedSolutions.length === 0 ? (
            <div className="bg-[#016774] rounded-lg border border-[#4CEADB]/30 p-6 sm:p-8 text-center">
              <p className="text-gray-400 mb-4">
                {solutions.length === 0 
                  ? "No approved solutions are currently available. Check back soon!"
                  : translations.noResults
                }
              </p>
              {solutions.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedIndustries([]);
                    setSelectedTechnologies([]);
                    setSearchQuery('');
                  }}
                  className="text-[#4CEADB] hover:text-[#4CEADB]/80 transition-colors duration-300"
                >
                  {translations.clearFilters}
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedSolutions.map((solution) => (
                <div key={solution.id} className="group relative bg-[#016774] rounded-lg border border-[#4CEADB]/30 hover:border-[#4CEADB] overflow-hidden transition-all duration-300 hover:transform hover:translate-y-[-4px]">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 bg-[#016774] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div 
                    className="h-36 sm:h-48 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `url(${(solution.product_images && solution.product_images.length > 0) 
                        ? solution.product_images[0] 
                        : 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=400'
                      })`
                    }}
                  >
                    {solution.arabic_support && (
                      <div className="absolute top-2 right-2 flex items-center text-xs text-green-300 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
                        <Check className="h-3 w-3 mr-1" />
                        {translations.arabicSupported}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-primary-500/10 px-2 py-1 rounded border border-primary-500/30">
                      <span className="text-xs text-primary-300 font-medium">✓ Verified</span>
                    </div>
                    <div className="h-full w-full bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                      <div className="text-white">
                        <h3 className="font-bold text-base sm:text-lg mb-1">{solution.solution_name}</h3>
                        <p className="text-xs sm:text-sm text-white/90">{solution.company_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 relative z-10">
                    <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                      {solution.summary}
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {(solution.tech_categories || []).slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-[#4CEADB]/10 text-[#4CEADB] rounded text-xs border border-[#4CEADB]/30"
                        >
                          {tag}
                        </span>
                      ))}
                      {(solution.tech_categories || []).length > 3 && (
                        <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-[#014952] text-gray-400 rounded text-xs">
                          +{(solution.tech_categories || []).length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-xs text-[#4CEADB] bg-[#4CEADB]/10 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded border border-[#4CEADB]/30">
                          <Users className="h-3 w-3 mr-1" />
                          {solution.interest_count || 0} {translations.interested}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/solutions/${solution.id}/recommendation`}
                          className="text-[#4CEADB] hover:text-[#4CEADB]/80 text-xs flex items-center transition-colors duration-300"
                        >
                          GO.Ai
                        </Link>
                        <Link 
                          to={`/solutions/${solution.id}`}
                          className="text-[#4CEADB] hover:text-[#4CEADB]/80 text-xs flex items-center transition-colors duration-300"
                        >
                          {translations.viewDetails}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSolutions.map((solution) => (
                <div key={solution.id} className="group bg-gray-800 rounded-lg border border-gray-700 hover:border-primary-500 overflow-hidden transition-all duration-300">
                  {/* Glowing background effect */}
                  
                  <div className="flex flex-col md:flex-row relative z-10">
                    <div 
                      className="md:w-64 h-36 md:h-auto bg-cover bg-center relative"
                      style={{ 
                        backgroundImage: `url(${(solution.product_images && solution.product_images.length > 0) 
                          ? solution.product_images[0] 
                          : 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=400'
                        })`
                      }}
                    >
                      {solution.arabic_support && (
                        <div className="absolute top-2 right-2 flex items-center text-xs text-green-300 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
                          <Check className="h-3 w-3 mr-1" />
                          {translations.arabicSupported}
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-[#4CEADB]/10 px-2 py-1 rounded border border-[#4CEADB]/30">
                        <span className="text-xs text-[#4CEADB] font-medium">✓ Verified</span>
                      </div>
                      {solution.product_images && solution.product_images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-gray-900/70 px-2 py-1 rounded border border-gray-700">
                          <span className="text-xs text-gray-300 flex items-center">
                            <Image className="h-3 w-3 mr-1" />
                            {solution.product_images.length}
                          </span>
                        </div>
                      )}
                      {solution.product_images && solution.product_images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-gray-900/70 px-2 py-1 rounded border border-gray-700">
                          <span className="text-xs text-gray-300 flex items-center">
                            <Image className="h-3 w-3 mr-1" />
                            {solution.product_images.length}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6 flex-grow">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2 sm:mb-3">
                        <div>
                          <h3 className="font-bold text-lg sm:text-xl text-white mb-1 group-hover:text-primary-500 transition-colors duration-300">{solution.solution_name}</h3>
                          <p className="text-xs sm:text-sm text-gray-400">{solution.company_name}</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 line-clamp-3">
                        {solution.summary}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                        {(solution.tech_categories || []).map((tag) => (
                          <span 
                            key={tag} 
                            className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-primary-500/10 text-primary-300 rounded text-xs border border-primary-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-xs text-primary-300 bg-primary-500/10 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded border border-primary-500/30">
                            <Users className="h-3 w-3 mr-1" />
                            {solution.interest_count || 0} {translations.interested}
                          </div>
                          <div className="text-xs text-gray-500">
                            {translations.added}: {new Date(solution.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/solutions/${solution.id}/recommendation`}
                            className="text-primary-500 hover:text-primary-400 text-xs flex items-center transition-colors duration-300"
                          >
                            GO.Ai
                          </Link>
                          <Link 
                            to={`/solutions/${solution.id}`}
                            className="text-primary-500 hover:text-primary-400 flex items-center text-xs sm:text-sm transition-colors duration-300"
                          >
                            {translations.viewDetails}
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DiscoverPage;