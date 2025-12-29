
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
    AcademicCapIcon
} from '../../components/icons';

const ALL_GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

const ProfileSettingsView: React.FC = () => {
    const { user, profile, refreshProfile } = useAuth();
    const { navigate } = useNavigation();
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states - Lấy dữ liệu từ profile hoặc metadata làm giá trị mặc định
    const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
    const [dob, setDob] = useState(profile?.date_of_birth || user?.user_metadata?.date_of_birth || '');
    const [gender, setGender] = useState(profile?.gender || user?.user_metadata?.gender || 'Nam');
    // Ưu tiên lấy grade từ metadata nếu profile chưa có cột này
    const [grade, setGrade] = useState(profile?.grade_name || user?.user_metadata?.grade_name || ALL_GRADES[0]);
    const [province, setProvince] = useState(profile?.province || user?.user_metadata?.province || 'Tuyên Quang');
    const [ward, setWard] = useState(profile?.ward_commune || user?.user_metadata?.ward_commune || '');
    const [school, setSchool] = useState(profile?.school_name || user?.user_metadata?.school_name || '');

    const isTuyenQuang = province === 'Tuyên Quang';
    const wardList = useMemo(() => isTuyenQuang ? Object.keys(SCHOOLS_BY_WARD).sort() : [], [isTuyenQuang]);
    const schoolList = useMemo(() => isTuyenQuang && ward ? (SCHOOLS_BY_WARD[ward] || []) : [], [isTuyenQuang, ward]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsLoading(true);
        setMessage(null);
        
        try {
            const updates = {
                full_name: fullName,
                date_of_birth: dob,
                gender,
                province,
                ward_commune: ward,
                school_name: school
            };

            // CHIẾN LƯỢC LƯU TRỮ THÔNG MINH (SMART SAVE STRATEGY)
            // 1. Cố gắng lưu vào bảng 'profiles' (bao gồm cả grade_name)
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ ...updates, grade_name: grade })
                    .eq('id', user.id);

                if (error) throw error;
            } catch (dbError: any) {
                // 2. NẾU LỖI DO THIẾU CỘT (Schema Mismatch)
                // Lỗi thường gặp: "Could not find the 'grade_name' column of 'profiles'"
                if (dbError.message?.includes("Could not find") || dbError.code === 'PGRST204' || dbError.code === '42703') {
                    console.warn("Database schema mismatch detected. Switching to Metadata storage fallback.");
                    
                    // Bước 2a: Lưu các thông tin cơ bản (có cột sẵn) vào profiles
                    const { error: retryError } = await supabase
                        .from('profiles')
                        .update(updates)
                        .eq('id', user.id);
                    
                    if (retryError) throw retryError;

                    // Bước 2b: Lưu 'grade_name' vào User Metadata (Phương án dự phòng an toàn)
                    const { error: metaError } = await supabase.auth.updateUser({
                        data: { grade_name: grade }
                    });
                    
                    if (metaError) throw metaError;
                } else {
                    // Nếu là lỗi khác (mạng, quyền...), ném ra ngoài để hiển thị
                    throw dbError;
                }
            }
            
            // Cập nhật lại context
            await refreshProfile();
            
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công! Thông tin lớp học đã được đồng bộ.' });
            
            // Tự động quay về trang chủ sau 1.5s
            setTimeout(() => navigate('home'), 1500);
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: 'Lỗi: ' + err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl pb-20 animate-scale-in">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Hồ sơ cá nhân' }]} />

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-brand-primary p-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                            <UserCircleIcon className="h-12 w-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Thiết lập tài khoản</h1>
                            <p className="text-indigo-100 text-sm opacity-80">Cập nhật thông tin để AI tối ưu lộ trình học tập cho bạn.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8 sm:p-10 space-y-8">
                    {/* Thông tin học tập - QUAN TRỌNG NHẤT */}
                    <div className="space-y-4">
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
                                <p className="text-[10px] text-indigo-500 font-bold mt-2 ml-1 italic">* Đổi lớp để nhận đúng đề thi từ giáo viên.</p>
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
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* Thông tin cá nhân */}
                    <div className="space-y-4">
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
                    </div>

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
                                <><CheckCircleIcon className="h-4 w-4" /> Lưu thay đổi</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsView;
