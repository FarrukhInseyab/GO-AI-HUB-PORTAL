import { createClient } from '@supabase/supabase-js';
import type { Solution, Interest } from '../types';
import { validateUrl, validateLinkedIn } from '../utils/validation';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  console.error('Missing Supabase environment variables:', missingVars);
  throw new Error(`Missing Supabase environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}. Please ensure it starts with https:// and is a valid URL.`);
}

console.log('Supabase Environment Check:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'ai-solutions-marketplace'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Test connection on initialization
// Simplified connection test with better error handling
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .limit(0);
    
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
      // Don't throw here, just log the warning
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (error) {
    console.warn('Supabase connection test error:', error);
    // Don't throw here, just log the warning
  }
};

// Run test connection but don't block app initialization
testConnection();

export function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
}

// Input sanitization function
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 10000); // Limit length
}

// File validation
export function validateFile(file: File, allowedTypes: string[], maxSize: number): void {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
  }
}

export async function uploadFile(file: File, bucket: string): Promise<string> {
  // Validate file based on bucket type
  const validationRules = {
    'pitch-decks': { types: ['application/pdf'], maxSize: 10 * 1024 * 1024 }, // 10MB
    'registration': { types: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 5 * 1024 * 1024 }, // 5MB
    'product-images': { types: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 2 * 1024 * 1024 } // 2MB
  };

  const rules = validationRules[bucket as keyof typeof validationRules];
  if (rules) {
    validateFile(file, rules.types, rules.maxSize);
  }

  // Generate secure filename
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function createSolution(solution: Partial<Solution>): Promise<Solution> {
  // Input validation and sanitization
  if (!solution.solution_name?.trim()) {
    throw new Error('Solution name is required');
  }
  
  if (!solution.summary?.trim()) {
    throw new Error('Solution summary is required');
  }

  if (!solution.contact_email?.trim()) {
    throw new Error('Contact email is required');
  }
  
  // Validate website URL if provided
  if (solution.website) {
    const websiteValidation = validateUrl(solution.website);
    if (!websiteValidation.isValid) {
      throw new Error(websiteValidation.error || 'Invalid website URL format');
    }
  }
  
  // Validate LinkedIn URL if provided
  if (solution.linkedin) {
    const linkedinValidation = validateLinkedIn(solution.linkedin);
    if (!linkedinValidation.isValid) {
      throw new Error(linkedinValidation.error || 'Invalid LinkedIn URL format');
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!solution.contact_email || !emailRegex.test(solution.contact_email)) {
    throw new Error('Invalid email format');
  }

  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Auth error:', userError);
    throw new Error('Authentication required');
  }

  console.log('Current auth user:', user.id);

  // Get user profile to link solution - we need the primary key id for the foreign key relationship
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, user_id, email, contact_name, company_name')
    .eq('user_id', user.id)
    .single();

  if (profileError || !userProfile) {
    console.error('Profile error:', profileError);
    console.error('Profile query result:', { userProfile, profileError });
    
    // Try to create the user profile if it doesn't exist
    console.log('Attempting to create user profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        user_id: user.id,
        email: user.email || '',
        contact_name: user.user_metadata?.contact_name || user.user_metadata?.contactName || 'User',
        company_name: user.user_metadata?.company_name || user.user_metadata?.companyName || 'Company',
        country: user.user_metadata?.country || 'Unknown',
        role: 'User'
      })
      .select('id, user_id, email, contact_name, company_name')
      .single();

    if (createError || !newProfile) {
      console.error('Failed to create user profile:', createError);
      throw new Error('User profile not found and could not be created. Please try signing out and signing back in.');
    }

    console.log('Created new user profile:', newProfile);
    // Use the newly created profile
    userProfile.id = newProfile.id;
    userProfile.user_id = newProfile.user_id;
    userProfile.email = newProfile.email;
    userProfile.contact_name = newProfile.contact_name;
    userProfile.company_name = newProfile.company_name;
  }

  console.log('Creating solution for user:', {
    authUserId: user.id,
    profileId: userProfile.id,
    profileUserId: userProfile.user_id,
    email: userProfile.email
  });

  // Sanitize text inputs
  const sanitizedSolution = {
    ...solution,
    user_id: userProfile.id, // Use the users table primary key for the foreign key relationship
    solution_name: sanitizeInput(solution.solution_name),
    summary: sanitizeInput(solution.summary || ''),
    description: solution.description ? sanitizeInput(solution.description) : null,
    company_name: solution.company_name ? sanitizeInput(solution.company_name) : userProfile.company_name,
    contact_name: solution.contact_name ? sanitizeInput(solution.contact_name) : userProfile.contact_name,
    contact_email: solution.contact_email.toLowerCase().trim(),
    website: solution.website?.trim() || null,
    linkedin: solution.linkedin ? (solution.linkedin.startsWith('http') ? solution.linkedin.trim() : `https://${solution.linkedin.trim()}`) : null,
    clients: solution.clients ? sanitizeInput(solution.clients) : null,
    ksa_customization_details: solution.ksa_customization_details ? sanitizeInput(solution.ksa_customization_details) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'pending',
    tech_approval_status: 'pending',
    business_approval_status: 'pending'
  };

  console.log('Sanitized solution data:', {
    user_id: sanitizedSolution.user_id,
    solution_name: sanitizedSolution.solution_name,
    contact_email: sanitizedSolution.contact_email
  });

  const { data, error } = await supabase
    .from('solutions')
    .insert(sanitizedSolution)
    .select()
    .single();

  if (error) {
    console.error('Error creating solution:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
  
  return data;
}

export async function updateSolution(id: string, solution: Partial<Solution>): Promise<Solution> {
  // Input validation and sanitization
  if (solution.solution_name && !solution.solution_name.trim()) {
    throw new Error('Solution name cannot be empty');
  }
  
  if (solution.summary && !solution.summary.trim()) {
    throw new Error('Solution summary cannot be empty');
  }

  if (solution.contact_email) {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(solution.contact_email)) {
      throw new Error('Invalid email format');
    }
  }
  
  // Validate website URL if provided
  if (solution.website) {
    const websiteValidation = validateUrl(solution.website);
    if (!websiteValidation.isValid) {
      throw new Error(websiteValidation.error || 'Invalid website URL format');
    }
  }
  
  // Validate LinkedIn URL if provided
  if (solution.linkedin) {
    const linkedinValidation = validateLinkedIn(solution.linkedin);
    if (!linkedinValidation.isValid) {
      throw new Error(linkedinValidation.error || 'Invalid LinkedIn URL format');
    }
  }

  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Auth error:', userError);
    throw new Error('Authentication required');
  }

  // Check if user owns the solution or is an evaluator
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (profileError || !userProfile) {
    console.error('Profile error:', profileError);
    throw new Error('User profile not found');
  }

  // Get the solution to check ownership
  const { data: existingSolution, error: solutionError } = await supabase
    .from('solutions')
    .select('user_id')
    .eq('id', id)
    .single();

  if (solutionError) {
    console.error('Solution error:', solutionError);
    throw new Error('Solution not found');
  }

  // Check if user is authorized to update this solution
  const isOwner = existingSolution.user_id === userProfile.id;
  const isEvaluator = userProfile.role === 'Evaluator';

  if (!isOwner && !isEvaluator) {
    throw new Error('You are not authorized to update this solution');
  }

  // Sanitize text inputs
  const sanitizedSolution: Partial<Solution> = {};
  
  // Only include fields that are provided
  if (solution.solution_name) sanitizedSolution.solution_name = sanitizeInput(solution.solution_name);
  if (solution.summary) sanitizedSolution.summary = sanitizeInput(solution.summary);
  if (solution.description) sanitizedSolution.description = sanitizeInput(solution.description);
  if (solution.company_name) sanitizedSolution.company_name = sanitizeInput(solution.company_name);
  if (solution.contact_name) sanitizedSolution.contact_name = sanitizeInput(solution.contact_name);
  if (solution.contact_email) sanitizedSolution.contact_email = solution.contact_email.toLowerCase().trim();
  if (solution.website) sanitizedSolution.website = solution.website.trim();
  if (solution.linkedin) sanitizedSolution.linkedin = solution.linkedin.startsWith('http') ? solution.linkedin.trim() : `https://${solution.linkedin.trim()}`;
  if (solution.clients) sanitizedSolution.clients = sanitizeInput(solution.clients);
  if (solution.ksa_customization_details) sanitizedSolution.ksa_customization_details = sanitizeInput(solution.ksa_customization_details);
  
  // Arrays and booleans
  if (solution.industry_focus) sanitizedSolution.industry_focus = solution.industry_focus;
  if (solution.tech_categories) sanitizedSolution.tech_categories = solution.tech_categories;
  if (solution.auto_tags) sanitizedSolution.auto_tags = solution.auto_tags;
  if (solution.product_images) sanitizedSolution.product_images = solution.product_images;
  if (solution.arabic_support !== undefined) sanitizedSolution.arabic_support = solution.arabic_support;
  if (solution.ksa_customization !== undefined) sanitizedSolution.ksa_customization = solution.ksa_customization;
  
  // Other fields
  if (solution.revenue) sanitizedSolution.revenue = solution.revenue;
  if (solution.employees) sanitizedSolution.employees = solution.employees;
  if (solution.registration_doc) sanitizedSolution.registration_doc = solution.registration_doc;
  if (solution.deployment_model) sanitizedSolution.deployment_model = solution.deployment_model;
  if (solution.trl) sanitizedSolution.trl = solution.trl;
  if (solution.deployment_status) sanitizedSolution.deployment_status = solution.deployment_status;
  if (solution.pitch_deck) sanitizedSolution.pitch_deck = solution.pitch_deck;
  if (solution.demo_video) sanitizedSolution.demo_video = solution.demo_video;
  if (solution.position) sanitizedSolution.position = solution.position;
  
  // Status fields - only evaluators can update these
  if (isEvaluator) {
    if (solution.status) sanitizedSolution.status = solution.status;
    if (solution.tech_approval_status) sanitizedSolution.tech_approval_status = solution.tech_approval_status;
    if (solution.business_approval_status) sanitizedSolution.business_approval_status = solution.business_approval_status;
    if (solution.tech_feedback) sanitizedSolution.tech_feedback = solution.tech_feedback;
    if (solution.business_feedback) sanitizedSolution.business_feedback = solution.business_feedback;
  }
  
  // If user is resubmitting, reset approval statuses
  if (isOwner && solution.status === 'pending') {
    sanitizedSolution.status = 'pending';
    sanitizedSolution.tech_approval_status = 'pending';
    sanitizedSolution.business_approval_status = 'pending';
  }
  
  // Always update the timestamp
  sanitizedSolution.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('solutions')
    .update(sanitizedSolution)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating solution:', error);
    throw error;
  }
  
  return data;
}

