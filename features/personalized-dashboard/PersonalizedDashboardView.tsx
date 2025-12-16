
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { generatePersonalizedLearningPath } from '../../services/geminiService';
// FIX: Corrected import path for types
import type { LearningPath, DailyTask } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CheckCircleIcon, VideoCameraIcon, PencilSquareIcon, RocketLaunchIcon, ClockIcon } from '../../components/icons';

const PersonalizedDashboard: React.FC = () => {
    const { user } = useAuth();
    const { navigate } = useNavigation();
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeDay, setActiveDay] = useState<number>(1); 

    // Helper to get week dates
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

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchActivityAndGeneratePath = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 1. Fetch RECENT activity (Attempts) - Not just incorrect ones
                // We want to know what the student is currently studying to build a path around it.
                const { data: recentAttempts, error: attemptsError } = await supabase
                    .from('question_attempts')
                    .select('question_topics, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (attemptsError) throw attemptsError;

                // 2. Fetch RECENT Exam Results to determine Grade
                const { data: examResults, error: examsError } = await supabase
                    .from('exam_results')
                    .select('grade_name, subject_name')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Determine Grade Context (Default to Lớp 6 if unknown, as user requested interest)
                const detectedGrade = examResults?.grade_name || "Lớp 6";

                // 3. Extract Focus Topics
                // We prioritize topics from the most recent attempts
                const uniqueTopics = new Set<string>();
                (recentAttempts || []).forEach(a => {
                    if (a.question_topics && Array.isArray(a.question_topics)) {
                        a.question_topics.forEach((t: string) => uniqueTopics.add(t));
                    }
                });
                
                const focusTopics = Array.from(uniqueTopics).slice(0, 3); // Top 3 recent topics

                if (focusTopics.length === 0) {
                     // If no data, maybe generate a generic path for Grade 6 Math (starting point)
                     setLearningPath(null); 
                     return;
                }

                // 4. Generate learning path
                const path = await generatePersonalizedLearningPath(focusTopics, detectedGrade);
                setLearningPath(path);

                // Set active day based on today (Monday = 1, etc.)
                const currentDayIndex = (new Date().getDay() || 7);
                setActiveDay(currentDayIndex);

            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Không thể tạo lộ trình học tập.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivityAndGeneratePath();
    }, [user]);
    
    const activeTaskData = useMemo(() => {
        return learningPath?.weeklyPlan.find(d => d.day === activeDay);
    }, [learningPath, activeDay]);


    if (!user) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-slate-700">Vui lòng đăng nhập</h2>
                <p className="text-slate-500 mt-2 mb-4">Bạn cần đăng nhập để AI có thể tạo lộ trình học tập cá nhân hóa.</p>
                <button onClick={() => navigate('login')} className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-500 transition-colors">
                    Đến trang Đăng nhập
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div>
                 <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Lộ trình của tôi' }]} />
                <LoadingSpinner 
                    text="AI đang thiết kế hành trình học tập cho bạn..."
                    subText="Đang phân tích bài học gần nhất để tạo kế hoạch 7 ngày."
                />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">{error}</div>;
    }
    
    if (!learningPath) {
         return (
            <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="bg-sky-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RocketLaunchIcon className="h-12 w-12 text-sky-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mt-4">Bắt đầu hành trình!</h2>
                <p className="text-slate-500 mt-3 mb-8 max-w-md mx-auto">
                    AI chưa có đủ dữ liệu về việc học của bạn. Hãy thử làm một bài luyện tập hoặc kiểm tra (ví dụ: Toán Lớp 6) để AI xây dựng kế hoạch cho tuần tới nhé!
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('self-study')} className="bg-sky-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-sky-500 transition-all hover:-translate-y-1 shadow-md">
                        Học bài ngay
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl pb-12">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Lộ trình của tôi' }]} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Hành trình chinh phục tri thức</h1>
                    <p className="text-indigo-100 text-lg">
                        Dựa trên kết quả học tập gần đây: 
                        <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded ml-2">
                            {learningPath.studentWeaknesses.join(", ")}
                        </span>
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-64 w-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar / Day Selection */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2 text-indigo-500" />
                            Lịch trình tuần này
                        </div>
                        <div className="divide-y divide-slate-100">
                            {learningPath.weeklyPlan.map((dayPlan, index) => {
                                const date = weekDates[index];
                                const isToday = (new Date().getDay() || 7) === dayPlan.day;
                                const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                                const dayName = index === 6 ? "CN" : `Thứ ${index + 2}`;

                                return (
                                    <button 
                                        key={dayPlan.day}
                                        onClick={() => setActiveDay(dayPlan.day)}
                                        className={`w-full text-left p-4 transition-all duration-200 flex items-center space-x-4 hover:bg-slate-50 ${activeDay === dayPlan.day ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${activeDay === dayPlan.day ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                            <span className="text-xs font-bold uppercase">{dayName}</span>
                                            <span className="text-lg font-bold">{date.getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold truncate ${activeDay === dayPlan.day ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                {dayPlan.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 truncate">{dayPlan.description}</p>
                                        </div>
                                        {isToday && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Hôm nay</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Task Details */}
                <div className="lg:w-2/3">
                     {activeTaskData ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-scale-in">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{activeTaskData.title}</h2>
                                <p className="text-slate-600 italic">"{activeTaskData.description}"</p>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {activeTaskData.tasks.map((task, index) => (
                                    <div key={index} className="flex group relative pl-8 pb-6 last:pb-0 border-l-2 border-slate-200 last:border-transparent">
                                        {/* Timeline connector */}
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${task.type === 'video' ? 'bg-sky-100 border-sky-500' : 'bg-orange-100 border-orange-500'} z-10`}></div>
                                        
                                        <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                    task.type === 'video' ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {task.type === 'video' ? <VideoCameraIcon className="w-3 h-3 mr-1" /> : <PencilSquareIcon className="w-3 h-3 mr-1" />}
                                                    {task.type === 'video' ? 'Xem & Học' : 'Thực hành'}
                                                </span>
                                                {task.difficulty && (
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                                        task.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                        task.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {task.difficulty}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">{task.content}</h3>
                                            
                                            <button 
                                                onClick={() => {
                                                    // Simple navigation logic based on type
                                                    if (task.type === 'video') navigate('lecture-subjects');
                                                    else navigate('self-practice-subjects');
                                                }}
                                                className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
                                            >
                                                Bắt đầu ngay <span className="ml-1">→</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     ) : (
                        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center text-slate-400">
                            <p>Chọn một ngày để xem nhiệm vụ chi tiết.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;
