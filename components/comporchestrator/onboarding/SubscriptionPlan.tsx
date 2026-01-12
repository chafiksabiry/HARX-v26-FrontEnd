import React, { useState, useEffect } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { companies } from '@/lib/api';

const SubscriptionPlan = () => {
  const [isStepCompleted, setIsStepCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const companyId = Cookies.get('companyId');

  // VÃ©rifier l'Ã©tat de l'Ã©tape au chargement
  useEffect(() => {
    if (companyId) {
      checkStepStatus();
    }
  }, [companyId]);

  const checkStepStatus = async () => {
    try {
      if (!companyId) return;
      
      // Vérifier l'état de l'étape 3 (Subscription Plan) dans la phase 1
      const onboardingData = await companies.getOnboarding(companyId);
      const onboarding = onboardingData.data || onboardingData;
      
      // Vérifier si l'étape 3 est dans les étapes complétées
      if (onboarding.completedSteps && Array.isArray(onboarding.completedSteps) && onboarding.completedSteps.includes(3)) {
        setIsStepCompleted(true);
        return;
      }
      
    } catch (error) {
      console.error('Error checking step status:', error);
    }
  };

  const freePlan = {
    name: 'Free',
    value: 'free',
    price: '0',
    description: 'Perfect for trying out our platform',
    features: [
      'Up to 5 active gigs',
      'Basic reporting',
      'Email support',
      'Community access',
      'Standard support',
      'Basic analytics',
      'Single phone number'
    ]
  };

  const handleActivatePlan = async () => {
    try {
      setIsLoading(true);
      console.log('ðŸ”„ Starting step completion...');
      console.log('Company ID:', companyId);

      // Marquer l'étape comme complétée (PAS de subscription update!)
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const stepId = 3; // ID du step Subscription Plan
      const phaseId = 1; // ID de la phase Company Account Setup
      const stepResponse = await companies.updateOnboardingStepQuery(companyId, phaseId, stepId, 'completed');
      
      if (!stepResponse) {
        throw new Error('Pas de réponse du serveur pour la mise à jour de l\'étape');
      }
      console.log('✅ Step 3 marked as completed:', stepResponse);
      
      // Mettre Ã  jour l'Ã©tat local
      setIsStepCompleted(true);
      
      // Ne plus utiliser localStorage - les donnÃ©es viennent uniquement de l'API
      // const currentProgress = {
      //   currentPhase: 1,
      //   completedSteps: [3],
      //   lastUpdated: new Date().toISOString()
      // };
      // localStorage.setItem('companyOnboardingProgress', JSON.stringify(currentProgress));
      
      // Synchroniser avec les cookies
      Cookies.set('subscriptionStepCompleted', 'true', { expires: 7 });
      
      // DÃ©clencher un Ã©vÃ©nement pour notifier CompanyOnboarding et fermer le step
      window.dispatchEvent(new CustomEvent('stepCompleted', {
        detail: { 
          stepId: 3, 
          phaseId: 1,
          completedSteps: [3], // NÃ©cessaire pour fermer le step actif
          status: 'completed'
        }
      }));
      
      console.log('âœ… Step 3 completion successful! Returning to phases view...');
      
    } catch (error: any) {
      console.error('âŒ Error completing step:', error);
      if (error.response) {
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url
        });
        alert(`Erreur lors de la validation de l'Ã©tape: ${error.response.data?.message || error.message}`);
      } else {
        alert('Une erreur est survenue lors de la validation de l\'Ã©tape');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
      <div>
          <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Free Plan</h2>
          </div>
        <p className="mt-2 text-gray-600">
          Start using our platform with our comprehensive free plan.
        </p>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="rounded-lg border border-indigo-600 p-8 shadow-sm ring-1 ring-indigo-600">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{freePlan.name}</h3>
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
              Recommended
            </span>
          </div>
          
          <p className="mt-4 text-gray-500">{freePlan.description}</p>
          
          <p className="mt-6">
            <span className="text-5xl font-bold text-gray-900">${freePlan.price}</span>
            <span className="text-base font-medium text-gray-500">/month</span>
          </p>

          <ul className="mt-8 space-y-4">
            {freePlan.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="h-5 w-5 text-indigo-600" />
                <span className="ml-3 text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={isStepCompleted ? undefined : handleActivatePlan}
            disabled={isStepCompleted || isLoading}
            className={`mt-8 w-full rounded-lg px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all ${
              isStepCompleted
                ? 'bg-green-600 cursor-not-allowed'
                : isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isStepCompleted ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Plan Already Activated
              </span>
            ) : isLoading ? (
              'Activating Plan...'
            ) : (
              'Activate Free Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;