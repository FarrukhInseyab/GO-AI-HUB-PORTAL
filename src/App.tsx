import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load components
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const SubmissionForm = React.lazy(() => import('./pages/SubmissionForm'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage'));
const SolutionDetails = React.lazy(() => import('./pages/SolutionDetails'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ConfirmEmail = React.lazy(() => import('./pages/ConfirmEmail'));

const HowItWorksPage = React.lazy(() => import('./pages/HowItWorksPage'));
const GoAdvantagePage = React.lazy(() => import('./pages/GoAdvantagePage'));
const SuccessStoriesPage = React.lazy(() => import('./pages/SuccessStoriesPage'));
const MarketInsightsPage = React.lazy(() => import('./pages/MarketInsightsPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = React.lazy(() => import('./pages/CookiePolicy'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const VendorOnboarding = React.lazy(() => import('./pages/VendorOnboarding'));
const VendorOnboardingAI = React.lazy(() => import('./pages/VendorOnboardingAI'));
const GOAIAgent = React.lazy(() => import('./pages/GOAIAgent'));
const AIRecommendation = React.lazy(() => import('./pages/AIRecommendation'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <Router>
              <div className="App">
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <LoadingSpinner size="lg" text="Loading..." />
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/submission-form" element={<SubmissionForm />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/solutions/:id" element={<SolutionDetails />} />
                    <Route path="/solutions/:id/recommendation" element={<AIRecommendation />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/confirm-email" element={<ConfirmEmail />} />
                    <Route path="/confirm-email" element={<ConfirmEmail />} />
                    <Route path="/confirm-email" element={<ConfirmEmail />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/go-advantage" element={<GoAdvantagePage />} />
                    <Route path="/success-stories" element={<SuccessStoriesPage />} />
                    <Route path="/market-insights" element={<MarketInsightsPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
                    <Route path="/vendor-onboarding-ai" element={<VendorOnboardingAI />} />
                    <Route path="/goai-agent" element={<GOAIAgent />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;