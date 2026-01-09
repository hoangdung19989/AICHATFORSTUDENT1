
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
    ArrowRightIcon,
    DocumentTextIcon,
    ShieldCheckIcon
} from '../../components/icons';

const ALL_SUBJECTS = ["Toán", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tin học", "Công nghệ", "GDCD"];
const ALL_GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

interface ExamVariant {
    code: string;
    questions: QuizQuestion[];
}

const ExamManager: React.FC = () => {
    const { user } = useAuth();
    const { navigate } = useNavigation();
    
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [myExams, setMyExams] = useState<any[]>([]);

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(ALL_SUBJECTS[0]);
    const [grade, setGrade] = useState(ALL_GRADES[0]);
    
    // Default deadline: 7 days from now
    const getDefaultDeadline = () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };
    const [deadline, setDeadline] = useState(getDefaultDeadline());
    
    const [externalLink, setExternalLink] = useState('');
    const [uploadedFile, setUploadedFile] = useState<{ file: File, base64?: string, text?: string } | null>(null);
    
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);

    const [shuffleConfig, setShuffleConfig] = useState({
        count: 1,
        mixQuestions: true,
        mixOptions: true
    });
    const [generatedVariants, setGeneratedVariants] = useState<ExamVariant[]>([]);
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);

    useEffect(() => { 
        if (viewMode === 'list' && user) {
            fetchMyExams(); 
        }
    }, [viewMode, user]);

    const fetchMyExams = async () => {
        if (!user) return;
        setIsLoading(true);
        
        const safetyTimer = setTimeout(() => setIsLoading(false), 10000);

        try {
            const { data, error } = await supabase.from('teacher_exams')
                .select('*, exam_results(count)')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                // Fallback: Query đơn giản
                const { data: simpleData } = await supabase.from('teacher_exams')
                    .select('*')
                    .eq('teacher_id', user.id)
                    .order('created_at', { ascending: false });
                setMyExams(simpleData || []);
            } else {
                setMyExams(data || []);
            }
        } catch (err: any) {
            console.error("Lỗi hệ thống:", err);
        } finally {
            clearTimeout(safetyTimer);
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.docx')) {
            setIsLoading(true); 
            try {
                // @ts-ignore
                const { default: mammoth } = await import('https://esm.sh/mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const conv = await mammoth.extractRawText({ arrayBuffer });
                setUploadedFile({ file, text: conv.value });
            } catch (e) { 
                console.error(e);
                alert("Không thể đọc file Word. Hãy thử chuyển sang PDF."); 
                setUploadedFile(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => { 
                const base64 = (reader.result as string).split(',')[1];
                setUploadedFile({ file, base64 }); 
            };
        }
    };

    const handleParse = async () => {
        if (!uploadedFile) { alert("Vui lòng chọn file đề thi."); return; }
        if (!title.trim()) { alert("Vui lòng nhập tên đợt thi."); return; }
        if (!deadline) { alert("Vui lòng chọn hạn nộp bài."); return; }
        
        setIsLoading(true);
        try {
            const base64 = uploadedFile.base64 || "";
            const parsedQuiz = await parseExamDocument(base64, uploadedFile.file.type, uploadedFile.text);
            
            if (!parsedQuiz.questions || parsedQuiz.questions.length === 0) {
                if (window.confirm("AI không tìm thấy câu hỏi trắc nghiệm nào rõ ràng. Bạn có muốn tự nhập thủ công không?")) {
                    setQuestions([{
                        question: "Câu hỏi 1...",
                        options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
                        correctAnswer: "Đáp án A",
                        explanation: ""
                    }]);
                    setStep(2);
                    return;
                } else {
                    throw new Error("Không tìm thấy dữ liệu câu hỏi.");
                }
            }
            
            setQuestions(parsedQuiz.questions);
            setEssayQuestions(parsedQuiz.essayQuestions || []);
            setStep(2);
        } catch (error: any) { 
            alert("LỖI PHÂN TÍCH: " + (error.message || "Hệ thống AI đang bận.")); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const handleGenerateVariants = () => {
        const variants: ExamVariant[] = [];
        const baseCode = 101;
        const shuffleArray = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(8, Math.max(1, shuffleConfig.count)); i++) {
            let variantQuestions = [...questions];
            if (shuffleConfig.mixQuestions) variantQuestions = shuffleArray(variantQuestions);
            if (shuffleConfig.mixOptions) {
                variantQuestions = variantQuestions.map(q => ({
                    ...q, options: shuffleArray([...q.options])
                }));
            }
            variants.push({ code: (baseCode + i).toString(), questions: variantQuestions });
        }
        setGeneratedVariants(variants);
        setActiveVariantIndex(0);
    };

    const handleSaveExam = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // FIX: Luôn đảm bảo có variant, kể cả khi không trộn đề
            let finalVariants = generatedVariants;
            if (step === 3 && generatedVariants.length > 0) {
                finalVariants = generatedVariants;
            } else {
                finalVariants = [{ code: 'GỐC', questions: questions }];
            }
            
            const rawData = {
                questions: questions, 
                essayQuestions: essayQuestions,
                variants: finalVariants,
                isShuffled: finalVariants.length > 1,
                externalLink: externalLink
            };
            
            const isoDeadline = new Date(deadline).toISOString();

            const { error } = await supabase.from('teacher_exams').insert({
                teacher_id: user.id,
                title,
                subject,
                grade,
                deadline: isoDeadline,
                questions: rawData,
                status: 'published'
            });

            if (error) throw error;
            
            alert("ĐÃ GIAO ĐỀ THÀNH CÔNG! Học sinh có thể vào làm bài ngay.");
            // Reset state
            setViewMode('list'); 
            setStep(1); 
            setTitle(''); 
            setDeadline(getDefaultDeadline()); 
            setExternalLink('');
            setQuestions([]); setEssayQuestions([]); setUploadedFile(null); setGeneratedVariants([]);
            
            fetchMyExams();
        } catch (err: any) {
            alert(`LỖI LƯU TRỮ: ${err.message}`);
            console.error("Database save error:", err);
        } finally { setIsLoading(false); }
    };

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

    if (isLoading) return <LoadingSpinner text="Đang xử lý..." subText="Vui lòng đợi trong giây lát..." />;

    return (
        <div className="container mx-auto max-w-5xl pb-20 animate-scale-in">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Quản lý & Giao đề' }]} />
            
            {viewMode === 'list' && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800">Quản lý Đề thi</h1>
                            <p className="text-slate-500 text-sm mt-1">Giao bài và theo dõi tiến độ nộp bài của học sinh.</p>
                        </div>
                        <button onClick={() => setViewMode('create')} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-primary-dark transition-all flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" /> Giao đề mới
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {myExams.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">
                                Chưa có đề thi nào. Hãy nhấn "Giao đề mới" để bắt đầu đẩy bài cho học sinh.
                            </div>
                        ) : (
                            myExams.map(exam => {
                                const deadlineDate = exam.deadline ? new Date(exam.deadline) : null;
                                const isExpired = deadlineDate && deadlineDate < new Date();
                                const submissionCount = exam.exam_results?.[0]?.count || 0;
                                
                                return (
                                    <div key={exam.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-slate-800">{exam.title}</h3>
                                                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{exam.subject}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-400 gap-3">
                                                <span>{exam.grade}</span>
                                                <span>•</span>
                                                <span className={`flex items-center ${isExpired ? 'text-red-500' : 'text-green-600'}`}>
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    Hạn: {deadlineDate ? deadlineDate.toLocaleDateString('vi-VN') : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="block text-2xl font-black text-slate-800 leading-none">{submissionCount}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-black">Bài nộp</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => navigate('exam-results-viewer', { examId: exam.id, examTitle: exam.title })}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold text-xs shadow-sm hover:shadow"
                                                >
                                                    Xem chi tiết
                                                </button>
                                                {/* Tính năng xóa có thể thêm sau */}
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {viewMode === 'create' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center mb-10">
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3].map((s) => (
                                <React.Fragment key={s}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= s ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'border-slate-200 text-slate-300'}`}>
                                        {s}
                                    </div>
                                    {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-brand-primary' : 'bg-slate-200'}`}></div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                             <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center">
                                <ShieldCheckIcon className="h-6 w-6 mr-2 text-brand-primary" /> Thông tin đợt thi mới
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tên đợt thi (VD: Kiểm tra giữa kỳ)</label>
                                    <input type="text" className="w-full p-4 border-2 rounded-2xl bg-slate-50 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold" placeholder="Nhập tên đợt thi..." value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Môn học</label>
                                        <select className="w-full p-4 border-2 rounded-2xl bg-slate-50 font-bold" value={subject} onChange={e => setSubject(e.target.value)}>
                                            {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Khối lớp</label>
                                        <select className="w-full p-4 border-2 rounded-2xl bg-slate-50 font-bold" value={grade} onChange={e => setGrade(e.target.value)}>
                                            {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Hạn nộp bài</label>
                                        <input type="datetime-local" className="w-full p-4 border-2 rounded-2xl bg-slate-50 font-bold" value={deadline} onChange={e => setDeadline(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Link đề gốc (PDF/Drive)</label>
                                        <input type="url" className="w-full p-4 border-2 rounded-2xl bg-slate-50 font-bold" placeholder="https://..." value={externalLink} onChange={e => setExternalLink(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tải đề thi (AI tự trích xuất)</label>
                                    <div className="relative border-4 border-dashed border-slate-100 rounded-3xl p-10 text-center hover:bg-indigo-50 transition-colors cursor-pointer">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} />
                                        {uploadedFile ? (
                                            <div className="text-green-600 font-bold flex flex-col items-center">
                                                <CheckCircleIcon className="h-12 w-12 mb-2" /> {uploadedFile.file.name}
                                            </div>
                                        ) : (
                                            <div className="text-slate-400">
                                                <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                <p className="font-bold">Nhấn hoặc kéo thả file đề thi vào đây</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setViewMode('list')} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-xs">Hủy bỏ</button>
                                    <button onClick={handleParse} className="flex-[2] py-4 bg-brand-primary text-white font-black rounded-2xl shadow-xl hover:shadow-indigo-200 uppercase tracking-widest text-xs">Bắt đầu phân tích</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                             <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">Kiểm tra câu hỏi AI trích xuất</h2>
                                <button onClick={() => setStep(3)} className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2">Tiếp tục: Trộn mã đề <ArrowRightIcon className="h-4 w-4" /></button>
                             </div>
                             <div className="p-8 space-y-8">
                                {questions.map((q, qIdx) => (
                                    <div key={qIdx} className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 relative group">
                                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><TrashIcon className="h-5 w-5" /></button>
                                        <div className="flex gap-4">
                                            <span className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-black text-xs shrink-0">{qIdx + 1}</span>
                                            <div className="flex-1">
                                                <textarea className="w-full bg-transparent font-bold text-slate-800 outline-none resize-none border-b border-transparent focus:border-indigo-200 mb-4" rows={2} value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} onClick={() => setCorrectAnswer(qIdx, opt)} className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${q.correctAnswer === opt ? 'bg-green-50 border-green-500' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${q.correctAnswer === opt ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}></div>
                                                            <input className="bg-transparent outline-none flex-1 text-sm font-medium" value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} onClick={e => e.stopPropagation()} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center"><ArrowPathIcon className="h-5 w-5 mr-2 text-indigo-500" /> Trộn mã đề</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Số mã đề (1-8)</label>
                                            <input type="number" min="1" max="8" className="w-full p-3 border-2 rounded-xl font-black text-center text-xl" value={shuffleConfig.count} onChange={e => setShuffleConfig({...shuffleConfig, count: parseInt(e.target.value)})}/>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                                <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={shuffleConfig.mixQuestions} onChange={e => setShuffleConfig({...shuffleConfig, mixQuestions: e.target.checked})}/>
                                                <span className="font-bold text-sm text-slate-700">Đảo câu hỏi</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                                <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={shuffleConfig.mixOptions} onChange={e => setShuffleConfig({...shuffleConfig, mixOptions: e.target.checked})}/>
                                                <span className="font-bold text-sm text-slate-700">Đảo đáp án</span>
                                            </label>
                                        </div>
                                        <button onClick={handleGenerateVariants} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all uppercase tracking-widest text-xs">Áp dụng trộn đề</button>
                                    </div>
                                </div>
                                <button onClick={handleSaveExam} className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black shadow-xl hover:shadow-green-100 hover:-translate-y-1 transition-all uppercase tracking-widest">HOÀN TẤT & ĐẨY BÀI</button>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-[70vh]">
                                <div className="p-4 bg-slate-50 border-b flex gap-2 overflow-x-auto scrollbar-hide">
                                    {generatedVariants.length === 0 ? (
                                        <div className="text-slate-400 text-xs italic p-2">Nhấn "Áp dụng" để xem trước.</div>
                                    ) : (
                                        generatedVariants.map((v, i) => (
                                            <button key={i} onClick={() => setActiveVariantIndex(i)} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${activeVariantIndex === i ? 'bg-brand-primary text-white shadow-md' : 'bg-white border text-slate-500'}`}>Mã {v.code}</button>
                                        ))
                                    )}
                                </div>
                                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                    {generatedVariants.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="text-center pb-6 border-b-2 border-dashed border-slate-100">
                                                <h2 className="text-xl font-black uppercase">{title}</h2>
                                                <p className="font-bold text-brand-primary">MÃ ĐỀ: {generatedVariants[activeVariantIndex].code}</p>
                                            </div>
                                            {generatedVariants[activeVariantIndex].questions.map((q, i) => (
                                                <div key={i}>
                                                    <p className="font-bold text-slate-800 text-sm mb-2">Câu {i+1}: {q.question}</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                                        {q.options.map((o, oi) => (
                                                            <p key={oi} className={`text-xs p-2 rounded-lg border ${q.correctAnswer === o ? 'bg-green-50 border-green-200 font-bold' : 'bg-slate-50 border-transparent'}`}>{String.fromCharCode(65+oi)}. {o}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExamManager;
