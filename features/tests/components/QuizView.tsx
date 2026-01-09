
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { generateQuiz } from '../../../services/geminiService';
import { useQuiz } from '../../../hooks/useQuiz';
import type { Quiz, TestSubject, TestGrade, TestType, Semester } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from './TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import MathRenderer from '../../../components/common/MathRenderer';
import { ArrowRightCircleIcon, ArrowLeftIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '../../../components/icons';

interface QuizViewProps {
    subject: TestSubject;
    grade: TestGrade;
    testType: TestType;
    semester: Semester;
    onBack: () => void;
    onBackToSubjects: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ subject, grade, testType, semester, onBack, onBackToSubjects }) => {
    const { user, profile } = useAuth();
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const fetchQuiz = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setShowResults(false);
        try {
            // Đảm bảo truyền đúng thông tin để AI sinh đề
            const data = await generateQuiz(subject.name, grade.name, testType, semester);
            if (!data || !data.questions || data.questions.length === 0) {
                throw new Error("Dữ liệu đề thi không hợp lệ.");
            }
            setQuizData(data);
        } catch (err: any) {
            console.error("Fetch Quiz Error:", err);
            setError(err.message || 'Đã xảy ra lỗi khi tải đề thi từ AI.');
        } finally {
            setIsLoading(false);
        }
    }, [subject.name, grade.name, testType, semester]);

    useEffect(() => { 
        fetchQuiz(); 
    }, [fetchQuiz]);

    const handleQuizFinish = useCallback(async (score: number, total: number) => {
        setFinalScore(score);
        setShowResults(true);
        if (user) {
            try {
                const studentName = user.user_metadata?.full_name || profile?.full_name || user.email?.split('@')[0] || 'Học sinh';
                await supabase.from('exam_results').insert({
                    user_id: user.id,
                    subject_name: subject.name,
                    grade_name: grade.name,
                    score,
                    total_questions: total,
                    exam_type: 'test',
                    metadata: { 
                        semester, 
                        test_type: testType.name,
                        student_name: studentName,
                        student_email: user.email
                    }
                });
            } catch (err) { console.error("Lỗi lưu kết quả:", err); }
        }
    }, [user, profile, subject.name, grade.name, semester, testType]);
    
    const {
        currentQuestion, currentQuestionIndex, selectedAnswer, userAnswers,
        timeLeft, isTimerRunning, handleAnswerSelect, submitExam,
        handleNextQuestion, handlePreviousQuestion, formatTime,
    } = useQuiz({ quizData, onQuizFinish: handleQuizFinish });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center">
                <Breadcrumb items={[{ label: 'Kiểm tra', onClick: onBackToSubjects }, { label: subject.name, onClick: onBack }, { label: testType.name }]} />
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-100">
                    <LoadingSpinner 
                        text="AI đang soạn đề thi cho bạn..." 
                        subText={`Môn ${subject.name} - Khối ${grade.name}`}
                    />
                    <p className="mt-4 text-slate-400 text-sm animate-pulse">Quá trình này có thể mất 10-15 giây...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center animate-scale-in">
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-red-50">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Không thể tải đề thi</h3>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={fetchQuiz} className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-brand-primary-dark transition-all">Thử lại ngay</button>
                        <button onClick={onBack} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Quay lại</button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults && quizData) {
        return <TestResultsView score={finalScore} totalQuestions={quizData.questions.length} onRetake={fetchQuiz} onBackToSubjects={onBackToSubjects} />;
    }

    if (!quizData || !currentQuestion) return null;

    const answeredCount = Object.keys(userAnswers).length;
    const total = quizData.questions.length;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
             <Breadcrumb items={[
                    { label: 'Kiểm tra', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: testType.name, onClick: onBack },
                    { label: semester }
                ]} />
            
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[80vh]">
                <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
                     <div>
                        <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{quizData.title}</h1>
                        <div className="flex items-center text-xs text-slate-500 font-bold gap-4 mt-1">
                            <span className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                                <ClockIcon className="h-3 w-3 mr-1" /> {formatTime(timeLeft)}
                            </span>
                            <span>Tiến độ: {answeredCount}/{total} câu</span>
                        </div>
                     </div>
                     <button 
                        onClick={() => { if(window.confirm("Bạn muốn nộp bài ngay?")) submitExam(); }} 
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                        Nộp bài
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-white">
                    {currentQuestion.section && (
                        <div className="mb-4 text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 p-2 rounded w-fit border border-indigo-100">
                            {currentQuestion.section}
                        </div>
                    )}

                    {currentQuestion.groupContent && (
                        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-sm shadow-inner">
                            <div className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Nội dung dữ liệu</div>
                            <MathRenderer content={currentQuestion.groupContent} />
                        </div>
                    )}
                    
                    <h2 className="text-xl font-bold text-slate-800 mb-8 leading-snug">
                        <span className="text-indigo-600 mr-2">Câu {currentQuestionIndex + 1}:</span>
                        <MathRenderer content={currentQuestion.question} />
                    </h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = option === selectedAnswer;
                            const label = String.fromCharCode(65 + index);
                            return (
                                 <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full text-left flex items-start p-5 rounded-2xl border-2 transition-all duration-200 group ${
                                        isSelected 
                                        ? 'bg-indigo-50 border-brand-primary ring-1 ring-indigo-200' 
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className={`w-9 h-9 flex items-center justify-center rounded-xl font-black mr-4 shrink-0 transition-colors ${
                                        isSelected ? 'bg-brand-primary text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                    }`}>
                                        {label}
                                    </span>
                                    <span className={`text-lg pt-1 flex-1 ${isSelected ? 'text-brand-primary font-bold' : 'text-slate-700 font-medium'}`}>
                                        <MathRenderer content={option} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <button 
                        onClick={handlePreviousQuestion} 
                        disabled={currentQuestionIndex === 0} 
                        className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 disabled:opacity-30 transition-all flex items-center text-sm"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Câu trước
                    </button>
                    
                    <div className="hidden sm:flex gap-1">
                        {quizData.questions.map((_, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentQuestionIndex ? 'bg-indigo-600 scale-125' : userAnswers[idx] ? 'bg-indigo-200' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>

                    {currentQuestionIndex < total - 1 ? (
                        <button 
                            onClick={handleNextQuestion} 
                            className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary-dark shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center"
                        >
                            Tiếp tục <ArrowRightCircleIcon className="h-5 w-5 ml-2" />
                        </button>
                    ) : (
                        <button 
                            onClick={() => submitExam()} 
                            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center animate-pulse"
                        >
                            <CheckCircleIcon className="h-5 w-5 mr-2" /> Hoàn thành bài thi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizView;
