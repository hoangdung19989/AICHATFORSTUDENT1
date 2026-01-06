
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuiz } from '../../../hooks/useQuiz';
// FIX: Corrected import path for types
import type { Quiz, SelfPracticeSubject, TestGrade, PracticeLesson } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from '../../tests/components/TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowRightCircleIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '../../../components/icons';

interface PracticeViewProps {
    subject: SelfPracticeSubject;
    grade: TestGrade;
    lesson: PracticeLesson;
    quizData: Quiz | null;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
    onBack: () => void;
    onBackToSubjects: () => void;
    onBackToSelfStudy: () => void;
}

const PracticeView: React.FC<PracticeViewProps> = (props) => {
    const { subject, grade, lesson, quizData, isLoading, error, onRetry, onBack, onBackToSubjects, onBackToSelfStudy } = props;
    const { user, profile } = useAuth();
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const handleQuizFinish = async (score: number, total: number) => {
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

                const { error } = await supabase.from('exam_results').insert({
                    user_id: user.id,
                    subject_name: subject.name,
                    grade_name: grade.name,
                    score,
                    total_questions: total,
                    exam_type: 'practice',
                    metadata: {
                        student_name: studentName, // LƯU CỨNG TÊN
                        student_email: user.email,
                        lesson_title: lesson.title
                    }
                });
                if (error) {
                    console.error("Failed to save practice result:", error.message);
                }
            } catch (err) {
                 console.error("Exception saving practice result:", err);
            }
        }
    };
    
    const {
        currentQuestion, currentQuestionIndex, selectedAnswer, isAnswered, 
        isQuizFinished, handleAnswerSelect, handleNextQuestion, score
    } = useQuiz({ quizData, onQuizFinish: handleQuizFinish });

    useEffect(() => {
        if (isQuizFinished) {
            setShowResults(true);
            setFinalScore(score);
        }
    }, [isQuizFinished, score]);


    const handleRetake = () => {
        setShowResults(false);
        onRetry();
    };

    // Helper to remove prefixes like "A. ", "B. ", "1. " from options if the AI generated them
    const cleanOptionText = (text: string) => {
        return text.replace(/^[A-D]\.\s*/, '').replace(/^\d+\.\s*/, '');
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                 <Breadcrumb items={[
                    { label: 'Tự học', onClick: onBackToSelfStudy },
                    { label: 'Tự luyện', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: grade.name, onClick: onBack },
                    { label: 'Luyện tập' }
                ]} />
                <div className="bg-white rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center">
                    <LoadingSpinner text="AI đang soạn thảo bài luyện tập..." subText={`Đang trích xuất kiến thức bài: ${lesson.title}`} />
                </div>
            </div>
        );
    }
    
    // Xử lý trường hợp có dữ liệu nhưng mảng câu hỏi rỗng
    const hasNoQuestions = !isLoading && quizData && quizData.questions.length === 0;

    if (error || hasNoQuestions) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6 animate-scale-in">
                <Breadcrumb items={[
                    { label: 'Tự học', onClick: onBackToSelfStudy },
                    { label: 'Tự luyện', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: grade.name, onClick: onBack },
                    { label: 'Luyện tập' }
                ]} />
                <div className="bg-white rounded-[2.5rem] shadow-xl p-12 text-center border-2 border-red-50">
                    <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Ối! Có lỗi xảy ra</h3>
                    <p className="text-slate-500 mb-10 max-w-md mx-auto">
                        {error || "Hệ thống AI không thể tạo câu hỏi cho bài học này ngay bây giờ. Điều này có thể do máy chủ đang bận."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={onRetry} 
                            className="bg-brand-primary text-white font-black px-8 py-4 rounded-2xl hover:bg-brand-primary-dark shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                            THỬ LẠI LẦN NỮA
                        </button>
                        <button 
                            onClick={onBack} 
                            className="bg-slate-100 text-slate-600 font-black px-8 py-4 rounded-2xl hover:bg-slate-200 transition-all"
                        >
                            CHỌN BÀI KHÁC
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults && quizData) {
        return <TestResultsView score={finalScore} totalQuestions={quizData.questions.length} onRetake={handleRetake} onBackToSubjects={onBackToSubjects} />;
    }

    if (!quizData || !currentQuestion) {
        return null; // Đang chuyển trạng thái
    }
    
    const progressPercent = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    const isUserCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
            <Breadcrumb items={[
                { label: 'Tự học', onClick: onBackToSelfStudy },
                { label: 'Tự luyện', onClick: onBackToSubjects },
                { label: subject.name, onClick: onBack },
                { label: grade.name, onClick: onBack },
                { label: 'Luyện tập' }
            ]} />

            {/* Main Quiz Card */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                {/* Header Section */}
                <div className="px-8 pt-8 pb-4 bg-slate-50/50">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                        <span className="bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">{quizData.sourceSchool || subject.name}</span>
                        <span className="text-brand-primary">Đang luyện tập bài học</span>
                    </div>

                    <h1 className="text-lg font-bold text-slate-700 mb-6 text-center">{lesson.title}</h1>

                    {/* Progress Bar */}
                    <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-2 shadow-inner">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-primary to-indigo-400 transition-all duration-700 ease-out rounded-full" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-slate-400 font-black text-[10px] uppercase">Tiến trình: {currentQuestionIndex + 1}/{quizData.questions.length} Câu</p>
                        {isAnswered && (
                            <span className={`text-[10px] font-black uppercase ${isUserCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                {isUserCorrect ? 'Chính xác! +1' : 'Tiếc quá!'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 sm:p-12">
                    {/* Illustration */}
                    {currentQuestion.image && (
                        <div className="mb-10 flex justify-center">
                            <img 
                                src={currentQuestion.image} 
                                alt="Hình minh họa" 
                                className="max-h-64 object-contain rounded-3xl border-4 border-slate-50 shadow-lg"
                            />
                        </div>
                    )}

                    <div className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
                            {currentQuestion.question}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrect = option === currentQuestion.correctAnswer;
                            const isSelected = option === selectedAnswer;
                            const optionLabel = String.fromCharCode(65 + index);
                            const optionText = cleanOptionText(option);

                            let buttonClass = 'border-slate-100 bg-white hover:border-brand-primary hover:bg-indigo-50/30';
                            let textClass = 'text-slate-600';
                            let labelClass = 'bg-slate-100 text-slate-400';

                            if (isAnswered) {
                                if (isCorrect) {
                                    buttonClass = 'bg-green-50 border-green-500 ring-4 ring-green-100';
                                    textClass = 'text-green-900 font-bold';
                                    labelClass = 'bg-green-500 text-white';
                                } else if (isSelected) {
                                    buttonClass = 'bg-red-50 border-red-500 ring-4 ring-red-100';
                                    textClass = 'text-red-900 font-bold';
                                    labelClass = 'bg-red-500 text-white';
                                } else {
                                    buttonClass = 'border-slate-50 bg-white opacity-40 grayscale';
                                    textClass = 'text-slate-400';
                                    labelClass = 'bg-slate-50 text-slate-200';
                                }
                            }

                            return (
                                 <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                    className={`w-full text-left flex items-center p-5 rounded-2xl border-2 transition-all duration-300 group ${buttonClass}`}
                                >
                                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black mr-4 flex-shrink-0 transition-colors ${labelClass}`}>
                                        {optionLabel}
                                    </span>
                                    <span className={`text-lg flex-1 ${textClass}`}>
                                        {optionText}
                                    </span>
                                    {isAnswered && isCorrect && <CheckCircleIcon className="h-6 w-6 ml-3 text-green-600 shrink-0" />}
                                    {isAnswered && isSelected && !isCorrect && <XCircleIcon className="h-6 w-6 ml-3 text-red-600 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                
                    {isAnswered && (
                        <div className={`mt-10 p-6 rounded-[2rem] border-2 animate-scale-in ${
                            isUserCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
                        }`}>
                            <h4 className={`text-xs font-black mb-3 flex items-center uppercase tracking-widest ${
                                isUserCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {isUserCorrect ? (
                                    <><CheckCircleIcon className="h-4 w-4 mr-2" /> Tại sao bạn đúng?</>
                                ) : (
                                    <><XCircleIcon className="h-4 w-4 mr-2" /> Ghi nhớ kiến thức</>
                                )}
                            </h4>
                            <p className={`${isUserCorrect ? 'text-green-800' : 'text-red-800'} leading-relaxed text-sm font-medium`}>
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex justify-end items-center gap-6">
                    <button
                        onClick={handleNextQuestion}
                        disabled={!isAnswered}
                        className={`flex items-center px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
                            !isAnswered 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-xl shadow-indigo-100 hover:-translate-y-1 active:translate-y-0'
                        }`}
                    >
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'Hoàn thành bài tập' : 'Câu tiếp theo'}
                        <ArrowRightCircleIcon className="h-5 w-5 ml-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PracticeView;
