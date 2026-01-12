/**
 * Configuration file for the REPS platform
 * Handles environment variables and user authentication data
 */

import Cookies from 'js-cookie';

/**
 * Get user authentication data from cookies and localStorage
 * This is used in-app mode (Next.js integration)
 */
export const getUserData = () => {
  // Get userId and agentId from cookies
  const userId = Cookies.get('userId') || null;
  const agentId = Cookies.get('agentId') || localStorage.getItem('agentId') || null;
  
  // Get token from localStorage (preferred) or cookies
  const token = localStorage.getItem('token') || Cookies.get('token') || null;

  return {
    userId,
    agentId,
    token,
  };
};

// Export configuration object
export const config = {
  getUserData,
  // Add other config properties as needed
};

export default config;

