import { supabase } from './supabase';
import type { User } from '../types';
import { generateToken } from '../utils/security';


export async function signUp(
  email: string, 
  password: string, 
  userData: { contact_name: string; company_name: string; country: string }
): Promise<User> {
  try {
    console.log('Auth: Starting sign up process for:', email);
    
    // Input validation
    if (!email || !password || !userData.contact_name || !userData.company_name || !userData.country) {
      throw new Error('All fields are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Password validation
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedContactName = userData.contact_name.trim();
    const sanitizedCompanyName = userData.company_name.trim();
    const sanitizedCountry = userData.country.trim();

    console.log('Auth: Creating Supabase auth user');
    
    // Generate confirmation token
    const confirmationToken = generateToken(32);
    
    
    // Use Supabase's built-in authentication with user metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
        data: {
          contact_name: sanitizedContactName,
          company_name: sanitizedCompanyName,
          country: sanitizedCountry
        }
      }
    });

    if (authError) {
      console.error('Auth: Supabase auth error:', authError);
      if (authError.message.includes('already registered')) {
        throw new Error('User with this email already exists');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    console.log('Auth: Supabase auth user created:', authData.user.id);

    // Wait for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the created user profile from public.users table
    console.log('Auth: Fetching user profile from database');
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      console.log('Auth: Profile not found, creating manually');
      // If the trigger didn't work, create the profile manually
      const { data: manualProfileData, error: manualProfileError } = await supabase
          .from('users')
          .insert({
            user_id: authData.user.id,
            email: sanitizedEmail,
            contact_name: sanitizedContactName,
            company_name: sanitizedCompanyName,
            country: sanitizedCountry,
            role: 'User',
            email_confirmation_token: confirmationToken,
            confirmation_sent_at: new Date().toISOString()
          })
          .select()
          .single();

      if (manualProfileError) {
        console.error('Auth: Failed to create profile manually:', manualProfileError);
        // Clean up the auth user if profile creation fails
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('Auth: Failed to clean up auth user:', cleanupError);
        }
        throw new Error('Failed to create user profile');
      }

      console.log('Auth: Manual profile created:', manualProfileData);
      
      // Send confirmation email
      try {
        await sendConfirmationEmail(sanitizedEmail, sanitizedContactName, confirmationToken);
        console.log('Auth: Confirmation email sent to:', sanitizedEmail);
      } catch (emailError) {
        console.error('Auth: Failed to send confirmation email:', emailError);
      }
      
      
      // Send confirmation email
      try {
        await sendConfirmationEmail(sanitizedEmail, sanitizedContactName, confirmationToken);
        console.log('Auth: Confirmation email sent to:', sanitizedEmail);
      } catch (emailError) {
        console.error('Auth: Failed to send confirmation email:', emailError);
      }
      
      return manualProfileData as User;
    }

    // Update the user profile with confirmation token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_confirmation_token: confirmationToken,
        confirmation_sent_at: new Date().toISOString()
      })
      .eq('user_id', authData.user.id);
      
    if (updateError) {
      console.error('Auth: Failed to update profile with confirmation token:', updateError);
    } else {
      // Send confirmation email
      try {
        await sendConfirmationEmail(sanitizedEmail, sanitizedContactName, confirmationToken);
        console.log('Auth: Confirmation email sent to:', sanitizedEmail);
      } catch (emailError) {
        console.error('Auth: Failed to send confirmation email:', emailError);
      }
    }

  

    console.log('Auth: Profile found:', profileData);
    return profileData as User;
  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    console.log('Auth: Starting sign in process for:', email);
    
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Use Supabase's built-in authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password
    });

    if (authError) {
      console.error('Auth: Sign in error:', authError);
      throw new Error('Invalid credentials');
    }

    if (!authData.user) {
      throw new Error('Invalid credentials');
    }

    console.log('Auth: Supabase auth successful:', authData.user.id);

    // Get user profile from public.users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      console.error('Auth: User profile not found after signin:', profileError);
      
      // Create a profile if it doesn't exist
      const { data: newProfileData, error: newProfileError } = await supabase
        .from('users')
        .insert({
          user_id: authData.user.id,
          email: authData.user.email || sanitizedEmail,
          contact_name: authData.user.user_metadata?.contact_name || 'User',
          company_name: authData.user.user_metadata?.company_name || 'Company',
          country: authData.user.user_metadata?.country || 'Unknown',
          role: 'User'
        })
        .select()
        .single();
        
      if (newProfileError) {
        console.error('Auth: Error creating profile after signin:', newProfileError);
        throw new Error('Failed to create user profile');
      }
      
      console.log('Auth: Created profile after signin:', newProfileData);
      return newProfileData as User;
    }

    // Check if email is confirmed
    if (!profileData.email_confirmed) {
      console.warn('Auth: Email not confirmed for user:', profileData.email);
      throw new Error('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
    }

    // Check if email is confirmed
    if (!profileData.email_confirmed) {
      console.warn('Auth: Email not confirmed for user:', profileData.email);
      throw new Error('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
    }

    console.log('Auth: Sign in successful, profile found:', profileData);
    return profileData as User;
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  try {
    // Password validation
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Use Supabase's built-in password update
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log('Auth: Sign out successful');
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('Auth: Getting current user...');
    
    // Test Supabase connection first
    try {
      await supabase.from('users').select('count', { count: 'exact' }).limit(0);
    } catch (connectionError) {
      console.error('Auth: Supabase connection failed:', connectionError);
      throw new Error('Unable to connect to database. Please check your internet connection and try again.');
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth request timeout')), 10000);
    });
    
    const authPromise = supabase.auth.getUser();
    
    const { data: { user: authUser }, error: authError } = await Promise.race([
      authPromise,
      timeoutPromise
    ]) as any;
    
    if (authError) {
      // Use console.warn for session missing errors as this is a gracefully handled scenario
      if (authError.message.includes('Auth session missing!')) {
        console.warn('Auth: Session missing, clearing stale session');
      } else {
        console.error('Auth: Error getting auth user:', authError);
      }
      
      // Check if the error indicates the user no longer exists or session is missing
      if (authError.message.includes('user_not_found') || 
          authError.message.includes('invalid_grant') ||
          authError.message.includes('User from sub claim in JWT does not exist') ||
          authError.message.includes('Auth session missing!')) {
        // Clear the stale session
        await signOut();
        return null;
      }
      return null;
    }

    if (!authUser) {
      console.log('Auth: No auth user found');
      return null;
    }

    console.log('Auth: Auth user found:', authUser.id);

    // Get user profile from public.users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (profileError || !profileData) {
      console.error('Auth: User profile not found:', profileError);
      
      // Try to create a profile if it doesn't exist
      try {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            user_id: authUser.id,
            email: authUser.email || '',
            contact_name: authUser.user_metadata?.contact_name || 'User',
            company_name: authUser.user_metadata?.company_name || 'Company',
            country: authUser.user_metadata?.country || 'Unknown',
            role: 'User'
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Auth: Failed to create user profile:', createError);
          return null;
        }
        
        console.log('Auth: Created missing profile:', newProfile);
        return newProfile as User;
      } catch (error) {
        console.error('Auth: Error creating profile:', error);
        return null;
      }
    }
    
    console.log('Auth: Current user profile found:', profileData);
    return profileData as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Function to send confirmation email



// Function to send confirmation email
async function sendConfirmationEmail(email: string, name: string, token: string): Promise<void> {
  try {
    const emailServiceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3000';
    const appUrl = window.location.origin;
    
    const response = await fetch(`${emailServiceUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        type: 'signup_confirmation',
        name: name,
        token: token,
        appUrl: appUrl
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send confirmation email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

// Function to verify email confirmation token
export async function verifyEmailConfirmation(token: string): Promise<boolean> {
  try {
    if (!token) {
      throw new Error('Confirmation token is required');
    }
    
    // Find user with this token
    const { data, error } = await supabase
      .from('users')
      .update({ email_confirmed: true, email_confirmation_token: null })
      .eq('email_confirmation_token', token)
      .select()
      .single();
      
    if (error) {
      console.error('Error verifying email confirmation:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in verifyEmailConfirmation:', error);
    return false;
  }
}