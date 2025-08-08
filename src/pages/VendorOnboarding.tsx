import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, ArrowRight, AlertCircle, Sparkles, Zap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { LoadingSpinner, Button } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { analyzeMessage, generateSummary } from '../lib/openai';
import type { Message, FormData } from '../types';

const VendorOnboarding = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: translations.chatbotWelcome,
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/vendor-onboarding');
    }
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Handle input changes and auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const getQuestionForStep = (step: number): string => {
    switch (step) {
      case 1:
        return translations.chatbotWelcome;
      case 2:
        return translations.chatbotQuestion1;
      case 3:
        return translations.chatbotQuestion2;
      case 4:
        return translations.chatbotQuestion3;
      default:
        return translations.chatbotCompletion;
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate('/auth?redirect=/vendor-onboarding');
      return;
    }

    if (input.trim() === '' || isCompleted) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsProcessing(true);
    setError(null);
    
    // Reset textarea height
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }
    
    const typingIndicatorId = `typing-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      { id: typingIndicatorId, text: '', sender: 'bot', isTyping: true },
    ]);
    
    try {
      // Analyze the message based on current step
      const analysis = await analyzeMessage(currentInput, currentStep);
      
      // Remove typing indicator
      setMessages(prev => 
        prev.filter(msg => msg.id !== typingIndicatorId)
      );
      
      if (analysis) {
        // Merge the analysis with existing form data
        const updatedFormData = { ...formData, ...analysis };
        setFormData(updatedFormData);
        
        console.log('Updated form data:', updatedFormData);
        
        // Update progress
        const newProgress = currentStep * 25;
        setProgress(newProgress);
        
        // Check if we've completed all 4 steps
        if (currentStep >= 4) {
          setIsCompleted(true);
          
          // Generate summary if we have description
          let summary = '';
          if (updatedFormData.description) {
            try {
              summary = await generateSummary(
                updatedFormData.description,
                updatedFormData.techCategory || [],
                updatedFormData.industryFocus || []
              );
            } catch (error) {
              console.error('Error generating summary:', error);
              summary = updatedFormData.description.substring(0, 200) + '...';
            }
          }
          
          const finalFormData = { ...updatedFormData, summary };
          setFormData(finalFormData);
          
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              text: translations.chatbotCompletion,
              sender: 'bot',
            },
          ]);
          
          // Auto-redirect to form after 3 seconds
          setTimeout(() => {
            navigate('/submission-form', { state: { formData: finalFormData } });
          }, 3000);
        } else {
          // Move to next step
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          
          const nextQuestion = getQuestionForStep(nextStep);
          
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              text: nextQuestion,
              sender: 'bot',
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error analyzing message:', error);
      
      setMessages(prev => 
        prev.filter(msg => msg.id !== typingIndicatorId)
      );
      
      setError(error instanceof Error ? error.message : 'Failed to analyze message');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "I apologize, but I'm having trouble understanding that. Could you please rephrase or provide more details?",
          sender: 'bot',
          isError: true,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipToForm = () => {
    navigate('/submission-form', { state: { formData } });
  };

  if (!user) {
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
          
          <div className="text-center relative z-10 max-w-md mx-4">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-6 sm:p-8">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{translations.signInToGetListed}</h2>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">{translations.signInDescription}</p>
              <Button onClick={() => setShowAuthModal(true)} className="w-full">
                {translations.signIn}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          redirectPath="/vendor-onboarding"
        />
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 via-secondary-900/30 to-primary-900/30 text-white p-4 sm:p-6 border-b border-primary-500/20">
                <div className="flex items-center mb-3 sm:mb-4 gap-3">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                  <h1 className="text-lg sm:text-xl font-semibold">AI-Powered Vendor Onboarding by GO.Ai | رُوَّاد</h1>
                </div>
                <p className="text-sm sm:text-base text-gray-300">{translations.vendorOnboardingSubtitle}</p>
                
                <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs sm:text-sm text-gray-300 flex justify-between">
                  <span>{translations.progressStart}</span>
                  <span>{progress}% - Step {currentStep}/4</span>
                  <span>{translations.progressComplete}</span>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border-l-4 border-red-500 p-3 sm:p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                    <p className="text-xs sm:text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}
              
              <div 
                ref={chatContainerRef}
                className="h-64 sm:h-96 overflow-y-auto p-3 sm:p-4 bg-gray-900/20 backdrop-blur-sm"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 sm:mb-4 flex gap-2 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-full p-1.5 sm:p-2">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg py-2 px-3 sm:px-4 backdrop-blur-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
                          : message.isError
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-gray-800/50 text-gray-200 border border-gray-700/50'
                      }`}
                    >
                      {message.isTyping ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                      )}
                    </div>
                    {message.sender === 'user' && (
                      <div className="bg-gradient-to-br from-secondary-500/20 to-primary-500/20 border border-secondary-500/30 rounded-full p-1.5 sm:p-2 ml-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-500" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-3 sm:p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
                <div className="flex items-center">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isProcessing && !isCompleted) handleSendMessage();
                      }
                    }}
                    placeholder={isCompleted ? translations.chatCompleted : translations.typeMessage}
                    className="flex-grow px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-white placeholder-gray-400 resize-none backdrop-blur-sm text-sm"
                    disabled={isProcessing || isCompleted}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isProcessing || isCompleted || !input.trim()}
                    className="rounded-l-none"
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </div>
              </div>
          
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-between items-center bg-[#014952] backdrop-blur-sm">
                <div className="text-xs text-gray-400 hidden sm:block">
                  {Object.keys(formData).length > 0 && (
                    <span>Extracted: {Object.keys(formData).slice(0, 3).join(', ')}{Object.keys(formData).length > 3 ? '...' : ''}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSkipToForm}
                  disabled={isCompleted}
                  size="sm"
                >
                  {translations.skipToForm}
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorOnboarding;