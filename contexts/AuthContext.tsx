
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import type { UserProfile } from '../types/user';

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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // CACHE: Khởi tạo profile từ LocalStorage nếu có để tránh flash màn hình chờ khi F5
  const [profile, setProfile] = useState<UserProfile | null>(() => {
      try {
          const cached = localStorage.getItem('user_profile');
          return cached ? JSON.parse(cached) : null;
      } catch (e) {
          return null;
      }
  });

  const fetchProfile = async (userId: string) => {
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
          
          if (error) return null;
          
          // CACHE: Lưu profile mới nhất vào LocalStorage
          if (data) {
              localStorage.setItem('user_profile', JSON.stringify(data));
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
          if (p) setProfile(p);
      }
  };

  useEffect(() => {
    let mounted = true;

    const safetyTimeout = setTimeout(() => {
        if (mounted && isLoading) {
            setIsLoading(false);
        }
    }, 5000);

    const initAuth = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            const currentSession = data?.session;
            
            if (!mounted) return;

            if (currentSession?.user) {
                setSession(currentSession);
                setUser(currentSession.user);
                
                // Fetch profile mới nhất từ server để cập nhật cache
                const p = await fetchProfile(currentSession.user.id);
                if (mounted && p) setProfile(p);
            } else {
                // Nếu không có session, xóa cache profile cũ
                localStorage.removeItem('user_profile');
                setProfile(null);
            }
        } catch (error) {
            console.error("Auth init error:", error);
            localStorage.removeItem('user_profile');
        } finally {
            if (mounted) {
                setIsLoading(false);
                clearTimeout(safetyTimeout);
            }
        }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: Session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          localStorage.removeItem('user_profile'); // Xóa cache khi đăng xuất
          setIsLoading(false);
      } else if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Kiểm tra nếu profile hiện tại khác với user mới (trường hợp đổi acc)
          if (!profile || profile.id !== session.user.id) {
              const p = await fetchProfile(session.user.id);
              if (mounted && p) setProfile(p);
          }
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
        mounted = false;
        clearTimeout(safetyTimeout);
        if (authListener?.subscription) {
            authListener.subscription.unsubscribe();
        }
    };
  }, []);

  const signOut = async () => {
    try {
        // 1. Xóa trạng thái trong bộ nhớ tạm thời của App
        setUser(null);
        setProfile(null);
        setSession(null);
        
        // 2. Xóa cache và lịch sử
        localStorage.removeItem('user_profile');
        localStorage.removeItem('nav_history');
        
        // 3. Gọi lệnh đăng xuất từ hệ thống Supabase (Xóa Token)
        await supabase.auth.signOut();
        
        // 4. Chuyển hướng về trang chủ/đăng nhập
        window.location.href = '/'; 
    } catch (error) {
        console.error("Logout error:", error);
        window.location.href = '/';
    }
  };

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
