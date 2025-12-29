
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigation } from '../../contexts/NavigationContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ChartBarIcon, ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon, UserGroupIcon } from '../../components/icons';

const ExamResultsViewer: React.FC = () => {
    const { navigate, params } = useNavigation();
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Nếu params có examId, tức là giáo viên đang xem kết quả của 1 đợt thi cụ thể
    const filterExamId = params?.examId;
    const filterTitle = params?.examTitle;

    const fetchResults = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('exam_results')
                .select(`
                    *,
                    profiles:user_id (full_name, email, school_name, grade_name)
                `)
                .order('created_at', { ascending: false });

            // LOGIC LỌC QUAN TRỌNG: Chỉ hiện kết quả của đề thi này
            if (filterExamId) {
                query = query.eq('exam_id', filterExamId);
            } else {
                // Nếu xem tổng quát (không có filterExamId), ta chỉ nên xem các bài thi "mock" (thi thử) 
                // hoặc bài thi do giáo viên này tạo (cần logic phức tạp hơn ở backend).
                // Tạm thời hiển thị tất cả để giáo viên có cái nhìn tổng quan.
            }

            const { data, error } = await query;
            if (error) throw error;
            setResults(data || []);
        } catch (err) {
            console.error("Lỗi lấy kết quả thi:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [filterExamId]);

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Quản lý đề', onClick: () => navigate('exam-manager') }, { label: 'Báo cáo kết quả' }]} />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
                        <UserGroupIcon className="h-9 w-9 mr-3 text-rose-500" />
                        {filterTitle ? `Thí sinh: ${filterTitle}` : 'Tất cả kết quả làm bài'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {filterExamId ? 'Danh sách học sinh đã nộp bài cho đề thi này.' : 'Theo dõi tình hình làm bài chung của học sinh.'}
                    </p>
                </div>
                <button onClick={fetchResults} className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all text-sm font-bold text-slate-600">
                    <ArrowPathIcon className="h-4 w-4 mr-2" /> Làm mới
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="py-20"><LoadingSpinner text="Đang thống kê dữ liệu..." /></div>
                ) : results.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic flex flex-col items-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <UserGroupIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <p>Chưa có học sinh nào nộp bài cho đề thi này.</p>
                        <p className="text-xs mt-2">Hãy nhắc nhở học sinh vào mục "Thi thử" để làm bài.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-5">Học sinh</th>
                                    <th className="px-6 py-5">Trường / Lớp</th>
                                    <th className="px-6 py-5">Điểm số</th>
                                    <th className="px-6 py-5">Thời gian nộp</th>
                                    <th className="px-6 py-5">Tình trạng</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.map((res) => {
                                    const isCheating = res.metadata?.is_cheating;
                                    const scorePercent = (res.score / res.total_questions) * 100;
                                    const profile = res.profiles || {};
                                    
                                    return (
                                        <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-3">
                                                        {profile.full_name?.charAt(0) || 'H'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{profile.full_name || 'Học sinh ẩn danh'}</p>
                                                        <p className="text-[10px] text-slate-400">{profile.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-700">{profile.school_name || 'Chưa cập nhật'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">{profile.grade_name || res.grade_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-base font-black ${scorePercent >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {res.score}/{res.total_questions}
                                                    </span>
                                                    <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                                                        <div className={`h-full ${scorePercent >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${scorePercent}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[10px] text-slate-500 font-medium">{new Date(res.created_at).toLocaleDateString('vi-VN')}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(res.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isCheating ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold uppercase ring-1 ring-red-100">
                                                        <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" /> Gian lận ({res.metadata?.violations || 1} lần)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold uppercase ring-1 ring-green-100">
                                                        <CheckCircleIcon className="h-3.5 w-3.5 mr-1" /> Hợp lệ
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamResultsViewer;
