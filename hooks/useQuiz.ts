
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { playAudioFromBase64 } from '../utils/audio';
import { CORRECT_ANSWER_SOUND, INCORRECT_ANSWER_SOUND } from '../data';
import type { Quiz, QuizQuestion } from '../types/index';

interface UseQuizOptions {
    quizData: Quiz | null;
    onQuizFinish?: (score: number, total: number) => void;
}

interface UseQuizReturn {
    currentQuestion: QuizQuestion | null;
    currentQuestionIndex: number;
    score: number;
    selectedAnswer: string | null;
    userAnswers: Record<number, string>;
    isAnswered: boolean;
    isQuizFinished: boolean;
    timeLeft: number;
    isTimerRunning: boolean;
    progress: number;
    handleAnswerSelect: (option: string) => void;
    submitAnswer: () => void;
    submitExam: () => void;
    handleNextQuestion: () => void;
    handlePreviousQuestion: () => void;
    formatTime: (seconds: number) => string;
}

export const useQuiz = ({ quizData, onQuizFinish }: UseQuizOptions): UseQuizReturn => {
    const { user } = useAuth();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isAnswered, setIsAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    
    const hasFinishedRef = useRef(false);
    const questions = quizData?.questions || [];

    useEffect(() => {
        if (quizData) {
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setUserAnswers({});
            setIsAnswered(false);
            hasFinishedRef.current = false;
            
            const timeString = quizData.timeLimit || '15';
            const minutes = parseInt(timeString.match(/\d+/)?.[0] || '15', 10);
            setTimeLeft(minutes * 60);
            setIsTimerRunning(true);
            setQuestionStartTime(Date.now());
        }
    }, [quizData]);

    // Timer logic
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            submitExam(); // Auto submit when time is up
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);
    
    const isQuizFinished = quizData ? currentQuestionIndex >= questions.length : false;

    // Hàm chọn đáp án (Chung cho cả 2 chế độ)
    const handleAnswerSelect = useCallback((option: string) => {
        // Trong chế độ Practice, nếu đã chốt (isAnswered) thì không cho chọn lại
        // Trong chế độ Exam, isAnswered thường là false cho đến khi nộp bài
        if (isAnswered) return; 
        
        setSelectedAnswer(option);
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }));
    }, [isAnswered, currentQuestionIndex]);

    // Hàm chốt đáp án từng câu (Dành cho Luyện tập/PracticeView)
    const submitAnswer = useCallback(async () => {
        if (isAnswered || !selectedAnswer || !questions[currentQuestionIndex]) return;

        setIsAnswered(true);
        const currentQ = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQ.correctAnswer;

        if (isCorrect) {
            setScore(s => s + 1);
            playAudioFromBase64(CORRECT_ANSWER_SOUND);
        } else {
            playAudioFromBase64(INCORRECT_ANSWER_SOUND);
        }

        // Log question attempt immediately for practice mode
        if (user) {
            const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
            try {
                await supabase.from('question_attempts').insert({
                    user_id: user.id,
                    question_text: currentQ.question,
                    is_correct: isCorrect,
                    time_taken_seconds: timeTaken,
                    question_topics: currentQ.topics || [],
                });
            } catch (err) {
                console.error("Exception logging question:", err);
            }
        }
    }, [isAnswered, selectedAnswer, questions, currentQuestionIndex, user, questionStartTime]);

    // Hàm nộp bài tổng thể (Dành cho Thi/ExamView)
    const submitExam = useCallback(() => {
        if (hasFinishedRef.current) return;
        hasFinishedRef.current = true;
        setIsTimerRunning(false);

        let finalScore = 0;
        questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) {
                finalScore++;
            }
        });
        setScore(finalScore);

        if (onQuizFinish) {
            onQuizFinish(finalScore, questions.length);
        }
    }, [questions, userAnswers, onQuizFinish]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            const nextIdx = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIdx);
            setSelectedAnswer(userAnswers[nextIdx] || null);
            setIsAnswered(false); // Reset check state for practice mode
            setQuestionStartTime(Date.now());
        }
    }, [currentQuestionIndex, questions.length, userAnswers]);

    const handlePreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            const prevIdx = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevIdx);
            setSelectedAnswer(userAnswers[prevIdx] || null);
            setIsAnswered(false); 
            setQuestionStartTime(Date.now());
        }
    }, [currentQuestionIndex, userAnswers]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = (quizData && questions.length > 0) ? ((Object.keys(userAnswers).length) / questions.length) * 100 : 0;

    return {
        currentQuestion: questions[currentQuestionIndex] || null,
        currentQuestionIndex,
        score,
        selectedAnswer,
        userAnswers,
        isAnswered,
        isQuizFinished,
        timeLeft,
        isTimerRunning,
        progress,
        handleAnswerSelect,
        submitAnswer,
        submitExam,
        handleNextQuestion,
        handlePreviousQuestion,
        formatTime,
    };
};
