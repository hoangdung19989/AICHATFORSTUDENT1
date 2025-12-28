
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuiz } from '../../../hooks/useQuiz';
// FIX: Corrected import path for types
import type { Quiz, SelfPracticeSubject, TestGrade, PracticeLesson } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from '../../tests/components/TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowRightCircleIcon, CheckCircleIcon, XCircleIcon } from '../../../components/icons';

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
    const { user } = useAuth();
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const handleQuizFinish = async (score: number, total: number) => {
        setFinalScore(score);
        setShowResults(true);
        if (user) {
            try {
                const { error } = await supabase.from('exam_results').insert({
                    user_id: user.id,
                    subject_name: subject.name,
                    grade_name: grade.name,
                    score,
                    total_questions: total,
                    exam_type: 'practice',
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
            <div>
                 <Breadcrumb items={[
                    { label: 'Tự học', onClick: onBackToSelfStudy },
                    { label: 'Tự luyện', onClick: onBackToSubjects },
                    { label: subject.name, onClick: onBack },
                    { label: grade.name, onClick: onBack },
                    { label: 'Luyện tập' }
                ]} />
                <LoadingSpinner text="AI đang tạo bài luyện tập..." subText="Vui lòng chờ trong giây lát." />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-red-600">Lỗi tạo bài tập</h3>
                <p className="text-slate-600 my-4">{error}</p>
                <button onClick={onRetry} className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-500">Thử lại</button>
            </div>
        );
    }

    if (showResults && quizData) {
        return <TestResultsView score={finalScore} totalQuestions={quizData.questions.length} onRetake={handleRetake} onBackToSubjects={onBackToSubjects} />;
    }

    if (!quizData || !currentQuestion) {
        return <p>Không có dữ liệu bài tập.</p>;
    }
    
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    const isUserCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <Breadcrumb items={[
                { label: 'Tự học', onClick: onBackToSelfStudy },
                { label: 'Tự luyện', onClick: onBackToSubjects },
                { label: subject.name, onClick: onBack },
                { label: grade.name, onClick: onBack },
                { label: 'Luyện tập' }
            ]} />

            {/* Main Quiz Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header Section */}
                <div className="px-6 pt-6 pb-2">
                     <div className="flex justify-between items-center text-sm font-medium text-slate-500 mb-4">
                        <span className="truncate pr-4">{quizData.sourceSchool || subject.name}</span>
                        <span>{lesson.title}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                        <div className="bg-brand-blue h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>

                    <p className="text-slate-500 font-semibold text-sm">Câu {currentQuestionIndex + 1}/{quizData.questions.length}</p>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    {/* Illustration */}
                    {currentQuestion.image && (
                        <div className="mb-6 flex justify-center">
                            <img 
                                src={currentQuestion.image} 
                                alt="Hình minh họa" 
                                className="max-h-64 object-contain rounded-lg border border-slate-200"
                            />
                        </div>
                    )}

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8 leading-snug">
                        {currentQuestion.question}
                    </h2>

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

                {/* Footer Section */}
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
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
                        <ArrowRightCircleIcon className="h-5 w-5 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PracticeView;
