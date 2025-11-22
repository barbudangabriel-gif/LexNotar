import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  completeOnboarding: () => void;
  startOnboarding: () => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    setIsOnboardingCompleted(completed);
    
    // Show onboarding for new users
    if (!completed) {
      // Delay to allow authentication to settle
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingCompleted,
        completeOnboarding,
        startOnboarding,
        showOnboarding,
        setShowOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
