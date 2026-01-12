import { auth } from '../lib/api';
import Cookies from 'js-cookie';
import { getAuthRedirect } from './authRedirect';

const LINKEDIN_SCOPE = 'openid profile email';

// Function to determine redirect path after authentication (deprecated - use getAuthRedirect instead)
const getRedirectPath = async (userId: string, token?: string): Promise<string> => {
  if (!token) {
    return '/onboarding/choice';
  }
  return await getAuthRedirect(userId, token);
};

export const handleLinkedInSignUp = () => {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const redirectUri = typeof window !== 'undefined' ? window.location.origin + '/auth/linkedin/callback' : '';
  
  if (!clientId) {
    console.error('LinkedIn client ID is not configured');
    return;
  }

  // Generate a random state value for security
  const state = Math.random().toString(36).substring(7);
  // Store state in sessionStorage for validation when LinkedIn redirects back
  localStorage.setItem('linkedin_oauth_state', state);

  // Construct the LinkedIn OAuth URL
  const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  linkedInAuthUrl.searchParams.append('response_type', 'code');
  linkedInAuthUrl.searchParams.append('client_id', clientId);
  linkedInAuthUrl.searchParams.append('redirect_uri', redirectUri);
  linkedInAuthUrl.searchParams.append('state', state);
  linkedInAuthUrl.searchParams.append('scope', LINKEDIN_SCOPE);
  
  window.location.href = linkedInAuthUrl.toString();
};

// Function to handle the OAuth callback
export const handleLinkedInCallback = async (code: string, state: string) => {
  // Verify state matches what we stored before the redirect
  const storedState = localStorage.getItem('linkedin_oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid OAuth state');
  }

  // Clear stored state
  localStorage.removeItem('linkedin_oauth_state');

  const response = await auth.linkedInAuth(code);
  localStorage.setItem("auth_token", response.token);
  
  // Decode token to get userId
  try {
    const { jwtDecode } = await import('jwt-decode');
    const decoded: any = jwtDecode(response.token);
    const userId = decoded.userId;
    
    if (userId) {
      localStorage.setItem("userId", userId);
      Cookies.set('userId', userId);
      
      // Determine redirect path based on user type and first login status
      const redirectPath = await getRedirectPath(userId, response.token);
      return redirectPath;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  
  // Fallback to choice page if we can't determine redirect
  return '/onboarding/choice';
};

// Function to handle the OAuth callback
export const handleLinkedInSignInCallback = async (code: string, state: string) => {
  // Verify state matches what we stored before the redirect
  const storedState = localStorage.getItem('linkedin_state');
  if (state !== storedState) {
    throw new Error('Invalid OAuth state');
  }
  
  try {
    // Send auth code to your backend for exchange
    const response = await auth.linkedinSignIn(code);
    localStorage.setItem("auth_token", response.token); 
    localStorage.setItem("userId", response.user._id);
    Cookies.set('userId', response.user._id);
    
    // Determine redirect path based on user type and first login status
    const redirectPath = await getRedirectPath(response.user._id, response.token);
    
    // Clear stored state
    localStorage.removeItem('linkedin_state');
    
    // Return redirect path so the caller can navigate
    return redirectPath;
  } catch (error) {
    console.error("LinkedIn Sign-in Error", error);
    throw error;
  }
};

export const handleLinkedInSignIn = async () => {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/linkedin/signin/callback` : '';
  const scope = 'openid profile email';
  const state = Math.random().toString(36).substring(7);
  
  localStorage.setItem('linkedin_state', state);
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  
  window.location.href = authUrl;
};

