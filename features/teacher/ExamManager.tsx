
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { parseExamDocument } from '../../services/geminiService';
import type { QuizQuestion, EssayQuestion, TeacherExam } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CloudArrowUpIcon, CheckCircleIcon, DocumentTextIcon, PencilSquareIcon, XMarkIcon, ClockIcon, ChartBarIcon, ArrowPathIcon } from '../../components/icons';

const ALL_SUBJECTS = ["Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tin học", "Công nghệ"];

const ExamManager: React.FC = () => {
    const { user } = useAuth();
    const { navigate } = useNavigation();
    
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [myExams, setMyExams] = useState<any[]>([]);
    const [isFetchingExams, setIsFetchingExams] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(ALL_SUBJECTS[0]);
    const [grade, setGrade] = useState('Lớp 6');
    const [deadline, setDeadline] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (viewMode === 'list') fetchMyExams();
    }, [viewMode]);

    const fetchMyExams = async () => {
        setIsFetchingExams(true);
        const { data, error } = await supabase
            .from('teacher_exams')
            .select('*, exam_results(count)')
            .eq('teacher_id', user?.id)
            .order('created_at', { ascending: false });
        if (!error) setMyExams(data || []);
        setIsFetchingExams(false);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
        });
    };

    const handleParse = async () => {
        if (!title || !uploadedFile || !deadline) {
            alert("Vui lòng nhập tên đề, chọn hạn nộp và tải file.");
            return;
        }
        setIsLoading(true);
        try {
            const base64Data = await fileToBase64(uploadedFile);
            const parsedQuiz = await parseExamDocument(base64Data, uploadedFile.type);
            setQuestions(parsedQuiz.questions || []);
            setEssayQuestions(parsedQuiz.essayQuestions || []);
            setStep(2);
        } catch (error: any) {
            alert("Lỗi: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.from('teacher_exams').insert({
                teacher_id: user.id,
                title,
                subject,
                grade,
                deadline: new Date(deadline).toISOString(),
                questions: { questions, essayQuestions },
                status: 'published'
            });
            if (error) throw error;
            alert("Đã giao bài thành công!");
            setViewMode('list');
            setStep(1);
        } catch (error: any) {
            alert("Lỗi: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Quản lý & Giao đề' }]} />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800">
                    {viewMode === 'list' ? 'Đề thi đã giao' : 'Tạo đợt thi mới'}
                </h1>
                <button 
                    onClick={() => setViewMode(viewMode === 'list' ? 'create' : 'list')}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${viewMode === 'list' ? 'bg-brand-primary text-white hover:bg-brand-primary-dark' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                    {viewMode === 'list' ? '+ Giao đề mới' : 'Quay lại danh sách'}
                </button>
            </div>

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-4">
                    {isFetchingExams ? <LoadingSpinner /> : myExams.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 italic">
                            Chưa có đề thi nào được giao.
                        </div>
                    ) : (
                        myExams.map(exam => {
                            const isExpired = new Date(exam.deadline) < new Date();
                            const submissionCount = exam.exam_results?.[0]?.count || 0;
                            return (
                                <div key={exam.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-800">{exam.title}</h3>
                                            {isExpired ? (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-md uppercase">Hết hạn</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-md uppercase">Đang mở</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center"><ClockIcon className="w-3 h-3 mr-1" /> Hạn: {new Date(exam.deadline).toLocaleString('vi-VN')}</span>
                                            <span>Môn: {exam.subject}</span>
                                            <span>Lớp: {exam.grade}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right mr-4">
                                            <p className="text-xs text-slate-400 font-bold uppercase">Đã nộp</p>
                                            <p className="text-xl font-black text-brand-primary">{submissionCount}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('exam-results-viewer', { examId: exam.id, examTitle: exam.title })}
                                            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-primary hover:text-white transition-all group"
                                            title="Xem danh sách thí sinh"
                                        >
                                            <ChartBarIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên đợt thi</label>
                                    <input type="text" className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-brand-primary transition-all" placeholder="VD: Thi thử giữa kỳ 2..." value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Hạn chót làm bài</label>
                                    <input type="datetime-local" className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-brand-primary transition-all" value={deadline} onChange={e => setDeadline(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
                                    <select className="w-full border-2 border-slate-100 rounded-xl p-3 bg-white" value={subject} onChange={e => setSubject(e.target.value)}>
                                        {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Khối lớp</label>
                                    <select className="w-full border-2 border-slate-100 rounded-xl p-3 bg-white" value={grade} onChange={e => setGrade(e.target.value)}>
                                        {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">File đề thi (PDF/Ảnh)</label>
                                <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                            </div>
                            <button onClick={handleParse} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all">BƯỚC TIẾP THEO: DUYỆT CÂU HỎI</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl">
                                <span className="font-bold text-indigo-700">Đã trích xuất {questions.length} câu trắc nghiệm & {essayQuestions.length} câu tự luận</span>
                                <button onClick={handlePublish} disabled={isSaving} className="bg-brand-primary text-white px-8 py-2 rounded-xl font-bold shadow-md hover:bg-brand-primary-dark">
                                    {isSaving ? 'Đang lưu...' : 'GIAO ĐỀ NGAY'}
                                </button>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="p-4 border rounded-xl bg-slate-50">
                                        <p className="font-bold text-slate-800 mb-2">Câu {idx + 1}: {q.question}</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {q.options.map((opt, i) => <div key={i} className={`p-2 rounded-lg border ${q.correctAnswer === opt ? 'bg-green-100 border-green-300 font-bold' : 'bg-white'}`}>{opt}</div>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExamManager;
