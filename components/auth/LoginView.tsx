
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { API_KEYS } from '../../config';
import { 
    OnLuyenLogo, 
    AcademicCapIcon, 
    UserCircleIcon, 
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    ArrowPathIcon
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
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Nam');
  const [otp, setOtp] = useState('');

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
        
        // Nếu Supabase trả về user nhưng chưa xác thực, chuyển sang màn hình OTP
        if (data.user && !data.session) {
            setIsVerifying(true);
            setMessage("Một mã xác thực đã được gửi đến email của bạn.");
        } else if (data.session) {
            onLoginSuccess();
        }
      }
    } catch (err: any) {
        setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
        setError("Vui lòng nhập mã xác thực 6 chữ số.");
        return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
        });
        
        if (error) throw error;
        if (data.session) {
            onLoginSuccess();
        }
    } catch (err: any) {
        setError(err.message || "Mã xác thực không chính xác hoặc đã hết hạn.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setMessage("Đang gửi lại mã...");
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        if (error) throw error;
        setMessage("Mã xác thực mới đã được gửi!");
    } catch (err: any) {
        setError(err.message);
    }
  };

  // Màn hình xác thực OTP
  if (isVerifying) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto h-20 w-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-4">
                        <EnvelopeIcon className="h-10 w-10 text-brand-primary" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-slate-800">Xác thực Email</h2>
                    <p className="mt-2 text-slate-500 px-4">
                        Chúng tôi đã gửi mã xác nhận đến <span className="font-bold text-slate-700">{email}</span>. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                    <form onSubmit={handleVerifyEmail} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
                                Nhập mã 6 chữ số
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                className="block w-full text-center text-3xl tracking-[0.5em] font-black rounded-2xl border-2 border-slate-100 px-4 py-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        {error && <div className="bg-red-50 p-3 rounded-xl text-xs text-red-600 font-bold text-center border border-red-100">{error}</div>}
                        {message && <div className="bg-green-50 p-3 rounded-xl text-xs text-green-700 font-bold text-center border border-green-100">{message}</div>}

                        <button
                            type="submit"
                            disabled={isSubmitting || otp.length < 6}
                            className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                        >
                            {isSubmitting ? 'Đang xác thực...' : 'XÁC NHẬN TÀI KHOẢN'}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-sm text-slate-500 mb-2">Không nhận được mã?</p>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="text-sm font-bold text-brand-primary hover:underline flex items-center justify-center mx-auto"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-1" /> Gửi lại mã mới
                            </button>
                        </div>
                    </form>
                </div>
                
                <button 
                    onClick={() => { setIsVerifying(false); setIsLoginView(false); }}
                    className="mt-6 text-sm text-slate-400 hover:text-slate-600 flex items-center justify-center mx-auto font-medium"
                >
                    ← Quay lại chỉnh sửa thông tin
                </button>
            </div>
        </div>
    );
  }

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