export async function getSolutions(): Promise<Solution[]> {
  const { data: solutions, error: solutionsError } = await supabase
    .from('solutions')
    .select('*')
    .order('created_at', { ascending: false });

  if (solutionsError) throw solutionsError;

  // Get all interests
  const { data: interests, error: interestError } = await supabase
    .from('interests')
    .select('solution_id');

  if (interestError) throw interestError;

  // Count occurrences of each solution_id
  const countMap = new Map<string, number>();
  interests.forEach(({ solution_id }) => {
    countMap.set(solution_id, (countMap.get(solution_id) || 0) + 1);
  });

  // Convert the data to ensure arrays are properly handled and add interest count
  return solutions.map(solution => ({
    ...solution,
    tech_categories: ensureStringArray(solution.tech_categories),
    industry_focus: ensureStringArray(solution.industry_focus),
    auto_tags: ensureStringArray(solution.auto_tags),
    product_images: Array.isArray(solution.product_images) ? solution.product_images : [],
    interest_count: countMap.get(solution.id) || 0
  }));
}

export async function getSolutionById(id: string): Promise<Solution> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid solution ID format');
  }

  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // Get interest count for this solution
  const { count } = await supabase
    .from('interests')
    .select('*', { count: 'exact' })
    .eq('solution_id', id);

  // Convert the data to ensure arrays are properly handled
  return {
    ...data,
    tech_categories: ensureStringArray(data.tech_categories),
    industry_focus: ensureStringArray(data.industry_focus),
    auto_tags: ensureStringArray(data.auto_tags),
    product_images: Array.isArray(data.product_images) ? data.product_images : [],
    interest_count: count || 0
  };
}

