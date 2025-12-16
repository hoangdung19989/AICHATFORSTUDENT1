import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
// FIX: Corrected import path for types
import type { TestSubject, TestGrade, TestType } from '../../types/index';
import { TEST_SUBJECTS, TEST_GRADES, TEST_TYPES } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import TypeSelection from './components/TypeSelection';
import QuizView from './components/QuizView';

const TestsFlow: React.FC = () => {
    const { navigate } = useNavigation();
    const { user } = useAuth();
    const [selectedSubject, setSelectedSubject] = useState<TestSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<TestGrade | null>(null);
    const [selectedType, setSelectedType] = useState<TestType | null>(null);

    const handleSelectType = (type: TestType) => {
        if (!user) {
            alert("Bạn cần đăng nhập để làm bài kiểm tra và lưu kết quả.");
            navigate('login');
            return;
        }
        setSelectedType(type);
    };

    if (selectedSubject && selectedGrade && selectedType) {
        return (
            <QuizView
                subject={selectedSubject}
                grade={selectedGrade}
                testType={selectedType}
                onBack={() => setSelectedType(null)}
                onBackToSubjects={() => {
                    setSelectedType(null);
                    setSelectedGrade(null);
                    setSelectedSubject(null);
                }}
            />
        );
    }

    if (selectedSubject && selectedGrade) {
        return (
            <TypeSelection
                subject={selectedSubject}
                grade={selectedGrade}
                testTypes={TEST_TYPES}
                onSelectTestType={handleSelectType}
                onBack={() => setSelectedGrade(null)}
                onBackToSubjects={() => {
                    setSelectedGrade(null);
                    setSelectedSubject(null);
                }}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
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

    return <SubjectSelection subjects={TEST_SUBJECTS} onSelectSubject={setSelectedSubject} onBack={() => navigate('self-study')} />;
};

export default TestsFlow;