
import React, { createContext, useContext, useEffect, useState } from 'react';
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
              // Nếu không lấy được profile, có thể do mạng hoặc chưa tạo xong
              // Trả về null để UI xử lý (loading hoặc thử lại)
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

    // Hàm khởi tạo
    const initAuth = async () => {
        try {
            const { data } = await supabase.auth.getSession();
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
            if (mounted) setIsLoading(false);
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
          // Lấy profile mới nhất
          const p = await fetchProfile(session.user.id);
          if (mounted) setProfile(p);
      }
      
      if (mounted) setIsLoading(false);
    });

    const subscription = data?.subscription;

    return () => {
        mounted = false;
        if (subscription?.unsubscribe) {
            subscription.unsubscribe();
        }
    };
  }, []);

  const signOut = async () => {
    try {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    } catch (error) {
        console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
