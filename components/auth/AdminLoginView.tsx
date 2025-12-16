
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ShieldCheckIcon, KeyIcon } from '../icons';
import { useNavigation } from '../../contexts/NavigationContext';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
}

const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess }) => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Đăng nhập cơ bản
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      if (!data.user) throw new Error("Không tìm thấy người dùng.");

      // 2. KIỂM TRA QUYỀN (Security Gate)
      // Truy vấn trực tiếp bảng profiles để kiểm tra vai trò
      try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (!profileError && profile) {
              // CHỈ CHẶN NẾU: Đọc được profile thành công VÀ Role không phải admin
              // Điều này cho phép user đã được update DB thành admin nhưng metadata cũ vẫn vào được.
              if (profile.role !== 'admin') {
                  await supabase.auth.signOut();
                  throw new Error("Truy cập bị từ chối. Tài khoản này không có quyền Quản trị.");
              }
          } else {
              // Nếu không đọc được profile (lỗi mạng, chưa tạo profile, hoặc lỗi RLS),
              // ta TẠM THỜI cho phép vào để Dashboard xử lý tiếp.
              // Log warning để debug
              console.warn("AdminLoginView: Profile check skipped due to error or missing data:", profileError?.message);
          }
      } catch (checkErr: any) {
          // Nếu lỗi là do ta tự throw (Truy cập bị từ chối), ném tiếp ra ngoài
          if (checkErr.message.includes("Truy cập bị từ chối")) {
              throw checkErr;
          }
          // Các lỗi khác (network v.v) thì bỏ qua, cho phép đăng nhập optimistic
      }

      // 3. Callback thành công
      onLoginSuccess();

    } catch (err: any) {
      console.error("Admin login error:", err);
      
      let displayError = err.message || 'Đăng nhập thất bại.';
      
      // Dịch các lỗi phổ biến sang tiếng Việt
      if (displayError.includes('Email not confirmed')) {
          displayError = 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email (bao gồm hòm thư Spam) để xác nhận.';
      } else if (displayError.includes('Invalid login credentials')) {
          displayError = 'Email hoặc mật khẩu không chính xác.';
      }

      setError(displayError);
      
      // Đảm bảo đăng xuất nếu có lỗi quyền hạn
      if (displayError.includes("Truy cập bị từ chối")) {
          await supabase.auth.signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        
        {/* Header Logo Area */}
        <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl mb-4">
                <ShieldCheckIcon className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
                Cổng Quản Trị Viên
            </h2>
            <p className="mt-2 text-sm text-slate-400">
                Hệ thống Quản lý OnLuyen AI
            </p>
        </div>

        <div className="bg-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-slate-700">
            <form className="space-y-6" onSubmit={handleAdminLogin}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                        Email quản trị
                    </label>
                    <div className="mt-1">
                        <input
                            id="email" name="email" type="email" required autoComplete="email"
                            className="block w-full appearance-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm transition-colors"
                            placeholder="admin@onluyen.vn"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                        Mật khẩu
                    </label>
                    <div className="mt-1">
                        <input
                            id="password" name="password" type="password" required autoComplete="current-password"
                            className="block w-full appearance-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm transition-colors"
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-900/30 border border-red-800 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ShieldCheckIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-400">Lỗi đăng nhập</h3>
                                <div className="mt-2 text-sm text-red-300">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full justify-center rounded-lg border border-transparent bg-red-600 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xác thực...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <KeyIcon className="w-5 h-5 mr-2" />
                                Đăng nhập vào Dashboard
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>

        <div className="mt-6 text-center">
            <button 
                onClick={() => navigate('login')}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center w-full"
            >
                <span className="mr-2">←</span> Quay lại trang Học viên
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginView;