export async function createInterest(interest: Omit<Interest, 'id' | 'created_at' | 'status'>): Promise<Interest> {
  // Input validation
  if (!interest.solution_id || !interest.user_id) {
    throw new Error('Solution ID and User ID are required');
  }

  if (!interest.company_name?.trim() || !interest.contact_name?.trim() || !interest.contact_email?.trim()) {
    throw new Error('Company name, contact name, and email are required');
  }

  if (!interest.message?.trim()) {
    throw new Error('Message is required');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(interest.contact_email)) {
    throw new Error('Invalid email format');
  }

  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required');
  }

  // Get user profile to link interest
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (profileError || !userProfile) {
    throw new Error('User profile not found');
  }

  // Sanitize inputs
  const sanitizedInterest = {
    ...interest,
    user_id: userProfile.id, // Link to users table
    company_name: sanitizeInput(interest.company_name),
    contact_name: sanitizeInput(interest.contact_name),
    contact_email: interest.contact_email.toLowerCase().trim(),
    contact_phone: interest.contact_phone ? sanitizeInput(interest.contact_phone) : null,
    message: sanitizeInput(interest.message),
    status: 'New Interest',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('interests')
    .insert(sanitizedInterest)
    .select()
    .single();

  if (error) {
    console.error('Error creating interest:', error);
    throw error;
  }
  
  return data;
}

export async function deleteSolution(id: string): Promise<void> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid solution ID format');
  }

  const { error } = await supabase
    .from('solutions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteInterest(id: string): Promise<void> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid solution ID format');
  }

  const { error } = await supabase
    .from('interests')
    .delete()
    .eq('id', id);

  if (error) throw error;
}