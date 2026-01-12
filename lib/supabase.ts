// Stub for Supabase client
// Note: Install @supabase/supabase-js package if you need Supabase functionality
// npm install @supabase/supabase-js

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mock Supabase client to avoid compilation errors
export const supabase = {
  auth: {
    signInWithOAuth: async (options: any) => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
    signUp: async (options: any) => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
    signInWithPassword: async (options: any) => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
    signOut: async () => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
    signInWithOtp: async (options: any) => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
    verifyOtp: async (options: any) => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
    resetPasswordForEmail: async (email: string, options: any) => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
    updateUser: async (options: any) => {
      throw new Error('Supabase is not configured. Please install @supabase/supabase-js');
    },
  },
} as any;

