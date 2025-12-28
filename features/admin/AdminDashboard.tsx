
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableSelect from '../../components/common/SearchableSelect'; // Import component mới
import type { UserProfile } from '../../types/user';
import { PROVINCES, SCHOOLS_BY_WARD } from '../../data/schools';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    UserCircleIcon, 
    AcademicCapIcon, 
    PencilSquareIcon, 
    KeyIcon,
    UserGroupIcon,
    ClockIcon,
    ShieldCheckIcon,
    BriefcaseIcon,
    ArrowRightCircleIcon,
    EnvelopeIcon,
    TowerIcon 
} from '../../components/icons';

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center transition-all hover:shadow-md duration-200">
        <div className={`p-3 sm:p-4 rounded-xl ${color} bg-opacity-15 mr-4 flex-shrink-0`}>
            <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider truncate">{title}</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">{value}</h3>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const { navigate } = useNavigation();
    const { profile, user, isLoading: isAuthLoading } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // Filters State
    const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student' | 'admin'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Location Filters State
    const [filterProvince, setFilterProvince] = useState('');
    const [filterWard, setFilterWard] = useState('');
    const [filterSchool, setFilterSchool] = useState('');

    const [error, setError] = useState<string | null>(null);

    // Derived Data for Dropdowns
    const isTuyenQuangFilter = filterProvince === 'Tuyên Quang';
    const availableWards = useMemo(() => isTuyenQuangFilter ? Object.keys(SCHOOLS_BY_WARD).sort() : [], [isTuyenQuangFilter]);
    const availableSchools = useMemo(() => (isTuyenQuangFilter && filterWard) ? (SCHOOLS_BY_WARD[filterWard] || []) : [], [isTuyenQuangFilter, filterWard]);

    // Reset child filters when parent changes
    useEffect(() => { setFilterWard(''); setFilterSchool(''); }, [filterProvince]);
    useEffect(() => { setFilterSchool(''); }, [filterWard]);

    const fetchUsers = useCallback(async () => {
        setIsLoadingData(true);
        setError(null);
        try {
            const { data, error } = await supabase.rpc('get_all_profiles');
            if (error) {
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (fallbackError) throw fallbackError;
                setUsers(fallbackData as UserProfile[]);
            } else {
                setUsers(data as UserProfile[]);
            }
        } catch (err: any) {
            setError("Lỗi tải dữ liệu: " + err.message);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthLoading) return;
        const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
        if (isAdmin) fetchUsers();
        else navigate('home');
    }, [isAuthLoading, profile, user, navigate, fetchUsers]);

    const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'blocked') => {
        try {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
            if (error) { fetchUsers(); throw error; }
        } catch (err: any) { alert(`Lỗi cập nhật: ${err.message}`); }
    };

    const handleUpdateRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
        if (!window.confirm(`Đổi vai trò người dùng này thành ${newRole}?`)) return;
        try {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            const { error: rpcError } = await supabase.rpc('update_user_role', { target_user_id: userId, new_role: newRole });
            if (rpcError) {
                const { error: tableError } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
                if (tableError) throw tableError;
            }
        } catch (err: any) { alert(`Lỗi: ${err.message}`); fetchUsers(); }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesRole = filterRole === 'all' || u.role === filterRole;
            const matchesSearch = 
                (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
            
            const matchesProvince = !filterProvince || u.province === filterProvince;
            const matchesWard = !filterWard || u.ward_commune === filterWard;
            const matchesSchool = !filterSchool || u.school_name === filterSchool;

            return matchesRole && matchesSearch && matchesProvince && matchesWard && matchesSchool;
        });
    }, [users, filterRole, searchQuery, filterProvince, filterWard, filterSchool]);

    const stats = useMemo(() => ({
        total: users.length,
        teachers: users.filter(u => u.role === 'teacher').length,
        students: users.filter(u => u.role === 'student').length,
        admins: users.filter(u => u.role === 'admin').length,
        pending: users.filter(u => u.status === 'pending').length,
    }), [users]);

    if (isAuthLoading) return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="container mx-auto max-w-6xl px-2 sm:px-4 pb-24 lg:pb-10">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Quản trị hệ thống' }]} />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Bảng điều khiển Admin</h1>
                    <p className="text-slate-500 text-sm">Quản lý người dùng và phê duyệt tài khoản.</p>
                </div>
                <button 
                    onClick={fetchUsers}
                    className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all text-sm font-bold"
                >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Làm mới dữ liệu
                </button>
            </div>

            {/* Stat Cards Grid - Responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard title="Tổng số" value={stats.total} icon={UserGroupIcon} color="bg-blue-500" />
                <StatCard title="Quản trị" value={stats.admins} icon={ShieldCheckIcon} color="bg-red-500" />
                <StatCard title="Giáo viên" value={stats.teachers} icon={PencilSquareIcon} color="bg-purple-500" />
                <StatCard title="Chờ duyệt" value={stats.pending} icon={ClockIcon} color="bg-amber-500" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header with Search & Filters */}
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
                    
                    {/* Top Row: Title & Search & Role Tabs */}
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                        <h2 className="text-lg font-bold text-slate-800">Danh sách người dùng</h2>
                        
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 sm:min-w-[250px]">
                                <input 
                                    type="text" 
                                    placeholder="Tìm email hoặc tên..." 
                                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex bg-slate-200/50 p-1 rounded-xl overflow-x-auto custom-scrollbar">
                                {(['all', 'admin', 'teacher', 'student'] as const).map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setFilterRole(r)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            filterRole === r 
                                            ? 'bg-white text-slate-800 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {r === 'all' ? 'Tất cả' : r === 'admin' ? 'Admin' : r === 'teacher' ? 'GV' : 'HS'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Location Filters with Searchable Select */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/50">
                        <SearchableSelect 
                            placeholder="-- Tất cả Tỉnh/Thành --"
                            options={PROVINCES}
                            value={filterProvince}
                            onChange={setFilterProvince}
                        />

                        <SearchableSelect 
                            placeholder="-- Tất cả Xã/Phường (Tuyên Quang) --"
                            options={availableWards}
                            value={filterWard}
                            onChange={setFilterWard}
                            disabled={!isTuyenQuangFilter}
                        />

                        <SearchableSelect 
                            placeholder="-- Tất cả Trường học --"
                            options={availableSchools}
                            value={filterSchool}
                            onChange={setFilterSchool}
                            disabled={!filterWard}
                        />
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="py-20"><LoadingSpinner /></div>
                ) : (
                    <>
                        {/* DESKTOP TABLE VIEW */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Người dùng</th>
                                        <th className="px-6 py-4">Đơn vị công tác/Học tập</th>
                                        <th className="px-6 py-4">Vai trò</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${u.role === 'admin' ? 'bg-red-500' : u.role === 'teacher' ? 'bg-purple-500' : 'bg-brand-primary'}`}>
                                                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : <UserCircleIcon className="h-6 w-6" />}
                                                    </div>
                                                    <div className="ml-3 min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 truncate">{u.full_name || 'N/A'}</p>
                                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{u.school_name || 'Chưa cập nhật'}</span>
                                                    {(u.ward_commune || u.province) && (
                                                        <span className="text-[10px] text-slate-400">
                                                            {u.ward_commune ? `${u.ward_commune}, ` : ''}{u.province}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'teacher' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className={`h-2 w-2 rounded-full mr-2 ${u.status === 'active' ? 'bg-green-500' : u.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-xs font-medium text-slate-600 capitalize">{u.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {u.id !== user?.id && (
                                                    <>
                                                        {u.status === 'pending' && (
                                                            <button onClick={() => handleUpdateStatus(u.id, 'active')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><CheckCircleIcon className="h-5 w-5" /></button>
                                                        )}
                                                        <button onClick={() => handleUpdateStatus(u.id, u.status === 'blocked' ? 'active' : 'blocked')} className={`p-2 rounded-lg ${u.status === 'blocked' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                                            {u.status === 'blocked' ? <KeyIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD VIEW */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredUsers.map((u) => (
                                <div key={u.id} className="p-4 bg-white hover:bg-slate-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center min-w-0">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${u.role === 'admin' ? 'bg-red-500' : u.role === 'teacher' ? 'bg-purple-500' : 'bg-brand-primary'}`}>
                                                {u.full_name ? u.full_name.charAt(0).toUpperCase() : <UserCircleIcon className="h-7 w-7" />}
                                            </div>
                                            <div className="ml-3 overflow-hidden">
                                                <p className="text-sm font-bold text-slate-800 truncate">{u.full_name || 'Người dùng mới'}</p>
                                                <div className="flex items-center text-xs text-slate-400 mt-0.5">
                                                    <EnvelopeIcon className="h-3 w-3 mr-1 shrink-0" />
                                                    <span className="truncate">{u.email}</span>
                                                </div>
                                                {(u.school_name || u.province) && (
                                                    <div className="flex items-center text-xs text-slate-500 mt-1">
                                                        <TowerIcon className="h-3 w-3 mr-1 shrink-0" />
                                                        <span className="truncate">{u.school_name || u.province}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'teacher' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'}`}>
                                                {u.role}
                                            </span>
                                            <div className={`text-[10px] font-bold ${u.status === 'active' ? 'text-green-500' : u.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>
                                                ● {u.status}
                                            </div>
                                        </div>
                                    </div>

                                    {u.id !== user?.id && (
                                        <div className="flex gap-2 mt-4">
                                            {u.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(u.id, 'active')}
                                                    className="flex-1 flex items-center justify-center py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold shadow-sm"
                                                >
                                                    <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Phê duyệt
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleUpdateStatus(u.id, u.status === 'blocked' ? 'active' : 'blocked')}
                                                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                                                    u.status === 'blocked' 
                                                    ? 'bg-sky-50 border-sky-200 text-sky-600' 
                                                    : 'bg-red-50 border-red-200 text-red-600'
                                                }`}
                                            >
                                                {u.status === 'blocked' ? (
                                                    <><KeyIcon className="h-4 w-4 mr-1.5" /> Mở khóa</>
                                                ) : (
                                                    <><XCircleIcon className="h-4 w-4 mr-1.5" /> Khóa TK</>
                                                )}
                                            </button>
                                            
                                            {/* Role Switcher Button for Mobile */}
                                            <button 
                                                onClick={() => {
                                                    const nextRole = u.role === 'student' ? 'teacher' : 'student';
                                                    handleUpdateRole(u.id, nextRole as any);
                                                }}
                                                className="flex-1 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold"
                                            >
                                                Lên {u.role === 'student' ? 'GV' : 'HS'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {filteredUsers.length === 0 && (
                            <div className="py-20 text-center text-slate-400 italic text-sm">
                                Không tìm thấy người dùng nào phù hợp.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Simple ArrowPathIcon if missing from icons.tsx
const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

export default AdminDashboard;
