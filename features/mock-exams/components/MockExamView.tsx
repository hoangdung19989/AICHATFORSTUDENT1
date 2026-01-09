
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { generateMockExam } from '../../../services/geminiService';
import { useQuiz } from '../../../hooks/useQuiz';
import type { Quiz, MockExamSubject, TestGrade } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from '../../tests/components/TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowRightCircleIcon, ArrowLeftIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon } from '../../../components/icons';

interface MockExamViewProps {
    subject: MockExamSubject;
    grade: TestGrade;
    initialQuizData: Quiz | null;
    examId?: string;
    onBack: () => void;
    onBackToSubjects: () => void;
}

const MockExamView: React.FC<MockExamViewProps> = ({ subject, grade, initialQuizData, examId, onBack, onBackToSubjects }) => {
    const { user, profile } = useAuth();
    const [quizData, setQuizData] = useState<Quiz | null>(initialQuizData);
    const [isLoading, setIsLoading] = useState(!initialQuizData);
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [isExpired, setIsExpired] = useState(false);
    
    // Anti-cheat states
    const [violations, setViolations] = useState(0);
    const [showCheatWarning, setShowCheatWarning] = useState(false);
    const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkDeadline = async () => {
            if (!examId) return;
            try {
                const { data } = await supabase.from('teacher_exams').select('deadline').eq('id', examId).single();
                if (data?.deadline && new Date(data.deadline) < new Date()) {
                    setIsExpired(true);
                }
            } catch (e) { console.error("Deadline check failed", e); }
        };
        checkDeadline();
    }, [examId]);

    const fetchExam = useCallback(async () => {
        if (initialQuizData) return;
        setIsLoading(true);
        setShowResults(false);
        try {
            const data = await generateMockExam(subject.name, grade.name);
            setQuizData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [subject.name, grade.name, initialQuizData]);

    useEffect(() => { fetchExam(); }, [fetchExam]);

    const handleQuizFinish = useCallback(async (score: number, total: number, cheatDetected: boolean = false) => {
        setFinalScore(score);
        setShowResults(true);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        
        if (user) {
            try {
                const studentName = user.user_metadata?.full_name || profile?.full_name || user.email?.split('@')[0] || 'Học sinh';
                const basePayload = {
                    user_id: user.id,
                    subject_name: subject.name,
                    grade_name: grade.name,
                    score,
                    total_questions: total,
                    exam_type: 'mock',
                    metadata: { 
                        student_name: studentName,
                        student_email: user.email,
                        violations: violations + (cheatDetected ? 1 : 0),
                        is_cheating: cheatDetected || violations >= 1,
                        auto_submitted: cheatDetected,
                        exam_id: examId 
                    }
                };

                if (examId) {
                    const { data: existing } = await supabase.from('exam_results').select('id, score').eq('user_id', user.id).eq('exam_id', examId).maybeSingle();
                    if (existing) {
                        if (score >= existing.score) {
                            await supabase.from('exam_results').update({ ...basePayload, exam_id: examId }).eq('id', existing.id);
                        }
                    } else {
                        await supabase.from('exam_results').insert({ ...basePayload, exam_id: examId });
                    }
                } else {
                    await supabase.from('exam_results').insert(basePayload);
                }
            } catch (err) { console.error("Error saving results:", err); }
        }
    }, [user, profile, subject.name, grade.name, violations, examId]);

    const {
        currentQuestion, currentQuestionIndex, selectedAnswer, 
        timeLeft, handleAnswerSelect, submitExam,
        handleNextQuestion, handlePreviousQuestion, formatTime, userAnswers, score
    } = useQuiz({ quizData, onQuizFinish: (s, t) => handleQuizFinish(s, t) });

    useEffect(() => {
        if (isLoading || showResults || !quizData || isExpired) return;
        const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') triggerViolation(); };
        const handleBlur = () => triggerViolation();
        const triggerViolation = () => {
            if (showResults || isAutoSubmitted) return;
            setViolations(prev => {
                const next = prev + 1;
                if (next === 1) setShowCheatWarning(true);
                else if (next >= 2) {
                    setIsAutoSubmitted(true);
                    handleQuizFinish(score, quizData.questions.length, true);
                }
                return next;
            });
        };
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isLoading, showResults, quizData, score, handleQuizFinish, isAutoSubmitted, isExpired]);

    const enterFullscreen = () => {
        if (containerRef.current) containerRef.current.requestFullscreen().catch(err => console.warn(err.message));
    };

    if (isExpired) return <div className="p-20 text-center"><h2 className="text-2xl font-bold text-red-600">Đã hết thời gian làm bài.</h2><button onClick={onBackToSubjects} className="mt-4 underline">Quay lại</button></div>;
    if (isLoading) return <div className="container mx-auto p-20"><LoadingSpinner text="Đang tải đề thi..." /></div>;

    if (showResults && quizData) {
        return (
            <div className="container mx-auto max-w-4xl">
                {isAutoSubmitted && <div className="mb-6 bg-red-600 text-white p-4 rounded-xl">BÀI THI ĐÃ BỊ NỘP TỰ ĐỘNG DO VI PHẠM QUY CHẾ.</div>}
                <TestResultsView 
                    score={finalScore} 
                    totalQuestions={quizData.questions.length} 
                    onRetake={() => window.location.reload()} 
                    onBackToSubjects={onBackToSubjects}
                    hideDetails={quizData.sourceSchool === "Đề thi Giáo viên"}
                />
            </div>
        );
    }

    if (!quizData || !currentQuestion) return <p>Lỗi dữ liệu.</p>;

    // Tính toán số câu đã làm
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = quizData.questions.length;

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto px-4 py-6 bg-slate-50 min-h-screen relative overflow-y-auto">
            {!document.fullscreenElement && !showResults && (
                <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-md">
                    <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400 mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Chế độ Phòng thi</h2>
                    <p className="text-lg text-slate-300 max-w-md mb-8">Vui lòng bật chế độ toàn màn hình để bắt đầu. Nếu thoát ra quá 2 lần, bài thi sẽ tự động nộp.</p>
                    <button onClick={enterFullscreen} className="bg-brand-primary hover:bg-brand-primary-dark text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-all">Vào phòng thi</button>
                </div>
            )}

            {showCheatWarning && !isAutoSubmitted && (
                <div className="fixed inset-0 z-[110] bg-red-600/95 flex items-center justify-center p-6 text-white text-center">
                    <div className="max-w-md">
                        <h2 className="text-3xl font-bold mb-4">CẢNH BÁO GIAN LẬN!</h2>
                        <p className="mb-8">Bạn vừa rời khỏi màn hình. Đây là lần cảnh báo duy nhất.</p>
                        <button onClick={() => { setShowCheatWarning(false); enterFullscreen(); }} className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold">Tiếp tục làm bài</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h1 className="font-bold text-slate-800 text-lg truncate max-w-md">{quizData.title || 'Đề thi'}</h1>
                        <div className="flex items-center text-xs text-slate-500 mt-1 gap-3">
                            <span className="flex items-center"><ClockIcon className="h-3 w-3 mr-1" /> {formatTime(timeLeft)}</span>
                            <span>•</span>
                            <span>Đã làm: {answeredCount}/{totalQuestions}</span>
                        </div>
                    </div>
                    <button onClick={() => { if(window.confirm("Bạn chắc chắn muốn nộp bài?")) submitExam(); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-sm">
                        Nộp bài
                    </button>
                </div>

                {/* Question Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                    {currentQuestion.image && (
                        <div className="mb-6 flex justify-center">
                            <img src={currentQuestion.image} alt="Question" className="max-h-60 rounded-lg border" />
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-slate-800 mb-8 leading-snug">
                        <span className="text-brand-primary mr-2">Câu {currentQuestionIndex + 1}:</span>
                        {currentQuestion.question}
                    </h2>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = option === selectedAnswer;
                            const label = String.fromCharCode(65 + index);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full text-left flex items-start p-4 rounded-xl border-2 transition-all duration-200 ${
                                        isSelected 
                                        ? 'bg-indigo-50 border-brand-primary ring-1 ring-indigo-200' 
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 text-sm shrink-0 transition-colors ${
                                        isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>{label}</span>
                                    <span className={`text-base pt-1 ${isSelected ? 'text-brand-primary font-medium' : 'text-slate-700'}`}>{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                    <button 
                        onClick={handlePreviousQuestion} 
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent font-bold text-sm transition-all"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Câu trước
                    </button>

                    {/* Quick navigation dots (hidden on mobile small) */}
                    <div className="hidden md:flex gap-1 overflow-x-auto max-w-xs px-2 no-scrollbar">
                        {quizData.questions.map((_, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentQuestionIndex ? 'bg-brand-primary scale-125' : userAnswers[idx] ? 'bg-indigo-300' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>

                    {currentQuestionIndex < totalQuestions - 1 ? (
                        <button 
                            onClick={handleNextQuestion}
                            className="flex items-center px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary-dark shadow-md transition-all"
                        >
                            Câu tiếp theo <ArrowRightCircleIcon className="h-4 w-4 ml-2" />
                        </button>
                    ) : (
                        <button 
                            onClick={() => { if(window.confirm("Bạn đã hoàn thành và muốn nộp bài?")) submitExam(); }}
                            className="flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md transition-all animate-pulse"
                        >
                            <CheckCircleIcon className="h-4 w-4 mr-2" /> Hoàn thành
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockExamView;
