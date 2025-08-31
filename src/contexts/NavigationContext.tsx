import React, { createContext, useContext, useEffect, useState } from 'react';

type NavigationPreference = 'sidebar' | 'bottom' | 'auto';

interface NavigationContextType {
  preference: NavigationPreference;
  setPreference: (preference: NavigationPreference) => void;
  actualLayout: 'sidebar' | 'bottom'; // What's actually shown based on preference + screen size
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<NavigationPreference>('bottom');
  const [actualLayout, setActualLayout] = useState<'sidebar' | 'bottom'>('bottom');

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('navigation-preference');
    if (saved && ['sidebar', 'bottom', 'auto'].includes(saved)) {
      setPreferenceState(saved as NavigationPreference);
    } else {
      // Set default to bottom if no preference saved
      setPreferenceState('bottom');
      localStorage.setItem('navigation-preference', 'bottom');
    }
  }, []);

  // Save preference to localStorage
  const setPreference = (newPreference: NavigationPreference) => {
    setPreferenceState(newPreference);
    localStorage.setItem('navigation-preference', newPreference);
  };

  // Determine actual layout based on preference and screen size
  useEffect(() => {
    const updateActualLayout = () => {
      if (preference === 'sidebar') {
        setActualLayout('sidebar');
      } else if (preference === 'bottom') {
        setActualLayout('bottom');
      } else {
        // Auto mode - responsive based on screen size
        setActualLayout(window.innerWidth >= 1024 ? 'sidebar' : 'bottom');
      }
    };

    updateActualLayout();

    if (preference === 'auto') {
      window.addEventListener('resize', updateActualLayout);
      return () => window.removeEventListener('resize', updateActualLayout);
    }
  }, [preference]);

  return (
    <NavigationContext.Provider value={{ preference, setPreference, actualLayout }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};