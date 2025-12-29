import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import type { MockExamSubject, TestGrade, Quiz } from '../../types/index';
import { MOCK_EXAM_SUBJECTS, MOCK_EXAM_GRADES } from '../../data';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
// FIX: Added missing import for LoadingSpinner
import LoadingSpinner from '../../components/common/LoadingSpinner';

import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import MockExamView from './components/MockExamView';
import ExamList from './components/ExamList';

const MockExamsFlow: React.FC = () => {
    const { navigate, params } = useNavigation();
    const { user } = useAuth();
    
    const [selectedSubject, setSelectedSubject] = useState<MockExamSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<TestGrade | null>(null);
    const [preloadedQuiz, setPreloadedQuiz] = useState<Quiz | null>(null);
    const [selectedExamId, setSelectedExamId] = useState<string | undefined>(undefined);
    const [isTakingExam, setIsTakingExam] = useState(false);
    const [isDirectLoading, setIsDirectLoading] = useState(false);

    // Logic xử lý khi được "đẩy" trực tiếp từ trang chủ
    useEffect(() => {
        if (params?.directStart && params?.examId) {
            handleDirectExam(params.examId);
        }
    }, [params]);

    const handleDirectExam = async (examId: string) => {
        setIsDirectLoading(true);
        try {
            const { data, error } = await supabase
                .from('teacher_exams')
                .select('*')
                .eq('id', examId)
                .single();
            
            if (error) throw error;
            if (data) {
                // Giả lập chọn môn và khối dựa trên dữ liệu đề
                const sub = MOCK_EXAM_SUBJECTS.find(s => s.name === data.subject) || MOCK_EXAM_SUBJECTS[0];
                const grd = MOCK_EXAM_GRADES.find(g => g.name === data.grade) || MOCK_EXAM_GRADES[0];
                
                setSelectedSubject(sub);
                setSelectedGrade(grd);
                
                const dbContent = data.questions;
                let finalQuestions = dbContent.questions || [];
                if (dbContent.variants && dbContent.variants.length > 0) {
                    const variant = dbContent.variants[Math.floor(Math.random() * dbContent.variants.length)];
                    finalQuestions = variant.questions;
                }

                setPreloadedQuiz({
                    sourceSchool: "Đề thi Giáo viên",
                    title: data.title,
                    timeLimit: "45 phút",
                    questions: finalQuestions,
                    essayQuestions: dbContent.essayQuestions || []
                });
                setSelectedExamId(data.id);
                setIsTakingExam(true);
            }
        } catch (e) {
            console.error("Direct load error:", e);
            alert("Không thể tải bài thi này. Có thể đề đã bị gỡ hoặc có lỗi kết nối.");
        } finally {
            setIsDirectLoading(false);
        }
    };

    if (isDirectLoading) return <div className="p-20 text-center"><LoadingSpinner text="Đang nạp bài thi từ giáo viên..." /></div>;

    if (isTakingExam && selectedSubject && selectedGrade) {
        return (
            <MockExamView
                subject={selectedSubject}
                grade={selectedGrade}
                initialQuizData={preloadedQuiz}
                examId={selectedExamId}
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
                    setSelectedExamId(examId);
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
                onSelectGrade={(g) => setSelectedGrade(g)}
                onBackToSubjects={() => setSelectedSubject(null)}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }

    return <SubjectSelection subjects={MOCK_EXAM_SUBJECTS} onSelectSubject={setSelectedSubject} onBack={() => navigate('self-study')} />;
};

export default MockExamsFlow;