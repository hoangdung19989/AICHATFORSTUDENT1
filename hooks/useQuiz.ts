import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { playAudioFromBase64 } from '../utils/audio';
import { CORRECT_ANSWER_SOUND, INCORRECT_ANSWER_SOUND } from '../data';
// FIX: Corrected import path for types
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
    isAnswered: boolean;
    isQuizFinished: boolean;
    timeLeft: number;
    isTimerRunning: boolean;
    progress: number;
    handleAnswerSelect: (option: string) => void;
    handleNextQuestion: () => void;
    formatTime: (seconds: number) => string;
}

export const useQuiz = ({ quizData, onQuizFinish }: UseQuizOptions): UseQuizReturn => {
    const { user } = useAuth();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());

    useEffect(() => {
        if (quizData) {
            // Reset state for new quiz
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
            
            const timeString = quizData.timeLimit || '15';
            const minutes = parseInt(timeString.match(/\d+/)?.[0] || '15', 10);
            setTimeLeft(minutes * 60);
            setIsTimerRunning(true);
            setQuestionStartTime(Date.now());
        }
    }, [quizData]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);
    
    const isQuizFinished = quizData ? currentQuestionIndex >= quizData.questions.length : false;
    const currentQuestion = quizData ? quizData.questions[currentQuestionIndex] : null;

    useEffect(() => {
        if (isQuizFinished && onQuizFinish && quizData) {
            onQuizFinish(score, quizData.questions.length);
        }
    }, [isQuizFinished, onQuizFinish, score, quizData]);


    const handleAnswerSelect = useCallback(async (option: string) => {
        if (isAnswered || !isTimerRunning || !currentQuestion) return;

        setIsAnswered(true);
        setSelectedAnswer(option);

        const isCorrect = option === currentQuestion.correctAnswer;
        if (isCorrect) {
            setScore(s => s + 1);
            playAudioFromBase64(CORRECT_ANSWER_SOUND);
        } else {
            playAudioFromBase64(INCORRECT_ANSWER_SOUND);
        }

        if (user) {
            const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
            try {
                const { error } = await supabase.from('question_attempts').insert({
                    user_id: user.id,
                    question_text: currentQuestion.question,
                    is_correct: isCorrect,
                    time_taken_seconds: timeTaken,
                    question_topics: currentQuestion.topics || [],
                });
                if (error) {
                    console.error("Failed to log question attempt:", error.message);
                }
            } catch (err) {
                console.error("Exception logging question:", err);
            }
        }
    }, [isAnswered, isTimerRunning, currentQuestion, user, questionStartTime]);

    const handleNextQuestion = useCallback(() => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
        setQuestionStartTime(Date.now());
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = quizData ? ((currentQuestionIndex + 1) / quizData.questions.length) * 100 : 0;

    return {
        currentQuestion,
        currentQuestionIndex,
        score,
        selectedAnswer,
        isAnswered,
        isQuizFinished,
        timeLeft,
        isTimerRunning,
        progress,
        handleAnswerSelect,
        handleNextQuestion,
        formatTime,
    };
};