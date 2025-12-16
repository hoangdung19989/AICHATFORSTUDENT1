
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { generateQuiz } from '../../../services/geminiService';
import { useQuiz } from '../../../hooks/useQuiz';
// FIX: Corrected import path for types to resolve module error.
import type { Quiz, TestSubject, TestGrade, TestType } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from './TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowRightCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../../../components/icons';

interface QuizViewProps {
    subject: TestSubject;
    grade: TestGrade;
    testType: TestType;
    onBack: () => void;
    onBackToSubjects: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ subject, grade, testType, onBack, onBackToSubjects }) => {
    const { user } = useAuth();
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
            const data = await generateQuiz(subject.name, grade.name, testType);
            setQuizData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    }, [subject.name, grade.name, testType]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

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
                    exam_type: 'test',
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
        fetchQuiz();
    };

    // Helper to clean option text
    const cleanOptionText = (text: string) => {
        return text.replace(/^[A-D]\.\s*/, '').replace(/^\d+\.\s*/, '');
    };
    
    if (isLoading) {
        return (
            <div>
                <Breadcrumb items={[
                    { label: 'Kiểm tra', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: grade.name, onClick: onBack },
                    { label: testType.name }
                ]} />
                <LoadingSpinner text="AI đang tạo đề kiểm tra..." subText="Quá trình này có thể mất vài giây." />
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-red-600">Lỗi tạo đề kiểm tra</h3>
                <p className="text-slate-600 my-4">{error}</p>
                <button onClick={fetchQuiz} className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-500">Thử lại</button>
            </div>
        );
    }

    if (showResults && quizData) {
        return <TestResultsView score={finalScore} totalQuestions={quizData.questions.length} onRetake={handleRetake} onBackToSubjects={onBackToSubjects} />;
    }

    if (!quizData || !currentQuestion) {
        return <p>Không có dữ liệu bài kiểm tra.</p>;
    }

    const isUserCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
             <Breadcrumb items={[
                    { label: 'Kiểm tra', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: grade.name, onClick: onBack },
                    { label: testType.name }
                ]} />
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex justify-between items-center text-sm font-medium mb-4">
                         <span className="text-slate-500">{quizData.sourceSchool}</span>
                         <div className={`flex items-center px-3 py-1 rounded-full text-white space-x-2 transition-colors duration-300 ${isTimerRunning && timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-mono text-base">{formatTime(timeLeft)}</span>
                         </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                        <div className="bg-brand-blue h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
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
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}
                        <ArrowRightCircleIcon className="h-5 w-5 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizView;
