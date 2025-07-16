import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, LoadingSpinner, Modal } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { generateGOAIResponse } from '../lib/openai';
import ReactMarkdown from 'react-markdown';
import { Brain, Send, User, Bot, FileText, Zap, AlertCircle, Sparkles, ExternalLink, RefreshCw, Clock, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import type { ResearchReport, Solution } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
  isError?: boolean;
}

const GOAIAgent = () => {
  const { language, translations } = useLanguage();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: language === 'ar' 
        ? "مرحباً! أنا رُوَّاد، مساعدك الذكي لاستكشاف حلول الذكاء الاصطناعي ورؤى السوق. كيف يمكنني مساعدتك اليوم؟"
        : "Hello! I'm GO.Ai | رُوَّاد, your intelligent assistant for exploring AI solutions and market insights. How can I help you today?",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'reports'>('chat');
  const [reports, setReports] = useState<ResearchReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [usageStats, setUsageStats] = useState({
    used: 0,
    limit: 50,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  });
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('AI Market Research');
  const [reportContent, setReportContent] = useState('');
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [isDeletingReport, setIsDeletingReport] = useState(false);
  const [reportPrompt, setReportPrompt] = useState('');
  const [showReportPromptModal, setShowReportPromptModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadReports();
      loadUsageStats();
      loadSolutions();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Scroll the chat container, not the whole page
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

  const loadReports = async () => {
    if (!user) return;
    
    setIsLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from('user_research_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const loadSolutions = async () => {
    setIsLoadingSolutions(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('id, solution_name, summary, description, tech_categories, industry_focus, company_name, status, tech_approval_status, business_approval_status')
        .eq('status', 'approved')
        .eq('tech_approval_status', 'approved')
        .eq('business_approval_status', 'approved');
      
      if (error) throw error;
      
      setSolutions(data || []);
      console.log(`Loaded ${data?.length || 0} solutions for GO.Ai Agent`);
    } catch (error) {
      console.error('Error loading solutions:', error);
    } finally {
      setIsLoadingSolutions(false);
    }
  };

  const loadUsageStats = async () => {
    if (!user) return;
    
    try {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('rate_limits')
        .select('count')
        .eq('user_id', user.id)
        .eq('action', 'goai_query')
        .gte('window_start', currentMonthStart.toISOString())
        .maybeSingle();
      
      if (error) {
        console.error('Error loading usage stats:', error);
        return;
      }
      
      setUsageStats({
        used: data?.count || 0,
        limit: 50,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    if (input.trim() === '') return;
    
    // Check rate limit before processing
    if (usageStats.used >= usageStats.limit) {
      setError(language === 'ar' 
        ? 'لقد وصلت إلى الحد الشهري للاستعلامات. يرجى المحاولة مرة أخرى الشهر المقبل.'
        : 'You have reached your monthly query limit. Please try again next month.');
      return;
    }
    
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
      // Increment usage counter
      const { error: rateError } = await supabase.rpc('increment_rate_limit', {
        action_param: 'goai_query',
        user_id_param: user.id
      });
      
      if (rateError) {
        console.error('Error incrementing rate limit:', rateError);
        // Continue processing even if rate limit increment fails
      }
      
      // Update usage stats
      await loadUsageStats();
      
      // Get chat history for context (last 5 messages) and map roles correctly
      const chatHistory = messages
        .filter(msg => !msg.isTyping)
        .slice(-5)
        .map(msg => ({
          role: msg.sender === 'bot' ? 'assistant' as const : msg.sender as 'user',
          content: msg.text
        }));
      
      // Generate response using OpenAI with solutions context
      const solutionsContext = prepareSolutionsContext();
      const response = await generateGOAIResponse(currentInput, chatHistory, solutionsContext);
      
      // Remove typing indicator
      setMessages(prev => 
        prev.filter(msg => msg.id !== typingIndicatorId)
      );
      
      // Add AI response
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: response,
          sender: 'bot',
        },
      ]);
      
      // Check if it's a research report request
      if (isResearchReportRequest(currentInput, response)) {
        await createResearchReport(currentInput, response);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      setMessages(prev => 
        prev.filter(msg => msg.id !== typingIndicatorId)
      );
      
      setError(error instanceof Error ? error.message : 'Failed to process message');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: language === 'ar'
            ? "أعتذر، لكنني أواجه مشكلة في معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا."
            : "I apologize, but I'm having trouble processing your request. Please try again later.",
          sender: 'bot',
          isError: true,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Prepare solutions context for the AI
  const prepareSolutionsContext = (): string => {
    if (!solutions || solutions.length === 0) {
      return language === 'ar'
        ? "لا توجد حلول متاحة حاليًا في المنصة."
        : "No solutions are currently available in the platform.";
    }

    // Create a concise context with essential solution information
    const solutionsInfo = solutions.map(solution => {
      return `Solution: ${solution.solution_name}
Company: ${solution.company_name}
ID: ${solution.id}
Summary: ${solution.summary.substring(0, 150)}${solution.summary.length > 150 ? '...' : ''}
Categories: ${solution.tech_categories.join(', ')}
Industries: ${solution.industry_focus.join(', ')}`;
    }).join('\n\n');

    return language === 'ar'
      ? `الحلول المتاحة في المنصة (${solutions.length} إجمالي):\n\n${solutionsInfo}\n\nعند الإشارة إلى الحلول، استخدم الصيغة "اسم الحل" دون ذكر المعرفات أو عناوين URL.`
      : `Available AI Solutions in the Platform (${solutions.length} total):\n\n${solutionsInfo}\n\nWhen referring to solutions, use the format "Solution Name" without mentioning IDs or URLs.`;
  };

  const isResearchReportRequest = (query: string, response: string): boolean => {
    // Check if query contains research-related keywords
    const researchKeywordsEn = ['research', 'report', 'analysis', 'study', 'insights', 'trends'];
    const researchKeywordsAr = ['بحث', 'تقرير', 'تحليل', 'دراسة', 'رؤى', 'اتجاهات'];
    
    const researchKeywords = language === 'ar' ? researchKeywordsAr : researchKeywordsEn;
    
    const queryHasKeywords = researchKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    // Check if response mentions creating a report
    const responseIndicatesReportEn = response.includes('research report') || 
                                   response.includes('generated a report') ||
                                   response.includes('created a report');
                                   
    const responseIndicatesReportAr = response.includes('تقرير بحثي') || 
                                   response.includes('أنشأت تقريرًا') ||
                                   response.includes('قمت بإنشاء تقرير');
                                   
    const responseIndicatesReport = language === 'ar' ? responseIndicatesReportAr : responseIndicatesReportEn;
    
    return queryHasKeywords && responseIndicatesReport;
  };

  const createResearchReport = async (query: string, response: string): Promise<void> => {
    if (!user) return;
    
    try {
      // Extract a title from the query
      const title = language === 'ar'
        ? `تقرير بحثي: ${query.length > 30 ? query.substring(0, 30) + '...' : query}`
        : `Research Report: ${query.length > 30 ? query.substring(0, 30) + '...' : query}`;
      
      // Create content with markdown formatting
      const content = language === 'ar'
        ? `# تقرير الذكاء الاصطناعي البحثي: ${query}

## نظرة عامة
${response.split('.').slice(0, 3).join('.')}

## النتائج الرئيسية
${response}

## سياق السوق
- سوق الذكاء الاصطناعي السعودي ينمو بمعدل 43.7٪ سنويًا
- الاستثمار الحكومي يصل إلى 14.2 مليار دولار في عام 2025
- معدل اعتماد المؤسسات وصل إلى 81٪ عبر القطاعات
- 312 حل ذكاء اصطناعي بدعم اللغة العربية الأصلية

## التوصيات
بناءً على هذا التحليل، يجب على المؤسسات النظر في:
1. تقييم حلول الذكاء الاصطناعي التي تتوافق مع حالات الاستخدام الخاصة بها
2. إعطاء الأولوية للحلول التي تدعم اللغة العربية
3. النظر في نموذج النشر الذي يناسب بنيتها التحتية بشكل أفضل
4. تقييم مستوى جاهزية التكنولوجيا (TRL) للحلول المحتملة

*تم إنشاؤه بواسطة GO.Ai | رُوَّاد في ${new Date().toLocaleDateString('ar-SA')}*`
        : `# AI Research Report: ${query}

## Overview
${response.split('.').slice(0, 3).join('.')}

## Key Findings
${response}

## Market Context
- Saudi AI market is growing at 43.7% annually
- Government investment reaching $14.2B in 2025
- Enterprise adoption has reached 81% across sectors
- 312 AI solutions with native Arabic language support

## Recommendations
Based on this analysis, organizations should consider:
1. Evaluating AI solutions that align with their specific use cases
2. Prioritizing solutions with Arabic language support
3. Considering the deployment model that best fits their infrastructure
4. Assessing the technology readiness level (TRL) of potential solutions

*Generated by GO.Ai | رُوَّاد on ${new Date().toLocaleDateString()}*`;
      
      // Create a summary
      const summary = response.split('.').slice(0, 2).join('.') + '.';
      
      // Determine category based on query
      let category = language === 'ar' ? 'بحث سوق الذكاء الاصطناعي' : 'AI Market Research';
      
      if (language === 'ar') {
        if (query.toLowerCase().includes('صحة') || query.toLowerCase().includes('طب')) category = 'الذكاء الاصطناعي في الرعاية الصحية';
        else if (query.toLowerCase().includes('حكوم')) category = 'الذكاء الاصطناعي الحكومي';
        else if (query.toLowerCase().includes('مال') || query.toLowerCase().includes('بنك')) category = 'الذكاء الاصطناعي المالي';
        else if (query.toLowerCase().includes('تعليم')) category = 'الذكاء الاصطناعي في التعليم';
      } else {
        if (query.toLowerCase().includes('healthcare')) category = 'Healthcare AI';
        else if (query.toLowerCase().includes('government')) category = 'Government AI';
        else if (query.toLowerCase().includes('finance')) category = 'Financial AI';
        else if (query.toLowerCase().includes('education')) category = 'Education AI';
      }
      
      // Save to database
      const { data, error } = await supabase
        .from('user_research_reports')
        .insert({
          user_id: user.id,
          title,
          summary,
          content,
          category
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Reload reports
      await loadReports();
      
      // Notify user
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: language === 'ar'
            ? `لقد أنشأت تقريرًا بحثيًا بناءً على استفسارك. يمكنك العثور عليه في علامة التبويب "التقارير البحثية".`
            : `I've created a research report based on your query. You can find it in the "Research Reports" tab.`,
          sender: 'bot',
        },
      ]);
    } catch (error) {
      console.error('Error creating research report:', error);
    }
  };

  const handleViewReport = (report: ResearchReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleCreateReport = async () => {
    if (!user) return;
    
    setIsCreatingReport(true);
    setError(null);
    
    try {
      // Generate a report using AI based on the user's prompt
      if (!reportPrompt.trim()) {
        throw new Error(language === 'ar' 
          ? 'يرجى تقديم موضوع للتقرير'
          : 'Please provide a prompt for the report');
      }
      
      // Get solutions context
      const solutionsContext = prepareSolutionsContext();
      
      // Generate AI response
      const response = await generateGOAIResponse(reportPrompt, [], solutionsContext);
      
      // Create a title based on the prompt
      const title = reportPrompt.length > 50 
        ? reportPrompt.substring(0, 50) + '...' 
        : reportPrompt;
      
      // Create content with markdown formatting
      const content = language === 'ar'
        ? `# ${title}

${response}

## سياق السوق
- سوق الذكاء الاصطناعي السعودي ينمو بمعدل 43.7٪ سنويًا
- الاستثمار الحكومي يصل إلى 14.2 مليار دولار في عام 2025
- معدل اعتماد المؤسسات وصل إلى 81٪ عبر القطاعات
- 312 حل ذكاء اصطناعي بدعم اللغة العربية الأصلية

## التوصيات
بناءً على هذا التحليل، يجب على المؤسسات النظر في:
1. تقييم حلول الذكاء الاصطناعي التي تتوافق مع حالات الاستخدام الخاصة بها
2. إعطاء الأولوية للحلول التي تدعم اللغة العربية
3. النظر في نموذج النشر الذي يناسب بنيتها التحتية بشكل أفضل
4. تقييم مستوى جاهزية التكنولوجيا (TRL) للحلول المحتملة

*تم إنشاؤه بواسطة GO.Ai | رُوَّاد في ${new Date().toLocaleDateString('ar-SA')}*`
        : `# ${title}

${response}

## Market Context
- Saudi AI market is growing at 43.7% annually
- Government investment reaching $14.2B in 2025
- Enterprise adoption has reached 81% across sectors
- 312 AI solutions with native Arabic language support

## Recommendations
Based on this analysis, organizations should consider:
1. Evaluating AI solutions that align with their specific use cases
2. Prioritizing solutions with Arabic language support
3. Considering the deployment model that best fits their infrastructure
4. Assessing the technology readiness level (TRL) of potential solutions

*Generated by GO.Ai | رُوَّاد on ${new Date().toLocaleDateString()}*`;
      
      // Create a summary from the first two sentences
      const summary = response.split('.').slice(0, 2).join('.') + '.';
      
      // Save to database
      const { data, error } = await supabase
        .from('user_research_reports')
        .insert({
          user_id: user.id,
          title,
          summary,
          content,
          category: reportCategory
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Reload reports
      await loadReports();
      
      // Show success message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: language === 'ar'
            ? `لقد أنشأت تقريرًا بحثيًا جديدًا بناءً على طلبك: "${reportPrompt}". يمكنك العثور عليه في علامة التبويب "التقارير البحثية".`
            : `I've created a new research report based on your prompt: "${reportPrompt}". You can find it in the "Research Reports" tab.`,
          sender: 'bot',
        },
      ]);
      
      // Switch to reports tab
      setActiveTab('reports');
      
      // Close the prompt modal
      setShowReportPromptModal(false);
      setReportPrompt('');
      
    } catch (error) {
      console.error('Error creating AI report:', error);
      setError(error instanceof Error ? error.message : (language === 'ar' 
        ? 'فشل في إنشاء تقرير الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.'
        : 'Failed to generate AI report. Please try again.'));
    } finally {
      setIsCreatingReport(false);
    }
  };

  const handleEditReport = (report: ResearchReport) => {
    setSelectedReport(report);
    setReportTitle(report.title);
    setReportCategory(report.category || 'AI Market Research');
    setReportContent(report.content);
    setIsEditingReport(true);
    setShowCreateReportModal(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!user) return;
    
    setIsDeletingReport(true);
    try {
      const { error } = await supabase
        .from('user_research_reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Reload reports
      await loadReports();
      setError(null);
    } catch (error) {
      console.error('Error deleting report:', error);
      setError(language === 'ar' ? 'فشل في حذف التقرير' : 'Failed to delete report');
    } finally {
      setIsDeletingReport(false);
    }
  };

  const handleSaveReport = async () => {
    if (!user || !reportTitle.trim() || !reportContent.trim()) return;
    
    setIsCreatingReport(true);
    try {
      // Generate a summary from the first two sentences of the content
      const contentSentences = reportContent.split('.');
      const summary = contentSentences.slice(0, 2).join('.') + '.';
      
      if (isEditingReport && selectedReport) {
        // Update existing report
        const { error } = await supabase
          .from('user_research_reports')
          .update({
            title: reportTitle,
            summary,
            content: reportContent,
            category: reportCategory,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedReport.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new report
        const { error } = await supabase
          .from('user_research_reports')
          .insert({
            user_id: user.id,
            title: reportTitle,
            summary,
            content: reportContent,
            category: reportCategory
          });
        
        if (error) throw error;
      }
      
      // Reload reports and close modal
      await loadReports();
      setShowCreateReportModal(false);
      setError(null);
    } catch (error) {
      console.error('Error saving report:', error);
      setError(language === 'ar' ? 'فشل في حفظ التقرير' : 'Failed to save report');
    } finally {
      setIsCreatingReport(false);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  // Process message text to convert solution references to links
  const processMessageText = (text: string): React.ReactNode => {
    if (!solutions || solutions.length === 0) {
      return <ReactMarkdown className="markdown-content">{text}</ReactMarkdown>;
    }

    // Create a map of solution IDs to solution objects for quick lookup
    const solutionMap = solutions.reduce((map, solution) => {
      map[solution.id] = solution;
      return map;
    }, {} as Record<string, Solution>);

    // Process text to replace solution references with proper links
    let processedText = text;
    
    // Remove any direct URLs to solutions
    processedText = processedText.replace(/\(https:\/\/goaihub\.ai\/solutions\/[a-f0-9-]+\)/g, '');
    
    // Remove ID patterns like (ID: solution_id)
    processedText = processedText.replace(/\(ID:\s*[a-f0-9-]+\)/g, '');
    
    // Replace solution names with links
    solutions.forEach(solution => {
      // Create a regex that matches the solution name but not if it's already in a markdown link
      const namePattern = new RegExp(`(?<!\\[)\\b${escapeRegExp(solution.solution_name)}\\b(?!\\])`, 'g');
      if (namePattern.test(processedText)) {
        processedText = processedText.replace(
          namePattern, 
          `[${solution.solution_name}](/solutions/${solution.id})`
        );
      }
    });

    return <ReactMarkdown className="markdown-content">{processedText}</ReactMarkdown>;
  };

  // Helper function to escape special characters in regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Get category names in Arabic if needed
  const getCategoryName = (category: string): string => {
    if (language !== 'ar') return category;
    
    const categoryMap: Record<string, string> = {
      'AI Market Research': 'بحث سوق الذكاء الاصطناعي',
      'Healthcare AI': 'الذكاء الاصطناعي في الرعاية الصحية',
      'Government AI': 'الذكاء الاصطناعي الحكومي',
      'Financial AI': 'الذكاء الاصطناعي المالي',
      'Education AI': 'الذكاء الاصطناعي في التعليم',
      'Industry Analysis': 'تحليل الصناعة',
      'Technology Trends': 'اتجاهات التكنولوجيا',
      'Cybersecurity AI': 'الذكاء الاصطناعي للأمن السيبراني',
      'Retail AI': 'الذكاء الاصطناعي في التجزئة',
      'Manufacturing AI': 'الذكاء الاصطناعي في التصنيع',
      'Transportation AI': 'الذكاء الاصطناعي في النقل',
      'Energy AI': 'الذكاء الاصطناعي في الطاقة',
      'Agriculture AI': 'الذكاء الاصطناعي في الزراعة',
      'Smart Cities': 'المدن الذكية',
      'Defense AI': 'الذكاء الاصطناعي في الدفاع'
    };
    
    return categoryMap[category] || category;
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
              linear-gradient(rgba(0, 105, 155, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 105, 155, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-secondary-500/20 shadow-xl shadow-secondary-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 via-secondary-900/30 to-primary-900/30 p-4 sm:p-6 border-b border-secondary-500/20">
                <div className="flex items-center mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-500 mr-2 sm:mr-3" />
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{translations.goaiAgentTitle}</h1>
                </div>
                <p className="text-sm sm:text-base text-gray-300">{translations.goaiAgentSubtitle}</p>
                
                <div className="flex mt-4 sm:mt-6 border-b border-gray-700/50 overflow-x-auto">
                  <button
                    className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'chat' 
                        ? 'text-secondary-500 border-b-2 border-secondary-500' 
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('chat')}
                  >
                    {translations.askGoai}
                  </button>
                  <button
                    className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'reports' 
                        ? 'text-secondary-500 border-b-2 border-secondary-500' 
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('reports')}
                  >
                    {translations.researchReports}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border-l-4 border-red-500 p-3 sm:p-4 backdrop-blur-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-2" />
                    <p className="text-sm sm:text-base text-red-300">{error}</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'chat' ? (
                <>
                  <div 
                    ref={chatContainerRef}
                    className="h-64 sm:h-96 overflow-y-auto p-3 sm:p-4 bg-gray-900/20 backdrop-blur-sm"
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 sm:mb-4 flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="bg-gradient-to-br from-secondary-500/20 to-primary-500/20 border border-secondary-500/30 rounded-full p-1.5 sm:p-2 mr-2">
                            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-500" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] rounded-lg py-2 px-3 sm:px-4 backdrop-blur-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white shadow-lg shadow-secondary-500/25'
                              : message.isError
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-gray-800/50 text-gray-200 border border-gray-700/50'
                          }`}
                        >
                          {message.isTyping ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <div className="markdown-content text-sm sm:text-base">
                              {processMessageText(message.text)}
                            </div>
                          )}
                        </div>
                        {message.sender === 'user' && (
                          <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-full p-1.5 sm:p-2 ml-2">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
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
                            if (!isProcessing) handleSendMessage();
                          }
                        }}
                        placeholder={translations.typeYourMessage}
                        className="flex-grow px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500/50 text-white placeholder-gray-400 resize-none backdrop-blur-sm text-sm sm:text-base"
                        disabled={isProcessing}
                        rows={2}
                        style={{ minHeight: '50px', maxHeight: '150px' }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isProcessing || input.trim() === '' || usageStats.used >= usageStats.limit}
                        className="rounded-l-none h-full"
                      >
                        {isProcessing ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{translations.pressEnterToSend}</p>
                  </div>
                  
                  <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-800/30 backdrop-blur-sm border-t border-gray-700/50">
                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 gap-2 sm:gap-4">
                      <div className="flex items-center">
                        <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-500 mr-1" />
                        <span>{translations.usageStatus}: {usageStats.used}/{usageStats.limit}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-500 mr-1" />
                        <span className="text-xs">{translations.monthlyQuota}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <a 
                        href={MARKET_INSIGHTS_SOURCES_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-secondary-500 hover:text-secondary-400 flex items-center transition-colors duration-300"
                      >
                        {translations.dataSources}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">{translations.researchReports}</h2>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadReports}
                        disabled={isLoadingReports}
                      >
                        {isLoadingReports ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        )}
                        <span className="text-xs sm:text-sm">{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setShowReportPromptModal(true)}
                        disabled={isCreatingReport}
                      >
                        {isCreatingReport ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        )}
                        <span className="text-xs sm:text-sm">{language === 'ar' ? 'تقرير جديد' : 'New Report'}</span>
                      </Button>
                    </div>
                  </div>
                  
                  {isLoadingReports ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner text={translations.loadingPlatformData} />
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sm:p-8 text-center">
                      <p className="text-gray-400 mb-4">{translations.noReportsYet}</p>
                      <Button
                        onClick={() => setShowReportPromptModal(true)}
                        variant="outline"
                        disabled={isCreatingReport}
                      >
                        {isCreatingReport ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {language === 'ar' ? 'إنشاء تقرير بحثي' : 'Create Research Report'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div 
                          key={report.id} 
                          className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6 hover:border-secondary-500/30 transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 sm:mb-4">
                            <div>
                              <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{report.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-400">
                                {translations.generatedOn}: {new Date(report.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : undefined)}
                              </p>
                            </div>
                            <div className="bg-secondary-500/20 text-secondary-300 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs border border-secondary-500/30 self-start">
                              {getCategoryName(report.category)}
                            </div>
                          </div>
                          <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 line-clamp-2">{report.summary}</p>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(report)}
                              className="flex items-center text-xs sm:text-sm"
                            >
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              {language === 'ar' ? 'عرض' : 'View'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditReport(report)}
                              className="flex items-center text-xs sm:text-sm"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReport(report.id)}
                              disabled={isDeletingReport}
                              className="flex items-center text-red-400 hover:text-red-300 text-xs sm:text-sm"
                            >
                              {isDeletingReport ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              )}
                              {language === 'ar' ? 'حذف' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-secondary-500/20 p-4 sm:p-6 hover:border-secondary-500/30 transition-all duration-300">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl border border-secondary-500/30 mr-2 sm:mr-3">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">{translations.platformSolutions}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                  {language === 'ar' 
                    ? 'اسأل عن حلول الذكاء الاصطناعي المتاحة على المنصة وقدراتها وتوافقها مع احتياجاتك.'
                    : 'Ask about AI solutions available on the platform, their capabilities, and compatibility with your needs.'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveTab('chat');
                    setInput(language === 'ar' 
                      ? 'ما هي حلول الذكاء الاصطناعي المتاحة للقطاع الحكومي؟'
                      : 'What AI solutions are available for government sector?');
                  }}
                  className="text-secondary-500 hover:text-secondary-400 text-xs sm:text-sm"
                >
                  {language === 'ar' ? 'اسأل عن الحلول' : 'Ask about solutions'}
                </Button>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-secondary-500/20 p-4 sm:p-6 hover:border-secondary-500/30 transition-all duration-300">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl border border-secondary-500/30 mr-2 sm:mr-3">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">{translations.saudiMarketInsights}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                  {language === 'ar'
                    ? 'احصل على أحدث الرؤى حول اعتماد الذكاء الاصطناعي واتجاهات السوق وتوقعات النمو في المملكة العربية السعودية.'
                    : 'Get the latest insights on AI adoption, market trends, and growth forecasts for Saudi Arabia.'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveTab('chat');
                    setInput(language === 'ar'
                      ? 'ما هي أحدث اتجاهات سوق الذكاء الاصطناعي في المملكة العربية السعودية؟'
                      : 'What are the latest AI market trends in Saudi Arabia?');
                  }}
                  className="text-secondary-500 hover:text-secondary-400 text-xs sm:text-sm"
                >
                  {language === 'ar' ? 'استكشف اتجاهات السوق' : 'Explore market trends'}
                </Button>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-secondary-500/20 p-4 sm:p-6 hover:border-secondary-500/30 transition-all duration-300">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl border border-secondary-500/30 mr-2 sm:mr-3">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">{translations.globalIndustryReports}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                  {language === 'ar'
                    ? 'اطلب تقارير بحثية شاملة عن تقنيات الذكاء الاصطناعي المحددة أو الصناعات أو حالات الاستخدام.'
                    : 'Request comprehensive research reports on specific AI technologies, industries, or use cases.'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportPromptModal(true)}
                  className="text-secondary-500 hover:text-secondary-400 text-xs sm:text-sm"
                >
                  {language === 'ar' ? 'طلب تقرير' : 'Request a report'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Report View Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={selectedReport?.title || (language === 'ar' ? "تقرير بحثي" : "Research Report")}
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="bg-secondary-500/20 text-secondary-300 px-2 py-1 rounded-full text-xs border border-secondary-500/30 self-start">
                {getCategoryName(selectedReport.category)}
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                {translations.generatedOn}: {new Date(selectedReport.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : undefined)}
              </p>
            </div>
            
            <div className="bg-gray-700/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-gray-600/50 mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{language === 'ar' ? 'ملخص' : 'Summary'}</h3>
              <p className="text-xs sm:text-sm text-gray-300">{selectedReport.summary}</p>
            </div>
            
            <div className="bg-gray-700/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-gray-600/50 prose prose-invert max-w-none text-xs sm:text-sm">
              <ReactMarkdown className="markdown-content">
                {selectedReport.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Report Modal */}
      <Modal
        isOpen={showCreateReportModal}
        onClose={() => setShowCreateReportModal(false)}
        title={isEditingReport 
          ? (language === 'ar' ? "تعديل التقرير البحثي" : "Edit Research Report") 
          : (language === 'ar' ? "إنشاء تقرير بحثي" : "Create Research Report")}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {language === 'ar' ? 'عنوان التقرير *' : 'Report Title *'}
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm sm:text-base"
              placeholder={language === 'ar' ? 'أدخل عنوان التقرير' : 'Enter report title'}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {language === 'ar' ? 'الفئة' : 'Category'}
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white backdrop-blur-sm text-sm sm:text-base"
            >
              <option value="AI Market Research">{language === 'ar' ? 'بحث سوق الذكاء الاصطناعي' : 'AI Market Research'}</option>
              <option value="Healthcare AI">{language === 'ar' ? 'الذكاء الاصطناعي في الرعاية الصحية' : 'Healthcare AI'}</option>
              <option value="Government AI">{language === 'ar' ? 'الذكاء الاصطناعي الحكومي' : 'Government AI'}</option>
              <option value="Financial AI">{language === 'ar' ? 'الذكاء الاصطناعي المالي' : 'Financial AI'}</option>
              <option value="Education AI">{language === 'ar' ? 'الذكاء الاصطناعي في التعليم' : 'Education AI'}</option>
              <option value="Industry Analysis">{language === 'ar' ? 'تحليل الصناعة' : 'Industry Analysis'}</option>
              <option value="Technology Trends">{language === 'ar' ? 'اتجاهات التكنولوجيا' : 'Technology Trends'}</option>
              <option value="Cybersecurity AI">{language === 'ar' ? 'الذكاء الاصطناعي للأمن السيبراني' : 'Cybersecurity AI'}</option>
              <option value="Retail AI">{language === 'ar' ? 'الذكاء الاصطناعي في التجزئة' : 'Retail AI'}</option>
              <option value="Manufacturing AI">{language === 'ar' ? 'الذكاء الاصطناعي في التصنيع' : 'Manufacturing AI'}</option>
              <option value="Transportation AI">{language === 'ar' ? 'الذكاء الاصطناعي في النقل' : 'Transportation AI'}</option>
              <option value="Energy AI">{language === 'ar' ? 'الذكاء الاصطناعي في الطاقة' : 'Energy AI'}</option>
              <option value="Agriculture AI">{language === 'ar' ? 'الذكاء الاصطناعي في الزراعة' : 'Agriculture AI'}</option>
              <option value="Smart Cities">{language === 'ar' ? 'المدن الذكية' : 'Smart Cities'}</option>
              <option value="Defense AI">{language === 'ar' ? 'الذكاء الاصطناعي في الدفاع' : 'Defense AI'}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {language === 'ar' ? 'محتوى التقرير (يدعم Markdown) *' : 'Report Content (Markdown supported) *'}
            </label>
            <textarea
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              rows={10}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm font-mono text-xs sm:text-sm"
              placeholder={language === 'ar' ? 
`# عنوان التقرير

## القسم 1
المحتوى هنا...

## القسم 2
المزيد من المحتوى...` : 
`# Report Title

## Section 1
Content goes here...

## Section 2
More content...`}
              required
            />
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-xs sm:text-sm text-gray-400">
              <span className="text-secondary-500">*</span> {language === 'ar' ? 'حقول مطلوبة' : 'Required fields'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowCreateReportModal(false)}
                size="sm"
              >
                {translations.cancel}
              </Button>
              <Button
                onClick={handleSaveReport}
                disabled={isCreatingReport || !reportTitle.trim() || !reportContent.trim()}
                loading={isCreatingReport}
                size="sm"
              >
                {isEditingReport 
                  ? (language === 'ar' ? "تحديث التقرير" : "Update Report") 
                  : (language === 'ar' ? "إنشاء التقرير" : "Create Report")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Report Prompt Modal */}
      <Modal
        isOpen={showReportPromptModal}
        onClose={() => setShowReportPromptModal(false)}
        title={language === 'ar' ? "إنشاء تقرير بحثي بالذكاء الاصطناعي" : "Create AI Research Report"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {language === 'ar' ? 'ما الذي ترغب في الحصول على تقرير عنه؟ *' : 'What would you like a report about? *'}
            </label>
            <textarea
              value={reportPrompt}
              onChange={(e) => setReportPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-gray-400 backdrop-blur-sm text-sm sm:text-base"
              placeholder={language === 'ar' 
                ? 'مثال: تحليل تأثير الذكاء الاصطناعي التوليدي على الرعاية الصحية في المملكة العربية السعودية'
                : 'E.g., Analyze the impact of generative AI on healthcare in Saudi Arabia'}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {language === 'ar' ? 'فئة التقرير' : 'Report Category'}
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white backdrop-blur-sm text-sm sm:text-base"
            >
              <option value="AI Market Research">{language === 'ar' ? 'بحث سوق الذكاء الاصطناعي' : 'AI Market Research'}</option>
              <option value="Healthcare AI">{language === 'ar' ? 'الذكاء الاصطناعي في الرعاية الصحية' : 'Healthcare AI'}</option>
              <option value="Government AI">{language === 'ar' ? 'الذكاء الاصطناعي الحكومي' : 'Government AI'}</option>
              <option value="Financial AI">{language === 'ar' ? 'الذكاء الاصطناعي المالي' : 'Financial AI'}</option>
              <option value="Education AI">{language === 'ar' ? 'الذكاء الاصطناعي في التعليم' : 'Education AI'}</option>
              <option value="Industry Analysis">{language === 'ar' ? 'تحليل الصناعة' : 'Industry Analysis'}</option>
              <option value="Technology Trends">{language === 'ar' ? 'اتجاهات التكنولوجيا' : 'Technology Trends'}</option>
              <option value="Cybersecurity AI">{language === 'ar' ? 'الذكاء الاصطناعي للأمن السيبراني' : 'Cybersecurity AI'}</option>
              <option value="Retail AI">{language === 'ar' ? 'الذكاء الاصطناعي في التجزئة' : 'Retail AI'}</option>
              <option value="Manufacturing AI">{language === 'ar' ? 'الذكاء الاصطناعي في التصنيع' : 'Manufacturing AI'}</option>
              <option value="Transportation AI">{language === 'ar' ? 'الذكاء الاصطناعي في النقل' : 'Transportation AI'}</option>
              <option value="Energy AI">{language === 'ar' ? 'الذكاء الاصطناعي في الطاقة' : 'Energy AI'}</option>
              <option value="Agriculture AI">{language === 'ar' ? 'الذكاء الاصطناعي في الزراعة' : 'Agriculture AI'}</option>
              <option value="Smart Cities">{language === 'ar' ? 'المدن الذكية' : 'Smart Cities'}</option>
              <option value="Defense AI">{language === 'ar' ? 'الذكاء الاصطناعي في الدفاع' : 'Defense AI'}</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-xs sm:text-sm text-gray-400">
              <span className="text-secondary-500">*</span> {language === 'ar' ? 'حقول مطلوبة' : 'Required fields'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowReportPromptModal(false)}
                size="sm"
              >
                {translations.cancel}
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={isCreatingReport || !reportPrompt.trim()}
                loading={isCreatingReport}
                size="sm"
              >
                {language === 'ar' ? 'إنشاء التقرير' : 'Create Report'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      
      <Footer />
    </div>
  );
};

// URL for market insights sources
const MARKET_INSIGHTS_SOURCES_URL = '/MARKET_INSIGHTS_SOURCES.md';

export default GOAIAgent;