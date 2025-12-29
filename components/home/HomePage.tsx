import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { supabase } from '../../services/supabaseClient';
import { 
    AcademicCapIcon, 
    RocketLaunchIcon, 
    ChatBubbleBottomCenterTextIcon, 
    PencilSquareIcon, 
    DocumentTextIcon, 
    ClockIcon, 
    KeyIcon,
    BriefcaseIcon,
    ArrowRightIcon,
    CheckCircleIcon
} from '../icons';
import FeatureCard from '../common/FeatureCard';
import LoadingSpinner from '../common/LoadingSpinner';

const HomePage: React.FC = () => {
    const { user, profile } = useAuth();
    const { navigate } = useNavigation();
    const [assignedExams, setAssignedExams] = useState<any[]>([]);
    // FIX: Added missing myExams state used for teacher statistics
    const [myExams, setMyExams] = useState<any[]>([]);
    const [isLoadingExams, setIsLoadingExams] = useState(false);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'bạn';
    const role = profile?.role || user?.user_metadata?.role;
    const isTeacher = role === 'teacher';
    const isAdmin = role === 'admin';
    const isStudent = role === 'student' || !role;

    // Lấy thông tin lớp của học sinh từ profile
    const studentGrade = profile?.grade_name || "Lớp 6";

    useEffect(() => {
        if (user) {
            if (isStudent) {
                fetchAssignedExams();
            }
            // FIX: Trigger teacher exams fetch if the user is a teacher
            if (isTeacher) {
                fetchTeacherExams();
            }
        }
    }, [isStudent, isTeacher, user, studentGrade]);

    // FIX: Function to fetch exams created by the teacher to populate myExams state
    const fetchTeacherExams = async () => {
        try {
            const { data, error } = await supabase
                .from('teacher_exams')
                .select('id')
                .eq('teacher_id', user?.id);
            
            if (!error && data) {
                setMyExams(data);
            }
        } catch (err) {
            console.error("Lỗi lấy thống kê giáo viên:", err);
        }
    };

    const fetchAssignedExams = async () => {
        setIsLoadingExams(true);
        try {
            // Lấy tất cả đề thi có trạng thái published khớp với khối lớp học sinh
            const { data, error } = await supabase
                .from('teacher_exams')
                .select('*, exam_results(id, user_id)')
                .eq('status', 'published')
                .eq('grade', studentGrade)
                .order('deadline', { ascending: true })
                .limit(5);
            
            if (!error && data) {
                setAssignedExams(data);
            }
        } catch (err) {
            console.error("Lỗi lấy đề thi:", err);
        } finally {
            setIsLoadingExams(false);
        }
    };

    const handleStartExam = (exam: any) => {
        // "Đẩy" học sinh thẳng vào màn hình làm bài
        navigate('mock-exam-view', { 
            examId: exam.id,
            subjectName: exam.subject,
            gradeName: exam.grade,
            directStart: true // Cờ báo hiệu cho MockExamFlow bỏ qua chọn khối lớp
        });
    };

    return (
        <div className="animate-slide-up pb-10">
            <div className="mb-10">
                <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight">
                    Xin chào, <span className="text-brand-primary">{userName}</span> 👋
                </h1>
                <p className="mt-3 text-slate-500 text-lg max-w-2xl">
                    {isAdmin ? 'Hệ thống đang hoạt động ổn định.' : 
                     isTeacher ? 'Chào mừng trở lại. Hôm nay thầy/cô muốn chuẩn bị bài giảng hay đẩy đề thi nào?' : 
                     'Bạn có nhiệm vụ bài tập mới từ giáo viên đấy, kiểm tra ngay nhé!'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isAdmin && (
                        <FeatureCard 
                            icon={KeyIcon}
                            title="Quản trị hệ thống"
                            description="Quản lý người dùng và phê duyệt giáo viên."
                            color="bg-red-500"
                            onClick={() => navigate('admin-dashboard')}
                        />
                    )}

                    {isStudent && (
                        <>
                            <FeatureCard 
                                icon={AcademicCapIcon}
                                title="Tự học thông minh"
                                description="Hệ thống bài giảng video và bài tập tự luyện đồng bộ SGK."
                                color="bg-indigo-500"
                                onClick={() => navigate('self-study')}
                            />
                            <FeatureCard 
                                icon={RocketLaunchIcon}
                                title="Lộ trình cá nhân"
                                description="AI thiết kế kế hoạch ôn tập riêng dựa trên điểm số của bạn."
                                color="bg-purple-500"
                                onClick={() => navigate('personalized-dashboard')}
                            />
                        </>
                    )}

                    {isTeacher && (
                        <>
                             <FeatureCard 
                                icon={PencilSquareIcon}
                                title="Công cụ AI soạn bài"
                                description="Tạo giáo án, đề thi từ ma trận trong 30 giây."
                                color="bg-indigo-500"
                                onClick={() => navigate('teacher-dashboard')}
                            />
                            <FeatureCard 
                                icon={DocumentTextIcon}
                                title="Giao bài & Theo dõi"
                                description="Quản lý đề thi và xem báo cáo vi phạm, điểm số học sinh."
                                color="bg-orange-500"
                                onClick={() => navigate('exam-manager')}
                            />
                        </>
                    )}

                     <FeatureCard 
                        icon={ChatBubbleBottomCenterTextIcon}
                        title={isTeacher ? "Hỗ trợ chuyên môn" : "Gia sư AI 24/7"}
                        description="Hỏi bất cứ điều gì về kiến thức bài học để được AI giải đáp."
                        color="bg-teal-500"
                        onClick={() => navigate('ai-subjects')}
                    />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {isStudent && (
                        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center">
                                    <BriefcaseIcon className="h-5 w-5 mr-2 text-orange-500" />
                                    Nhiệm vụ từ giáo viên
                                </h3>
                                {assignedExams.filter(e => !e.exam_results?.some((r: any) => r.user_id === user?.id)).length > 0 && (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">Cần làm</span>
                                )}
                            </div>
                            <div className="p-4 space-y-3">
                                {isLoadingExams ? (
                                    <div className="py-4 text-center"><LoadingSpinner text="" /></div>
                                ) : assignedExams.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-slate-400 text-sm italic">Thầy cô chưa đẩy nhiệm vụ mới cho khối lớp của bạn.</p>
                                    </div>
                                ) : (
                                    assignedExams.map(exam => {
                                        const isDone = exam.exam_results?.some((r: any) => r.user_id === user?.id);
                                        const deadline = new Date(exam.deadline);
                                        const isExpired = deadline < new Date();
                                        
                                        return (
                                            <button 
                                                key={exam.id}
                                                onClick={() => handleStartExam(exam)}
                                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                                    isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-brand-primary hover:shadow-md'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className={`font-bold text-sm truncate ${isDone ? 'text-slate-500' : 'text-slate-800'}`}>{exam.title}</p>
                                                    <div className="flex items-center mt-1 space-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        <span className="text-brand-primary">{exam.subject}</span>
                                                        <span>•</span>
                                                        <span className={isExpired ? 'text-red-500' : ''}>
                                                            Hạn: {deadline.toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                                                    isDone ? 'bg-green-100 text-green-600' : 'bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white'
                                                }`}>
                                                    {isDone ? <CheckCircleIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-4 w-4" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {isTeacher && (
                        <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Thống kê giảng dạy</h3>
                                <div className="space-y-4 mt-6">
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                        <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Đã đẩy</p>
                                        <p className="text-3xl font-black mt-1">{myExams.length}</p>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                        <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Lượt nộp bài mới</p>
                                        <p className="text-3xl font-black mt-1">--</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('exam-results-viewer')}
                                    className="w-full mt-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all text-sm"
                                >
                                    Xem báo cáo chi tiết
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;