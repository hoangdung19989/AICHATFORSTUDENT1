
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { generatePersonalizedLearningPath } from '../../services/geminiService';
import type { LearningPath, DailyTask } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
    CheckCircleIcon, 
    VideoCameraIcon, 
    PencilSquareIcon, 
    RocketLaunchIcon, 
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    ChartBarIcon,
    ArrowPathIcon,
    SparklesIcon
} from '../../components/icons';

const CACHE_KEY = 'ai_learning_path_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 giờ

const PersonalizedDashboard: React.FC = () => {
    const { user, profile } = useAuth();
    const { navigate } = useNavigation();
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeDay, setActiveDay] = useState<number>(1); 

    const weekDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay() || 7; 
        if (day !== 1) monday.setHours(-24 * (day - 1));
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, []);

    const fetchAndGenerate = useCallback(async (forceRefresh = false) => {
        if (!user) return;
        
        setIsLoading(true);
        setError(null);

        try {
            // 1. Kiểm tra Cache trước
            if (!forceRefresh) {
                const cachedData = localStorage.getItem(`${CACHE_KEY}_${user.id}`);
                if (cachedData) {
                    const { path, timestamp } = JSON.parse(cachedData);
                    if (Date.now() - timestamp < CACHE_EXPIRY) {
                        setLearningPath(path);
                        setActiveDay(new Date().getDay() || 7);
                        setIsLoading(false);
                        return;
                    }
                }
            }

            // 2. Thu thập dữ liệu thực tế của học sinh
            const { data: recentAttempts } = await supabase
                .from('question_attempts')
                .select('question_topics, is_correct')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(30);

            if (!recentAttempts || recentAttempts.length === 0) {
                 setLearningPath(null); 
                 setIsLoading(false);
                 return;
            }

            const correctCount = recentAttempts.filter((a: any) => a.is_correct).length;
            const performanceMsg = `Hoàn thành ${recentAttempts.length} câu, tỉ lệ đúng ${Math.round((correctCount/recentAttempts.length)*100)}%`;

            const uniqueTopics = new Set<string>();
            recentAttempts.forEach((a: any) => {
                if (a.question_topics && Array.isArray(a.question_topics)) {
                    a.question_topics.forEach((t: string) => uniqueTopics.add(t));
                }
            });
            
            const focusTopics = Array.from(uniqueTopics).slice(0, 4);
            const studentGrade = profile?.grade_name || user.user_metadata?.grade_name || "Lớp 6";

            // 3. Gọi AI tạo lộ trình
            const path = await generatePersonalizedLearningPath(focusTopics, studentGrade, performanceMsg);
            
            // 4. Lưu Cache
            localStorage.setItem(`${CACHE_KEY}_${user.id}`, JSON.stringify({
                path,
                timestamp: Date.now()
            }));

            setLearningPath(path);
            setActiveDay(new Date().getDay() || 7);

        } catch (err) {
            console.error(err);
            setError("Hệ thống AI đang quá tải. Vui lòng thử lại sau giây lát.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user, profile]);

    useEffect(() => {
        fetchAndGenerate();
    }, [fetchAndGenerate]);

    const activeTaskData = useMemo(() => {
        return learningPath?.weeklyPlan.find(d => d.day === activeDay);
    }, [learningPath, activeDay]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchAndGenerate(true);
    };

    if (isLoading && !isRefreshing) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                 <LoadingSpinner 
                    text="Đang phân tích kết quả học tập..."
                    subText="AI đang thiết kế lộ trình 7 ngày tối ưu cho riêng bạn."
                />
            </div>
        );
    }

    if (!learningPath && !isLoading) {
        return (
            <div className="container mx-auto max-w-4xl animate-scale-in">
                <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Lộ trình' }]} />
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden text-center p-12">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <RocketLaunchIcon className="h-12 w-12 text-indigo-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">Chưa có dữ liệu phân tích</h2>
                    <p className="text-slate-500 mb-10 max-w-md mx-auto">Hãy thực hiện ít nhất 5-10 câu hỏi trong phần <b>Tự luyện</b> để AI có thể hiểu trình độ và tạo lộ trình cho bạn.</p>
                    <button 
                        onClick={() => navigate('self-practice-subjects')}
                        className="bg-brand-primary text-white font-black px-10 py-4 rounded-2xl hover:bg-brand-primary-dark shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        BẮT ĐẦU LUYỆN TẬP NGAY
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Lộ trình AI' }]} />
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center px-5 py-2.5 bg-white border-2 border-indigo-100 rounded-2xl text-indigo-600 hover:bg-indigo-50 font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                    {isRefreshing ? <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" /> : <SparklesIcon className="h-4 w-4 mr-2" />}
                    Cập nhật lộ trình mới
                </button>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Timeline Column */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden sticky top-24">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center">
                                <ClockIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                Kế hoạch tuần này
                            </h3>
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">7 NGÀY</span>
                        </div>
                        
                        <div className="p-2 space-y-1">
                            {learningPath?.weeklyPlan.map((dayPlan, index) => {
                                const date = weekDates[index];
                                const isToday = (new Date().getDay() || 7) === dayPlan.day;
                                const isActive = activeDay === dayPlan.day;
                                const dayName = index === 6 ? "CN" : `T${index + 2}`;

                                return (
                                    <button 
                                        key={dayPlan.day}
                                        onClick={() => setActiveDay(dayPlan.day)}
                                        className={`w-full text-left p-4 rounded-[1.5rem] transition-all duration-300 flex items-center gap-4 ${
                                            isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors ${
                                            isActive ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'
                                        }`}>
                                            <span className="text-[10px] font-black uppercase leading-none">{dayName}</span>
                                            <span className="text-lg font-black leading-none mt-1">{date.getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>{dayPlan.title}</p>
                                            <p className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{dayPlan.description}</p>
                                        </div>
                                        {isToday && !isActive && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Column */}
                <div className="lg:w-2/3 space-y-6">
                    {activeTaskData ? (
                        <div className="animate-slide-up">
                            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                                <div className="p-8 sm:p-10 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest">Ngày {activeDay}</span>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 mb-3">{activeTaskData.title}</h2>
                                    <p className="text-slate-500 leading-relaxed italic">"{activeTaskData.description}"</p>
                                </div>

                                <div className="p-8 sm:p-10 space-y-6">
                                    {activeTaskData.tasks.map((task, idx) => (
                                        <div key={idx} className="group relative flex gap-6">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                                                    task.type === 'video' ? 'bg-sky-500 text-white' : 'bg-amber-500 text-white'
                                                }`}>
                                                    {task.type === 'video' ? <VideoCameraIcon className="w-6 h-6" /> : <PencilSquareIcon className="w-6 h-6" />}
                                                </div>
                                                {idx < activeTaskData.tasks.length - 1 && <div className="w-1 flex-1 bg-slate-100 my-2 rounded-full"></div>}
                                            </div>
                                            
                                            <div className="flex-1 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all group-hover:-translate-y-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                        {task.type === 'video' ? 'KIẾN THỨC MỚI' : 'LUYỆN TẬP THỰC TẾ'}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                        task.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                                                        task.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        Mức độ: {task.difficulty}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-800 mb-4">{task.content}</h4>
                                                <button 
                                                    onClick={() => navigate(task.type === 'video' ? 'lecture-subjects' : 'self-practice-subjects')}
                                                    className="inline-flex items-center text-sm font-black text-indigo-600 hover:text-indigo-800 group/btn"
                                                >
                                                    Thực hiện nhiệm vụ
                                                    <ArrowRightIcon className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-2" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 bg-indigo-50/50 border-t border-indigo-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <ChartBarIcon className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 leading-none">Hoàn thành ngày học?</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Ghi nhận tiến độ vào hồ sơ cá nhân</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Đánh dấu xong</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                            Vui lòng chọn một ngày trong tuần để xem chi tiết
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;
