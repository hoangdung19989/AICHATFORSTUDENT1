
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { generateMockExam } from '../../../services/geminiService';
import { useQuiz } from '../../../hooks/useQuiz';
// FIX: Corrected import path for types to resolve module error.
import type { Quiz, MockExamSubject, TestGrade } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from '../../tests/components/TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowRightCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PencilSquareIcon } from '../../../components/icons';

interface MockExamViewProps {
    subject: MockExamSubject;
    grade: TestGrade;
    initialQuizData: Quiz | null; // NEW PROP
    onBack: () => void;
    onBackToSubjects: () => void;
}

const MockExamView: React.FC<MockExamViewProps> = ({ subject, grade, initialQuizData, onBack, onBackToSubjects }) => {
    const { user } = useAuth();
    const [quizData, setQuizData] = useState<Quiz | null>(initialQuizData);
    const [isLoading, setIsLoading] = useState(!initialQuizData); // Only load if no initial data
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const fetchExam = useCallback(async () => {
        // If we already have data (from teacher), don't fetch AI
        if (initialQuizData) return;

        setIsLoading(true);
        setError(null);
        setShowResults(false);
        try {
            const data = await generateMockExam(subject.name, grade.name);
            setQuizData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    }, [subject.name, grade.name, initialQuizData]);

    useEffect(() => {
        fetchExam();
    }, [fetchExam]);

    const handleQuizFinish = useCallback(async (score: number, total: number) => {
        setFinalScore(score);
        setShowResults(true);
        if (user) {
            try {
                const { error: dbError } = await supabase.from('exam_results').insert({
                    user_id: user.id,
                    subject_name: subject.name,
                    grade_name: grade.name,
                    score,
                    total_questions: total,
                    exam_type: 'mock',
                });
                if (dbError) console.error("Failed to save exam result:", dbError.message);
            } catch (err) {
                 console.error("Exception saving exam result:", err);
            }
        }
    }, [user, subject.name, grade.name]);
    
     const {
        currentQuestion, currentQuestionIndex, selectedAnswer, isAnswered, 
        timeLeft, isTimerRunning, handleAnswerSelect, 
        handleNextQuestion, formatTime, progress,
    } = useQuiz({ quizData, onQuizFinish: handleQuizFinish });

    const handleRetake = () => {
        // If it was a teacher exam, just reset UI (useQuiz handles internal reset when data changes, but here data is same)
        // Ideally, we should remount or reset quiz state. 
        // For simplicity, we just reload the fetch or re-use initial data.
        window.location.reload(); // Simple reload for now to reset everything cleanly
    };

    // Helper to clean option text
    const cleanOptionText = (text: string) => {
        return text.replace(/^[A-D]\.\s*/, '').replace(/^\d+\.\s*/, '');
    };
    
    if (isLoading) {
        return (
            <div>
                <Breadcrumb items={[
                    { label: 'Thi thử', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: grade.name }
                ]} />
                <LoadingSpinner text="AI đang tạo đề thi thử..." subText="Đề thi thử có thể mất nhiều thời gian hơn để tạo. Vui lòng kiên nhẫn." color="amber"/>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-red-600">Lỗi tạo đề thi thử</h3>
                <p className="text-slate-600 my-4">{error}</p>
                <button onClick={fetchExam} className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-500">Thử lại</button>
            </div>
        );
    }

    if (showResults && quizData) {
        return <TestResultsView score={finalScore} totalQuestions={quizData.questions.length} onRetake={handleRetake} onBackToSubjects={onBackToSubjects} />;
    }

    if (!quizData || !currentQuestion) {
        return <p>Không có dữ liệu bài thi.</p>;
    }

    const isUserCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
             <Breadcrumb items={[
                 { label: 'Thi thử', onClick: onBackToSubjects },
                 { label: subject.name, onClick: onBack },
                 { label: grade.name }
             ]} />
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex justify-between items-center text-sm font-medium mb-4">
                         <span className="text-slate-500 font-bold">{quizData.title || quizData.sourceSchool}</span>
                         <div className={`flex items-center px-3 py-1 rounded-full text-white space-x-2 transition-colors duration-300 ${isTimerRunning && timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-mono text-base">{formatTime(timeLeft)}</span>
                         </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                        <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>

                    <p className="text-slate-500 font-semibold text-sm">Câu {currentQuestionIndex + 1}/{quizData.questions.length}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8 leading-snug">{currentQuestion.question}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrect = option === currentQuestion.correctAnswer;
                            const isSelected = option === selectedAnswer;
                            const optionLabel = String.fromCharCode(65 + index);
                            const optionText = cleanOptionText(option);

                            let buttonClass = 'border-slate-300 bg-white hover:border-sky-400 hover:bg-sky-50';
                            let textClass = 'text-slate-700';
                            let labelClass = 'text-slate-500';

                            if (isAnswered) {
                                if (isCorrect) {
                                    buttonClass = 'bg-green-50 border-green-500 ring-1 ring-green-500';
                                    textClass = 'text-green-900 font-medium';
                                    labelClass = 'text-green-700 font-bold';
                                } else if (isSelected) {
                                    buttonClass = 'bg-red-50 border-red-500 ring-1 ring-red-500';
                                    textClass = 'text-red-900 font-medium';
                                    labelClass = 'text-red-700 font-bold';
                                } else {
                                    buttonClass = 'border-slate-200 bg-slate-50 opacity-60';
                                    textClass = 'text-slate-500';
                                }
                            }

                            return (
                                 <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                    className={`w-full text-left flex items-start p-4 rounded-xl border transition-all duration-200 group ${buttonClass}`}
                                >
                                    <span className={`text-lg font-bold mr-4 flex-shrink-0 leading-tight ${labelClass} ${!isAnswered && 'group-hover:text-brand-blue'}`}>
                                        {optionLabel}.
                                    </span>
                                    <span className={`text-lg leading-tight ${textClass}`}>
                                        {optionText}
                                    </span>
                                    {isAnswered && isCorrect && <CheckCircleIcon className="h-6 w-6 ml-auto flex-shrink-0 text-green-600" />}
                                    {isAnswered && isSelected && !isCorrect && <XCircleIcon className="h-6 w-6 ml-auto flex-shrink-0 text-red-600" />}
                                </button>
                            );
                        })}
                    </div>
                
                    {isAnswered && (
                        <div className={`mt-8 p-5 rounded-xl border animate-slide-in-bottom ${
                            isUserCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                            <h4 className={`font-bold mb-2 flex items-center ${
                                isUserCorrect ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {isUserCorrect ? (
                                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                                )}
                                Giải thích
                            </h4>
                            <p className={`${isUserCorrect ? 'text-green-700' : 'text-red-700'} leading-relaxed`}>
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleNextQuestion}
                        disabled={!isAnswered}
                        className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                            !isAnswered 
                            ? 'bg-slate-200 text-white cursor-not-allowed' 
                            : 'bg-brand-blue text-white hover:bg-brand-blue-dark shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                    >
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'Nộp bài Trắc nghiệm' : 'Câu tiếp theo'}
                        <ArrowRightCircleIcon className="h-5 w-5 ml-2" />
                    </button>
                </div>
            </div>

            {/* Essay Section (Always visible at the bottom) */}
            {quizData.essayQuestions && quizData.essayQuestions.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
                    <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-center">
                        <PencilSquareIcon className="h-6 w-6 text-orange-600 mr-2" />
                        <h3 className="font-bold text-orange-800 text-lg">PHẦN TỰ LUẬN</h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <p className="text-blue-800 text-sm">
                                <strong>Lưu ý:</strong> Hãy đọc đề bài dưới đây và làm bài chi tiết ra giấy kiểm tra. 
                                Phần này không chấm điểm trên hệ thống nhưng rất quan trọng để rèn luyện kỹ năng trình bày.
                            </p>
                        </div>
                        <div className="space-y-6">
                            {quizData.essayQuestions.map((q, idx) => (
                                <div key={idx} className="pb-4 border-b border-slate-100 last:border-0">
                                    <p className="font-bold text-slate-800 mb-2">Câu {idx + 1}:</p>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{q.question}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockExamView;
