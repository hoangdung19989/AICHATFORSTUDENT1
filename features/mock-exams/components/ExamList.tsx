
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import Breadcrumb from '../../../components/common/Breadcrumb';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BriefcaseIcon, SparklesIcon, ChevronRightIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '../../../components/icons';

interface ExamListProps {
    subject: { id: string, name: string };
    grade: { id: string, name: string };
    onSelectExam: (examData: any, examId?: string) => void;
    onGenerateRandom: () => void;
    onBack: () => void;
    onBackToSubjects: () => void;
}

const ExamList: React.FC<ExamListProps> = ({ subject, grade, onSelectExam, onGenerateRandom, onBack, onBackToSubjects }) => {
    const { user } = useAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, [subject.name, grade.name]);

    const fetchExams = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('teacher_exams')
                .select(`
                    *,
                    exam_results(id, user_id)
                `)
                .eq('subject', subject.name)
                .eq('grade', grade.name)
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            
            if (!error && data) setExams(data);
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTeacherExam = (exam: any) => {
        const isExpired = new Date(exam.deadline) < new Date();
        if (isExpired) {
            alert("Kỳ thi này đã hết hạn, bạn không thể tham gia.");
            return;
        }

        const userResult = exam.exam_results?.find((r: any) => r.user_id === user?.id);
        const isDone = !!userResult;

        if (isDone) {
            if (!window.confirm("Bạn đã nộp bài này. Bạn có muốn làm lại để cải thiện điểm số?")) return;
        }

        const dbContent: any = exam.questions;
        let finalQuestions = dbContent.questions || [];
        let examTitle = exam.title;

        if (dbContent.variants && Array.isArray(dbContent.variants) && dbContent.variants.length > 0) {
            const randomIndex = Math.floor(Math.random() * dbContent.variants.length);
            const selectedVariant = dbContent.variants[randomIndex];
            finalQuestions = selectedVariant.questions || []; 
            examTitle = `${exam.title} (Mã đề: ${selectedVariant.code})`;
        }

        onSelectExam({
            sourceSchool: "Đề thi Giáo viên",
            title: examTitle,
            timeLimit: "45 phút",
            questions: finalQuestions,
            essayQuestions: dbContent.essayQuestions || []
        }, exam.id);
    };

    if (isLoading) return <div className="py-20"><LoadingSpinner text="Đang tìm đề thi từ giáo viên..." /></div>;

    return (
        <div className="container mx-auto max-w-5xl animate-scale-in">
            <Breadcrumb items={[{ label: 'Thi thử', onClick: onBackToSubjects }, { label: subject.name, onClick: onBack }, { label: grade.name }]} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <BriefcaseIcon className="w-7 h-7 mr-3 text-orange-500" />
                        Đề thi giáo viên đã giao
                    </h2>
                    
                    {exams.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                            <p className="text-slate-400">Hiện tại thầy cô chưa đẩy đề thi nào cho mục này.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {exams.map(exam => {
                                const isExpired = new Date(exam.deadline) < new Date();
                                const isDone = exam.exam_results && exam.exam_results.some((r: any) => r.user_id === user?.id);
                                
                                return (
                                    <button
                                        key={exam.id}
                                        onClick={() => !isExpired && handleSelectTeacherExam(exam)}
                                        className={`w-full text-left p-6 bg-white border-2 rounded-3xl transition-all flex items-center justify-between group ${
                                            isExpired 
                                            ? 'opacity-50 grayscale cursor-not-allowed border-slate-100' 
                                            : 'border-white shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1'
                                        }`}
                                    >
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className={`text-xl font-bold ${isExpired ? 'text-slate-400' : 'text-slate-800 group-hover:text-orange-600'}`}>
                                                    {exam.title} {isExpired && '(Đã hết hạn)'}
                                                </h3>
                                                {isDone && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md">ĐÃ NỘP</span>}
                                            </div>
                                            <div className="flex items-center text-sm font-medium space-x-4">
                                                <span className={`flex items-center ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                                                    <ClockIcon className="w-4 h-4 mr-1.5" />
                                                    Hạn: {new Date(exam.deadline).toLocaleDateString('vi-VN')}
                                                </span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-slate-400">{exam.subject}</span>
                                            </div>
                                        </div>
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                                            isExpired 
                                            ? 'bg-slate-100 text-slate-300' 
                                            : 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                                        }`}>
                                            <ChevronRightIcon className="w-6 h-6" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-3xl shadow-2xl sticky top-24">
                        <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Luyện thi với AI</h2>
                        <p className="mb-8 text-indigo-100 text-sm leading-relaxed">
                            Yêu cầu AI thiết kế riêng một đề thi thử ngẫu nhiên bám sát chương trình học để ôn luyện thêm.
                        </p>
                        <button
                            onClick={onGenerateRandom}
                            className="w-full py-4 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                        >
                            TỰ TẠO ĐỀ THI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamList;
