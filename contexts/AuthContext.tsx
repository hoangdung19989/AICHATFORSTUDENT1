
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import type { UserProfile } from '../types/user';

// Define types as any to avoid import errors from @supabase/supabase-js
type User = any;
type Session = any;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
          
          if (error) {
              return null;
          }
          return data as UserProfile;
      } catch (err) {
          console.error('Exception fetching profile:', err);
          return null;
      }
  };

  const refreshProfile = async () => {
      if (user) {
          const p = await fetchProfile(user.id);
          setProfile(p);
      }
  };

  useEffect(() => {
    let mounted = true;

    // --- SAFETY VALVE ---
    // Force stop loading after 5 seconds to prevent infinite loop on refresh
    const safetyTimeout = setTimeout(() => {
        if (mounted && isLoading) {
            console.warn("Auth check timed out. Forcing app load.");
            setIsLoading(false);
        }
    }, 5000);

    // Hàm khởi tạo
    const initAuth = async () => {
        try {
            // Get session normally
            const { data, error } = await supabase.auth.getSession();
            
            if (error) throw error;

            const currentSession = data?.session;
            
            if (!mounted) return;

            if (currentSession?.user) {
                setSession(currentSession);
                setUser(currentSession.user);
                
                // Lấy Profile từ Database
                const p = await fetchProfile(currentSession.user.id);
                if (mounted) setProfile(p);
            }
        } catch (error) {
            console.error("Auth init error:", error);
        } finally {
            if (mounted) {
                setIsLoading(false);
                clearTimeout(safetyTimeout); // Clear safety timer if successful
            }
        }
    };

    initAuth();

    // Lắng nghe sự thay đổi trạng thái đăng nhập
    const { data } = supabase.auth.onAuthStateChange(async (event: string, session: Session) => {
      if (!mounted) return;
      
      // Xử lý sự kiện
      if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
      } else if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Chỉ lấy profile nếu chưa có hoặc user thay đổi, tránh fetch dư thừa
          if (!profile || profile.id !== session.user.id) {
              const p = await fetchProfile(session.user.id);
              if (mounted) setProfile(p);
          }
      }
      
      // Ensure loading is false after any auth change event
      if (mounted) setIsLoading(false);
    });

    const subscription = data?.subscription;

    return () => {
        mounted = false;
        clearTimeout(safetyTimeout);
        if (subscription?.unsubscribe) {
            subscription.unsubscribe();
        }
    };
  }, []);

  const signOut = async () => {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // ALWAYS clear local state to ensure user is logged out visually
        setUser(null);
        setProfile(null);
        setSession(null);
        // Clear local storage for navigation logic
        localStorage.removeItem('nav_history'); 
    }
  };

  // Memoize value to prevent consumers from re-rendering unless data actually changes
  const value = useMemo(() => ({
    user,
    profile,
    session,
    isLoading,
    signOut,
    refreshProfile
  }), [user, profile, session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
