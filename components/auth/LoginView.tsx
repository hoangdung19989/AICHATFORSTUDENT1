
import React, { useState, useEffect, useMemo } from 'react';
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
    ArrowPathIcon,
    TowerIcon
} from '../icons';
import { useNavigation } from '../../contexts/NavigationContext';
import { PROVINCES, SCHOOLS_BY_WARD } from '../../data/schools';
import SearchableSelect from '../common/SearchableSelect';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

type UserRole = 'student' | 'teacher';

const ALL_GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

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
  const [grade, setGrade] = useState(ALL_GRADES[0]);
  
  // School Fields
  const [province, setProvince] = useState('Tuyên Quang');
  const [ward, setWard] = useState('');
  const [school, setSchool] = useState('');
  
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

  const isTuyenQuang = province === 'Tuyên Quang';
  const wardList = useMemo(() => isTuyenQuang ? Object.keys(SCHOOLS_BY_WARD).sort() : [], [isTuyenQuang]);
  const schoolList = useMemo(() => isTuyenQuang && ward ? (SCHOOLS_BY_WARD[ward] || []) : [], [isTuyenQuang, ward]);

  // Reset fields when province/ward changes
  useEffect(() => {
      if (isTuyenQuang) {
          setWard('');
          setSchool('');
      }
  }, [province]);

  useEffect(() => {
      if (isTuyenQuang) {
          setSchool('');
      }
  }, [ward]);

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
        if (!fullName.trim() || !dob || !province || !ward || !school) { 
            setError("Vui lòng điền đầy đủ thông tin cá nhân và chọn trường học."); 
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
                    province,
                    ward_commune: ward,
                    school_name: school,
                    grade_name: grade, // Lưu thông tin khối lớp vào metadata
                    status: role === 'teacher' ? 'pending' : 'active'
                } 
            }
        });
        if (error) throw error;
        
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

  if (isVerifying) {
    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50">
            <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-20 w-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-4">
                            <EnvelopeIcon className="h-10 w-10 text-brand-primary" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-slate-800">Xác thực Email</h2>
                        <p className="mt-2 text-slate-500 px-4">
                            Chúng tôi đã gửi mã xác nhận đến <span className="font-bold text-slate-700">{email}</span>. Vui lòng kiểm tra hộp thư đến.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                        <form onSubmit={handleVerifyEmail} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
                                    Nhập mã 6 chữ số
                                </label>
                                <input
                                    type="text" maxLength={6} placeholder="000000"
                                    className="block w-full text-center text-3xl tracking-[0.5em] font-black rounded-2xl border-2 border-slate-100 px-4 py-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>

                            {error && <div className="bg-red-50 p-3 rounded-xl text-xs text-red-600 font-bold text-center border border-red-100">{error}</div>}
                            {message && <div className="bg-green-50 p-3 rounded-xl text-xs text-green-700 font-bold text-center border border-green-100">{message}</div>}

                            <button
                                type="submit" disabled={isSubmitting || otp.length < 6}
                                className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                            >
                                {isSubmitting ? 'Đang xác thực...' : 'XÁC NHẬN TÀI KHOẢN'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 custom-scrollbar">
      <div className="flex flex-col items-center min-h-screen px-4 pt-10 pb-24">
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                <OnLuyenLogo className="mx-auto h-20 w-20 mb-4" />
                <h2 className="text-4xl font-display font-bold text-slate-800">
                    {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
                </h2>
                <p className="mt-2 text-slate-500 font-medium italic">Hệ thống ôn luyện thông minh OnLuyen AI</p>
            </div>

            {!isLoginView && (
                <div className="mb-8 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setRole('student')}
                        className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                            role === 'student' ? 'bg-indigo-50 border-brand-primary shadow-lg shadow-indigo-100 scale-105' : 'bg-white border-slate-100 opacity-60'
                        }`}
                    >
                        <div className={`p-2 rounded-xl mb-2 ${role === 'student' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <AcademicCapIcon className="w-8 h-8" />
                        </div>
                        <span className={`font-black text-xs uppercase tracking-widest ${role === 'student' ? 'text-brand-primary' : 'text-slate-500'}`}>Học sinh</span>
                    </button>
                    <button
                        onClick={() => setRole('teacher')}
                        className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                            role === 'teacher' ? 'bg-pink-50 border-pink-500 shadow-lg shadow-pink-100 scale-105' : 'bg-white border-slate-100 opacity-60'
                        }`}
                    >
                        <div className={`p-2 rounded-xl mb-2 ${role === 'teacher' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <UserCircleIcon className="w-8 h-8" />
                        </div>
                        <span className={`font-black text-xs uppercase tracking-widest ${role === 'teacher' ? 'text-pink-600' : 'text-slate-500'}`}>Giáo viên</span>
                    </button>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-visible relative">
                <div className="p-8 sm:p-10">
                    <form className="space-y-6" onSubmit={handleEmailAuthAction}>
                        {!isLoginView && (
                            <div className="space-y-6 animate-slide-up">
                                {/* Section: School Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-1 w-8 bg-brand-primary rounded-full"></div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin trường học</label>
                                    </div>
                                    
                                    <SearchableSelect 
                                        label="Tỉnh / Thành phố"
                                        options={PROVINCES}
                                        value={province}
                                        onChange={setProvince}
                                        placeholder="Chọn tỉnh thành..."
                                        required
                                    />

                                    {isTuyenQuang ? (
                                        <div className="space-y-4">
                                            <SearchableSelect 
                                                label="Xã / Phường"
                                                options={wardList}
                                                value={ward}
                                                onChange={setWard}
                                                placeholder="Chọn xã hoặc phường..."
                                                required
                                            />
                                            <SearchableSelect 
                                                label="Trường học"
                                                disabled={!ward}
                                                options={schoolList}
                                                value={school}
                                                onChange={setSchool}
                                                placeholder={ward ? "Chọn trường..." : "Vui lòng chọn xã/phường trước"}
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Xã / Phường / Quận / Huyện</label>
                                                <input 
                                                    type="text" required placeholder="Nhập địa phương của bạn"
                                                    className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                                    value={ward} onChange={(e) => setWard(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên Trường học</label>
                                                <input 
                                                    type="text" required placeholder="Nhập đầy đủ tên trường"
                                                    className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                                    value={school} onChange={(e) => setSchool(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Grade Selection for Students */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Khối lớp {role === 'teacher' ? 'đang dạy' : ''}</label>
                                        <select 
                                            className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold"
                                            value={grade} onChange={(e) => setGrade(e.target.value)}
                                        >
                                            {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100"></div>
                                
                                {/* Section: Personal Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-1 w-8 bg-brand-primary rounded-full"></div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin cá nhân</label>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
                                        <input
                                            type="text" required placeholder="Họ và tên đầy đủ"
                                            className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                            value={fullName} onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngày sinh</label>
                                            <input
                                                type="date" required
                                                className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                                value={dob} onChange={(e) => setDob(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giới tính</label>
                                            <select 
                                                className="w-full rounded-xl border-2 border-slate-100 px-2 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                                value={gender} onChange={(e) => setGender(e.target.value)}
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100"></div>
                            </div>
                        )}
                        
                        {/* Section: Credentials */}
                        <div className="space-y-4">
                            {!isLoginView && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1 w-8 bg-brand-primary rounded-full"></div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tài khoản đăng nhập</label>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Địa chỉ Email</label>
                                <input
                                    type="email" required placeholder="example@gmail.com"
                                    className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mật khẩu</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                                        className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <button
                                type="submit" disabled={isSubmitting || !!configError}
                                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary-dark transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 hover:-translate-y-1 active:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (isLoginView ? 'Đăng nhập ngay' : 'Hoàn tất đăng ký')}
                            </button>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginView(!isLoginView);
                                    setError(null);
                                    // Cuộn lên đầu form khi chuyển chế độ
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-sm font-bold text-slate-400 hover:text-brand-primary transition-colors group"
                            >
                                {isLoginView ? (
                                    <>Chưa có tài khoản? <span className="text-brand-primary group-hover:underline">Đăng ký ngay</span></>
                                ) : (
                                    <>Đã có tài khoản? <span className="text-brand-primary group-hover:underline">Đăng nhập</span></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                {error && (
                    <div className="bg-red-50 p-5 text-xs text-red-600 text-center font-bold border-t border-red-100 animate-slide-up rounded-b-[2.5rem]">
                        <ShieldCheckIcon className="h-4 w-4 inline mr-2 mb-0.5" />
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-12 text-center">
                <button onClick={() => navigate('admin-login')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center mx-auto transition-all font-bold uppercase tracking-widest opacity-60 hover:opacity-100">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" /> Cổng Quản trị hệ thống
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
