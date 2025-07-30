import { supabase } from './supabase';
import type { User } from '../types';
import { generateToken, validateToken } from '../utils/security';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = import.meta.env.VITE_SERVICE_ROLE_KEY;

// ✅ Client for public operations
export const supabasesAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);


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
            email_confirmed:false,
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
      // try {
      //   await sendConfirmationEmail(sanitizedEmail, sanitizedContactName, confirmationToken);
      //   console.log('Auth: Confirmation email sent to:', sanitizedEmail);
      // } catch (emailError) {
      //   console.error('Auth: Failed to send confirmation email:', emailError);
      // }
      
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

// Function to request password reset
export async function requestPasswordReset(email: string): Promise<boolean> {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    debugger;
    
    const sanitizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, contact_name')
      .eq('email', sanitizedEmail)
      .single();
      
    if (userError || !userData) {
      console.error('User not found for password reset:', userError);
      // Don't reveal if user exists or not for security
      return true;
    }
    
    // Generate reset token
    const resetToken = generateToken(32);
    
    // Store token in database
    const { data, error } = await supabase
        .from('users')
        .update({
          email_confirmation_token: resetToken,
          confirmation_sent_at: new Date().toISOString()
        })
        .eq('email', sanitizedEmail)
        .select();

    console.log("UPDATE ERROR:", error);
    console.log("UPDATE RESULT:", data);
      
    if (!data) {
      console.error('Error updating user with reset token:', data);
      throw new Error('Failed to process password reset request');
    }
    
    // Send password reset email
    await sendPasswordResetEmail(
      sanitizedEmail, 
      userData.contact_name || 'User', 
      resetToken
    );
    
    return true;
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    throw error;
  }
}

// Function to reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    if (!token || !newPassword) {
      throw new Error("Token and new password are required");
    }

    if (!validateToken(token)) {
      throw new Error("Invalid token format");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    console.log("🔐 Attempting to reset password with token:", token.substring(0, 5) + "...");

    // 1️⃣ Validate token in custom users table
    const { data: user, error: tokenError } = await supabase
      .from("users")
      .select("*")
      .eq("email_confirmation_token", token)
      .single();

    if (tokenError || !user) {
      console.error("❌ Token validation failed:", tokenError);
      throw new Error("Invalid or expired token");
    }

    console.log("✅ Token found for user:", user.email);

    // Check token expiry (24 hours)
    const tokenDate = new Date(user.confirmation_sent_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      console.error("⏳ Token expired. Hours since creation:", hoursDiff);
      throw new Error("Token has expired. Please request a new password reset.");
    }

    console.log("✅ Token is valid and not expired");

    // 2️⃣ Fetch Supabase Auth user by email
    const { data: authUsersData, error: authError } = await supabasesAdmin.auth.admin.listUsers({
      email: user.email
    });

    if (authError) {
      console.error("❌ Error fetching auth user by email:", authError);
      throw new Error("Failed to find user in Supabase Auth");
    }

    if (!authUsersData?.users?.length) {
      console.error("❌ No Supabase Auth user found for email:", user.email);
      throw new Error("User not found in Supabase Auth");
    }

    const authUser = authUsersData.users[0];
    console.log("✅ Supabase Auth user found. ID:", authUser.id);

    // 3️⃣ Update password in Supabase Auth
    const { error: adminError } = await supabasesAdmin.auth.admin.updateUserById(authUser.id, {
      password: newPassword
    });

    if (adminError) {
      console.error("❌ Admin API error updating password:", adminError);
      throw new Error("Failed to update password");
    }

    console.log("✅ Password updated successfully in Supabase Auth");

    // 4️⃣ Clear token in custom users table
    const { error: clearTokenError } = await supabase
      .from("users")
      .update({ email_confirmation_token: null, confirmation_sent_at: null })
      .eq("id", user.id);

    if (clearTokenError) {
      console.error("⚠️ Error clearing token:", clearTokenError);
      // Don’t throw here; password was already updated
    }

    console.log("🎉 Password reset flow completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
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
async function sendConfirmationEmail(email: string, name: string, token: string): Promise<void> {
  try {
    const emailServiceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://goaihub.ai:3000/api';
    const appUrl = window.location.origin;
    
    console.log('Sending confirmation email to:', email);
    console.log('Using email service URL:', emailServiceUrl);
    
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
      const errorText = await response.text();
      console.error('Email service response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to send confirmation email');
      } catch (e) {
        throw new Error(`Failed to send confirmation email: ${e}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

// Function to send password reset email
async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  try {
    const emailServiceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://goaihub.ai:3000/api';
    const appUrl = window.location.origin;
    
    console.log('Sending password reset email to:', email);
    console.log('Using email service URL:', emailServiceUrl);
    
    const response = await fetch(`${emailServiceUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        type: 'password_reset',
        name: name,
        token: token,
        appUrl: appUrl
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email service response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to send password reset email');
      } catch (e) {
        throw new Error(`Failed to send password reset email: ${e}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Function to verify email confirmation token
export async function verifyEmailConfirmation(token: string): Promise<boolean> {
  try {
    if (!token) throw new Error('Confirmation token is required');

    const { error, count } = await supabase
      .from('users')
      .update({ email_confirmed: true, email_confirmation_token: null })
      .eq('email_confirmation_token', token)
      .select();

    if (error || count === 0) {
      console.error('Verification failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in verifyEmailConfirmation:', error);
    return false;
  }
}
