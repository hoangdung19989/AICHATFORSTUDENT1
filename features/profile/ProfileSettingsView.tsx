
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import SearchableSelect from '../../components/common/SearchableSelect';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PROVINCES, SCHOOLS_BY_WARD } from '../../data/schools';
import { 
    UserCircleIcon, 
    CheckCircleIcon, 
    ArrowPathIcon,
    ShieldCheckIcon,
    AcademicCapIcon,
    SparklesIcon,
    RobotIcon,
    KeyIcon
} from '../../components/icons';

const ALL_GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

const ProfileSettingsView: React.FC = () => {
    const { user, profile, refreshProfile } = useAuth();
    const { navigate } = useNavigation();
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states - Profile
    const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
    const [dob, setDob] = useState(profile?.date_of_birth || user?.user_metadata?.date_of_birth || '');
    const [gender, setGender] = useState(profile?.gender || user?.user_metadata?.gender || 'Nam');
    const [grade, setGrade] = useState(profile?.grade_name || user?.user_metadata?.grade_name || ALL_GRADES[0]);
    const [province, setProvince] = useState(profile?.province || user?.user_metadata?.province || 'Tuyên Quang');
    const [ward, setWard] = useState(profile?.ward_commune || user?.user_metadata?.ward_commune || '');
    const [school, setSchool] = useState(profile?.school_name || user?.user_metadata?.school_name || '');

    // Form states - AI Preference
    const [aiPreference, setAiPreference] = useState<'gemini' | 'chatgpt'>('gemini');
    const [customOpenAIKey, setCustomOpenAIKey] = useState('');
    const [customGeminiKey, setCustomGeminiKey] = useState('');

    useEffect(() => {
        // Load preferences from localStorage
        const pref = localStorage.getItem('ai_preference') as 'gemini' | 'chatgpt';
        if (pref) setAiPreference(pref);
        
        const openAIKey = localStorage.getItem('openai_api_key');
        if (openAIKey) setCustomOpenAIKey(openAIKey);

        const geminiKey = localStorage.getItem('gemini_api_key');
        if (geminiKey) setCustomGeminiKey(geminiKey);
    }, []);

    const isTuyenQuang = province === 'Tuyên Quang';
    const wardList = useMemo(() => isTuyenQuang ? Object.keys(SCHOOLS_BY_WARD).sort() : [], [isTuyenQuang]);
    const schoolList = useMemo(() => isTuyenQuang && ward ? (SCHOOLS_BY_WARD[ward] || []) : [], [isTuyenQuang, ward]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsLoading(true);
        setMessage(null);
        
        try {
            // 1. Lưu Cấu hình AI vào LocalStorage
            localStorage.setItem('ai_preference', aiPreference);
            
            // Save OpenAI Key
            if (customOpenAIKey.trim()) {
                localStorage.setItem('openai_api_key', customOpenAIKey.trim());
            } else {
                localStorage.removeItem('openai_api_key');
            }

            // Save Gemini Key
            if (customGeminiKey.trim()) {
                localStorage.setItem('gemini_api_key', customGeminiKey.trim());
            } else {
                localStorage.removeItem('gemini_api_key');
            }

            // 2. Lưu thông tin Profile vào DB
            const updates = {
                full_name: fullName,
                date_of_birth: dob,
                gender,
                province,
                ward_commune: ward,
                school_name: school
            };

            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ ...updates, grade_name: grade })
                    .eq('id', user.id);

                if (error) throw error;
            } catch (dbError: any) {
                if (dbError.message?.includes("Could not find") || dbError.code === 'PGRST204' || dbError.code === '42703') {
                    console.warn("Database schema mismatch. Switching to Metadata storage fallback.");
                    const { error: retryError } = await supabase.from('profiles').update(updates).eq('id', user.id);
                    if (retryError) throw retryError;
                    const { error: metaError } = await supabase.auth.updateUser({ data: { grade_name: grade } });
                    if (metaError) throw metaError;
                } else {
                    throw dbError;
                }
            }
            
            await refreshProfile();
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ và cấu hình AI thành công!' });
            
            // Tự động cuộn lên đầu để thấy thông báo
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: 'Lỗi: ' + err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl pb-20 animate-scale-in">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Hồ sơ & Cài đặt' }]} />

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-brand-primary p-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                            <UserCircleIcon className="h-12 w-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Thiết lập tài khoản</h1>
                            <p className="text-indigo-100 text-sm opacity-80">Cập nhật thông tin và tùy chỉnh trải nghiệm AI.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8 sm:p-10 space-y-10">
                    
                    {/* --- CẤU HÌNH AI --- */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-1 w-8 bg-purple-500 rounded-full"></div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cấu hình Trí tuệ nhân tạo (AI)</label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div 
                                onClick={() => setAiPreference('gemini')}
                                className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${aiPreference === 'gemini' ? 'border-brand-primary bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`p-3 rounded-2xl ${aiPreference === 'gemini' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <SparklesIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${aiPreference === 'gemini' ? 'text-brand-primary' : 'text-slate-700'}`}>Google Gemini</h3>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Mặc định</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Tốc độ phản hồi nhanh, miễn phí và ổn định. Phù hợp cho các tác vụ tạo văn bản và phân tích cơ bản.
                                </p>
                                {aiPreference === 'gemini' && <div className="absolute top-4 right-4 text-brand-primary"><CheckCircleIcon className="h-6 w-6" /></div>}
                            </div>

                            <div 
                                onClick={() => setAiPreference('chatgpt')}
                                className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${aiPreference === 'chatgpt' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`p-3 rounded-2xl ${aiPreference === 'chatgpt' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <RobotIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${aiPreference === 'chatgpt' ? 'text-emerald-700' : 'text-slate-700'}`}>OpenAI ChatGPT</h3>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Khuyên dùng</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Thông minh hơn, hỗ trợ <strong>Vision (Đọc ảnh)</strong> tốt hơn. Giảm thiểu lỗi "Quá tải" của Gemini.
                                </p>
                                {aiPreference === 'chatgpt' && <div className="absolute top-4 right-4 text-emerald-600"><CheckCircleIcon className="h-6 w-6" /></div>}
                            </div>
                        </div>

                        {aiPreference === 'gemini' && (
                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 animate-slide-up">
                                <label className="block text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center">
                                    <KeyIcon className="h-4 w-4 mr-2" /> Google Gemini API Key (Tùy chọn)
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="AIzaSy..." 
                                    className="w-full p-4 rounded-xl border border-indigo-200 focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-mono"
                                    value={customGeminiKey}
                                    onChange={e => setCustomGeminiKey(e.target.value)}
                                />
                                <p className="text-[10px] text-indigo-600 mt-2 italic">
                                    * Sử dụng Key cá nhân của bạn sẽ giúp tốc độ ổn định hơn và tránh bị giới hạn Quota của hệ thống. 
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline ml-1 font-bold">Lấy Key tại đây</a>.
                                </p>
                            </div>
                        )}

                        {aiPreference === 'chatgpt' && (
                            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 animate-slide-up">
                                <label className="block text-xs font-bold text-emerald-800 uppercase mb-2 flex items-center">
                                    <KeyIcon className="h-4 w-4 mr-2" /> OpenAI API Key (Tùy chọn)
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="sk-proj-..." 
                                    className="w-full p-4 rounded-xl border border-emerald-200 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-mono"
                                    value={customOpenAIKey}
                                    onChange={e => setCustomOpenAIKey(e.target.value)}
                                />
                                <p className="text-[10px] text-emerald-600 mt-2 italic">
                                    * Nếu bạn có Key riêng, hãy nhập vào đây để sử dụng không giới hạn. Nếu để trống, hệ thống sẽ dùng Key mặc định (có thể bị giới hạn).
                                </p>
                            </div>
                        )}
                    </section>

                    <div className="h-px bg-slate-100"></div>

                    {/* --- THÔNG TIN HỌC TẬP --- */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 w-8 bg-brand-primary rounded-full"></div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin lớp học & Trường</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Bạn đang học lớp nào?</label>
                                <select 
                                    className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold bg-slate-50"
                                    value={grade} onChange={(e) => setGrade(e.target.value)}
                                >
                                    {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            
                            <SearchableSelect 
                                label="Tỉnh / Thành phố"
                                options={PROVINCES}
                                value={province}
                                onChange={setProvince}
                                placeholder="Chọn tỉnh thành..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect 
                                label="Xã / Phường"
                                options={wardList}
                                value={ward}
                                onChange={setWard}
                                placeholder="Chọn xã hoặc phường..."
                                disabled={!isTuyenQuang}
                            />
                            <SearchableSelect 
                                label="Trường học"
                                options={schoolList}
                                value={school}
                                onChange={setSchool}
                                placeholder="Chọn trường..."
                                disabled={!ward}
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-100"></div>

                    {/* --- THÔNG TIN CÁ NHÂN --- */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngày sinh</label>
                                <input
                                    type="date" required
                                    className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                    value={dob} onChange={(e) => setDob(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giới tính</label>
                                <select 
                                    className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-brand-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                    value={gender} onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {message && (
                        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ShieldCheckIcon className="h-5 w-5" />}
                            {message.text}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('home')}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary-dark shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><ArrowPathIcon className="h-4 w-4 animate-spin" /> Đang lưu...</>
                            ) : (
                                <><CheckCircleIcon className="h-4 w-4" /> Lưu tất cả thay đổi</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsView;
