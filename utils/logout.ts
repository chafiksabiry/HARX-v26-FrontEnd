import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

/**
 * Fonction centralisée pour déconnecter l'utilisateur
 * Supprime tous les tokens et cookies d'authentification
 * Redirige vers /auth
 */
export function logout() {
  // Supprimer toutes les données de localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('agentId');
    localStorage.removeItem('zoho_token');
    localStorage.removeItem('zoho_access_token');
    
    // Supprimer tous les cookies
    Cookies.remove('token', { path: '/' });
    Cookies.remove('userId', { path: '/' });
    Cookies.remove('agentId', { path: '/' });
    Cookies.remove('gigId', { path: '/' });
    
    // Supprimer aussi avec le domaine pour être sûr
    const hostname = window.location.hostname;
    Cookies.remove('token', { path: '/', domain: hostname });
    Cookies.remove('userId', { path: '/', domain: hostname });
    Cookies.remove('agentId', { path: '/', domain: hostname });
    Cookies.remove('gigId', { path: '/', domain: hostname });
    
    // Rediriger vers /auth
    window.location.href = '/auth';
  }
}

/**
 * Hook pour utiliser logout avec le router Next.js
 */
export function useLogout() {
  const router = useRouter();
  
  return () => {
    // Supprimer toutes les données de localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('agentId');
      localStorage.removeItem('zoho_token');
      localStorage.removeItem('zoho_access_token');
      
      // Supprimer tous les cookies
      Cookies.remove('token', { path: '/' });
      Cookies.remove('userId', { path: '/' });
      Cookies.remove('agentId', { path: '/' });
      Cookies.remove('gigId', { path: '/' });
      
      // Supprimer aussi avec le domaine pour être sûr
      const hostname = window.location.hostname;
      Cookies.remove('token', { path: '/', domain: hostname });
      Cookies.remove('userId', { path: '/', domain: hostname });
      Cookies.remove('agentId', { path: '/', domain: hostname });
      Cookies.remove('gigId', { path: '/', domain: hostname });
    }
    
    // Rediriger vers /auth
    router.push('/auth');
  };
}

