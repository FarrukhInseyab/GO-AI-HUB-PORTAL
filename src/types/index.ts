// Common types used across the application
export interface User {
  id: string;
  user_id: string; // Links to auth.users
  email: string;
  contact_name: string;
  company_name: string;
  country: string;
  created_at: string;
  updated_at: string;
  role?: string;
}

export interface Solution {
  id: string;
  user_id: string;
  company_name: string;
  country: string;
  website?: string;
  revenue?: string;
  employees?: string;
  registration_doc?: string;
  linkedin?: string;
  solution_name: string;
  summary: string;
  description?: string;
  industry_focus: string[];
  tech_categories: string[];
  auto_tags: string[];
  deployment_model?: string;
  arabic_support: boolean;
  product_images: string[];
  trl?: string;
  deployment_status?: string;
  clients?: string;
  ksa_customization: boolean;
  ksa_customization_details?: string;
  pitch_deck?: string;
  demo_video?: string;
  contact_name: string;
  position?: string;
  contact_email: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmit';
  tech_approval_status?: string;
  business_approval_status?: string;
  tech_feedback?: string;
  business_feedback?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  technical_eval_id?: string;
  business_eval_id?: string;
  interest_count?: number;
}

export interface Interest {
  id: string;
  solution_id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  message: string;
  created_at: string;
  status: 'Lead Initiated' | 'New Interest';
  comments?: string;
  profile_id?: string;
  initiated_at?: string;
  solutions?: {
    id: string;
    solution_name: string;
    company_name?: string;
    status?: string;
    tech_approval_status?: string;
    business_approval_status?: string;
  };
}

export interface FormData {
  // Basic Info
  companyName?: string;
  website?: string;
  revenue?: string;
  employees?: string;
  registration?: string | null;
  linkedin?: string;
  
  // Solution Overview
  solutionName?: string;
  summary?: string;
  description?: string;
  industryFocus?: string[];
  techCategory?: string[];
  aiTags?: string[];
  deploymentModel?: string;
  arabicSupport?: boolean;
  productImages?: string[];
  
  // Deployment & Maturity
  trl?: string;
  deploymentStatus?: string;
  clients?: string;
  ksaCustomization?: boolean;
  ksaCustomizationDetails?: string;
  
  // Attachments & Legal
  pitchDeck?: string | null;
  demoVideo?: string;
  contactName?: string;
  position?: string;
  contactEmail?: string;
  legalTerms?: boolean;
  
  // For resubmission
  isResubmission?: boolean;
  solutionId?: string;
  techFeedback?: string;
  businessFeedback?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
  isError?: boolean;
}

export interface MarketHighlight {
  title: { en: string; ar: string };
  value: string;
  description: { en: string; ar: string };
  trend: 'up' | 'down' | 'neutral';
}

export interface SuccessStory {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  impact: { en: string; ar: string };
}

export interface ResearchReport {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'highest-rated' | 'alphabetical';