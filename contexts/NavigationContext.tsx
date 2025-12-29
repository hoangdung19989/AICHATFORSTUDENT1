
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';

export type View = 
  | 'home' | 'login' | 'admin-login' | 'update-password' | 'personalized-dashboard' | 'self-study'
  | 'teacher-dashboard' | 'lesson-planner' | 'test-generator' | 'admin-dashboard' | 'exam-manager' | 'exam-results-viewer'
  | 'ai-subjects' | 'ai-tutor' | 'profile-settings'
  | 'lecture-subjects' | 'lecture-grades' | 'lecture-video'
  | 'laboratory-categories' | 'laboratory-subcategories' | 'laboratory-list' | 'laboratory-simulation'
  | 'test-subjects' | 'test-grades' | 'test-types' | 'quiz-view'
  | 'mock-exam-subjects' | 'mock-exam-grades' | 'mock-exam-view'
  | 'self-practice-subjects' | 'self-practice-grades' | 'self-practice-lessons' | 'practice-view';

type NavigationParams = Record<string, any>;

interface NavigationState {
  view: View;
  params: NavigationParams;
}

interface NavigationContextType {
  currentView: View;
  params: NavigationParams;
  navigate: (view: View, params?: NavigationParams) => void;
  goBack: () => void;
  resetNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getViewFromHash = (): NavigationState => {
    const hash = window.location.hash.replace('#/', '');
    if (!hash) return { view: 'login', params: {} };
    return { view: hash as View, params: {} };
  };

  const [history, setHistory] = useState<NavigationState[]>([getViewFromHash()]);

  useEffect(() => {
    const currentState = history[history.length - 1];
    if (currentState) {
      window.location.hash = `/${currentState.view}`;
    }
  }, [history]);

  useEffect(() => {
    const handleHashChange = () => {
      const newState = getViewFromHash();
      setHistory(prev => {
        const last = prev[prev.length - 1];
        if (last?.view === newState.view) return prev;
        return [...prev, newState];
      });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const currentState = history[history.length - 1] || { view: 'login', params: {} };

  const navigate = useCallback((view: View, params: NavigationParams = {}) => {
    setHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.view === view) {
            return [...prev.slice(0, -1), { view, params }];
        }
        return [...prev, { view, params }];
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
        if (prev.length > 1) {
            return prev.slice(0, -1);
        }
        return prev;
    });
  }, []);

  const resetNavigation = useCallback(() => {
      setHistory([{ view: 'login', params: {} }]);
  }, []);

  const value = useMemo(() => ({
    currentView: currentState.view,
    params: currentState.params,
    navigate,
    goBack,
    resetNavigation
  }), [currentState.view, currentState.params, navigate, goBack, resetNavigation]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
