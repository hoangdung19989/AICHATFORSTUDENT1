
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import type { TeacherExam, MockExamSubject, TestGrade } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BriefcaseIcon, SparklesIcon, ChevronRightIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '../../../components/icons';

interface ExamListProps {
    subject: MockExamSubject;
    grade: TestGrade;
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
        // Lấy đề thi và kiểm tra xem user hiện tại đã làm chưa
        const { data, error } = await supabase
            .from('teacher_exams')
            .select(`
                *,
                exam_results(id)
            `)
            .eq('subject', subject.name)
            .eq('grade', grade.name)
            .eq('status', 'published')
            .eq('exam_results.user_id', user?.id)
            .order('created_at', { ascending: false });
        
        if (!error && data) setExams(data);
        setIsLoading(false);
    };

    const handleSelectTeacherExam = (exam: any) => {
        const isExpired = new Date(exam.deadline) < new Date();
        if (isExpired) {
            alert("Đợt thi này đã kết thúc vào " + new Date(exam.deadline).toLocaleString('vi-VN'));
            return;
        }
        if (exam.exam_results && exam.exam_results.length > 0) {
            if (!window.confirm("Bạn đã hoàn thành bài thi này. Bạn có muốn làm lại để cải thiện điểm số không?")) return;
        }

        const dbContent: any = exam.questions;
        let finalQuestions = dbContent.questions || [];
        let examTitle = exam.title;

        // Logic chọn mã đề ngẫu nhiên nếu có variants
        if (dbContent.variants && Array.isArray(dbContent.variants) && dbContent.variants.length > 0) {
            const randomIndex = Math.floor(Math.random() * dbContent.variants.length);
            const selectedVariant = dbContent.variants[randomIndex];
            finalQuestions = selectedVariant.questions;
            examTitle = `${exam.title} (Mã đề: ${selectedVariant.code})`;
        }

        const quizData = {
            sourceSchool: "Đề thi Giáo viên",
            title: examTitle,
            timeLimit: "45 phút", // Hoặc lấy từ db nếu có trường timeLimit
            questions: finalQuestions,
            essayQuestions: dbContent.essayQuestions || []
        };
        // Pass exam.id to parent
        onSelectExam(quizData, exam.id);
    };

    if (isLoading) return <LoadingSpinner text="Đang tải danh sách đề thi..." />;

    return (
        <div className="container mx-auto max-w-5xl">
            <Breadcrumb items={[{ label: 'Thi thử', onClick: onBackToSubjects }, { label: subject.name, onClick: onBack }, { label: grade.name }]} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1 & 2: Teacher Exams */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <BriefcaseIcon className="w-7 h-7 mr-3 text-orange-500" />
                        Đề thi từ Giáo viên giao
                    </h2>
                    
                    {exams.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 italic">Hiện chưa có đợt thi nào được giao cho bạn.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {exams.map(exam => {
                                const isExpired = new Date(exam.deadline) < new Date();
                                const isDone = exam.exam_results && exam.exam_results.length > 0;
                                const hasVariants = exam.questions?.variants?.length > 1;
                                
                                return (
                                    <button
                                        key={exam.id}
                                        onClick={() => handleSelectTeacherExam(exam)}
                                        className={`w-full text-left p-6 bg-white border-2 rounded-3xl transition-all flex items-center justify-between group ${isExpired ? 'opacity-60 border-slate-100 grayscale' : 'border-white shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1'}`}
                                    >
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className={`text-xl font-bold ${isExpired ? 'text-slate-500' : 'text-slate-800 group-hover:text-orange-600'}`}>{exam.title}</h3>
                                                {isDone && <span className="flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md"><CheckCircleIcon className="w-3 h-3 mr-1" /> ĐÃ NỘP</span>}
                                                {!isDone && hasVariants && <span className="flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md"><SparklesIcon className="w-3 h-3 mr-1" /> TRỘN ĐỀ</span>}
                                            </div>
                                            <div className="flex items-center text-sm font-medium space-x-4">
                                                <span className={`flex items-center ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>
                                                    <ClockIcon className="w-4 h-4 mr-1.5" />
                                                    {isExpired ? 'Đã hết hạn' : `Hạn nộp: ${new Date(exam.deadline).toLocaleDateString('vi-VN')}`}
                                                </span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-slate-400">Môn: {exam.subject}</span>
                                            </div>
                                        </div>
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${isExpired ? 'bg-slate-100 text-slate-300' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'}`}>
                                            {isExpired ? <XCircleIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Column 3: AI Tool */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-3xl shadow-2xl sticky top-24">
                        <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Tự luyện với AI</h2>
                        <p className="mb-8 text-indigo-100 leading-relaxed">
                            Thầy cô chưa giao đề? Bạn có thể tự yêu cầu AI thiết kế một đề thi thử ngẫu nhiên theo đúng khối lớp và môn học của mình.
                        </p>
                        <button
                            onClick={onGenerateRandom}
                            className="w-full py-4 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                        >
                            TẠO ĐỀ NGẪU NHIÊN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamList;
