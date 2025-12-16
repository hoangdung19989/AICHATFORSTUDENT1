
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { API_KEYS } from '../../config';
import { 
    OnLuyenLogo, 
    AcademicCapIcon, 
    UserCircleIcon, 
    ShieldCheckIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '../icons';
import { useNavigation } from '../../contexts/NavigationContext';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

type UserRole = 'student' | 'teacher';
type AuthMethod = 'email' | 'phone';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { navigate } = useNavigation();
  const [role, setRole] = useState<UserRole>('student');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Basic Auth Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  // New Profile Fields (For Registration)
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Nam');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Config Check State
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
      const url = API_KEYS.SUPABASE_URL;
      const key = API_KEYS.SUPABASE_ANON_KEY;
      
      const isPlaceholder = !url || url.includes('YOUR_SUPABASE_URL') || !key || key.includes('YOUR_SUPABASE_ANON_KEY');
      
      if (isPlaceholder) {
          setConfigError("⚠️ Bạn chưa điền thông tin Supabase vào file 'config.ts'. Hãy mở file đó và dán URL + Key của dự án bạn vào.");
      } 
  }, []);

  // Validation Helper
  const validateRegistration = () => {
      if (!fullName.trim()) return "Vui lòng nhập họ và tên.";
      if (!dob) return "Vui lòng nhập ngày sinh.";
      return null;
  };

  // --- PHONE LOGIN (SEND OTP) ---
  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (configError) return;
      
      // Nếu là đăng ký, validate thông tin cá nhân trước
      if (!isLoginView) {
          const valError = validateRegistration();
          if (valError) {
              setError(valError);
              return;
          }
      }

      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      let formattedPhone = phone.trim();
      if (!formattedPhone) {
          setError("Vui lòng nhập số điện thoại.");
          setIsSubmitting(false);
          return;
      }
      if (formattedPhone.startsWith('0')) {
          formattedPhone = '+84' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+84' + formattedPhone;
      }

      try {
          const { error } = await supabase.auth.signInWithOtp({
              phone: formattedPhone,
              options: {
                  data: !isLoginView ? {
                      role: role,
                      full_name: fullName,
                      date_of_birth: dob,
                      gender: gender
                  } : undefined
              }
          });
          if (error) throw error;
          
          setShowOtpInput(true);
          setMessage(`Mã OTP đã được gửi đến ${formattedPhone}. Vui lòng kiểm tra tin nhắn.`);
      } catch (err: any) {
          setError(err.message || "Không thể gửi OTP. Vui lòng kiểm tra lại số điện thoại.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- PHONE LOGIN (VERIFY OTP) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) formattedPhone = '+84' + formattedPhone.substring(1);
      else if (!formattedPhone.startsWith('+')) formattedPhone = '+84' + formattedPhone;

      try {
          const { data, error } = await supabase.auth.verifyOtp({
              phone: formattedPhone,
              token: otp,
              type: 'sms'
          });

          if (error) throw error;

          if (data.session) {
              onLoginSuccess();
          }
      } catch (err: any) {
          setError(err.message || "Mã OTP không chính xác hoặc đã hết hạn.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- EMAIL AUTH ACTION ---
  const handleEmailAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (configError) return;

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginView) {
        // Sign In
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (authError) throw authError;
        
        onLoginSuccess();

      } else {
        // Sign Up
        const valError = validateRegistration();
        if (valError) {
            setError(valError);
            setIsSubmitting(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    role: role, 
                    full_name: fullName,
                    date_of_birth: dob,
                    gender: gender
                }
            }
        });
        if (error) throw error;

        if (data.session) {
            onLoginSuccess();
        } else if (data.user) {
            let msg = `Đăng ký thành công! `;
            if (role === 'teacher') msg += "Tài khoản Giáo viên sẽ ở trạng thái Chờ duyệt. ";
            else msg += "Vui lòng kiểm tra email để xác nhận. ";
            setMessage(msg);
            setIsLoginView(true);
        }
      }
    } catch (err: any) {
        let msg = err.message || 'Đã xảy ra lỗi.';
        // Dịch lỗi sang Tiếng Việt
        if (msg.includes('Invalid login credentials')) {
             msg = "Email hoặc mật khẩu không chính xác.";
        } else if (msg.includes('Email not confirmed')) {
             msg = "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư đến (hoặc thư rác) để kích hoạt tài khoản.";
        } else if (msg.includes('User already registered')) {
             msg = "Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.";
        }
        setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordReset = async () => {
      if (configError) return;
      if (!email) {
          setError("Vui lòng nhập email để khôi phục mật khẩu.");
          return;
      }
      setIsSubmitting(true);
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin,
          });
          if (error) throw error;
          setMessage("Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư.");
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const renderRegistrationFields = () => {
      if (isLoginView) return null;
      return (
          <div className="space-y-3 pt-2 pb-1 border-t border-b border-slate-100 my-3 animate-slide-in-bottom">
              <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Thông tin cá nhân</label>
                  <input
                      type="text" required placeholder="Họ và tên đầy đủ"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-sky-500 focus:ring-sky-500"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                  />
              </div>
              <div className="flex space-x-3">
                  <div className="flex-1">
                      <input
                          type="date" required
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-sky-500 focus:ring-sky-500 text-slate-600"
                          value={dob} onChange={(e) => setDob(e.target.value)}
                      />
                  </div>
                  <div className="w-1/3">
                      <select 
                          className="block w-full rounded-lg border border-gray-300 px-2 py-2.5 focus:border-sky-500 focus:ring-sky-500"
                          value={gender} onChange={(e) => setGender(e.target.value)}
                      >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                      </select>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
            <OnLuyenLogo className="mx-auto h-20 w-auto" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                Chào mừng đến với OnLuyen
            </h2>
            <p className="mt-2 text-slate-500">Nền tảng học tập thông minh với AI</p>
        </div>

        {/* --- CONFIG ERROR BANNER --- */}
        {configError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md animate-pulse">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-bold text-red-800">Cấu hình chưa đúng!</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{configError}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ROLE SELECTION (STEP 1) --- */}
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Bước 1: Bạn là ai?</h3>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => { setRole('student'); setError(null); setMessage(null); }}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        role === 'student' 
                        ? 'bg-sky-50 border-sky-500 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                    }`}
                >
                    <div className={`p-3 rounded-full mb-2 ${role === 'student' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                        <AcademicCapIcon className="w-8 h-8" />
                    </div>
                    <span className={`font-bold ${role === 'student' ? 'text-sky-700' : 'text-slate-600'}`}>Học sinh</span>
                    {role === 'student' && <div className="absolute top-2 right-2"><CheckCircleIcon className="w-5 h-5 text-sky-500" /></div>}
                </button>

                <button
                    type="button"
                    onClick={() => { setRole('teacher'); setError(null); setMessage(null); }}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        role === 'teacher' 
                        ? 'bg-purple-50 border-purple-500 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                >
                    <div className={`p-3 rounded-full mb-2 ${role === 'teacher' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                        <UserCircleIcon className="w-8 h-8" />
                    </div>
                    <span className={`font-bold ${role === 'teacher' ? 'text-purple-700' : 'text-slate-600'}`}>Giáo viên</span>
                    {role === 'teacher' && <div className="absolute top-2 right-2"><CheckCircleIcon className="w-5 h-5 text-purple-500" /></div>}
                </button>
            </div>
        </div>

        {/* --- AUTH METHODS (STEP 2) --- */}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 ${configError ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className={`p-4 border-b ${role === 'student' ? 'bg-sky-500 border-sky-600' : 'bg-purple-500 border-purple-600'}`}>
                 <h3 className="text-white font-bold text-center">
                    {isLoginView ? 'Đăng nhập ' : 'Đăng ký '} 
                    dành cho {role === 'student' ? 'Học sinh' : 'Giáo viên'}
                 </h3>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
                
                {/* Tabs: Email vs Phone */}
                <div className="flex border-b border-slate-200">
                    <button
                        className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${authMethod === 'email' ? 'text-brand-blue border-brand-blue' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        onClick={() => { setAuthMethod('email'); setError(null); setMessage(null); }}
                    >
                         Email
                    </button>
                    <button
                        className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${authMethod === 'phone' ? 'text-brand-blue border-brand-blue' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        onClick={() => { setAuthMethod('phone'); setError(null); setMessage(null); }}
                    >
                         Số điện thoại
                    </button>
                </div>

                {/* Forms */}
                {authMethod === 'email' && (
                    <form className="space-y-4" onSubmit={handleEmailAuthAction}>
                        {renderRegistrationFields()}
                        
                        <div className="space-y-3">
                            <input
                                type="email" required placeholder="Địa chỉ email"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password" required placeholder="Mật khẩu"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {isLoginView && (
                            <div className="flex justify-end text-sm">
                                <button type="button" onClick={handlePasswordReset} className="font-medium text-sky-600 hover:text-sky-500" disabled={isSubmitting}>Quên mật khẩu?</button>
                            </div>
                        )}
                        <button
                            type="submit" disabled={isSubmitting}
                            className={`w-full flex justify-center rounded-lg py-3 px-4 text-sm font-bold text-white transition-colors shadow-md ${
                                role === 'student' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-purple-600 hover:bg-purple-700'
                            } disabled:opacity-50`}
                        >
                            {isSubmitting ? 'Đang xử lý...' : (isLoginView ? 'Đăng nhập' : 'Đăng ký')}
                        </button>
                    </form>
                )}

                {authMethod === 'phone' && (
                    <form className="space-y-4" onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp}>
                        {!showOtpInput ? (
                            <>
                                {renderRegistrationFields()}
                                <input
                                    type="tel" required placeholder="Số điện thoại (VD: 0912345678)"
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
                                    value={phone} onChange={(e) => setPhone(e.target.value)}
                                />
                                <button
                                    type="submit" disabled={isSubmitting}
                                    className={`w-full flex justify-center items-center rounded-lg py-3 px-4 text-sm font-bold text-white transition-colors shadow-md ${
                                        role === 'student' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-purple-600 hover:bg-purple-700'
                                    } disabled:opacity-50`}
                                >
                                    {isSubmitting ? 'Đang gửi...' : <><PaperAirplaneIcon className="h-4 w-4 mr-2" /> Gửi mã OTP</>}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-center mb-2">
                                    <p className="text-sm text-slate-600">Mã gửi đến <b>{phone}</b></p>
                                    <button type="button" onClick={() => setShowOtpInput(false)} className="text-xs text-sky-600 hover:underline">Đổi số</button>
                                </div>
                                <input
                                    type="text" required placeholder="Nhập mã OTP (6 số)" maxLength={6}
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-sky-500 focus:ring-sky-500"
                                    value={otp} onChange={(e) => setOtp(e.target.value)}
                                />
                                <button
                                    type="submit" disabled={isSubmitting}
                                    className="w-full flex justify-center rounded-lg bg-green-600 py-3 px-4 text-sm font-bold text-white hover:bg-green-50 disabled:opacity-50 transition-colors shadow-md"
                                >
                                    {isSubmitting ? 'Đang kiểm tra...' : 'Xác thực'}
                                </button>
                            </>
                        )}
                    </form>
                )}

                {/* Toggle Login/Signup */}
                <div className="text-center pt-2">
                    <p className="text-sm text-slate-600">
                        {isLoginView ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                        <button 
                            type="button" 
                            onClick={() => { setIsLoginView(!isLoginView); setError(null); setMessage(null); }} 
                            className={`font-bold ml-1 hover:underline ${role === 'student' ? 'text-sky-600' : 'text-purple-600'}`}
                        >
                            {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && <div className="bg-red-50 border-t border-red-100 p-4 text-sm text-red-700 text-center">{error}</div>}
            {message && <div className="bg-green-50 border-t border-green-100 p-4 text-sm text-green-700 text-center">{message}</div>}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('admin-login')}
            className="inline-flex items-center text-xs text-slate-400 hover:text-slate-600 transition-colors border-b border-dashed border-slate-300 pb-0.5"
          >
              <ShieldCheckIcon className="w-3 h-3 mr-1" />
              Portal Quản trị (Admin)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
