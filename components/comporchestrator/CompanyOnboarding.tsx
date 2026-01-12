"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Shield,
  FileText,
  Phone,
  Users,
  BookOpen,
  MessageSquare,
  BarChart,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Upload,
  Globe,
  Calendar,
  Settings,
  Rocket,
} from "lucide-react";
import TelephonySetup from "./TelephonySetup";
import CompanyProfile from "./onboarding/CompanyProfile";
import KYCVerification from "./onboarding/KYCVerification";
import SubscriptionPlan from "./onboarding/SubscriptionPlan";
import CallScript from "./onboarding/CallScript";
import ScriptGenerator from "../knowledgebase/components/ScriptGenerator";
import ReportingSetup from "./onboarding/ReportingSetup";
import CreateGig from "./onboarding/CreateGig";
import UploadContacts from "./onboarding/UploadContacts";
import MatchHarxReps from "./onboarding/MatchHarxReps";
import MatchingDashboard from "./onboarding/MatchingDashboard";
import RepOnboarding from "./onboarding/RepOnboarding";
import SessionPlanning from "./onboarding/SessionPlanning";
import Cookies from "js-cookie";
import { companies, leads, gigs, zoho } from "@/lib/api";
import GigDetails from "./onboarding/GigDetails";
import KnowledgeBase from "./onboarding/KnowledgeBase";
import ApprovalPublishing from "./ApprovalPublishing";
import ZohoService from "./services/zohoService";

interface BaseStep {
  id: number;
  title: string;
  description: string;
  status: string;
  disabled?: boolean;
}

interface ComponentStep extends BaseStep {
  component: React.ComponentType;
}

interface NonComponentStep extends BaseStep {
  component?: never;
}

type Step = ComponentStep | NonComponentStep;

interface Phase {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  steps: Step[];
}

interface OnboardingProgressResponse {
  currentPhase: number;
  completedSteps: number[];
  phases: {
    id: number;
    status: "pending" | "in_progress" | "completed";
    steps: {
      id: number;
      status: "pending" | "in_progress" | "completed";
      completedAt?: Date;
    }[];
  }[];
}

interface HasGigsResponse {
  message: string;
  data: {
    hasGigs: boolean;
  };
}

interface HasLeadsResponse {
  success: boolean;
  hasLeads: boolean;
  count: number;
}

interface CompanyResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    // Add other company fields as needed
  };
}

interface GigResponse {
  success: boolean;
  message: string;
  data: Array<{
    _id: string;
    title: string;
    status: string;
    // Add other gig fields as needed
  }>;
}

