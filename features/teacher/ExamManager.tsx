
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { parseExamDocument } from '../../services/geminiService';
import type { QuizQuestion, EssayQuestion } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    PencilSquareIcon, 
    XMarkIcon, 
    ClockIcon, 
    ChartBarIcon, 
    ArrowPathIcon,
    TrashIcon,
    PlusIcon,
    PhotoIcon,
    ArrowRightIcon,
    DocumentTextIcon
} from '../../components/icons';
// @ts-ignore
import mammoth from 'https://esm.sh/mammoth';

// FIX: Tên môn học phải khớp chính xác với MOCK_EXAM_SUBJECTS trong data/subjects.ts để học sinh có thể filter thấy
const ALL_SUBJECTS = ["Toán", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tin học", "Công nghệ", "GDCD"];
const ALL_GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

interface ExamVariant {
    code: string;
    questions: QuizQuestion[];
}

const ExamManager: React.FC = () => {
    const { user } = useAuth();
    const { navigate } = useNavigation();
    
    // View States
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Edit/Review, 3: Shuffle
    const [isLoading, setIsLoading] = useState(false);
    const [myExams, setMyExams] = useState<any[]>([]);

    // Form Data
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(ALL_SUBJECTS[0]);
    const [grade, setGrade] = useState(ALL_GRADES[0]);
    const [deadline, setDeadline] = useState('');
    const [externalLink, setExternalLink] = useState(''); // NEW: Link đề gốc
    const [uploadedFile, setUploadedFile] = useState<{ file: File, base64?: string, text?: string } | null>(null);
    
    // Editor Data
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);

    // Shuffle Data
    const [shuffleConfig, setShuffleConfig] = useState({
        count: 1,
        mixQuestions: true,
        mixOptions: true
    });
    const [generatedVariants, setGeneratedVariants] = useState<ExamVariant[]>([]);
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);

    useEffect(() => { if (viewMode === 'list') fetchMyExams(); }, [viewMode]);

    const fetchMyExams = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Attempt to fetch exams with result counts
            const { data, error } = await supabase.from('teacher_exams')
                .select('*, exam_results(count)')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setMyExams(data || []);
        } catch (err: any) {
            console.warn("Error fetching exams with counts (trying fallback):", err);
            
            // Fallback: Fetch exams without result counts (in case of relation error)
            try {
                const { data, error } = await supabase.from('teacher_exams')
                    .select('*')
                    .eq('teacher_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setMyExams(data || []);
            } catch (fallbackErr: any) {
                console.error("Error fetching exams (fallback failed):", fallbackErr);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const arrayBuffer = ev.target?.result as ArrayBuffer;
                try {
                    const conv = await mammoth.extractRawText({ arrayBuffer });
                    setUploadedFile({ file, text: conv.value });
                } catch (e) {
                    alert("Lỗi đọc file Word.");
                }
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
        // Chỉ bắt buộc uploadedFile nếu chưa nhập externalLink HOẶC cần AI parse
        // Ở đây ta bắt buộc uploadedFile ĐỂ AI PARSE, dù có link hay không
        if (!uploadedFile) {
            alert("Vui lòng tải file đề thi lên để AI có thể trích xuất câu hỏi.");
            return;
        }
        if (!title || !deadline) {
            alert("Vui lòng nhập đủ thông tin (Tên đợt thi, Hạn nộp).");
            return;
        }
        setIsLoading(true);
        try {
            const base64 = uploadedFile.base64 || "";
            const parsedQuiz = await parseExamDocument(base64, uploadedFile.file.type, uploadedFile.text);
            setQuestions(parsedQuiz.questions || []);
            setEssayQuestions(parsedQuiz.essayQuestions || []);
            setStep(2);
        } catch (error: any) { 
            alert("Lỗi xử lý file: " + error.message); 
        } finally { 
            setIsLoading(false); 
        }
    };

    // Helper: Shuffle Array
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleGenerateVariants = () => {
        const variants: ExamVariant[] = [];
        const baseCode = 101;

        for (let i = 0; i < shuffleConfig.count; i++) {
            let variantQuestions = [...questions];

            // 1. Shuffle Questions
            if (shuffleConfig.mixQuestions) {
                variantQuestions = shuffleArray(variantQuestions);
            }

            // 2. Shuffle Options within each question
            if (shuffleConfig.mixOptions) {
                variantQuestions = variantQuestions.map(q => {
                    const originalOptions = [...q.options];
                    const shuffledOptions = shuffleArray(originalOptions);
                    return {
                        ...q,
                        options: shuffledOptions
                    };
                });
            }

            variants.push({
                code: (baseCode + i).toString(),
                questions: variantQuestions
            });
        }
        setGeneratedVariants(variants);
        setActiveVariantIndex(0);
    };

    const goToShuffleStep = () => {
        // Validate answer key before moving to shuffle
        const unanswered = questions.findIndex(q => !q.correctAnswer);
        if (unanswered !== -1) {
            if (!confirm(`Câu hỏi số ${unanswered + 1} chưa có đáp án đúng. Bạn có chắc chắn muốn tiếp tục không?`)) {
                return;
            }
        }
        // Init logic for step 3: Default to 1 variant (original) if empty
        if (generatedVariants.length === 0) {
            setGeneratedVariants([{ code: 'GỐC', questions: questions }]);
        }
        setStep(3);
    };

    const handleSaveExam = async () => {
        // 1. Validation
        if (!user) {
            alert("Vui lòng đăng nhập lại để thực hiện chức năng này.");
            return;
        }
        if (!title.trim() || !deadline) {
            alert("Thiếu thông tin đề thi hoặc hạn nộp. Vui lòng quay lại Bước 1 kiểm tra.");
            return;
        }
        if (questions.length === 0 && essayQuestions.length === 0) {
            alert("Đề thi trống! Vui lòng thêm câu hỏi.");
            return;
        }

        setIsLoading(true);
        try {
            // Determine variants to save
            let finalVariants = null;
            if (step === 3 && generatedVariants.length > 0) {
                finalVariants = generatedVariants;
            } else {
                finalVariants = [{ code: 'GỐC', questions: questions }];
            }

            // Prepare payload - NEW: Add externalLink
            const rawData = {
                questions: questions, 
                essayQuestions: essayQuestions,
                variants: finalVariants,
                isShuffled: !!finalVariants && finalVariants.length > 1,
                externalLink: externalLink // Lưu link đề gốc vào JSON
            };

            // 2. SANITIZATION: Remove 'undefined' values (Supabase JSONB prohibits undefined)
            // This is the crucial fix for Supabase JSONB errors
            const cleanData = JSON.parse(JSON.stringify(rawData));

            // 3. Ensure Deadline is ISO format
            let isoDeadline = deadline;
            try {
                isoDeadline = new Date(deadline).toISOString();
            } catch (e) {
                throw new Error("Định dạng ngày tháng không hợp lệ.");
            }

            const { error } = await supabase.from('teacher_exams').insert({
                teacher_id: user.id,
                title,
                subject,
                grade,
                deadline: isoDeadline,
                questions: cleanData,
                status: 'published'
            });

            if (error) throw error;

            alert("Giao bài thành công! Học sinh đã có thể làm bài.");
            
            // Reset form
            setViewMode('list');
            setStep(1);
            setTitle('');
            setDeadline('');
            setExternalLink('');
            setQuestions([]);
            setEssayQuestions([]);
            setUploadedFile(null);
            setGeneratedVariants([]);
            setShuffleConfig({ count: 1, mixQuestions: true, mixOptions: true });
            
            // Refresh list
            fetchMyExams();

        } catch (err: any) {
            console.error("Lỗi lưu đề:", err);
            
            let finalMessage = "Đã xảy ra lỗi không xác định";

            if (typeof err === 'string') {
                finalMessage = err;
            } else if (err instanceof Error) {
                finalMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                // Xử lý lỗi từ Supabase (thường có thuộc tính message, details, hint, code)
                if (typeof err.message === 'string') {
                    finalMessage = err.message;
                    if (err.details) finalMessage += ` (${err.details})`;
                    if (err.hint) finalMessage += `\nGợi ý: ${err.hint}`;
                } else if (typeof err.error_description === 'string') {
                    finalMessage = err.error_description;
                } else {
                    // Nếu là object lạ, thử stringify
                    try {
                        const json = JSON.stringify(err, null, 2);
                        // Nếu là Error object thì stringify sẽ ra {}, lúc đó dùng String(err) hoặc message mặc định
                        if (json === '{}' || json === '[]') {
                             finalMessage = String(err);
                        } else {
                             finalMessage = json;
                        }
                    } catch (e) {
                        finalMessage = "Lỗi không thể đọc chi tiết (Lỗi đối tượng phức tạp)";
                    }
                }
            } else {
                finalMessage = String(err);
            }

            // Chặn tuyệt đối chuỗi "[object Object]"
            if (String(finalMessage).includes("[object Object]")) {
                finalMessage = "Lỗi hệ thống (Chi tiết trong Console)";
            }
            
            alert(`Lỗi lưu đề: ${finalMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Editor Handlers
    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const newQs = [...questions];
        newQs[index] = { ...newQs[index], [field]: value };
        setQuestions(newQs);
    };

    const updateOption = (qIndex: number, oIndex: number, text: string) => {
        const newQs = [...questions];
        newQs[qIndex].options[oIndex] = text;
        setQuestions(newQs);
    };

    const setCorrectAnswer = (qIndex: number, optionText: string) => {
        const newQs = [...questions];
        newQs[qIndex].correctAnswer = optionText;
        setQuestions(newQs);
    };

    const deleteQuestion = (index: number) => {
        const newQs = questions.filter((_, i) => i !== index);
        setQuestions(newQs);
    };

    const handleQuestionImageUpload = (qIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                updateQuestion(qIndex, 'image', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQuestionImage = (qIndex: number) => {
        const newQs = [...questions];
        delete newQs[qIndex].image;
        setQuestions(newQs);
    };

    const handleEssayImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                const newEqs = [...essayQuestions];
                newEqs[index].image = base64;
                setEssayQuestions(newEqs);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeEssayImage = (index: number) => {
        const newEqs = [...essayQuestions];
        delete newEqs[index].image;
        setEssayQuestions(newEqs);
    };

    if (isLoading) return <LoadingSpinner text={step === 1 ? "Đang phân tích đề thi..." : "Đang xử lý dữ liệu..."} />;

    return (
        <div className="container mx-auto max-w-5xl pb-20 animate-scale-in">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Quản lý & Giao đề' }]} />
            
            {viewMode === 'list' && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-800">Danh sách Đề thi đã giao</h1>
                        <button onClick={() => setViewMode('create')} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-primary-dark transition-all flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" /> Giao đề mới
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {myExams.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">
                                Chưa có đề thi nào được tạo.
                            </div>
                        ) : (
                            myExams.map(exam => (
                                <div key={exam.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{exam.title}</h3>
                                        <div className="flex items-center text-sm text-slate-500 gap-3">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase">{exam.subject}</span>
                                            <span className="text-slate-300">|</span>
                                            <span>{exam.grade}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className={`flex items-center ${new Date(exam.deadline) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                Hạn: {new Date(exam.deadline).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                                        <div className="text-center px-4">
                                            <span className="block text-2xl font-bold text-slate-800">{exam.exam_results?.[0]?.count || 0}</span>
                                            <span className="text-xs text-slate-400 uppercase font-bold">Đã nộp</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate('exam-results-viewer', { examId: exam.id, examTitle: exam.title })}
                                            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                            title="Xem kết quả"
                                        >
                                            <ChartBarIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {viewMode === 'create' && step === 1 && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Thiết lập Đợt thi mới</h2>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên đợt thi</label>
                            <input type="text" className="w-full p-4 border rounded-2xl bg-slate-50 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold" placeholder="VD: Kiểm tra 15 phút - Chương 1" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Môn học</label>
                                <select className="w-full p-4 border rounded-2xl bg-slate-50 font-medium outline-none" value={subject} onChange={e => setSubject(e.target.value)}>
                                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Khối lớp</label>
                                <select className="w-full p-4 border rounded-2xl bg-slate-50 font-medium outline-none" value={grade} onChange={e => setGrade(e.target.value)}>
                                    {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hạn nộp bài</label>
                            <input type="datetime-local" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none font-medium" value={deadline} onChange={e => setDeadline(e.target.value)} />
                        </div>

                        {/* NEW: External Link Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Link đề gốc (Google Drive/Dropbox)</label>
                            <div className="flex items-center bg-slate-50 rounded-2xl border px-3">
                                <DocumentTextIcon className="h-5 w-5 text-slate-400 mr-2" />
                                <input 
                                    type="url" 
                                    className="w-full p-4 bg-transparent outline-none font-medium text-sm" 
                                    placeholder="Dán link file đề tại đây (để học sinh xem khi làm bài)..." 
                                    value={externalLink} 
                                    onChange={e => setExternalLink(e.target.value)} 
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 italic ml-2">Học sinh có thể mở link này để xem đề bài gốc nếu cần đối chiếu hình ảnh/bảng biểu.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tải file đề (Để AI đọc)</label>
                            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} />
                                {uploadedFile ? (
                                    <div className="flex items-center justify-center text-green-600 font-bold">
                                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                                        {uploadedFile.file.name}
                                    </div>
                                ) : (
                                    <div className="text-slate-400">
                                        <CloudArrowUpIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Nhấn để tải file (PDF/Word/Ảnh)</span>
                                        <p className="text-[10px] mt-1 opacity-70">File này chỉ dùng để AI tạo câu hỏi, KHÔNG lưu trữ trên server.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button onClick={() => setViewMode('list')} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Hủy</button>
                            <button onClick={handleParse} className="flex-[2] py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-primary-dark transition-all">TIẾP TỤC</button>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'create' && step === 2 && (
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-20">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Duyệt & Chỉnh sửa Đề</h2>
                            <p className="text-sm text-slate-500">Hãy chọn đáp án đúng cho từng câu trắc nghiệm.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg text-sm">Quay lại</button>
                            <button onClick={goToShuffleStep} className="px-6 py-2 bg-brand-blue text-white font-bold rounded-xl shadow hover:bg-brand-blue-dark text-sm flex items-center">
                                TIẾP TỤC: TRỘN ĐỀ <ArrowRightIcon className="h-4 w-4 ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-10">
                        {/* Questions List (Review Mode) */}
                        {questions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-black text-brand-primary uppercase mb-6 flex items-center">
                                    <CheckCircleIcon className="h-6 w-6 mr-2" /> Phần Trắc nghiệm ({questions.length} câu)
                                </h3>
                                <div className="space-y-8">
                                    {questions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group">
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => deleteQuestion(qIdx)} className="p-2 bg-white text-red-500 rounded-full shadow hover:bg-red-50">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="flex gap-4 mb-4">
                                                <span className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">{qIdx + 1}</span>
                                                <div className="flex-1">
                                                    {q.image && (
                                                        <div className="relative mb-3 inline-block">
                                                            <img src={q.image} alt="Minh họa" className="max-h-48 rounded-lg border border-slate-300" />
                                                            <button 
                                                                onClick={() => removeQuestionImage(qIdx)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                                                title="Xóa ảnh"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    <textarea 
                                                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 focus:bg-white outline-none p-2 rounded transition-all font-medium text-slate-800 resize-none mb-2"
                                                        rows={2}
                                                        value={q.question}
                                                        onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                                                    />

                                                    <div className="mt-1">
                                                        <label className="cursor-pointer inline-flex items-center text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors">
                                                            <PhotoIcon className="h-4 w-4 mr-1.5" />
                                                            {q.image ? 'Thay đổi hình minh họa' : 'Thêm hình minh họa'}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleQuestionImageUpload(qIdx, e)} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} 
                                                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${q.correctAnswer === opt ? 'bg-green-50 border-green-500' : 'bg-white border-transparent hover:border-slate-200'}`}
                                                        onClick={() => setCorrectAnswer(qIdx, opt)}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${q.correctAnswer === opt ? 'border-green-600' : 'border-slate-300'}`}>
                                                            {q.correctAnswer === opt && <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            className="flex-1 bg-transparent outline-none text-sm text-slate-700"
                                                            value={opt}
                                                            onChange={(e) => { e.stopPropagation(); updateOption(qIdx, oIdx, e.target.value); }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {essayQuestions.length > 0 && (
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-black text-brand-primary uppercase mb-6 flex items-center">
                                    <PencilSquareIcon className="h-6 w-6 mr-2" /> Phần Tự luận ({essayQuestions.length} câu)
                                </h3>
                                <div className="space-y-4">
                                    {essayQuestions.map((eq, idx) => (
                                        <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                            <div className="flex gap-4">
                                                <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                                                <div className="flex-1">
                                                    {eq.image && (
                                                        <div className="relative mb-3 inline-block">
                                                            <img src={eq.image} alt="Minh họa" className="max-h-48 rounded-lg border border-slate-300" />
                                                            <button 
                                                                onClick={() => removeEssayImage(idx)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                                                title="Xóa ảnh"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <textarea 
                                                        className="w-full bg-transparent border-b border-transparent focus:border-orange-300 focus:bg-white outline-none p-2 rounded transition-all font-medium text-slate-800 resize-none mb-2"
                                                        rows={3}
                                                        value={eq.question}
                                                        onChange={e => {
                                                            const newEqs = [...essayQuestions];
                                                            newEqs[idx].question = e.target.value;
                                                            setEssayQuestions(newEqs);
                                                        }}
                                                    />
                                                    <div className="mt-1">
                                                        <label className="cursor-pointer inline-flex items-center text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors">
                                                            <PhotoIcon className="h-4 w-4 mr-1.5" />
                                                            {eq.image ? 'Thay đổi hình minh họa' : 'Thêm hình minh họa'}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleEssayImageUpload(idx, e)} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 3: SHUFFLE & PREVIEW */}
            {viewMode === 'create' && step === 3 && (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Panel: Configuration */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <ArrowPathIcon className="h-6 w-6 mr-2 text-brand-primary" /> Cấu hình trộn đề
                            </h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Số lượng mã đề</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="range" min="1" max="8" step="1" 
                                            className="flex-1 accent-brand-primary"
                                            value={shuffleConfig.count}
                                            onChange={(e) => setShuffleConfig({...shuffleConfig, count: parseInt(e.target.value)})}
                                        />
                                        <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl font-black text-xl text-slate-700">
                                            {shuffleConfig.count}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
                                            checked={shuffleConfig.mixQuestions}
                                            onChange={(e) => setShuffleConfig({...shuffleConfig, mixQuestions: e.target.checked})}
                                        />
                                        <span className="font-bold text-slate-700">Đảo thứ tự câu hỏi</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
                                            checked={shuffleConfig.mixOptions}
                                            onChange={(e) => setShuffleConfig({...shuffleConfig, mixOptions: e.target.checked})}
                                        />
                                        <span className="font-bold text-slate-700">Đảo vị trí đáp án</span>
                                    </label>
                                </div>

                                <button 
                                    onClick={handleGenerateVariants}
                                    className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center"
                                >
                                    <ArrowPathIcon className="h-5 w-5 mr-2" /> Tạo mã đề
                                </button>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                            <h3 className="font-bold text-indigo-900 mb-2">Lưu ý</h3>
                            <ul className="text-sm text-indigo-800 space-y-2 list-disc pl-4">
                                <li>Phần tự luận sẽ giữ nguyên ở tất cả các mã đề.</li>
                                <li>Mỗi học sinh khi vào thi sẽ được hệ thống ngẫu nhiên phát một mã đề.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Quay lại</button>
                            <button onClick={handleSaveExam} className="flex-[2] py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 flex items-center justify-center">
                                <CheckCircleIcon className="h-5 w-5 mr-2" /> HOÀN TẤT & GIAO BÀI
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Preview */}
                    <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[80vh]">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Xem trước mã đề</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {generatedVariants.map((v, idx) => (
                                    <button
                                        key={v.code}
                                        onClick={() => setActiveVariantIndex(idx)}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                                            activeVariantIndex === idx 
                                            ? 'bg-brand-primary text-white shadow-md' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Mã {v.code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {generatedVariants.length > 0 && (
                                <div className="space-y-8">
                                    <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                                        <h2 className="text-2xl font-bold uppercase">{title}</h2>
                                        <p className="font-bold text-slate-500">Mã đề: {generatedVariants[activeVariantIndex].code}</p>
                                    </div>

                                    {generatedVariants[activeVariantIndex].questions.map((q, idx) => (
                                        <div key={idx} className="mb-6 last:mb-0">
                                            <div className="flex gap-3 mb-2">
                                                <span className="font-bold text-brand-primary">Câu {idx + 1}:</span>
                                                <div className="flex-1">
                                                    {q.image && <img src={q.image} className="max-h-40 rounded-lg border border-slate-200 mb-3" alt="Minh họa" />}
                                                    <p className="font-medium text-slate-800">{q.question}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`p-3 rounded-lg border text-sm ${q.correctAnswer === opt ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                        {String.fromCharCode(65 + oIdx)}. {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {essayQuestions.length > 0 && (
                                        <div className="mt-8 pt-8 border-t-2 border-slate-200">
                                            <h3 className="font-bold text-lg mb-4 uppercase text-slate-700">Phần Tự luận</h3>
                                            {essayQuestions.map((eq, idx) => (
                                                <div key={idx} className="mb-6">
                                                    <div className="flex gap-3">
                                                        <span className="font-bold text-slate-700">Câu {generatedVariants[activeVariantIndex].questions.length + idx + 1}:</span>
                                                        <div className="flex-1">
                                                            {eq.image && <img src={eq.image} className="max-h-40 rounded-lg border border-slate-200 mb-3" alt="Minh họa" />}
                                                            <p className="text-slate-800">{eq.question}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManager;
