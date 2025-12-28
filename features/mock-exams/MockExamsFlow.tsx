
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
    const [selectedExamId, setSelectedExamId] = useState<string | undefined>(undefined); // NEW: Track Exam ID

    const handleSelectGrade = (grade: TestGrade) => {
        if (!user) {
            alert("Bạn cần đăng nhập để tham gia thi thử.");
            navigate('login');
            return;
        }
        setSelectedGrade(grade);
    };

    // Logic tách biệt trạng thái List và Exam View
    const [isTakingExam, setIsTakingExam] = useState(false);

    if (isTakingExam && selectedSubject && selectedGrade) {
        return (
            <MockExamView
                subject={selectedSubject}
                grade={selectedGrade}
                initialQuizData={preloadedQuiz} // Pass the teacher exam if selected
                examId={selectedExamId} // Pass exam ID for database linking
                onBack={() => {
                    setIsTakingExam(false);
                    setPreloadedQuiz(null);
                    setSelectedExamId(undefined);
                }}
                onBackToSubjects={() => {
                    setIsTakingExam(false);
                    setPreloadedQuiz(null);
                    setSelectedExamId(undefined);
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
                onSelectExam={(quiz, examId) => {
                    setPreloadedQuiz(quiz);
                    setSelectedExamId(examId); // Save ID
                    setIsTakingExam(true);
                }}
                onGenerateRandom={() => {
                    setPreloadedQuiz(null);
                    setSelectedExamId(undefined);
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
