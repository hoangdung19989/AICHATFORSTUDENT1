
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
  
  // Khởi tạo profile từ cache để có dữ liệu ngay lập tức
  const [profile, setProfile] = useState<UserProfile | null>(() => {
      try {
          const cached = localStorage.getItem('user_profile');
          return cached ? JSON.parse(cached) : null;
      } catch (e) {
          return null;
      }
  });

  // Nếu có profile trong cache, ta có thể coi như đã load xong (Optimistic UI)
  // Tuy nhiên vẫn cần kiểm tra session thực tế.
  // Ta đặt mặc định isLoading = true, nhưng sẽ xử lý fast-track trong useEffect.
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
          
          if (error) return null;
          
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

    // Timeout an toàn để tắt loading nếu mạng quá chậm
    const safetyTimeout = setTimeout(() => {
        if (mounted && isLoading) {
            setIsLoading(false);
        }
    }, 3000);

    const initAuth = async () => {
        try {
            // Lấy session từ bộ nhớ local của Supabase (rất nhanh)
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            const currentSession = data?.session;
            
            if (!mounted) return;

            if (currentSession?.user) {
                setSession(currentSession);
                setUser(currentSession.user);
                
                // --- FAST TRACK LOGIC ---
                // Nếu đã có profile trong cache khớp với user hiện tại, mở khóa UI ngay lập tức
                if (profile && profile.id === currentSession.user.id) {
                    setIsLoading(false); // Vào App ngay, không chờ fetch
                    
                    // Fetch ngầm để cập nhật dữ liệu mới nhất (background update)
                    fetchProfile(currentSession.user.id).then(p => {
                        if (mounted && p) {
                            // Chỉ update state nếu có sự thay đổi quan trọng để tránh re-render thừa
                            if (JSON.stringify(p) !== JSON.stringify(profile)) {
                                setProfile(p);
                            }
                        }
                    });
                } else {
                    // Nếu chưa có cache hoặc user khác cache, bắt buộc phải chờ fetch
                    const p = await fetchProfile(currentSession.user.id);
                    if (mounted && p) setProfile(p);
                    if (mounted) setIsLoading(false);
                }
            } else {
                // Không có session
                localStorage.removeItem('user_profile');
                setProfile(null);
                if (mounted) setIsLoading(false);
            }
        } catch (error) {
            console.error("Auth init error:", error);
            localStorage.removeItem('user_profile');
            if (mounted) setIsLoading(false);
        } finally {
            clearTimeout(safetyTimeout);
        }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: Session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          localStorage.removeItem('user_profile');
          setIsLoading(false);
      } else if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Update profile khi auth state thay đổi (vd: token refresh)
          // Chỉ fetch nếu profile hiện tại không khớp
          if (!profile || profile.id !== session.user.id) {
              const p = await fetchProfile(session.user.id);
              if (mounted && p) setProfile(p);
          }
      }
    });

    return () => {
        mounted = false;
        clearTimeout(safetyTimeout);
        if (authListener?.subscription) {
            authListener.subscription.unsubscribe();
        }
    };
  }, []); // Empty dependency array -> Run once on mount

  const signOut = async () => {
    try {
        setUser(null);
        setProfile(null);
        setSession(null);
        localStorage.removeItem('user_profile');
        localStorage.removeItem('nav_history');
        await supabase.auth.signOut();
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
