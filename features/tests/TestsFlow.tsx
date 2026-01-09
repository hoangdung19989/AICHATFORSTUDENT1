
import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import type { TestSubject, TestGrade, TestType, Semester } from '../../types/index';
import { TEST_SUBJECTS, TEST_GRADES, TEST_TYPES } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import TypeSelection from './components/TypeSelection';
import SemesterSelection from './components/SemesterSelection';
import QuizView from './components/QuizView';

const TestsFlow: React.FC = () => {
    const { navigate, currentView } = useNavigation();
    const { user } = useAuth();
    
    // States
    const [selectedSubject, setSelectedSubject] = useState<TestSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<TestGrade | null>(null);
    const [selectedType, setSelectedType] = useState<TestType | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

    // Reset internal state if we navigate away and come back to the start
    useEffect(() => {
        if (currentView === 'test-subjects' && selectedSubject) {
            // Only reset if we are explicitly at the subjects view
            // This is handled by back buttons usually, but added for safety
        }
    }, [currentView]);

    const handleSelectType = (type: TestType) => {
        if (!user) {
            alert("Bạn cần đăng nhập để làm bài kiểm tra và lưu kết quả.");
            navigate('login');
            return;
        }
        setSelectedType(type);
        // Nếu là bài 15p (không cần học kỳ), nhảy thẳng vào thi
        if (!type.requiresSemester) {
            setSelectedSemester('Cả năm');
        }
    };

    const handleSelectSemester = (sem: Semester) => {
        setSelectedSemester(sem);
    };

    const handleBack = () => {
        if (selectedSemester && selectedType?.requiresSemester) {
            setSelectedSemester(null);
        } else if (selectedType) {
            setSelectedType(null);
            setSelectedSemester(null);
        } else if (selectedGrade) {
            setSelectedGrade(null);
        } else if (selectedSubject) {
            setSelectedSubject(null);
        } else {
            navigate('self-study');
        }
    };

    const handleResetAll = () => {
        setSelectedSemester(null);
        setSelectedType(null);
        setSelectedGrade(null);
        setSelectedSubject(null);
    };

    // Render logic in reverse order of depth
    
    // 5. Quiz View (Deepest)
    if (selectedSubject && selectedGrade && selectedType && selectedSemester) {
        return (
            <QuizView
                subject={selectedSubject}
                grade={selectedGrade}
                testType={selectedType}
                semester={selectedSemester}
                onBack={handleBack}
                onBackToSubjects={handleResetAll}
            />
        );
    }

    // 4. Semester Selection
    if (selectedSubject && selectedGrade && selectedType && selectedType.requiresSemester) {
        return (
            <SemesterSelection 
                subject={selectedSubject}
                grade={selectedGrade}
                testType={selectedType}
                onSelectSemester={handleSelectSemester}
                onBack={handleBack}
            />
        );
    }

    // 3. Type Selection
    if (selectedSubject && selectedGrade) {
        return (
            <TypeSelection
                subject={selectedSubject}
                grade={selectedGrade}
                testTypes={TEST_TYPES}
                onSelectTestType={handleSelectType}
                onBack={handleBack}
                onBackToSubjects={handleResetAll}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }

    // 2. Grade Selection
    if (selectedSubject) {
        return (
            <GradeSelection
                subject={selectedSubject}
                grades={TEST_GRADES}
                onSelectGrade={setSelectedGrade}
                onBackToSubjects={handleBack}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }

    // 1. Subject Selection (Start)
    return (
        <SubjectSelection 
            subjects={TEST_SUBJECTS} 
            onSelectSubject={setSelectedSubject} 
            onBack={() => navigate('self-study')} 
        />
    );
};

export default TestsFlow;
