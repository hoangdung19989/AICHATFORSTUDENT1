
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { generateQuiz } from '../../../services/geminiService';
import { useQuiz } from '../../../hooks/useQuiz';
import type { Quiz, TestSubject, TestGrade, TestType, Semester } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from './TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowRightCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ShieldCheckIcon } from '../../../components/icons';

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
            // Cập nhật: Truyền semester vào hàm generateQuiz
            const data = await generateQuiz(subject.name, grade.name, testType, semester);
            setQuizData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
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
                // Lấy tên học sinh để lưu vào metadata
                const studentName = 
                    user.user_metadata?.full_name || 
                    profile?.full_name || 
                    user.email?.split('@')[0] || 
                    'Học sinh';

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
                        student_name: studentName, // LƯU CỨNG TÊN VÀO ĐÂY
                        student_email: user.email
                    }
                });
            } catch (err) {
                 console.error("Exception saving exam result:", err);
            }
        }
    }, [user, profile, subject.name, grade.name, semester, testType]);
    
    const {
        currentQuestion, currentQuestionIndex, selectedAnswer, isAnswered, 
        timeLeft, isTimerRunning, handleAnswerSelect, 
        handleNextQuestion, formatTime, progress,
    } = useQuiz({ quizData, onQuizFinish: handleQuizFinish });

    const handleRetake = () => { fetchQuiz(); };

    const cleanOptionText = (text: string) => text.replace(/^[A-D]\.\s*/, '').replace(/^\d+\.\s*/, '');
    
    if (isLoading) {
        return (
            <div>
                <Breadcrumb items={[
                    { label: 'Kiểm tra', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: testType.name, onClick: onBack },
                    { label: semester }
                ]} />
                <LoadingSpinner text="Đang trích xuất đề thi từ hệ thống..." subText={`Truy cập ngân hàng đề thi quốc gia môn ${subject.name}...`} />
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircleIcon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Không thể tải đề thi</h3>
                <p className="text-slate-500 my-4 max-w-md mx-auto">{error}</p>
                <button onClick={fetchQuiz} className="bg-brand-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-primary-dark transition-all">Thử lại</button>
            </div>
        );
    }

    if (showResults && quizData) {
        return <TestResultsView score={finalScore} totalQuestions={quizData.questions.length} onRetake={handleRetake} onBackToSubjects={onBackToSubjects} />;
    }

    if (!quizData || !currentQuestion) return <p>Không có dữ liệu.</p>;

    const isUserCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
             <Breadcrumb items={[
                    { label: 'Kiểm tra', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: testType.name, onClick: onBack },
                    { label: semester }
                ]} />
            
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-6 pt-6 pb-2">
                    <div className="flex justify-between items-start mb-6">
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center">
                                <ShieldCheckIcon className="h-3 w-3 mr-1" /> NGÂN HÀNG ĐỀ QUỐC GIA
                            </span>
                            <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{quizData.title}</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Nguồn: {quizData.sourceSchool}</p>
                         </div>
                         <div className={`flex flex-col items-center px-4 py-2 rounded-2xl text-white transition-colors duration-300 ${isTimerRunning && timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
                            <span className="text-[9px] font-black uppercase mb-0.5">Còn lại</span>
                            <span className="font-mono text-xl leading-none">{formatTime(timeLeft)}</span>
                         </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <div className="bg-brand-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>

                    <p className="text-slate-400 font-bold text-[10px] uppercase">Tiến độ: {currentQuestionIndex + 1}/{quizData.questions.length} Câu</p>
                </div>

                <div className="p-6 sm:p-10">
                    {/* Render Image Illustration if available */}
                    {currentQuestion.image && (
                        <div className="mb-6 flex justify-center">
                            <img 
                                src={currentQuestion.image} 
                                alt="Hình minh họa" 
                                className="max-h-64 object-contain rounded-lg border border-slate-200"
                            />
                        </div>
                    )}

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-10 leading-snug">{currentQuestion.question}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrect = option === currentQuestion.correctAnswer;
                            const isSelected = option === selectedAnswer;
                            const optionLabel = String.fromCharCode(65 + index);
                            const optionText = cleanOptionText(option);

                            let buttonClass = 'border-slate-100 bg-white hover:border-brand-primary hover:bg-slate-50';
                            if (isAnswered) {
                                if (isCorrect) buttonClass = 'bg-green-50 border-green-500 ring-2 ring-green-100';
                                else if (isSelected) buttonClass = 'bg-red-50 border-red-500 ring-2 ring-red-100';
                                else buttonClass = 'opacity-40 grayscale border-slate-50';
                            }

                            return (
                                 <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                    className={`w-full text-left flex items-start p-5 rounded-2xl border-2 transition-all duration-300 group ${buttonClass}`}
                                >
                                    <span className={`text-lg font-black mr-4 flex-shrink-0 leading-tight ${isAnswered && isCorrect ? 'text-green-600' : 'text-slate-300 group-hover:text-brand-primary'}`}>
                                        {optionLabel}.
                                    </span>
                                    <span className={`text-lg leading-tight ${isAnswered && isCorrect ? 'text-green-900 font-bold' : 'text-slate-700'}`}>
                                        {optionText}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                
                    {isAnswered && (
                        <div className={`mt-10 p-6 rounded-2xl border-2 animate-scale-in ${
                            isUserCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
                        }`}>
                            <h4 className={`text-sm font-black mb-2 flex items-center uppercase tracking-wider ${
                                isUserCorrect ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {isUserCorrect ? 'Giải thích chính xác' : 'Hướng dẫn kiến thức'}
                            </h4>
                            <p className={`${isUserCorrect ? 'text-green-700' : 'text-red-700'} leading-relaxed text-sm`}>
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleNextQuestion}
                        disabled={!isAnswered}
                        className={`flex items-center px-10 py-4 rounded-2xl font-black transition-all duration-300 uppercase tracking-widest text-xs ${
                            !isAnswered 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-xl shadow-indigo-100 hover:-translate-y-1'
                        }`}
                    >
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'Nộp bài ngay' : 'Câu tiếp theo'}
                        <ArrowRightCircleIcon className="h-5 w-5 ml-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizView;
