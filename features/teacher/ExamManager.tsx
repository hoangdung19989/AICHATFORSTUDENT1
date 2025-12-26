
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { parseExamDocument } from '../../services/geminiService';
import type { QuizQuestion, EssayQuestion, TeacherExam } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CloudArrowUpIcon, CheckCircleIcon, DocumentTextIcon, PencilSquareIcon, XMarkIcon, ClockIcon, ChartBarIcon, ArrowPathIcon } from '../../components/icons';
// @ts-ignore
import mammoth from 'https://esm.sh/mammoth';

const ALL_SUBJECTS = ["Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tin học", "Công nghệ"];

const ExamManager: React.FC = () => {
    const { user } = useAuth();
    const { navigate } = useNavigation();
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [myExams, setMyExams] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(ALL_SUBJECTS[0]);
    const [grade, setGrade] = useState('Lớp 6');
    const [deadline, setDeadline] = useState('');
    const [uploadedFile, setUploadedFile] = useState<{ file: File, base64?: string, text?: string } | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { if (viewMode === 'list') fetchMyExams(); }, [viewMode]);

    const fetchMyExams = async () => {
        const { data } = await supabase.from('teacher_exams').select('*, exam_results(count)').eq('teacher_id', user?.id).order('created_at', { ascending: false });
        setMyExams(data || []);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const arrayBuffer = ev.target?.result as ArrayBuffer;
                const conv = await mammoth.extractRawText({ arrayBuffer });
                setUploadedFile({ file, text: conv.value });
            };
            reader.readAsArrayBuffer(file);
        } else {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setUploadedFile({ file, base64: (reader.result as string).split(',')[1] });
            };
        }
    };

    const handleParse = async () => {
        if (!uploadedFile) return;
        setIsLoading(true);
        try {
            // Lưu ý: Gemini chưa hỗ trợ gửi text text trực tiếp qua parseExamDocument như binary, 
            // nên ta giả lập hoặc gửi qua một prompt khác nếu cần. 
            // Ở đây ta ưu tiên dùng PDF/Ảnh hoặc dán text.
            const base64 = uploadedFile.base64 || "";
            const parsedQuiz = await parseExamDocument(base64, uploadedFile.file.type);
            setQuestions(parsedQuiz.questions || []);
            setEssayQuestions(parsedQuiz.essayQuestions || []);
            setStep(2);
        } catch (error: any) { alert(error.message); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Quản lý & Giao đề' }]} />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold">{viewMode === 'list' ? 'Đề thi đã giao' : 'Tạo đợt thi mới'}</h1>
                <button onClick={() => setViewMode(viewMode === 'list' ? 'create' : 'list')} className="bg-brand-primary text-white px-6 py-2 rounded-xl">
                    {viewMode === 'list' ? '+ Giao đề mới' : 'Quay lại'}
                </button>
            </div>

            {viewMode === 'create' && (
                <div className="bg-white p-8 rounded-3xl shadow-xl">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <input type="text" placeholder="Tên đợt thi" className="w-full p-4 border rounded-xl" value={title} onChange={e => setTitle(e.target.value)} />
                            <input type="file" accept=".docx,.pdf,.png,.jpg" className="w-full" onChange={handleFileChange} />
                            <button onClick={handleParse} className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold">TIẾP TỤC</button>
                        </div>
                    ) : (
                        <div className="p-4 bg-green-50 rounded-xl text-center">Đã sẵn sàng giao bài.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExamManager;
