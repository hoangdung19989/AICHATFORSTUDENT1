
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

export type View = 
  | 'home' | 'login' | 'admin-login' | 'update-password' | 'personalized-dashboard' | 'self-study'
  | 'teacher-dashboard' | 'lesson-planner' | 'test-generator' | 'admin-dashboard' | 'exam-manager'
  | 'ai-subjects' | 'ai-tutor'
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
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<NavigationState[]>([{ view: 'login', params: {} }]);

  const currentState = history[history.length - 1];

  const navigate = useCallback((view: View, params: NavigationParams = {}) => {
    // Prevent pushing the same view consecutively
    setHistory(prev => {
        const last = prev[prev.length - 1];
        if (last.view === view) {
            // Replace params if view is same
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

  const value = useMemo(() => ({
    currentView: currentState.view,
    params: currentState.params,
    navigate,
    goBack,
  }), [currentState.view, currentState.params, navigate, goBack]);

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
