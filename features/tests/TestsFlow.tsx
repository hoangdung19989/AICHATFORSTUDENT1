
import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
// FIX: Corrected import path for types
import type { TestSubject, TestGrade, TestType, Semester } from '../../types/index';
import { TEST_SUBJECTS, TEST_GRADES, TEST_TYPES } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import TypeSelection from './components/TypeSelection';
import SemesterSelection from './components/SemesterSelection';
import QuizView from './components/QuizView';

const TestsFlow: React.FC = () => {
    const { navigate } = useNavigation();
    const { user } = useAuth();
    const [selectedSubject, setSelectedSubject] = useState<TestSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<TestGrade | null>(null);
    const [selectedType, setSelectedType] = useState<TestType | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

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

    // View 5: Làm bài thi
    if (selectedSubject && selectedGrade && selectedType && selectedSemester) {
        return (
            <QuizView
                subject={selectedSubject}
                grade={selectedGrade}
                testType={selectedType}
                semester={selectedSemester}
                onBack={() => {
                    if (selectedType.requiresSemester) {
                        setSelectedSemester(null);
                    } else {
                        setSelectedSemester(null);
                        setSelectedType(null);
                    }
                }}
                onBackToSubjects={() => {
                    setSelectedSemester(null);
                    setSelectedType(null);
                    setSelectedGrade(null);
                    setSelectedSubject(null);
                }}
            />
        );
    }

    // View 4: Chọn học kỳ (Nếu cần)
    if (selectedSubject && selectedGrade && selectedType && selectedType.requiresSemester) {
        return (
            <SemesterSelection 
                subject={selectedSubject}
                grade={selectedGrade}
                testType={selectedType}
                onSelectSemester={handleSelectSemester}
                onBack={() => setSelectedType(null)}
            />
        );
    }

    // View 3: Chọn loại bài kiểm tra
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

    // View 2: Chọn khối lớp
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

    // View 1: Chọn môn học
    return <SubjectSelection subjects={TEST_SUBJECTS} onSelectSubject={setSelectedSubject} onBack={() => navigate('self-study')} />;
};

export default TestsFlow;
