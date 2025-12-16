
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import type { TeacherExam, MockExamSubject, TestGrade } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BriefcaseIcon, SparklesIcon, ChevronRightIcon } from '../../../components/icons';

interface ExamListProps {
    subject: MockExamSubject;
    grade: TestGrade;
    onSelectExam: (examData: any) => void; // Pass the Quiz object
    onGenerateRandom: () => void;
    onBack: () => void;
    onBackToSubjects: () => void;
}

const ExamList: React.FC<ExamListProps> = ({ subject, grade, onSelectExam, onGenerateRandom, onBack, onBackToSubjects }) => {
    const [exams, setExams] = useState<TeacherExam[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            const { data, error } = await supabase
                .from('teacher_exams')
                .select('*')
                .eq('subject', subject.name)
                .eq('grade', grade.name)
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                setExams(data as TeacherExam[]);
            }
            setIsLoading(false);
        };
        fetchExams();
    }, [subject.name, grade.name]);

    const handleSelectTeacherExam = (exam: TeacherExam) => {
        // The 'questions' column in DB now holds { questions: [], essayQuestions: [] }
        // We need to extract them correctly.
        const dbContent: any = exam.questions;
        
        const quizData = {
            sourceSchool: "Đề thi Giáo viên",
            title: exam.title,
            timeLimit: "45 phút", // Default for now
            // Handle both legacy (array) and new (object with arrays) formats safely
            questions: Array.isArray(dbContent) ? dbContent : (dbContent.questions || []),
            essayQuestions: Array.isArray(dbContent) ? [] : (dbContent.essayQuestions || [])
        };
        onSelectExam(quizData);
    };

    if (isLoading) return <LoadingSpinner text="Đang tải danh sách đề thi..." />;

    return (
        <div className="container mx-auto max-w-4xl">
            <Breadcrumb items={[
                { label: 'Thi thử', onClick: onBackToSubjects },
                { label: subject.name, onClick: onBack },
                { label: grade.name }
            ]} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Teacher Exams */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <BriefcaseIcon className="w-6 h-6 mr-2 text-orange-500" />
                        Đề thi từ Giáo viên
                    </h2>
                    {exams.length === 0 ? (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500">
                            Hiện chưa có đề thi nào từ giáo viên cho môn này.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {exams.map(exam => (
                                <button
                                    key={exam.id}
                                    onClick={() => handleSelectTeacherExam(exam)}
                                    className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-orange-300 transition-all group"
                                >
                                    <h3 className="font-bold text-slate-800 group-hover:text-orange-600">{exam.title}</h3>
                                    <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                        <span>Ngày giao: {new Date(exam.created_at).toLocaleDateString('vi-VN')}</span>
                                        <span className="flex items-center text-orange-500 font-semibold group-hover:underline">
                                            Làm bài <ChevronRightIcon className="w-3 h-3 ml-1" />
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 2: AI Generation */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-2 text-purple-500" />
                        Tạo đề ngẫu nhiên với AI
                    </h2>
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="mb-6 opacity-90">
                            Không tìm thấy đề phù hợp? Hãy để AI tạo ra một đề thi thử ngẫu nhiên dựa trên cấu trúc chuẩn.
                        </p>
                        <button
                            onClick={onGenerateRandom}
                            className="w-full py-3 bg-white text-purple-700 font-bold rounded-lg hover:bg-purple-50 transition-colors shadow-sm"
                        >
                            Tạo đề ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamList;
