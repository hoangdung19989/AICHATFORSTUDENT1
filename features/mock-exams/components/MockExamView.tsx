
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { generateMockExam } from '../../../services/geminiService';
import { useQuiz } from '../../../hooks/useQuiz';
import type { Quiz, MockExamSubject, TestGrade } from '../../../types/index';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TestResultsView from '../../tests/components/TestResultsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowRightCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PencilSquareIcon, ExclamationTriangleIcon } from '../../../components/icons';

interface MockExamViewProps {
    subject: MockExamSubject;
    grade: TestGrade;
    initialQuizData: Quiz | null;
    examId?: string; // NEW: Receive Exam ID
    onBack: () => void;
    onBackToSubjects: () => void;
}

const MockExamView: React.FC<MockExamViewProps> = ({ subject, grade, initialQuizData, examId, onBack, onBackToSubjects }) => {
    const { user } = useAuth();
    const [quizData, setQuizData] = useState<Quiz | null>(initialQuizData);
    const [isLoading, setIsLoading] = useState(!initialQuizData);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    
    // Anti-cheat states
    const [violations, setViolations] = useState(0);
    const [showCheatWarning, setShowCheatWarning] = useState(false);
    const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchExam = useCallback(async () => {
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

    // Handle results and submission
    const handleQuizFinish = useCallback(async (score: number, total: number, cheatDetected: boolean = false) => {
        setFinalScore(score);
        setShowResults(true);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        
        if (user) {
            try {
                // Insert result into Supabase
                const payload: any = {
                    user_id: user.id,
                    subject_name: subject.name,
                    grade_name: grade.name,
                    score,
                    total_questions: total,
                    exam_type: 'mock',
                    metadata: { 
                        violations: violations + (cheatDetected ? 1 : 0),
                        is_cheating: cheatDetected || violations >= 1,
                        auto_submitted: cheatDetected
                    }
                };

                // CRITICAL: Attach exam_id if this is a teacher-assigned exam
                if (examId) {
                    payload.exam_id = examId;
                }

                await supabase.from('exam_results').insert(payload);
            } catch (err) {
                 console.error("Error saving results:", err);
            }
        }
    }, [user, subject.name, grade.name, violations, examId]);

    const {
        currentQuestion, currentQuestionIndex, selectedAnswer, isAnswered, 
        timeLeft, isTimerRunning, handleAnswerSelect, 
        handleNextQuestion, formatTime, progress, score
    } = useQuiz({ quizData, onQuizFinish: (s, t) => handleQuizFinish(s, t) });

    // Anti-cheat Logic
    useEffect(() => {
        if (isLoading || showResults || !quizData) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                triggerViolation();
            }
        };

        const handleBlur = () => {
            triggerViolation();
        };

        const triggerViolation = () => {
            if (showResults || isAutoSubmitted) return;
            
            setViolations(prev => {
                const next = prev + 1;
                if (next === 1) {
                    setShowCheatWarning(true);
                } else if (next >= 2) {
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
    }, [isLoading, showResults, quizData, score, handleQuizFinish, isAutoSubmitted]);

    const enterFullscreen = () => {
        if (containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => {
                console.warn(`Fullscreen error: ${err.message}`);
            });
        }
    };

    const handleRetake = () => {
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl">
                <Breadcrumb items={[{ label: 'Thi thử', onClick: onBackToSubjects }, { label: subject.name, onClick: onBack }, { label: grade.name }]} />
                <LoadingSpinner text="Đang chuẩn bị đề thi..." subText="Vui lòng không thoát trình duyệt." />
            </div>
        );
    }

    if (showResults && quizData) {
        // Kiểm tra xem đây có phải đề từ giáo viên hay không để ẩn đáp án chi tiết
        const isTeacherExam = quizData.sourceSchool === "Đề thi Giáo viên";

        return (
            <div className="container mx-auto max-w-4xl">
                {isAutoSubmitted && (
                    <div className="mb-6 bg-red-600 text-white p-6 rounded-2xl shadow-lg flex items-center animate-bounce">
                        <ExclamationTriangleIcon className="h-10 w-10 mr-4" />
                        <div>
                            <h3 className="text-xl font-bold">BÀI LÀM BỊ KHÓA TỰ ĐỘNG!</h3>
                            <p>Phát hiện hành vi rời khỏi màn hình thi lần thứ 2. Kết quả đã được gửi về hệ thống.</p>
                        </div>
                    </div>
                )}
                <TestResultsView 
                    score={finalScore} 
                    totalQuestions={quizData.questions.length} 
                    onRetake={handleRetake} 
                    onBackToSubjects={onBackToSubjects}
                    hideDetails={isTeacherExam} // Ẩn chi tiết nếu là đề giáo viên
                />
            </div>
        );
    }

    if (!quizData || !currentQuestion) return <p>Không có dữ liệu.</p>;

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto px-4 py-6 bg-slate-50 min-h-screen relative overflow-y-auto">
            {/* Fullscreen Trigger Overlay for First Click */}
            {!document.fullscreenElement && !showResults && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-md">
                    <ExclamationTriangleIcon className="h-20 w-20 text-yellow-500 mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Chế độ Thi nghiêm túc</h2>
                    <p className="text-lg text-slate-300 max-w-md mb-8">
                        Để bắt đầu, bạn phải chuyển sang chế độ Toàn màn hình. Hệ thống sẽ tự động nộp bài nếu bạn thoát ra hoặc chuyển sang tab khác.
                    </p>
                    <button 
                        onClick={enterFullscreen}
                        className="bg-brand-primary hover:bg-brand-primary-dark text-white px-10 py-4 rounded-2xl font-bold text-xl transition-all shadow-xl hover:scale-105"
                    >
                        Bắt đầu làm bài ngay
                    </button>
                </div>
            )}

            {/* Cheat Warning Modal */}
            {showCheatWarning && !isAutoSubmitted && (
                <div className="fixed inset-0 z-[110] bg-red-600/95 flex items-center justify-center p-6 backdrop-blur-lg">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">CẢNH BÁO GIAN LẬN!</h2>
                        <p className="text-slate-600 mb-8">
                            Bạn vừa rời khỏi màn hình thi. Đây là lời cảnh báo <strong>DUY NHẤT</strong>. Nếu vi phạm lần nữa, bài thi sẽ bị thu hồi ngay lập tức.
                        </p>
                        <button 
                            onClick={() => {
                                setShowCheatWarning(false);
                                enterFullscreen();
                            }}
                            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors"
                        >
                            Tôi đã hiểu, tiếp tục thi
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <Breadcrumb items={[{ label: 'Thi thử', onClick: onBackToSubjects }, { label: subject.name, onClick: onBack }, { label: grade.name }]} />
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-6 pt-6 pb-2">
                    <div className="flex justify-between items-center text-sm font-medium mb-4">
                         <span className="text-slate-500 font-bold uppercase tracking-wider">{quizData.title || 'ĐỀ THI THỬ'}</span>
                         <div className={`flex items-center px-4 py-1.5 rounded-full text-white space-x-2 ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                         </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                        <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-slate-400 font-bold text-xs uppercase">Câu hỏi {currentQuestionIndex + 1} / {quizData.questions.length}</p>
                        {violations > 0 && <span className="text-red-500 text-xs font-bold animate-pulse">⚠️ PHÁT HIỆN 1 VI PHẠM</span>}
                    </div>
                </div>

                <div className="p-6 sm:p-10">
                    {/* Image Illustration */}
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
                            let buttonClass = 'border-slate-200 bg-white hover:border-brand-primary hover:bg-slate-50';
                            
                            // LOGIC MỚI: Nếu đang làm bài, hiện màu chọn bình thường
                            // Nếu đã trả lời (isAnswered) và KHÔNG phải đề giáo viên, thì mới hiện Đúng/Sai.
                            // Nếu là đề giáo viên, ta giữ trạng thái đã chọn (ví dụ màu xám đậm hoặc xanh dương) nhưng KHÔNG tiết lộ đáp án đúng/sai.
                            const isTeacherExam = quizData.sourceSchool === "Đề thi Giáo viên";

                            if (isAnswered) {
                                if (isTeacherExam) {
                                    // Chế độ giấu đáp án: Chỉ highlight cái đã chọn
                                    if (isSelected) buttonClass = 'bg-brand-primary/10 border-brand-primary ring-2 ring-brand-primary/20 text-brand-primary';
                                    else buttonClass = 'opacity-50 grayscale border-slate-100';
                                } else {
                                    // Chế độ luyện tập thường: Hiện xanh/đỏ
                                    if (isCorrect) buttonClass = 'bg-green-50 border-green-500 ring-2 ring-green-200';
                                    else if (isSelected) buttonClass = 'bg-red-50 border-red-500 ring-2 ring-red-200';
                                    else buttonClass = 'opacity-50 grayscale border-slate-100';
                                }
                            }

                            return (
                                 <button
                                    key={index} onClick={() => handleAnswerSelect(option)} disabled={isAnswered}
                                    className={`w-full text-left flex items-start p-5 rounded-2xl border-2 transition-all duration-200 ${buttonClass}`}
                                >
                                    <span className={`text-lg font-black mr-4 ${isAnswered && !isTeacherExam && isCorrect ? 'text-green-600' : 'text-slate-400'}`}>{optionLabel}.</span>
                                    <span className="text-lg text-slate-700">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleNextQuestion} disabled={!isAnswered}
                        className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all ${!isAnswered ? 'bg-slate-200 text-slate-400' : 'bg-brand-primary text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5'}`}
                    >
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'Nộp bài ngay' : 'Câu tiếp theo'}
                        <ArrowRightCircleIcon className="h-5 w-5 ml-2" />
                    </button>
                </div>
            </div>
            
            {quizData.essayQuestions && quizData.essayQuestions.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
                    <div className="flex items-center mb-4">
                        <PencilSquareIcon className="h-6 w-6 text-amber-600 mr-2" />
                        <h3 className="font-bold text-amber-800">PHẦN TỰ LUẬN (GHI RA GIẤY)</h3>
                    </div>
                    {quizData.essayQuestions.map((q, i) => (
                        <div key={i} className="mb-4 last:mb-0 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                            <p className="font-bold text-slate-700 text-sm mb-1">Câu {i + 1}:</p>
                            {/* Hiển thị ảnh minh họa cho câu tự luận */}
                            {q.image && (
                                <div className="mb-3">
                                    <img 
                                        src={q.image} 
                                        alt="Hình minh họa" 
                                        className="max-h-64 object-contain rounded-lg border border-amber-200"
                                    />
                                </div>
                            )}
                            <p className="text-slate-800">{q.question}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MockExamView;
