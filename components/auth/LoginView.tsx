
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { API_KEYS } from '../../config';
import { 
    OnLuyenLogo, 
    AcademicCapIcon, 
    UserCircleIcon, 
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon
} from '../icons';
import { useNavigation } from '../../contexts/NavigationContext';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

type UserRole = 'student' | 'teacher';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { navigate } = useNavigation();
  const [role, setRole] = useState<UserRole>('student');
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Nam');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
      const url = API_KEYS.SUPABASE_URL;
      const key = API_KEYS.SUPABASE_ANON_KEY;
      const isPlaceholder = !url || url.includes('YOUR_SUPABASE_URL') || !key || key.includes('YOUR_SUPABASE_ANON_KEY');
      if (isPlaceholder) {
          setConfigError("⚠️ Hệ thống chưa được cấu hình key. Vui lòng kiểm tra config.ts.");
      } 
  }, []);

  const handleEmailAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (configError) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      if (isLoginView) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess();
      } else {
        if (!fullName.trim() || !dob) { 
            setError("Vui lòng điền đầy đủ thông tin cá nhân."); 
            setIsSubmitting(false); 
            return; 
        }
        const { data, error } = await supabase.auth.signUp({ 
            email, password,
            options: { 
                data: { 
                    role, 
                    full_name: fullName, 
                    date_of_birth: dob, 
                    gender,
                    status: role === 'teacher' ? 'pending' : 'active'
                } 
            }
        });
        if (error) throw error;
        if (data.session) onLoginSuccess();
        else {
            setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
            setIsLoginView(true);
        }
      }
    } catch (err: any) {
        setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
            <OnLuyenLogo className="mx-auto h-20 w-20 mb-4" />
            <h2 className="text-3xl font-display font-bold text-slate-800">
                {isLoginView ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h2>
            <p className="mt-2 text-slate-500">Hệ thống ôn luyện thông minh OnLuyen AI</p>
        </div>

        <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setRole('student')}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                        role === 'student' ? 'bg-indigo-50 border-brand-primary shadow-md scale-105' : 'bg-white border-slate-200 opacity-60'
                    }`}
                >
                    <AcademicCapIcon className={`w-8 h-8 mb-2 ${role === 'student' ? 'text-brand-primary' : 'text-slate-400'}`} />
                    <span className={`font-bold text-sm ${role === 'student' ? 'text-indigo-700' : 'text-slate-500'}`}>Học sinh</span>
                </button>
                <button
                    onClick={() => setRole('teacher')}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                        role === 'teacher' ? 'bg-pink-50 border-pink-500 shadow-md scale-105' : 'bg-white border-slate-200 opacity-60'
                    }`}
                >
                    <UserCircleIcon className={`w-8 h-8 mb-2 ${role === 'teacher' ? 'text-pink-600' : 'text-slate-400'}`} />
                    <span className={`font-bold text-sm ${role === 'teacher' ? 'text-pink-700' : 'text-slate-500'}`}>Giáo viên</span>
                </button>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8">
                <form className="space-y-4" onSubmit={handleEmailAuthAction}>
                    {!isLoginView && (
                        <div className="space-y-3 animate-slide-up">
                            <input
                                type="text" required placeholder="Họ và tên đầy đủ"
                                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                value={fullName} onChange={(e) => setFullName(e.target.value)}
                            />
                            <div className="flex space-x-3">
                                <input
                                    type="date" required
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                    value={dob} onChange={(e) => setDob(e.target.value)}
                                />
                                <select 
                                    className="w-1/3 rounded-xl border border-slate-200 px-2 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                    value={gender} onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <input
                        type="email" required placeholder="Địa chỉ Email"
                        className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'} required placeholder="Mật khẩu"
                            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                    
                    <button
                        type="submit" disabled={isSubmitting || !!configError}
                        className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary-dark transition-all disabled:opacity-50 shadow-lg mt-2"
                    >
                        {isSubmitting ? 'Đang xử lý...' : (isLoginView ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                    
                    <div className="mt-6 pt-6 border-t border-slate-50 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginView(!isLoginView);
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-sm font-bold text-brand-primary hover:underline"
                        >
                            {isLoginView ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
            
            {configError && <div className="bg-amber-50 p-4 text-xs text-amber-700 text-center font-bold border-t border-amber-100">{configError}</div>}
            {error && <div className="bg-red-50 p-4 text-xs text-red-600 text-center font-bold border-t border-red-100">{error}</div>}
            {message && <div className="bg-green-50 p-4 text-xs text-green-700 text-center font-bold border-t border-green-100">{message}</div>}
        </div>

        <div className="mt-8 text-center">
            <button onClick={() => navigate('admin-login')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center mx-auto transition-colors">
                <ShieldCheckIcon className="h-4 w-4 mr-1" /> Portal Quản trị (Admin)
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
