
import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
// FIX: Corrected import path for types
import type { MockExamSubject, TestGrade, Quiz } from '../../types/index';
import { MOCK_EXAM_SUBJECTS, MOCK_EXAM_GRADES } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import MockExamView from './components/MockExamView';
import ExamList from './components/ExamList'; // Import new component

const MockExamsFlow: React.FC = () => {
    const { navigate } = useNavigation();
    const { user } = useAuth();
    const [selectedSubject, setSelectedSubject] = useState<MockExamSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<TestGrade | null>(null);
    const [preloadedQuiz, setPreloadedQuiz] = useState<Quiz | null>(null); // For teacher exams

    const handleSelectGrade = (grade: TestGrade) => {
        if (!user) {
            alert("Bạn cần đăng nhập để tham gia thi thử.");
            navigate('login');
            return;
        }
        setSelectedGrade(grade);
    };

    const handleSelectTeacherExam = (quiz: Quiz) => {
        setPreloadedQuiz(quiz);
    };

    const handleGenerateRandom = () => {
        setPreloadedQuiz(null); // Explicitly null to trigger AI generation in View
    };
    
    // View: Taking the Exam
    // Logic: If preloadedQuiz exists, pass it. If not (and we are in this view), MockExamView handles generation.
    // However, MockExamView currently generates on mount if no data.
    // We need to slightly adapt MockExamView or control it here.
    // Simplest approach: Add a new state `isTakingExam` to separate List View from Exam View.
    const [isTakingExam, setIsTakingExam] = useState(false);

    if (isTakingExam && selectedSubject && selectedGrade) {
        return (
            <MockExamView
                subject={selectedSubject}
                grade={selectedGrade}
                initialQuizData={preloadedQuiz} // Pass the teacher exam if selected
                onBack={() => {
                    setIsTakingExam(false);
                    setPreloadedQuiz(null);
                }}
                onBackToSubjects={() => {
                    setIsTakingExam(false);
                    setPreloadedQuiz(null);
                    setSelectedGrade(null);
                    setSelectedSubject(null);
                }}
            />
        );
    }

    if (selectedSubject && selectedGrade) {
        return (
            <ExamList 
                subject={selectedSubject}
                grade={selectedGrade}
                onSelectExam={(quiz) => {
                    setPreloadedQuiz(quiz);
                    setIsTakingExam(true);
                }}
                onGenerateRandom={() => {
                    setPreloadedQuiz(null);
                    setIsTakingExam(true);
                }}
                onBack={() => setSelectedGrade(null)}
                onBackToSubjects={() => {
                    setSelectedGrade(null);
                    setSelectedSubject(null);
                }}
            />
        );
    }

    if (selectedSubject) {
        return (
            <GradeSelection
                subject={selectedSubject}
                grades={MOCK_EXAM_GRADES}
                onSelectGrade={handleSelectGrade}
                onBackToSubjects={() => setSelectedSubject(null)}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }

    return <SubjectSelection subjects={MOCK_EXAM_SUBJECTS} onSelectSubject={setSelectedSubject} onBack={() => navigate('self-study')} />;
};

export default MockExamsFlow;
