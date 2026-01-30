
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { parseExamDocument } from '../../services/geminiService';
import type { QuizQuestion, EssayQuestion } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MathRenderer from '../../components/common/MathRenderer'; // Import MathRenderer
import { 
    CloudArrowUpIcon, 
    PlusIcon,
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
        try {
            const { data, error } = await supabase.from('teacher_exams')
                .select('*, exam_results(count)')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setMyExams(data || []);
        } catch (err: any) { console.error(err); } 
        finally { setIsLoading(false); }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.docx')) {
            setIsLoading(true); 
            try {
                // @ts-ignore
                const mammothModule = await import('https://esm.sh/mammoth@1.6.0');
                const mammoth = mammothModule.default || mammothModule;
                
                const arrayBuffer = await file.arrayBuffer();
                const conv = await mammoth.extractRawText({ arrayBuffer });
                setUploadedFile({ file, text: conv.value });
            } catch (e) { 
                console.error(e);
                alert("Lỗi đọc file Word."); 
                setUploadedFile(null);
            } finally { setIsLoading(false); }
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
        if (!uploadedFile) { alert("Vui lòng chọn file."); return; }
        if (!title.trim()) { alert("Vui lòng nhập tên bài thi."); return; }
        
        setIsLoading(true);
        try {
            const base64 = uploadedFile.base64 || "";
            const parsedQuiz = await parseExamDocument(base64, uploadedFile.file.type, uploadedFile.text);
            
            if (!parsedQuiz.questions || parsedQuiz.questions.length === 0) {
                setQuestions([{
                    question: "Câu hỏi mẫu (AI chưa đọc được file)",
                    options: ["A", "B", "C", "D"],
                    correctAnswer: "A",
                    explanation: "Vui lòng nhập thủ công."
                }]);
            } else {
                setQuestions(parsedQuiz.questions);
            }
            setEssayQuestions(parsedQuiz.essayQuestions || []);
            setStep(2);
        } catch (error: any) { 
            alert("Lỗi AI: " + error.message); 
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
        if (!user) { alert("Vui lòng đăng nhập lại."); return; }
        if (questions.length === 0) { alert("Đề thi trống!"); return; }

        setIsLoading(true);
        try {
            let finalVariants = generatedVariants;
            if (finalVariants.length === 0) {
                finalVariants = [{ code: 'GỐC', questions: [...questions] }];
            }
            const cleanQuestions = JSON.parse(JSON.stringify(questions));
            const cleanEssay = JSON.parse(JSON.stringify(essayQuestions));
            const cleanVariants = JSON.parse(JSON.stringify(finalVariants));

            const examPayload = {
                source: 'uploaded',
                questions: cleanQuestions,
                essayQuestions: cleanEssay,
                variants: cleanVariants,
                isShuffled: cleanVariants.length > 1,
                externalLink: externalLink || ""
            };

            const isoDeadline = new Date(deadline).toISOString();

            const { error } = await supabase.from('teacher_exams').insert({
                teacher_id: user.id,
                title: title.trim(),
                subject: subject,
                grade: grade,
                deadline: isoDeadline,
                questions: examPayload, 
                status: 'published'
            });

            if (error) throw error;
            alert("✅ GIAO BÀI THÀNH CÔNG!");
            setStep(1);
            setViewMode('list');
            setTitle('');
            setQuestions([]);
            setEssayQuestions([]);
            setGeneratedVariants([]);
            setUploadedFile(null);
            fetchMyExams();
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(`LỖI: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
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

    if (isLoading) return <LoadingSpinner text="Đang xử lý dữ liệu..." subText="Vui lòng đợi, không tắt trình duyệt." />;

    return (
        <div className="container mx-auto max-w-5xl pb-20 animate-scale-in">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Quản lý & Giao đề' }]} />
            
            {viewMode === 'list' && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800">Quản lý Đề thi</h1>
                            <p className="text-slate-500 text-sm mt-1">Danh sách các bài tập đã giao.</p>
                        </div>
                        <button onClick={() => setViewMode('create')} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-primary-dark transition-all flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" /> Giao đề mới
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {myExams.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">Chưa có đề thi nào.</div>
                        ) : (
                            myExams.map(exam => {
                                const submissionCount = exam.exam_results?.[0]?.count || 0;
                                return (
                                    <div key={exam.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{exam.title}</h3>
                                            <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded">{exam.subject}</span>
                                                <span className="bg-slate-100 px-2 py-0.5 rounded">{exam.grade}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-2xl font-black text-slate-800">{submissionCount}</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Bài nộp</span>
                                            <button onClick={() => navigate('exam-results-viewer', { examId: exam.id, examTitle: exam.title })} className="block mt-2 text-indigo-600 text-xs font-bold hover:underline">Xem chi tiết</button>
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
                    {/* Stepper */}
                    <div className="flex items-center justify-center mb-8 gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-primary text-white' : 'bg-slate-200'}`}>1</div>
                        <div className="w-10 h-1 bg-slate-200"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-primary text-white' : 'bg-slate-200'}`}>2</div>
                        <div className="w-10 h-1 bg-slate-200"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-brand-primary text-white' : 'bg-slate-200'}`}>3</div>
                    </div>

                    {step === 1 && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6">
                            <h2 className="text-2xl font-bold">Bước 1: Thông tin đề thi</h2>
                            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100">
                                💡 <strong>Mẹo:</strong> Để AI nhận diện công thức Toán/Lý/Hóa tốt nhất, hãy tải lên <strong>Ảnh (JPG/PNG)</strong> hoặc file <strong>PDF</strong>. Nếu dùng file Word, hãy đảm bảo công thức không bị lỗi font MathType.
                            </div>
                            <input type="text" className="w-full p-4 border rounded-xl font-bold" placeholder="Tên bài thi (VD: Kiểm tra 15p)" value={title} onChange={e => setTitle(e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <select className="p-3 border rounded-xl" value={subject} onChange={e => setSubject(e.target.value)}>{ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                <select className="p-3 border rounded-xl" value={grade} onChange={e => setGrade(e.target.value)}>{ALL_GRADES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1">Hạn nộp</label>
                                    <input type="datetime-local" className="w-full p-3 border rounded-xl" value={deadline} onChange={e => setDeadline(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">Link đề gốc (nếu có)</label>
                                    <input type="text" className="w-full p-3 border rounded-xl" placeholder="Link Drive..." value={externalLink} onChange={e => setExternalLink(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 relative">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,.docx,.jpg,.png" />
                                {uploadedFile ? <p className="text-green-600 font-bold">{uploadedFile.file.name}</p> : <p className="text-slate-500">Nhấn để tải file đề (Word/PDF/Ảnh)</p>}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setViewMode('list')} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600">Hủy</button>
                                <button onClick={handleParse} className="flex-[2] py-3 bg-brand-primary text-white rounded-xl font-bold">Tiếp tục: Trích xuất câu hỏi</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Bước 2: Duyệt câu hỏi ({questions.length} câu)</h2>
                                <button onClick={() => setStep(3)} className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold">Tiếp tục</button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="border p-4 rounded-xl relative group">
                                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xs">Xóa</button>
                                        
                                        {/* Hiển thị trường Section/GroupContent để sửa */}
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <input className="p-2 border rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50" placeholder="Section (VD: I. READING)" value={q.section || ''} onChange={e => updateQuestion(idx, 'section', e.target.value)} />
                                            <input className="p-2 border rounded-lg text-xs text-slate-600" placeholder="Đoạn văn dùng chung (nếu có)..." value={q.groupContent || ''} onChange={e => updateQuestion(idx, 'groupContent', e.target.value)} />
                                        </div>

                                        <div className="mb-2 font-bold text-slate-700">Câu {idx + 1}: <MathRenderer content={q.question} /></div>
                                        <textarea className="w-full p-2 border rounded-lg mb-2 font-medium font-mono text-sm bg-slate-50" rows={2} value={q.question} onChange={e => updateQuestion(idx, 'question', e.target.value)} />
                                        <div className="grid grid-cols-2 gap-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} onClick={() => setCorrectAnswer(idx, opt)} className={`p-2 border rounded cursor-pointer ${q.correctAnswer === opt ? 'bg-green-100 border-green-500' : ''}`}>
                                                    <div className="mb-1 text-xs text-slate-500"><MathRenderer content={opt} /></div>
                                                    <input className="bg-transparent w-full outline-none font-mono text-sm" value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                            <h2 className="text-2xl font-bold mb-6">Bước 3: Trộn đề & Xuất bản</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="font-bold">Số lượng mã đề</label>
                                    <input type="number" min="1" max="8" className="w-full p-3 border-2 rounded-xl mt-2 font-bold text-center text-xl" value={shuffleConfig.count} onChange={e => setShuffleConfig({...shuffleConfig, count: parseInt(e.target.value) || 1})} />
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg flex-1">
                                        <input type="checkbox" className="w-5 h-5" checked={shuffleConfig.mixQuestions} onChange={e => setShuffleConfig({...shuffleConfig, mixQuestions: e.target.checked})} />
                                        <span className="font-bold text-sm">Đảo câu hỏi</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg flex-1">
                                        <input type="checkbox" className="w-5 h-5" checked={shuffleConfig.mixOptions} onChange={e => setShuffleConfig({...shuffleConfig, mixOptions: e.target.checked})} />
                                        <span className="font-bold text-sm">Đảo đáp án</span>
                                    </label>
                                </div>
                                
                                <button onClick={handleGenerateVariants} className="w-full py-3 bg-slate-700 text-white rounded-xl font-bold">Tạo thử mã đề</button>

                                {generatedVariants.length > 0 && (
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="font-bold text-green-600">Đã tạo {generatedVariants.length} mã đề: {generatedVariants.map(v => v.code).join(', ')}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <button onClick={handleSaveExam} className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-green-700 transition-all">
                                        HOÀN TẤT & GIAO BÀI
                                    </button>
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
