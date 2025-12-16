import React, { useState, useCallback } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Corrected import path for types
import type { SelfPracticeSubject, TestGrade, PracticeLesson, Quiz } from '../../types/index';
import { PRACTICE_LESSONS_DATA, TEST_GRADES } from '../../data';
import { generatePracticeExercises } from '../../services/geminiService';

import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import LessonSelection from './components/LessonSelection';
import PracticeView from './components/PracticeView';

const SelfPracticeFlow: React.FC = () => {
    const { navigate } = useNavigation();
    const { user } = useAuth();

    const [selectedSubject, setSelectedSubject] = useState<SelfPracticeSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<TestGrade | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<PracticeLesson | null>(null);
    
    const [practiceQuiz, setPracticeQuiz] = useState<Quiz | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
    const [quizError, setQuizError] = useState<string | null>(null);

    const fetchPracticeQuiz = useCallback(async (subject: SelfPracticeSubject, grade: TestGrade, lesson: PracticeLesson) => {
        setIsLoadingQuiz(true);
        setQuizError(null);
        setPracticeQuiz(null);
        try {
            const quizData = await generatePracticeExercises(subject.name, grade.name, lesson.title);
            setPracticeQuiz(quizData);
        } catch (err) {
            setQuizError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoadingQuiz(false);
        }
    }, []);

    const handleSelectLesson = useCallback((lesson: PracticeLesson) => {
        if (!user) {
            alert("Bạn cần đăng nhập để vào phòng luyện tập.");
            navigate('login');
            return;
        }
        if (selectedSubject && selectedGrade) {
            setSelectedLesson(lesson);
            fetchPracticeQuiz(selectedSubject, selectedGrade, lesson);
        }
    }, [user, navigate, selectedSubject, selectedGrade, fetchPracticeQuiz]);

    if (selectedSubject && selectedGrade && selectedLesson) {
        return (
            <PracticeView
                subject={selectedSubject}
                grade={selectedGrade}
                lesson={selectedLesson}
                quizData={practiceQuiz}
                isLoading={isLoadingQuiz}
                error={quizError}
                onRetry={() => fetchPracticeQuiz(selectedSubject, selectedGrade, selectedLesson)}
                onBack={() => {
                    setSelectedLesson(null);
                    setPracticeQuiz(null);
                    setQuizError(null);
                }}
                onBackToSubjects={() => {
                    setSelectedSubject(null);
                    setSelectedGrade(null);
                    setSelectedLesson(null);
                }}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }
    
    if (selectedSubject && selectedGrade) {
        const lessonKey = `sp-${selectedSubject.id.replace('sp-', '')}-grade-${selectedGrade.id.replace('grade-', '')}`;
        const practiceChapters = PRACTICE_LESSONS_DATA[lessonKey];
        if (practiceChapters) {
             return (
                <LessonSelection
                    subject={selectedSubject}
                    grade={selectedGrade}
                    chapters={practiceChapters}
                    onBack={() => setSelectedGrade(null)}
                    onSelectLesson={handleSelectLesson}
                    onBackToSelfStudy={() => navigate('self-study')}
                    onBackToSubjects={() => setSelectedSubject(null)}
                />
             );
        } else {
            // This case should ideally not happen if UI is correct
             alert(`Nội dung cho ${selectedSubject.name} ${selectedGrade.name} đang được phát triển.`);
             setSelectedGrade(null); // Go back
             return null;
        }
    }

    if (selectedSubject) {
        return (
            <GradeSelection
                subject={selectedSubject}
                grades={TEST_GRADES}
                onSelectGrade={setSelectedGrade}
                onBackToSubjects={() => setSelectedSubject(null)}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }

    return <SubjectSelection onBack={() => navigate('self-study')} onSelectSubject={setSelectedSubject} />;
};

export default SelfPracticeFlow;