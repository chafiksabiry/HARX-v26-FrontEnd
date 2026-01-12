import { supabase } from './supabase';

export type AuthError = {
  message: string;
};

export async function signInWithLinkedIn() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        scopes: 'r_liteprofile r_emailaddress',
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'Failed to sign in with LinkedIn'
      } as AuthError 
    };
  }
}

export async function signUp(email: string, password: string, phone: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'Failed to sign up'
      } as AuthError 
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? 
          error.message === 'Invalid login credentials' ? 
            'Invalid email or password' : 
            error.message : 
          'An error occurred during sign in'
      } as AuthError 
    };
  }
}

export async function sendOTP(email: string) {
  try {
    // Clear any existing OTP sessions first
    await supabase.auth.signOut();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        data: {
          type: 'login_otp'
        }
      }
    });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { 
      error: {
        message: error instanceof Error ? error.message : 'Failed to send verification code'
      } as AuthError 
    };
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      if (error.message.includes('Token has expired')) {
        throw new Error('Verification code has expired. Please request a new one.');
      }
      if (error.message.includes('Invalid token')) {
        throw new Error('Invalid verification code. Please try again.');
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'Invalid verification code'
      } as AuthError 
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { 
      error: {
        message: error instanceof Error ? error.message : 'Failed to sign out'
      } as AuthError 
    };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { 
      error: {
        message: error instanceof Error ? error.message : 'Failed to reset password'
      } as AuthError 
    };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'Failed to update password'
      } as AuthError 
    };
  }
}

