
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { generateQuiz } from '../../../services/geminiService';
import { useQuiz } from '../../../hooks/useQuiz';
import type { Quiz, TestSubject, TestGrade, TestType, Semester } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from './TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import MathRenderer from '../../../components/common/MathRenderer'; // Import
import { ArrowRightCircleIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ShieldCheckIcon } from '../../../components/icons';

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
            const data = await generateQuiz(subject.name, grade.name, testType, semester);
            setQuizData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    }, [subject.name, grade.name, testType, semester]);

    useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

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
            } catch (err) { console.error("Exception saving exam result:", err); }
        }
    }, [user, profile, subject.name, grade.name, semester, testType]);
    
    const {
        currentQuestion, currentQuestionIndex, selectedAnswer, userAnswers,
        timeLeft, isTimerRunning, handleAnswerSelect, submitExam,
        handleNextQuestion, handlePreviousQuestion, formatTime,
    } = useQuiz({ quizData, onQuizFinish: handleQuizFinish });

    const handleRetake = () => { fetchQuiz(); };

    if (isLoading) {
        return (
            <div>
                <Breadcrumb items={[{ label: 'Kiểm tra', onClick: onBackToSubjects }, { label: subject.name, onClick: onBack }, { label: testType.name }]} />
                <LoadingSpinner text="Đang tải đề thi..." />
            </div>
        );
    }
    
    if (error) return <div className="text-center p-8"><p className="text-red-500">{error}</p><button onClick={fetchQuiz} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Thử lại</button></div>;

    if (showResults && quizData) {
        return <TestResultsView score={finalScore} totalQuestions={quizData.questions.length} onRetake={handleRetake} onBackToSubjects={onBackToSubjects} />;
    }

    if (!quizData || !currentQuestion) return <p>Không có dữ liệu.</p>;

    const answeredCount = Object.keys(userAnswers).length;
    const total = quizData.questions.length;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
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
                        <div className="flex items-center text-xs text-slate-500 font-bold gap-2">
                            <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-600">{formatTime(timeLeft)}</span>
                            <span>Đã làm {answeredCount}/{total}</span>
                        </div>
                     </div>
                     <button onClick={() => { if(window.confirm("Nộp bài ngay?")) submitExam(); }} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Nộp bài</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                    {/* Section Header */}
                    {currentQuestion.section && (
                        <div className="mb-4 text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 p-2 rounded w-fit">
                            {currentQuestion.section}
                        </div>
                    )}

                    {/* Reading Passage */}
                    {currentQuestion.groupContent && (
                        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-sm">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Nội dung bài đọc</div>
                            <MathRenderer content={currentQuestion.groupContent} />
                        </div>
                    )}

                    {currentQuestion.image && <img src={currentQuestion.image} alt="Minh họa" className="max-h-64 object-contain rounded-lg border mb-6 mx-auto" />}
                    
                    <h2 className="text-xl font-bold text-slate-800 mb-8 leading-snug">
                        <span className="text-brand-primary mr-2">Câu {currentQuestionIndex + 1}:</span>
                        <MathRenderer content={currentQuestion.question} />
                    </h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = option === selectedAnswer;
                            return (
                                 <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full text-left flex items-start p-4 rounded-xl border-2 transition-all duration-200 ${
                                        isSelected ? 'bg-indigo-50 border-brand-primary ring-1 ring-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-4 shrink-0 text-sm ${isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className={`text-base pt-1 ${isSelected ? 'text-brand-primary font-bold' : 'text-slate-700'}`}>
                                        <MathRenderer content={option} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between shrink-0">
                    <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-sm transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 inline mr-1" /> Câu trước
                    </button>
                    {currentQuestionIndex < total - 1 ? (
                        <button onClick={handleNextQuestion} className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary-dark shadow-lg transition-all">
                            Câu tiếp theo <ArrowRightCircleIcon className="h-4 w-4 inline ml-1" />
                        </button>
                    ) : (
                        <button onClick={() => submitExam()} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg transition-all">
                            <CheckCircleIcon className="h-4 w-4 inline mr-1" /> Hoàn thành
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizView;
