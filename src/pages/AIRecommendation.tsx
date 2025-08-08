import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, LoadingSpinner } from '../components/ui';
import { Brain, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { getSolutionById } from '../lib/supabase';
import { generateRecommendation } from '../lib/openai';
import { useAsync } from '../hooks/useAsync';
import { useLanguage } from '../context/LanguageContext';

const AIRecommendation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const [userNeed, setUserNeed] = useState('');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: solution, loading: solutionLoading, error: solutionError } = useAsync(
    () => getSolutionById(id!),
    [id]
  );

  const handleGenerateRecommendation = async () => {
    if (!userNeed.trim() || !solution) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateRecommendation(solution, userNeed);
      setRecommendation(result);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      setError(translations.errorGeneratingRecommendation);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: string) => {
    const numScore = parseInt(score);
    if (numScore >= 80) return 'text-green-400';
    if (numScore >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: string) => {
    const numScore = parseInt(score);
    if (numScore >= 80) return <CheckCircle className="h-8 w-8 text-green-400" />;
    if (numScore >= 60) return <AlertTriangle className="h-8 w-8 text-yellow-400" />;
    return <XCircle className="h-8 w-8 text-red-400" />;
  };

  if (solutionLoading) {
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
          
          <LoadingSpinner text={translations.loadingSolutionDetails} />
        </main>
        <Footer />
      </div>
    );
  }

  if (solutionError || !solution) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Header />
        <main className="flex-grow pt-20 flex items-center justify-center relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-primary-900/20"></div>
          
          <div className="text-center relative z-10">
            <p className="text-red-400 mb-4">{translations.errorLoadingSolutions}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {translations.back}
            </Button>
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

        <div className="container mx-auto px-4 py-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translations.backToSolution}
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 via-secondary-900/30 to-primary-900/30 p-6 text-white border-b border-primary-500/20">
                <div className=" gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30 mr-4">
                    <Brain className="h-8 w-8 text-primary-500" />
                  </div>
                  <h1 className="text-2xl font-bold">AI Solution Recommendation by GO.Ai | رُوَّاد</h1>
                </div>
                <p className="text-gray-300">
                  {translations.aiRecommendationDescription}
                </p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {translations.specificNeeds}
                  </label>
                  <textarea
                    value={userNeed}
                    onChange={(e) => setUserNeed(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                    placeholder={translations.needsPlaceholder}
                  />
                </div>

                <Button
                  onClick={handleGenerateRecommendation}
                  disabled={isLoading || !userNeed.trim()}
                  loading={isLoading}
                  className="w-full"
                >
                  {translations.generateRecommendation}
                </Button>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30">
                    {error}
                  </div>
                )}

                {recommendation && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                      <div>
                        <h3 className="text-xl font-semibold mb-1 text-primary-500">{translations.compatibilityScore}</h3>
                        <p className={`text-3xl font-bold ${getScoreColor(recommendation.score)}`}>
                          {recommendation.score}
                        </p>
                      </div>
                      {getScoreIcon(recommendation.score)}
                    </div>

                    <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50 p-6">
                      <h3 className="text-lg font-semibold mb-3 text-green-400">{translations.keyStrengths}</h3>
                      <ul className="space-y-2">
                        {recommendation.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50 p-6">
                      <h3 className="text-lg font-semibold mb-3 text-yellow-400">{translations.potentialGaps}</h3>
                      <ul className="space-y-2">
                        {recommendation.gaps.map((gap: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50 p-6">
                      <h3 className="text-lg font-semibold mb-3 text-primary-500">{translations.implementationConsiderations}</h3>
                      <ul className="space-y-2">
                        {recommendation.considerations.map((consideration: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Brain className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-primary-500/20">
                      <div className="flex items-center mb-4 gap-2">
                        <Sparkles className="h-5 w-5 text-primary-500" />
                        <h3 className="text-lg font-semibold text-primary-500">{translations.overview}</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{recommendation.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIRecommendation;