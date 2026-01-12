import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/rep-profile/hooks/useProfile';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { getProfile } = useProfile();
  const hasFetchedRef = useRef(false);
  const fetchingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('token') || localStorage.getItem('token');
      const userId = Cookies.get('userId');

      if (!token || !userId) {
        // Redirect to login if no auth data
        // router.push('/auth/login'); 
        // For now, don't redirect strictly to allow viewing components, 
        // but set loading false
        setLoading(false);
        return;
      }

      // Check if we've already fetched for this userId
      if (userIdRef.current === userId && hasFetchedRef.current) {
        setLoading(false);
        return;
      }

      // Prevent multiple simultaneous fetches
      if (fetchingRef.current) {
        return;
      }

      try {
        fetchingRef.current = true;
        userIdRef.current = userId;
        
        // Fetch user profile using the rep profile hook for consistency
        const profile = await getProfile(userId);
        if (profile) {
          setUser(profile);
        } else {
          // Profile doesn't exist yet - this is normal, set user to null
          setUser(null);
        }
        hasFetchedRef.current = true;
      } catch (error) {
        // Only log non-404 errors (404 is handled gracefully in getProfile)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          if (axiosError.response?.status !== 404) {
            console.error('Error fetching user:', error);
          }
        } else {
          console.error('Error fetching user:', error);
        }
        setUser(null);
        hasFetchedRef.current = true; // Mark as fetched even on error to prevent retries
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // Only run once on mount

  return { user, loading };
};