const CompanyOnboarding = () => {
  // Remove early return - we need to render the component to show onboarding interface

  const [isMounted, setIsMounted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [displayedPhase, setDisplayedPhase] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showTelephonySetup, setShowTelephonySetup] = useState(false);
  const [showUploadContacts, setShowUploadContacts] = useState(false);

  // Handle client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Single useEffect to handle UploadContacts state and parsed leads cleanup
  useEffect(() => {
    const hasParsedLeads = localStorage.getItem("parsedLeads");
    const wasManuallyClosed = sessionStorage.getItem("uploadContactsManuallyClosed");
    
    // Only restore if we have leads AND we're not manually closed AND we're in the right phase
    if (hasParsedLeads && !wasManuallyClosed && displayedPhase >= 2 && !showUploadContacts) {
      console.log("🔄 Restoring UploadContacts view - parsed leads exist and phase allows it");
      setShowUploadContacts(true);
    }
    
    // Debug: log the current state
    console.log("🔍 UploadContacts restoration check:", {
      hasParsedLeads: !!hasParsedLeads,
      wasManuallyClosed: !!wasManuallyClosed,
      displayedPhase,
      showUploadContacts,
      shouldRestore: hasParsedLeads && !wasManuallyClosed && displayedPhase >= 2 && !showUploadContacts
    });
  }, [displayedPhase]); // Remove showUploadContacts to prevent loops

  // Clean up parsed leads when phase changes and component is not showing
  useEffect(() => {
    if (displayedPhase < 2 && showUploadContacts) {
      console.log("🧹 Cleaning parsed leads - current phase too early:", displayedPhase);
      localStorage.removeItem("parsedLeads");
      setShowUploadContacts(false);
    }
  }, [displayedPhase, showUploadContacts]);

  // Prevent any automatic restoration when manually closed
  useEffect(() => {
    if (!showUploadContacts) {
      // Set the flag immediately when component is closed
      sessionStorage.setItem("uploadContactsManuallyClosed", "true");
      console.log("🚫 Set manual close flag - preventing auto-restoration");
    }
  }, [showUploadContacts]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGigs, setHasGigs] = useState(false);
  const [hasLeads, setHasLeads] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showGigDetails, setShowGigDetails] = useState(false);
  const userId = Cookies.get("userId");

  // Fetch company ID using user ID
  useEffect(() => {
    const fetchCompanyId = async () => {
      // TOUJOURS charger depuis l'API, même en développement
      if (!userId) {
        console.error("User ID not found in cookies");
        // Rediriger vers /auth si pas d'userId
        if (typeof window !== 'undefined') {
        window.location.href = "/auth";
        }
        return;
      }

      try {
        console.log("🔍 Fetching company for userId:", userId);
        // Utiliser le service API qui pointe vers le backend (port 5000)
        const companyData = await companies.getByUserId(userId);
        if (companyData && companyData.success && companyData.data) {
          const fetchedCompanyId = companyData.data._id;
          console.log("✅ Company ID fetched from API:", fetchedCompanyId);
          
          setCompanyId(fetchedCompanyId);
          // Store company ID in cookie
          Cookies.set("companyId", fetchedCompanyId);
          
          console.log(
            "✅ Company ID fetched and stored:",
            fetchedCompanyId
          );
        } else {
          // Pas de company trouvée - c'est normal pour un nouvel utilisateur ou si l'utilisateur n'a pas encore créé de company
          console.log("ℹ️ No company found for user (this is normal if user hasn't created a company yet):", userId);
          // Ne pas logger comme une erreur, c'est un cas normal
        }
      } catch (error: any) {
        // Si 404, pas de company trouvée - c'est normal pour un nouvel utilisateur
        if (error.response?.status === 404 || error.status === 404) {
          console.log("ℹ️ No company found for user (this is normal if user hasn't created a company yet):", userId);
        } else {
          console.error("Error fetching company ID:", error);
        }
        // Ne pas rediriger immédiatement, afficher un message d'erreur à la place
      }
    };

    fetchCompanyId();
  }, [userId]);

  // Add listener for step completion messages from child components
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "STEP_COMPLETED") {
        console.log("Received step completion message:", event.data);
        const { stepId, phaseId, data } = event.data;

        // Update local state
        setCompletedSteps((prev) => {
          if (!prev.includes(stepId)) {
            return [...prev, stepId];
          }
          return prev;
        });

        // Refresh onboarding progress
        loadCompanyProgress();

        // Show success message
        console.log(`✅ Step ${stepId} completed successfully`);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Recharger les données périodiquement pour détecter les changements
  // Désactivé car cause trop de rafraîchissements
  // useEffect(() => {
  //   if (!companyId) return;

  //   const interval = setInterval(() => {
  //     loadCompanyProgress();
  //   }, 5000); // Recharger toutes les 5 secondes

  //   return () => clearInterval(interval);
  // }, [companyId]);

  // Vérifier périodiquement si l'étape 6 doit être marquée comme complétée
  useEffect(() => {
    if (!companyId) return;

    const interval = setInterval(() => {
      // Vérifier si la company a des leads mais que l'étape 6 n'est pas marquée comme complétée
      checkCompanyLeadsForAutoCompletion();
    }, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(interval);
  }, [companyId, completedSteps]);

  // Fonction pour auto-compléter l'étape 6 si des leads existent
  const checkCompanyLeadsForAutoCompletion = React.useCallback(async () => {
    try {
      if (!companyId || completedSteps.includes(6)) {
        return; // Step already completed or no company ID
      }

      const response = await leads.hasLeads(companyId);
      
      if (response.hasLeads && response.count > 0) {
        console.log('✅ Company has leads - auto-completing step 6');
        try {
          await companies.updateOnboardingStep(companyId, 2, 6, 'completed');
          
          // Update local state to reflect the completed step
          setCompletedSteps((prev: any) => {
            if (!prev.includes(6)) {
              const newSteps = [...prev, 6];
              console.log('✅ Step 6 auto-completed successfully - updating local state');
              
              // Update localStorage as well
              const currentProgress = {
                currentPhase: 2,
                completedSteps: newSteps,
                lastUpdated: new Date().toISOString()
              };
              localStorage.setItem('companyOnboardingProgress', JSON.stringify(currentProgress));
              
              return newSteps;
            }
            return prev;
          });
          
          // Set hasLeads state
          setHasLeads(true);
          
        } catch (error) {
          console.error('Error auto-completing step 6:', error);
        }
      }
    } catch (error) {
      console.error('Error checking company leads for auto-completion:', error);
    }
  }, [companyId, completedSteps]); // useCallback dependencies

  // Si l'URL contient ?startStep=6 ou si on est sur l'URL spécifique avec session, on lance handleStartStep(6)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Vérifier si l'URL contient le paramètre startStep=6
    if (params.get("session") === "someGeneratedSessionId" && companyId) {
      handleStartStep(6);
    }
  }, [companyId]);

  const checkCompanyGigs = async () => {
    try {
      // Vérifier que companyId est disponible
      if (!companyId) {
        console.error("❌ Company ID not available for checking gigs");
        return;
      }

      const response = await gigs.hasGigs(companyId);
      const hasGigs = response.data?.hasGigs || false;
      setHasGigs(hasGigs);

      // If company has gigs, update the onboarding progress for step 4
      // DISABLED: L'étape 4 doit être marquée manuellement après création de gigs
      if (hasGigs) {
        console.log(`✅ Company has ${hasGigs} gigs, but step 4 auto-completion is disabled`);
        // try {
        //   await axios.put(
        //     `${
        //       process.env.NEXT_PUBLIC_COMPANY_API_URL
        //     }/companies/${companyId}/onboarding/phases/2/steps/4`,
        //     { status: "completed" }
        //   );
        //   // Update local state to reflect the completed step
        //   setCompletedSteps((prev) => [...prev, 4]);
        // } catch (error) {
        //   console.error("Error updating onboarding progress:", error);
        //   // Ne pas faire échouer toute la fonction si cette mise à jour échoue
        // }
      }
    } catch (error) {
      console.error("Error checking company gigs:", error);
      // Ne pas faire échouer toute la fonction si cette vérification échoue
    }
  };

  const checkCompanyLeads = async () => {
    try {
      // Vérifier que companyId est disponible
      if (!companyId) {
        console.error("❌ Company ID not available for checking leads");
        return;
      }

      const response = await leads.hasLeads(companyId);
      const hasLeads = response.hasLeads;
      setHasLeads(hasLeads);

      // Auto-complete step 6 if company has leads
      if (hasLeads) {
        console.log("✅ Company has leads - auto-completing step 6");
        try {
          await companies.updateOnboardingStep(companyId, 2, 6, 'completed');
          // Update local state to reflect the completed step
          setCompletedSteps((prev) => {
            if (!prev.includes(6)) {
              return [...prev, 6];
            }
            return prev;
          });
          console.log("✅ Step 6 auto-completed successfully");
        } catch (error) {
          console.error("Error auto-completing step 6:", error);
        }
      } else {
        console.log("⚠️ Company has no leads - step 6 needs manual completion");
      }
    } catch (error) {
      console.error("Error checking company leads:", error);
      // Ne pas faire échouer toute la fonction si cette vérification échoue
    }
  };

  // Fonction utilitaire pour mettre à jour l'état d'onboarding sans recharger tout le projet
  const updateOnboardingState = async () => {
    if (!companyId) {
      console.error(
        "❌ Company ID not available for updating onboarding state"
      );
      return;
    }

    try {
      // Vérifier les leads
      // await checkCompanyLeads();

      // Vérifier les gigs actifs
      await checkActiveGigs();

      // Fonction pour vérifier si toutes les étapes non-désactivées d'une phase sont complétées
      const isPhaseFullyCompleted = (phaseId: number) => {
        const phase = phases[phaseId - 1];
        if (!phase) return false;

        const nonDisabledSteps = phase.steps.filter((step) => !step.disabled);
        return nonDisabledSteps.every((step) =>
          completedSteps.includes(step.id)
        );
      };

      // Déterminer la phase valide en vérifiant que toutes les phases précédentes sont complétées
      let validPhase = 1;

      // Vérifier chaque phase séquentiellement
      for (let phaseId = 1; phaseId <= 4; phaseId++) {
        if (phaseId === 1) {
          // Phase 1 est toujours accessible
          validPhase = 1;
        } else {
          // Pour les phases 2, 3, 4, vérifier que la phase précédente est complétée
          const previousPhaseCompleted = isPhaseFullyCompleted(phaseId - 1);

          if (previousPhaseCompleted) {
            validPhase = phaseId;
            console.log(
              `✅ Phase ${
                phaseId - 1
              } is fully completed, allowing access to phase ${phaseId}`
            );
          } else {
            console.log(
              `⚠️ Phase ${
                phaseId - 1
              } is not fully completed, stopping at phase ${validPhase}`
            );
            break; // Arrêter ici, ne pas avancer plus loin
          }
        }
      }

      // Vérifications spéciales pour les cas particuliers
      if (completedSteps.includes(7) && validPhase < 3) {
        // Si step 7 (Knowledge Base) est complété, on peut aller en phase 3
        // MAIS seulement si la phase 2 est complétée
        if (isPhaseFullyCompleted(2)) {
          validPhase = 3;
          console.log(
            "🔄 Step 7 completed and phase 2 is fully completed - setting phase to 3"
          );
        } else {
          console.log(
            "⚠️ Step 7 completed but phase 2 is not fully completed - staying in phase 2"
          );
          validPhase = 2;
        }
      }

      if (completedSteps.includes(10) && validPhase < 4) {
        // Si step 10 (Match HARX REPS) est complété, on peut aller en phase 4
        // MAIS seulement si la phase 3 est complétée
        if (isPhaseFullyCompleted(3)) {
          validPhase = 4;
          console.log(
            "🔄 Step 10 completed and phase 3 is fully completed - setting phase to 4"
          );
        } else {
          console.log(
            "⚠️ Step 10 completed but phase 3 is not fully completed - staying in phase 3"
          );
          validPhase = 3;
        }
      }

      if (completedSteps.includes(13) && validPhase < 4) {
        // Si step 13 (Gig Activation) est complété, on peut aller en phase 4
        // MAIS seulement si la phase 3 est complétée
        if (isPhaseFullyCompleted(3)) {
          validPhase = 4;
          console.log(
            "🔄 Step 13 completed and phase 3 is fully completed - setting phase to 4"
          );
        } else {
          console.log(
            "⚠️ Step 13 completed but phase 3 is not fully completed - staying in phase 3"
          );
          validPhase = 3;
        }
      }

      // Mettre à jour la phase seulement si elle a changé
      if (validPhase !== currentPhase) {
        console.log("🔄 Updating phase from", currentPhase, "to", validPhase);
        setCurrentPhase(validPhase);
        setDisplayedPhase(validPhase);
      }

      console.log("✅ Onboarding state updated successfully");
    } catch (error) {
      console.error("Error updating onboarding state:", error);
      // Ne pas faire échouer toute la fonction si cette mise à jour échoue
    }
  };

  const checkActiveGigs = async () => {
    try {
      console.log("🔍 Checking for active gigs...");

      // Vérifier que companyId est disponible
      if (!companyId) {
        console.error("❌ Company ID not available for checking active gigs");
        return;
      }

      const response = await gigs.getByCompanyId(companyId);

      if (response && response.data) {
        const gigsList = response.data;
        const hasActiveGig = gigsList.some(
          (gig: any) =>
            gig.status === "active" ||
            gig.status === "approved" ||
            gig.status === "published"
        );

        console.log("🔍 Active gigs check:", {
          totalGigs: gigsList.length,
          hasActiveGig,
          gigStatuses: gigsList.map((g: any) => g.status),
        });

        // If at least one gig is active, complete the last phase and step
        if (hasActiveGig) {
          try {
            console.log("✅ Found active gig - completing last phase and step");
            const completeResponse = await companies.completeLastOnboarding(companyId);

            if (completeResponse.data) {
              console.log(
                "✅ Last phase and step completed successfully:",
                completeResponse.data
              );
              // Update local state without reloading the entire project
              setCompletedSteps((prev) => {
                const newSteps = [...prev];
                if (!newSteps.includes(13)) {
                  newSteps.push(13);
                }
                return newSteps;
              });

              // Mettre à jour les cookies avec le nouveau progrès
              const currentProgress = {
                currentPhase: 4, // Phase 4 car step 13 est dans la phase 4
                completedSteps: [...completedSteps, 13],
              };
              Cookies.set(
                "companyOnboardingProgress",
                JSON.stringify(currentProgress)
              );

              console.log("✅ Step 13 marked as completed - active gig found");
            }
          } catch (error) {
            console.error("Error completing last phase and step:", error);
            // Ne pas faire échouer toute la fonction si cette mise à jour échoue
          }
        }

        // If no gigs are active and step 13 was previously completed, mark it as in_progress
        else {
          try {
            console.log("⚠️ No active gigs found - updating step 13 status");

            // Mark step 13 as in_progress - seulement si on est en phase 4
            if (currentPhase >= 4) {
              await companies.updateOnboardingStep(companyId, 4, 13, 'in_progress');
            }

            // Update local state to remove the completed step
            setCompletedSteps((prev) => prev.filter((step) => step !== 13));
            console.log(
              "⚠️ Step 13 removed from completed steps and marked as in_progress"
            );

            // Mettre à jour les cookies avec le nouveau progrès
            const currentProgress = {
              currentPhase: 3, // Retour à la phase 3 car step 13 n'est plus complété
              completedSteps: completedSteps.filter((step) => step !== 13),
            };
            Cookies.set(
              "companyOnboardingProgress",
              JSON.stringify(currentProgress)
            );

            console.log(
              "⚠️ Step 13 marked as in_progress - no active gigs found"
            );
          } catch (error) {
            console.error(
              "Error updating onboarding progress for step 13:",
              error
            );
            // Ne pas faire échouer toute la fonction si cette mise à jour échoue
          }
        }
      }
    } catch (error) {
      console.error("Error checking active gigs:", error);
      // Ne pas rediriger vers /auth pour cette erreur, juste la logger
    }
  };

  // Initial check for leads and gigs when component mounts
  useEffect(() => {
    if (companyId) {
      console.log("🔄 Initial check for leads and gigs...");
      checkCompanyLeads();
      checkActiveGigs();
    }
  }, [companyId]);

  const loadCompanyProgress = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Vérifier que companyId est disponible
      if (!companyId) {
        console.error("❌ Company ID not available for loading progress");
        setIsLoading(false);
        return;
      }

      const progress = await companies.getOnboarding(companyId);
      console.log("🔄 API Response:", progress);
      // progress.data contains the actual onboarding data if backend returns { success: true, data: ... }
      const onboardingData = progress.data || progress;
      console.log("🔄 currentPhase from API:", onboardingData.currentPhase);
      console.log("🔄 completedSteps from API:", onboardingData.completedSteps);

      // Store the progress in cookies
      Cookies.set("companyOnboardingProgress", JSON.stringify(onboardingData));

      // Fonction pour vérifier si toutes les étapes non-désactivées d'une phase sont complétées
      const isPhaseFullyCompleted = (phaseId: number) => {
        const phase = phases[phaseId - 1];
        if (!phase) return false;

        const nonDisabledSteps = phase.steps.filter((step) => !step.disabled);
        return nonDisabledSteps.every((step) =>
          onboardingData.completedSteps.includes(step.id)
        );
      };

      // Déterminer la phase valide en vérifiant que toutes les phases précédentes sont complétées
      let validPhase = 1;

      // Vérifier chaque phase séquentiellement
      for (let phaseId = 1; phaseId <= 4; phaseId++) {
        if (phaseId === 1) {
          // Phase 1 est toujours accessible
          validPhase = 1;
        } else {
          // Pour les phases 2, 3, 4, vérifier que la phase précédente est complétée
          const previousPhaseCompleted = isPhaseFullyCompleted(phaseId - 1);

          if (previousPhaseCompleted) {
            validPhase = phaseId;
            console.log(
              `✅ Phase ${
                phaseId - 1
              } is fully completed, allowing access to phase ${phaseId}`
            );
          } else {
            console.log(
              `⚠️ Phase ${
                phaseId - 1
              } is not fully completed, stopping at phase ${validPhase}`
            );
            break; // Arrêter ici, ne pas avancer plus loin
          }
        }
      }

      // Vérifications spéciales pour les cas particuliers
      if (onboardingData.completedSteps.includes(7) && validPhase < 3) {
        // Si step 7 (Knowledge Base) est complété, on peut aller en phase 3
        // MAIS seulement si la phase 2 est complétée
        if (isPhaseFullyCompleted(2)) {
          validPhase = 3;
          console.log(
            "🔄 Step 7 completed and phase 2 is fully completed - setting phase to 3"
          );
        } else {
          console.log(
            "⚠️ Step 7 completed but phase 2 is not fully completed - staying in phase 2"
          );
          validPhase = 2;
        }
      }

      if (onboardingData.completedSteps.includes(10) && validPhase < 4) {
        // Si step 10 (Match HARX REPS) est complété, on peut aller en phase 4
        // MAIS seulement si la phase 3 est complétée
        if (isPhaseFullyCompleted(3)) {
          validPhase = 4;
          console.log(
            "🔄 Step 10 completed and phase 3 is fully completed - setting phase to 4"
          );
        } else {
          console.log(
            "⚠️ Step 10 completed but phase 3 is not fully completed - staying in phase 3"
          );
          validPhase = 3;
        }
      }

      if (onboardingData.completedSteps.includes(13) && validPhase < 4) {
        // Si step 13 (Gig Activation) est complété, on peut aller en phase 4
        // MAIS seulement si la phase 3 est complétée
        if (isPhaseFullyCompleted(3)) {
          validPhase = 4;
          console.log(
            "🔄 Step 13 completed and phase 3 is fully completed - setting phase to 4"
          );
        } else {
          console.log(
            "⚠️ Step 13 completed but phase 3 is not fully completed - staying in phase 3"
          );
          validPhase = 3;
        }
      }

      console.log(
        "🔄 Final valid phase determined:",
        validPhase,
        "from API currentPhase:",
        onboardingData.currentPhase
      );
      console.log("🔄 Setting completed steps:", onboardingData.completedSteps);
      setCurrentPhase(validPhase);
      setDisplayedPhase(validPhase);
      setCompletedSteps(onboardingData.completedSteps);

      // Check for leads and auto-complete step 6 if necessary
      if (!onboardingData.completedSteps.includes(6)) {
        setTimeout(() => {
          checkCompanyLeadsForAutoCompletion();
        }, 100);
      }

      // Force a re-render to ensure the UI updates
      setTimeout(() => {
        console.log("🔄 Forcing re-render after state update");
        setCurrentPhase((prev) => prev); // This will trigger a re-render
      }, 50);
    } catch (error: any) {
      console.error("Error loading company progress:", error);
      
      // Si l'enregistrement n'existe pas (404), le créer
      if (error.response?.status === 404) {
        console.log("📝 Onboarding progress not found, creating initial record...");
        if (!companyId) {
          console.error("❌ Cannot create onboarding: companyId is null");
          return;
        }
        try {
          const progress = await companies.createOnboarding(companyId);
          console.log("✅ Initial onboarding record created:", progress);
          setCurrentPhase(progress.currentPhase || 1);
          setDisplayedPhase(progress.currentPhase || 1);
          setCompletedSteps(progress.completedSteps || []);
          
          // Store in cookies
          Cookies.set("companyOnboardingProgress", JSON.stringify(progress));
        } catch (createError: any) {
          console.error("Error creating initial onboarding record:", createError);
          
          // Si l'erreur est 400 (déjà existant), essayer de le récupérer
          if (createError.response?.status === 400) {
            console.log("⚠️ Record already exists, fetching it...");
            try {
              const progress = await companies.getOnboarding(companyId);
              setCurrentPhase(progress.currentPhase || 1);
              setDisplayedPhase(progress.currentPhase || 1);
              setCompletedSteps(progress.completedSteps || []);
              Cookies.set("companyOnboardingProgress", JSON.stringify(progress));
              console.log("✅ Fetched existing onboarding record");
            } catch (fetchError) {
              console.error("Error fetching existing record:", fetchError);
              // En dernier recours, utiliser les valeurs par défaut
      setCurrentPhase(1);
      setDisplayedPhase(1);
      setCompletedSteps([]);
            }
          } else {
            // Pour les autres erreurs de création, utiliser les valeurs par défaut
            setCurrentPhase(1);
            setDisplayedPhase(1);
            setCompletedSteps([]);
          }
        }
      } else {
        // Pour les autres erreurs, utiliser les valeurs par défaut
        setCurrentPhase(1);
        setDisplayedPhase(1);
        setCompletedSteps([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [companyId, checkCompanyLeadsForAutoCompletion]); // useCallback dependencies

  // Add listener for custom step completion events from child components
  // Must be declared AFTER loadCompanyProgress and checkCompanyLeadsForAutoCompletion to avoid initialization errors
  useEffect(() => {
    const handleStepCompleted = (event: CustomEvent) => {
      const { stepId, phaseId, status, completedSteps } = event.detail;
      console.log('🎯 Step completion event received:', { stepId, phaseId, status, completedSteps });
      
      // Mettre à jour l'état local des étapes complétées
      if (completedSteps && Array.isArray(completedSteps)) {
        setCompletedSteps(completedSteps);
        
        // Mettre à jour le localStorage
        const currentProgress = {
          currentPhase: phaseId,
          completedSteps: completedSteps,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('companyOnboardingProgress', JSON.stringify(currentProgress));
        
        console.log('💾 Local state updated from step completion event');
        
        // Fermer le step actif pour revenir à la vue des phases
        console.log('🔙 Closing active step and returning to phases view');
        setActiveStep(null);
        
        // Force reload onboarding progress to get fresh data from API
        setTimeout(() => {
          console.log('🔄 Reloading onboarding progress after step completion');
          loadCompanyProgress();
        }, 500);
      }
    };

    // Add listener for contacts upload completion
    const handleContactsUploadCompleted = () => {
      console.log('📞 Contacts upload completed - refreshing onboarding state');
      // Close UploadContacts and refresh progress
      setShowUploadContacts(false);
      // Clear manual close flag to allow future auto-restoration if needed
      sessionStorage.removeItem("uploadContactsManuallyClosed");
      // Immediately check for leads and auto-complete step 6
      checkCompanyLeadsForAutoCompletion();
      // Also reload progress after a short delay
      setTimeout(() => {
        loadCompanyProgress();
      }, 1000);
    };
    
    // Ajouter l'écouteur d'événement
    window.addEventListener('stepCompleted', handleStepCompleted as EventListener);
    window.addEventListener('contactsUploadCompleted', handleContactsUploadCompleted);
    
    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('stepCompleted', handleStepCompleted as EventListener);
      window.removeEventListener('contactsUploadCompleted', handleContactsUploadCompleted);
    };
  }, [loadCompanyProgress, checkCompanyLeadsForAutoCompletion]); // Dependencies

  // Load company progress and check gigs when company ID is available
  // Must be declared AFTER all function definitions
  useEffect(() => {
    if (companyId) {
      // Nettoyer le localStorage et cookies pour éviter les conflits
      console.log("🧹 Cleaning localStorage and verifying companyId...");
      localStorage.removeItem('companyOnboardingProgress');
      
      // Vérifier que le cookie companyId correspond au state
      const cookieCompanyId = Cookies.get('companyId');
      if (cookieCompanyId !== companyId) {
        console.log("⚠️ Cookie companyId mismatch, updating...");
        Cookies.set('companyId', companyId);
      }
      
      console.log(
        "🔄 Company ID available, loading progress and checking gigs...",
        companyId
      );
      loadCompanyProgress();
      checkCompanyGigs();
      // checkCompanyLeads();

      // Vérifier si l'utilisateur vient de se connecter à Zoho
      checkZohoConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]); // Only trigger when companyId changes

  // Fonction pour vérifier si l'utilisateur vient de se connecter à Zoho
  const checkZohoConnection = async () => {
    try {
      // Vérifier si Zoho est configuré pour cet utilisateur
      const zohoService = ZohoService.getInstance();
      const isConfigured = zohoService.isConfigured();

      // Log the status but don't auto-show UploadContacts
      if (isConfigured) {
        console.log("✅ Zoho est configuré - ready for manual upload");
      }
    } catch (error) {
      console.error("Error checking Zoho connection:", error);
    }
  };

  const handleStartStep = async (stepId: number) => {
    if (!companyId) {
      console.error("Company ID not available for starting step");
      return;
    }

    try {
      // Vérifier si le step est déjà complété
      const isStepCompleted = completedSteps.includes(stepId);
      
      // Si le step est déjà complété, ne pas changer son statut
      if (isStepCompleted) {
        console.log(`✅ Step ${stepId} is already completed, not changing status`);
      } else {
        // Mettre à jour le statut de l'étape à "in_progress" seulement si pas déjà complétée
        const phaseId =
          phases.findIndex((phase) =>
            phase.steps.some((step) => step.id === stepId)
          ) + 1;

        await companies.updateOnboardingStepQuery(companyId, phaseId, stepId, 'in_progress');
        console.log(`🔄 Step ${stepId} status updated to in_progress`);
      }

      const allSteps = phases.flatMap((phase) => phase.steps);
      const step = allSteps.find((s) => s.id === stepId);

      // Special handling for Knowledge Base step - use local component
      if (stepId === 7) {
        setActiveStep(stepId);
        return;
      }

      // Special handling for Call Script step - use ScriptGenerator component
      if (stepId === 8) {
        setActiveStep(stepId);
        return;
      }

      // Special handling for Gig Activation step (step 13) - redirect to Approval & Publishing
      if (stepId === 13) {
        // Set the active tab to approval-publishing in the App component
        localStorage.setItem("activeTab", "approval-publishing");
        // Trigger a custom event to notify the App component
        window.dispatchEvent(
          new CustomEvent("tabChange", {
            detail: { tab: "approval-publishing" },
          })
        );
        return;
      }

      if (step?.component) {
        if (stepId === 4 && completedSteps.includes(stepId)) {
          setShowGigDetails(true);
        } else if (stepId === 5) {
          setShowTelephonySetup(true);
        } else {
          setActiveStep(stepId);
        }
      }
    } catch (error) {
      console.error("Error updating step status:", error);
      // Afficher un message d'erreur plus informatif
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    }
  };

  // Nouvelle fonction pour gérer la révision des steps complétés
  const handleReviewStep = async (stepId: number) => {
    if (!companyId) {
      console.error("Company ID not available for reviewing step");
      return;
    }

    try {
      console.log(`🔍 Reviewing step ${stepId} (already completed)`);
      
      const allSteps = phases.flatMap((phase) => phase.steps);
      const step = allSteps.find((s) => s.id === stepId);

      // Special handling for Knowledge Base step - use local component
      if (stepId === 7) {
        setActiveStep(stepId);
        return;
      }

      // Special handling for Call Script step - use ScriptGenerator component
      if (stepId === 8) {
        setActiveStep(stepId);
        return;
      }

      // Special handling for Gig Activation step (step 13) - redirect to Approval & Publishing
      if (stepId === 13) {
        // Set the active tab to approval-publishing in the App component
        localStorage.setItem("activeTab", "approval-publishing");
        // Trigger a custom event to notify the App component
        window.dispatchEvent(
          new CustomEvent("tabChange", {
            detail: { tab: "approval-publishing" },
          })
        );
        return;
      }

      if (step?.component) {
        if (stepId === 4) {
          setShowGigDetails(true);
        } else if (stepId === 5) {
          setShowTelephonySetup(true);
        } else {
          setActiveStep(stepId);
        }
      }
    } catch (error) {
      console.error("Error reviewing step:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    }
  };

  const handleStepComplete = async (stepId: number) => {
    if (!companyId) {
      console.error("Company ID not available for step completion");
      return;
    }

    try {
      const phaseId =
        phases.findIndex((phase) =>
          phase.steps.some((step) => step.id === stepId)
        ) + 1;

      await companies.updateOnboardingStepQuery(companyId, phaseId, stepId, 'completed');

      setCompletedSteps((prev) => [...prev, stepId]);
    } catch (error) {
      console.error("Error completing step:", error);
      // Afficher un message d'erreur plus informatif
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    }
  };

  const handlePhaseChange = async (newPhase: number) => {
    if (!companyId) return;

    // Fonction pour vérifier si toutes les étapes non-désactivées d'une phase sont complétées
    const isPhaseFullyCompleted = (phaseId: number) => {
      const phase = phases[phaseId - 1];
      if (!phase) return false;

      const nonDisabledSteps = phase.steps.filter((step) => !step.disabled);
      return nonDisabledSteps.every((step) => completedSteps.includes(step.id));
    };

    // Vérifier si on peut accéder à la nouvelle phase
    let canAccessPhase = true;

    if (newPhase > 1) {
      // Vérifier que toutes les phases précédentes sont complétées
      for (let phaseId = 1; phaseId < newPhase; phaseId++) {
        if (!isPhaseFullyCompleted(phaseId)) {
          console.log(
            `⚠️ Cannot access phase ${newPhase} - phase ${phaseId} is not fully completed`
          );
          canAccessPhase = false;
          break;
        }
      }
    }

    if (canAccessPhase) {
      // Mettre à jour seulement la phase affichée
      setDisplayedPhase(newPhase);

      // On ne met à jour l'API que si:
      // 1. La nouvelle phase est accessible
      // 2. La nouvelle phase est inférieure ou égale à la phase actuelle
      // 3. La phase n'est pas déjà complétée (currentPhase > newPhase)
      if (
        isPhaseAccessible(newPhase) &&
        newPhase <= currentPhase &&
        !isPhaseCompleted(newPhase)
      ) {
        try {
          await companies.updateOnboardingPhase(companyId, newPhase);
          setCurrentPhase(newPhase);
          console.log(`✅ Successfully changed to phase ${newPhase}`);
        } catch (error) {
          console.error("Error updating phase:", error);
        }
      }
    } else {
      console.log(
        `❌ Cannot change to phase ${newPhase} - previous phases not completed`
      );
      // Suppressed popup as requested by user
      console.log(
        `Vous devez compléter toutes les étapes de la phase précédente avant d'accéder à la phase ${newPhase}`
      );
    }
  };

  const isPhaseCompleted = (phaseId: number) => {
    const phase = phases[phaseId - 1];
    return phase.steps
      .filter((step) => !step.disabled)
      .every((step) => completedSteps.includes(step.id));
  };

  const handlePreviousPhase = () => {
    const newPhase = Math.max(1, displayedPhase - 1);
    // Pour Previous, on met juste à jour la phase affichée
    setDisplayedPhase(newPhase);
  };

  const handleNextPhase = () => {
    const newPhase = Math.min(4, displayedPhase + 1);

    // Fonction pour vérifier si toutes les étapes non-désactivées d'une phase sont complétées
    const isPhaseFullyCompleted = (phaseId: number) => {
      const phase = phases[phaseId - 1];
      if (!phase) return false;

      const nonDisabledSteps = phase.steps.filter((step) => !step.disabled);
      return nonDisabledSteps.every((step) => completedSteps.includes(step.id));
    };

    // Si on est à la phase 4 (dernière phase), rediriger vers le dashboard
    if (displayedPhase === 4) {
      window.location.href = "/company/dashboard/details";
      return;
    }

    // Pour les phases 1, 2, 3 : vérifier si la phase actuelle est complétée avant d'avancer
    if (displayedPhase < 4) {
      if (isPhaseFullyCompleted(displayedPhase)) {
        console.log(
          `✅ Phase ${displayedPhase} is fully completed, proceeding to phase ${newPhase}`
        );
        handlePhaseChange(newPhase);
      } else {
        console.log(
          `⚠️ Cannot proceed to phase ${newPhase} - current phase ${displayedPhase} is not fully completed`
        );
        console.log(
          `Vous devez compléter toutes les étapes de la phase ${displayedPhase} avant de passer à la phase suivante`
        );
        return;
      }
    }
  };

  const isPhaseAccessible = (phaseId: number) => {
    if (phaseId === 1) return true;

    const previousPhase = phases[phaseId - 2];
    return previousPhase.steps
      .filter((step) => !step.disabled)
      .every((step) => completedSteps.includes(step.id));
  };

  const phases: Phase[] = [
    {
      id: 1,
      title: "Company Account Setup & Identity",
      icon: Building2,
      color: "blue",
      steps: [
        {
          id: 1,
          title: "Create Company Profile",
          description:
            "Legal and commercial details, key contacts, terms agreement",
          status: "completed",
          component: CompanyProfile,
        },
        {
          id: 2,
          title: "KYC / KYB Verification",
          description:
            "Identity verification through Stripe Identity or Sumsub",
          status: "current",
          component: KYCVerification,
          disabled: true,
        },
        {
          id: 3,
          title: "Subscription Plan",
          description: "Select plan: Free, Standard, or Premium",
          status: "pending",
          component: SubscriptionPlan,
        },
      ],
    },
    {
      id: 2,
      title: "Operational Setup",
      icon: Settings,
      color: "yellow",
      steps: [
        {
          id: 4,
          title: "Create Gigs",
          description: "Define multi-channel gigs and requirements",
          status: "pending",
          component: CreateGig,
        },
        {
          id: 5,
          title: "Telephony Setup",
          description: "Phone numbers, call tracking, and dialer configuration",
          status: "pending",
          component: TelephonySetup,
        },
        {
          id: 6,
          title: "Upload Contacts",
          description: "Import contacts for multi-channel engagement",
          status: "pending",
          component: UploadContacts,
        },
        {
          id: 7,
          title: "Knowledge Base",
          description: "Create training materials and FAQs",
          status: "pending",
          component: KnowledgeBase,
        },
        {
          id: 8,
          title: "Call Script",
          description: "Define script and conversation flows",
          status: "pending",
          component: ScriptGenerator,
          // disabled: true
        },
        {
          id: 9,
          title: "Reporting Setup",
          description: "Configure KPIs and reporting preferences",
          status: "pending",
          component: ReportingSetup,
          disabled: true,
        },
      ],
    },
    {
      id: 3,
      title: "REPS Engagement",
      icon: Users,
      color: "green",
      steps: [
        {
          id: 10,
          title: "Match HARX REPS",
          description: "Connect with qualified REPS based on requirements",
          status: "pending",
          component: MatchingDashboard,
        },
        {
          id: 11,
          title: "REP Onboarding",
          description: "Training, validation, and contract acceptance",
          status: "pending",
          component: RepOnboarding,
          disabled: true,
        },
        {
          id: 12,
          title: "Session Planning",
          description: "Schedule call slots and prioritize leads",
          status: "pending",
          component: SessionPlanning,
          disabled: true,
        },
      ],
    },
    {
      id: 4,
      title: "Activation",
      icon: Rocket,
      color: "red",
      steps: [
        {
          id: 13,
          title: "Gig Activation",
          description: "Launch multi-channel operations",
          status: "pending",
          component: ApprovalPublishing,
        },
      ],
    },
  ];

  const getStepIcon = (step: any) => {
    switch (step.id) {
      case 1:
        return Building2;
      case 2:
        return Shield;
      case 3:
        return FileText;
      case 4:
        return MessageSquare;
      case 5:
        return Phone;
      case 6:
        return Upload;
      case 7:
        return BookOpen;
      case 8:
        return FileText;
      case 9:
        return BarChart;
      case 10:
        return Users;
      case 11:
        return BookOpen;
      case 12:
        return Calendar;
      case 13:
        return Rocket;
      default:
        return CheckCircle;
    }
  };

  const handleBackToOnboarding = () => {
    // If UploadContacts is showing, cancel processing and return immediately
    if (showUploadContacts) {
      console.log(
        "🛑 Back to onboarding clicked while UploadContacts is active - cancelling processing"
      );

      // Try to call the normal cancel processing function first
      if ((window as any).cancelUploadProcessing) {
        console.log("✅ Calling cancelUploadProcessing function");
        try {
          (window as any).cancelUploadProcessing();
          console.log("✅ cancelUploadProcessing executed successfully");
        } catch (error) {
          console.error("❌ Error calling cancelUploadProcessing:", error);
          // If normal cancellation fails, try emergency cancellation
          if ((window as any).emergencyCancelUpload) {
            console.log("🚨 Trying emergency cancellation...");
            try {
              (window as any).emergencyCancelUpload();
              console.log("✅ Emergency cancellation executed successfully");
            } catch (emergencyError) {
              console.error("❌ Emergency cancellation also failed:", emergencyError);
            }
          }
        }
      } else {
        console.warn("⚠️ cancelUploadProcessing function not found on window");
        // Try emergency cancellation as fallback
        if ((window as any).emergencyCancelUpload) {
          console.log("🚨 Trying emergency cancellation as fallback...");
          try {
            (window as any).emergencyCancelUpload();
            console.log("✅ Emergency cancellation executed successfully");
          } catch (emergencyError) {
            console.error("❌ Emergency cancellation failed:", emergencyError);
          }
        }
      }

      // Remove parsed leads from localStorage to prevent auto-restore
      localStorage.removeItem("parsedLeads");
      localStorage.removeItem("validationResults");
      localStorage.removeItem("uploadProcessing");
      sessionStorage.removeItem("uploadProcessing");
      sessionStorage.removeItem("parsedLeads");
      sessionStorage.removeItem("validationResults");
      console.log("🧹 Removed all storage items");

      // Force close the component immediately
      setShowUploadContacts(false);
      console.log("✅ Set showUploadContacts to false");

      // Simply close UploadContacts and return to normal CompanyOnboarding state
      console.log(
        "✅ Closing UploadContacts and returning to normal onboarding state"
      );
      return;
    }

    // For other cases, just close the active step
    setActiveStep(null);
  };

  const handleStepClick = (stepId: number) => {
    const allSteps = phases.flatMap((phase) => phase.steps);
    const step = allSteps.find((s) => s.id === stepId);
    const currentPhaseSteps = phases[currentPhase - 1].steps;

    // Trouver l'index du step cliqué dans la phase courante
    const stepIndex = currentPhaseSteps.findIndex((s) => s.id === stepId);
    const previousSteps = currentPhaseSteps.slice(0, stepIndex);

    // Vérifier si tous les steps précédents sont complétés
    const allPreviousCompleted = previousSteps.every(
      (s) => s.disabled || completedSteps.includes(s.id)
    );

    // Redirection spéciale pour Create Gigs
    if (stepId === 4) {
      if (completedSteps.includes(stepId)) {
        setShowGigDetails(true);
      } else if (hasGigs) {
        window.location.href = "/app11";
      } else {
        window.location.href = "/gigs/prompt";
      }
      return;
    }

    // Pour Match HARX REPS - use local MatchingDashboard component
    if (stepId === 10) {
      if (allPreviousCompleted) {
        setActiveStep(stepId);
      }
      return;
    }

    // Pour Knowledge Base - use local component
    if (stepId === 7) {
      if (allPreviousCompleted) {
        setActiveStep(stepId);
      }
      return;
    }

    // Pour Call Script - use ScriptGenerator component
    if (stepId === 8) {
      if (allPreviousCompleted) {
        setActiveStep(stepId);
      }
      return;
    }

    // Pour Telephony Setup
    if (stepId === 5) {
      if (allPreviousCompleted) {
        setShowTelephonySetup(true);
      }
      return;
    }

    // Pour Upload Contacts
    if (stepId === 6) {
      if (allPreviousCompleted) {
        // Check if UploadContacts was manually closed
        const wasManuallyClosed = sessionStorage.getItem("uploadContactsManuallyClosed");
        if (!wasManuallyClosed) {
          setShowUploadContacts(true);
          console.log("✅ Opening UploadContacts via step click");
        } else {
          console.log("🚫 UploadContacts was manually closed - not reopening");
        }
      }
      return;
    }

    // Pour les autres steps, vérifier la complétion des étapes précédentes
    if (step?.component && allPreviousCompleted && !step.disabled) {
      setActiveStep(stepId);
    }
  };

  // Vérifier si l'utilisateur est authentifié
  // Use useEffect for redirect to avoid hydration mismatch
  useEffect(() => {
    if (isMounted && !userId && typeof window !== 'undefined') {
    console.log("User ID not found, redirecting to /auth");
    window.location.href = "/auth";
    }
  }, [isMounted, userId]);

  // Show consistent loading state during SSR and initial client render
  if (!isMounted || !userId || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Find the active step component
  const ActiveStepComponent = activeStep
    ? phases
        .flatMap((phase) => phase.steps)
        .find((step) => step.id === activeStep)?.component
    : null;

  // Don't skip rendering - allow component to render normally
  // Navigation will be handled directly by the child components

  // Déterminer quel composant afficher
  let activeComponent = null;
  let onBack: () => void = () => {};

  if (showGigDetails) {
    activeComponent = <GigDetails />;
    onBack = () => {
      setShowGigDetails(false);
    };
  } else if (showTelephonySetup) {
    activeComponent = (
      <TelephonySetup
        onBackToOnboarding={async () => {
          setShowTelephonySetup(false);

          // Force reload onboarding state after telephony setup completion
          if (companyId) {
            try {
              await loadCompanyProgress();
              console.log("✅ Onboarding state reloaded successfully");
            } catch (error) {
              console.error("❌ Error reloading onboarding state:", error);
            }
          }
        }}
      />
    );
    onBack = () => {
      setShowTelephonySetup(false);
    };
  } else if (showUploadContacts) {
    activeComponent = <UploadContacts />;
    onBack = () => {
      // Clean up localStorage when manually closing UploadContacts
      localStorage.removeItem("parsedLeads");
      localStorage.removeItem("validationResults");
      localStorage.removeItem("uploadProcessing");
      sessionStorage.removeItem("uploadProcessing");
      sessionStorage.removeItem("parsedLeads");
      sessionStorage.removeItem("validationResults");
      sessionStorage.removeItem("uploadContactsManuallyClosed");
      console.log("🧹 Manual cleanup - UploadContacts closed");
      setShowUploadContacts(false);
    };
  } else if (ActiveStepComponent) {
    activeComponent = <ActiveStepComponent />;
    onBack = handleBackToOnboarding;
  }

  if (activeComponent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              onBack();
            }}
            className="flex items-center transition-colors text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            <span>Back to Onboarding</span>
          </button>
        </div>
        {activeComponent}
      </div>
    );
  }

  // Allow normal rendering - navigation is handled directly by child components

  // Utiliser displayedPhase au lieu de currentPhase pour afficher les steps
  const displayedPhaseData = phases[displayedPhase - 1];
  if (!displayedPhaseData) {
    return (
      <div className="text-center text-red-600">
        Error: Phase data not found. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Company Onboarding</h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Save Progress
        </button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-5 gap-4">
        {phases.map((phase) => {
          const PhaseIcon = phase.icon;
          const isActive = displayedPhase === phase.id;
          const isCompleted = isPhaseCompleted(phase.id);
          const isAccessible = isPhaseAccessible(phase.id);



          return (
            <div
              key={phase.id}
              className={`relative rounded-lg p-4 ${
                isActive
                  ? "bg-indigo-50 border-2 border-indigo-500"
                  : isCompleted
                  ? "bg-green-50 border border-green-500"
                  : !isAccessible
                  ? "bg-gray-50 border border-gray-300"
                  : "bg-white border border-gray-200"
              } cursor-pointer`}
              onClick={() => handlePhaseChange(phase.id)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`rounded-full p-2 ${
                    isActive
                      ? "bg-indigo-100 text-indigo-600"
                      : isCompleted
                      ? "bg-green-100 text-green-600"
                      : !isAccessible
                      ? "bg-gray-200 text-gray-500"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <PhaseIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Phase {phase.id}
                  </p>
                  <p className="text-xs text-gray-500">{phase.title}</p>
                  {!isAccessible && phase.id > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Complete previous phase first
                    </p>
                  )}
                </div>
              </div>
              {phase.id < 4 && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Phase Details */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Phase {displayedPhaseData.id}: {displayedPhaseData.title}
          </h2>
          <p className="text-sm text-gray-500">
            {isPhaseAccessible(displayedPhaseData.id)
              ? "Complete the following steps to proceed to the next phase"
              : "Complete all steps in the previous phase to unlock this phase"}
          </p>
        </div>

        <div className="space-y-4">
          {displayedPhaseData.steps.map((step) => {
            const StepIcon = getStepIcon(step);
            const isClickable = !!step.component;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrentStep =
              !isCompleted &&
              !step.disabled &&
              displayedPhaseData.steps
                .slice(
                  0,
                  displayedPhaseData.steps.findIndex((s) => s.id === step.id)
                )
                .every((s) => s.disabled || completedSteps.includes(s.id));
            const canAccessStep = isPhaseAccessible(displayedPhaseData.id);

            return (
              <div
                key={step.id}
                className={`rounded-lg border p-4 ${
                  !canAccessStep
                    ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                    : step.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : isCompleted
                    ? "border-green-200 bg-green-50"
                    : isCurrentStep
                    ? "border-indigo-200 bg-indigo-50 ring-2 ring-indigo-500"
                    : "border-gray-200 bg-white"
                } ${
                  isClickable && !step.disabled && canAccessStep
                    ? "cursor-pointer hover:border-indigo-300"
                    : ""
                }`}
                onClick={() =>
                  isClickable &&
                  !step.disabled &&
                  canAccessStep &&
                  handleStepClick(step.id)
                }
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`rounded-full p-2 ${
                      !canAccessStep
                        ? "bg-gray-200 text-gray-400"
                        : step.disabled
                        ? "bg-gray-200 text-gray-400"
                        : isCompleted
                        ? "bg-green-100 text-green-600"
                        : isCurrentStep
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {step.title}
                      </h3>
                      {!canAccessStep ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Locked
                        </span>
                      ) : step.disabled ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Coming Soon
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Completed
                        </span>
                      ) : isCurrentStep ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Current Step
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {step.description}
                    </p>
                    {isClickable && !step.disabled && canAccessStep && (
                      <button
                        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => isCompleted ? handleReviewStep(step.id) : handleStartStep(step.id)}
                      >
                        {isCompleted ? "Review Step" : "Start Step"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            disabled={displayedPhase === 1}
            onClick={handlePreviousPhase}
          >
            Previous Phase
          </button>
          <button
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            disabled={false}
            onClick={handleNextPhase}
          >
            Next Phase
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Need Help?</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="flex items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
            <MessageSquare className="mr-2 h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Chat with Support
            </span>
          </button>
          <button className="flex items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
            <BookOpen className="mr-2 h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              View Documentation
            </span>
          </button>
          <button className="flex items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
            <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Schedule a Call
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboarding;
