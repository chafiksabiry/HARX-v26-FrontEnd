import { auth, companies } from '../lib/api';
import Cookies from 'js-cookie';

/**
 * Détermine la redirection appropriée pour un utilisateur connecté
 * Logique:
 * 1. Si premier login ou pas de type → /onboarding/choice
 * 2. Si type rep → orchestrator rep
 * 3. Si type company:
 *    - Si pas de company → /onboarding/company
 *    - Si company mais pas de gigs → /gigs/create
 *    - Si company et a des gigs → orchestrator company
 */
export async function getAuthRedirect(userId: string, token: string): Promise<string> {
  try {
    // 1. Vérifier si premier login et type utilisateur
    let checkFirstLogin, checkUserType;
    
    try {
      checkFirstLogin = await auth.checkFirstLogin(userId);
      checkUserType = await auth.checkUserType(userId);
    } catch (error: any) {
      // Si l'utilisateur n'existe pas (404) ou erreur d'authentification (401), nettoyer les credentials
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.warn('User not found or unauthorized, clearing credentials');
        if (typeof window !== 'undefined') {
          Cookies.remove('userId');
          localStorage.removeItem('userId');
          localStorage.removeItem('token');
        }
        throw new Error('UNAUTHORIZED');
      }
      throw error;
    }

    // Extraire les valeurs depuis la structure de réponse { success: true, data: {...} }
    const isFirstLogin = checkFirstLogin.data?.isFirstLogin ?? checkFirstLogin.isFirstLogin ?? false;
    const userType = checkUserType.data?.userType ?? checkUserType.userType;

    // Debug logs
    console.log('[authRedirect] checkFirstLogin:', checkFirstLogin);
    console.log('[authRedirect] checkUserType:', checkUserType);
    console.log('[authRedirect] extracted userType:', userType);
    console.log('[authRedirect] isFirstLogin:', isFirstLogin);

    // Si pas de type, vérifier si l'utilisateur a une company ou un profil rep
    // pour déterminer le type implicitement
    if (userType == null || userType === undefined) {
      console.warn('[authRedirect] userType is null/undefined, checking for existing company or profile...');
      
      // Vérifier d'abord si l'utilisateur a une company
      try {
        const companyData = await companies.getByUserId(userId);
        if (companyData && companyData.success && companyData.data && companyData.data._id) {
          console.log('[authRedirect] Company found, treating user as company type');
          // L'utilisateur a une company, traiter comme company
          const companyId = companyData.data._id;
          
          // Vérifier les phases d'onboarding
          try {
            const onboardingData = await companies.getOnboarding(companyId);
            const completedSteps = onboardingData.data?.completedSteps || onboardingData.completedSteps || [];
            const currentPhase = onboardingData.data?.currentPhase || onboardingData.currentPhase || 1;
            const allRequiredSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
            const allStepsCompleted = allRequiredSteps.every(stepId => completedSteps.includes(stepId));
            const isPhase4Complete = currentPhase === 4 && completedSteps.length >= 13;
            
            if (allStepsCompleted || isPhase4Complete) {
              return '/company/dashboard/overview';
            } else {
              const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
              return compOrchestratorUrl;
            }
          } catch (onboardingError: any) {
            console.warn('[authRedirect] Error checking onboarding, redirecting to orchestrator');
            const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
            return compOrchestratorUrl;
          }
        }
      } catch (companyCheckError: any) {
        // Pas de company trouvée, continuer avec la vérification du profil rep
        console.log('[authRedirect] No company found, checking for rep profile...');
      }
      
      // Vérifier si l'utilisateur a un profil rep
      try {
        const { api } = await import('../lib/api');
        const profileResponse = await api.get(`/profiles/${userId}`);
        if (profileResponse.data && profileResponse.data.success && profileResponse.data.data) {
          console.log('[authRedirect] Rep profile found, treating user as rep type');
          const profileData = profileResponse.data.data;
          
          // Stocker l'agentId si disponible
          if (profileData._id) {
            Cookies.set('agentId', profileData._id);
            if (typeof window !== 'undefined') {
              localStorage.setItem('agentId', profileData._id);
            }
          }
          
          // Vérifier si toutes les phases d'onboarding sont complètes
          // Le backend a 4 phases (phase1-phase4), toutes doivent être "completed" pour accéder au dashboard
          if (profileData.onboardingProgress) {
            const onboardingProgress = profileData.onboardingProgress;
            const phases = onboardingProgress.phases || {};
            
            // Vérifier si toutes les phases 1-4 sont complétées
            const allPhasesComplete = [1, 2, 3, 4].every(phaseNum => {
              const phase = phases[`phase${phaseNum}`];
              if (!phase) return false;
              
              // Vérifier que le status est "completed"
              if (phase.status === 'completed') {
                return true;
              }
              
              // Alternative: vérifier que tous les requiredActions sont true
              if (phase.requiredActions && typeof phase.requiredActions === 'object') {
                const allRequiredCompleted = Object.values(phase.requiredActions).every((action: any) => action === true);
                return allRequiredCompleted;
              }
              
              return false;
            });
            
            if (allPhasesComplete) {
              // Toutes les phases sont complètes → rediriger vers dashboard
              console.log('[authRedirect] All rep onboarding phases (1-4) completed, redirecting to dashboard');
              return '/repdashboard';
            } else {
              // Phases non complètes → rediriger vers orchestrator
              console.log('[authRedirect] Rep onboarding not complete, redirecting to orchestrator');
              const repOrchestratorUrl = process.env.NEXT_PUBLIC_REP_ORCHESTRATOR_URL || '/reporchestrator';
              return repOrchestratorUrl;
            }
          }
          
          // Si pas de données d'onboarding, rediriger vers orchestrator par défaut
          const repOrchestratorUrl = process.env.NEXT_PUBLIC_REP_ORCHESTRATOR_URL || '/reporchestrator';
          return repOrchestratorUrl;
        }
      } catch (profileCheckError: any) {
        // Pas de profil rep trouvé
        console.log('[authRedirect] No rep profile found');
      }
      
      // Si ni company ni rep profile, rediriger vers choice
      console.warn('[authRedirect] No company or rep profile found, redirecting to choice page');
      return '/onboarding/choice';
    }

    // 2. Si type rep → vérifier si l'utilisateur a un profil d'agent et l'état des phases
    if (userType === 'rep') {
      // Vérifier si l'utilisateur a un profil d'agent (agentId)
      let agentId = Cookies.get('agentId') || (typeof window !== 'undefined' ? localStorage.getItem('agentId') : null);
      let profileData = null;
      
      // Si pas d'agentId, vérifier si un profil existe déjà via l'API
      if (!agentId) {
        try {
          const { api } = await import('../lib/api');
          const profileResponse = await api.get(`/profiles/${userId}`);
          if (profileResponse.data && profileResponse.data.success && profileResponse.data.data) {
            // Le profil existe, stocker l'agentId
            profileData = profileResponse.data.data;
            if (profileData._id) {
              agentId = profileData._id;
              Cookies.set('agentId', agentId);
              if (typeof window !== 'undefined') {
                localStorage.setItem('agentId', agentId);
              }
            }
          }
        } catch (profileError: any) {
          // Si 404, pas de profil → rediriger vers la création de profil
          if (profileError.response?.status === 404) {
            console.log('[authRedirect] No rep profile found, redirecting to profile creation');
            return '/repcreationprofile';
          }
          // Autre erreur → ne pas rediriger, laisser l'utilisateur sur la page actuelle
          console.warn('[authRedirect] Error checking agent profile:', profileError);
          return null; // Ne pas rediriger en cas d'erreur
        }
        
        // Pas de profil trouvé → rediriger vers la création de profil
        if (!profileData) {
          console.log('[authRedirect] No rep profile found, redirecting to profile creation');
          return '/repcreationprofile';
        }
      } else {
        // Si agentId existe, récupérer les données du profil pour vérifier les phases
        try {
          const { api } = await import('../lib/api');
          const profileResponse = await api.get(`/profiles/${userId}`);
          if (profileResponse.data && profileResponse.data.success && profileResponse.data.data) {
            profileData = profileResponse.data.data;
          }
        } catch (profileError: any) {
          console.warn('[authRedirect] Error fetching profile data:', profileError);
        }
      }
      
      // Vérifier si toutes les phases d'onboarding sont complètes
      // Le backend a 4 phases (phase1-phase4), toutes doivent être "completed" pour accéder au dashboard
      if (profileData && profileData.onboardingProgress) {
        const onboardingProgress = profileData.onboardingProgress;
        const phases = onboardingProgress.phases || {};
        
        // Vérifier si toutes les phases 1-4 sont complétées
        const allPhasesComplete = [1, 2, 3, 4].every(phaseNum => {
          const phase = phases[`phase${phaseNum}`];
          if (!phase) return false;
          
          // Vérifier que le status est "completed"
          if (phase.status === 'completed') {
            return true;
          }
          
          // Alternative: vérifier que tous les requiredActions sont true
          if (phase.requiredActions && typeof phase.requiredActions === 'object') {
            const allRequiredCompleted = Object.values(phase.requiredActions).every((action: any) => action === true);
            return allRequiredCompleted;
          }
          
          return false;
        });
        
        if (allPhasesComplete) {
          // Toutes les phases sont complètes → rediriger vers dashboard
          console.log('[authRedirect] All rep onboarding phases (1-4) completed, redirecting to dashboard');
          return '/repdashboard';
        } else {
          // Phases non complètes → rediriger vers orchestrator
          console.log('[authRedirect] Rep onboarding not complete, redirecting to orchestrator');
          const repOrchestratorUrl = process.env.NEXT_PUBLIC_REP_ORCHESTRATOR_URL || '/reporchestrator';
          return repOrchestratorUrl;
        }
      }
      
      // Si pas de données d'onboarding, rediriger vers orchestrator par défaut
      console.log('[authRedirect] No onboarding data found, redirecting to orchestrator');
      const repOrchestratorUrl = process.env.NEXT_PUBLIC_REP_ORCHESTRATOR_URL || '/reporchestrator';
      return repOrchestratorUrl;
    }

    // 3. Si type company → vérifier company et phases d'onboarding
    if (userType === 'company') {
      console.log('[authRedirect] User type is company, checking company data...');
      try {
        // Vérifier si l'utilisateur a une entreprise
        const companyData = await companies.getByUserId(userId);
        console.log('[authRedirect] Company data response:', companyData);
        
        if (companyData && companyData.success && companyData.data && companyData.data._id) {
          console.log('[authRedirect] Company found, checking onboarding status...');
          const companyId = companyData.data._id;
          
          // Vérifier si toutes les phases d'onboarding sont complètes
          try {
            const onboardingData = await companies.getOnboarding(companyId);
            
            // Vérifier si toutes les phases (1-4) sont complètes
            // L'onboarding company utilise un système de steps complétés
            const isAllPhasesComplete = (onboarding: any) => {
              if (!onboarding) return false;
              
              // Vérifier si currentPhase est 4 et que tous les steps sont complétés
              // Ou vérifier directement les completedSteps
              const completedSteps = onboarding.completedSteps || [];
              
              // Les phases ont généralement ces steps:
              // Phase 1: steps 1-3
              // Phase 2: steps 4-6
              // Phase 3: steps 7-9
              // Phase 4: steps 10-13
              // Si tous les steps 1-13 sont complétés, toutes les phases sont complètes
              const allRequiredSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
              const allStepsCompleted = allRequiredSteps.every(stepId => completedSteps.includes(stepId));
              
              // Alternative: vérifier si currentPhase est 4
              const currentPhase = onboarding.currentPhase || 1;
              const isPhase4Complete = currentPhase === 4 && completedSteps.length >= 13;
              
              return allStepsCompleted || isPhase4Complete;
            };
            
            const allPhasesComplete = isAllPhasesComplete(onboardingData.data || onboardingData);
            
            if (allPhasesComplete) {
              // Toutes les phases sont complètes → rediriger vers dashboard
              console.log('All company onboarding phases completed, redirecting to dashboard');
              return '/company/dashboard/overview';
            } else {
              // Phases non complètes → rediriger vers orchestrator
              console.log('Company onboarding not complete, redirecting to orchestrator');
              const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
              return compOrchestratorUrl;
            }
          } catch (onboardingError: any) {
            // Si erreur lors de la vérification de l'onboarding, rediriger vers orchestrator par sécurité
            console.warn('Error checking onboarding status, redirecting to orchestrator:', onboardingError);
          const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
          return compOrchestratorUrl;
          }
        } else {
          // Pas d'entreprise → rediriger vers création d'entreprise
          console.warn('[authRedirect] No company found in response, redirecting to company creation');
          return '/onboarding/company';
        }
      } catch (companyError: any) {
        console.error('[authRedirect] Error checking company:', companyError);
        // Si 404, pas d'entreprise trouvée → rediriger vers création d'entreprise
        if (companyError.response?.status === 404) {
          console.warn('[authRedirect] Company not found (404), redirecting to company creation');
          return '/onboarding/company';
        }
        // Si 401, token invalide ou expiré → nettoyer les credentials
        if (companyError.response?.status === 401) {
          console.warn('Authentication failed (401): Token may be invalid or expired');
          if (typeof window !== 'undefined') {
            Cookies.remove('userId');
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
          }
          throw new Error('UNAUTHORIZED');
        }
        // Autre erreur → rediriger vers orchestrator par sécurité
        console.error('Error checking company:', companyError);
        const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
        return compOrchestratorUrl;
      }
    }

    // Fallback vers choice si type inconnu
    return '/onboarding/choice';
  } catch (error: any) {
    console.error('[authRedirect] Error determining redirect path:', error);
    console.error('[authRedirect] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // Si c'est une erreur UNAUTHORIZED, ne pas rediriger vers choice
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      throw error; // Re-throw pour que le caller puisse gérer
    }
    return '/onboarding/choice';
  }
}

/**
 * Vérifie si l'utilisateur est connecté et redirige si nécessaire
 */
export async function checkAndRedirect(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null; // Côté serveur, pas de redirection
  }

  const userId = Cookies.get('userId') || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!userId || !token) {
    return null; // Pas connecté
  }

  try {
    return await getAuthRedirect(userId, token);
  } catch (error) {
    // Si erreur d'authentification (401), retourner null pour rester sur la page de login
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return null;
    }
    // Pour les autres erreurs, les propager
    throw error;
  }
}

