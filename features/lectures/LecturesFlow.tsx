import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
// FIX: Corrected import path for types
import type { LectureSubject, Grade, Course } from '../../types/index';
import { GRADES_BY_SUBJECT, ALL_COURSES } from '../../data';
import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import LectureView from './components/LectureView';

const LecturesFlow: React.FC = () => {
    const { goBack, navigate } = useNavigation();
    const [selectedSubject, setSelectedSubject] = useState<LectureSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const handleSelectSubject = (subject: LectureSubject) => {
        setSelectedSubject(subject);
    };

    const handleSelectGrade = (grade: Grade) => {
        setSelectedGrade(grade);
        const courseData = ALL_COURSES[grade.courseId];
        if (courseData) {
            setSelectedCourse(courseData);
        } else {
            alert(`Nội dung cho ${grade.name} đang được cập nhật.`);
        }
    };
    
    if (selectedCourse) {
        return <LectureView course={selectedCourse} onExit={() => {
            setSelectedCourse(null);
            setSelectedGrade(null);
        }} />;
    }

    if (selectedSubject) {
        const gradesForSubject = GRADES_BY_SUBJECT[selectedSubject.id] || [];
        return (
            <GradeSelection 
                subject={selectedSubject}
                grades={gradesForSubject}
                onSelectGrade={handleSelectGrade}
                onBackToSubjects={() => setSelectedSubject(null)}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }

    return <SubjectSelection onBack={() => navigate('self-study')} onSelectSubject={handleSelectSubject} />;
};

export default LecturesFlow;