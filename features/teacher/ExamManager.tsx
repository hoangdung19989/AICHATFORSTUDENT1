
import React, { useState, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { parseExamDocument } from '../../services/geminiService';
import type { QuizQuestion, EssayQuestion } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CloudArrowUpIcon, CheckCircleIcon, DocumentTextIcon, ArrowRightCircleIcon, PencilSquareIcon, XMarkIcon } from '../../components/icons';

const ALL_SUBJECTS = [
    "Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", 
    "Lịch sử và Địa lí", "Tin học", "Công nghệ", 
    "Giáo dục công dân", "Nghệ thuật", "Giáo dục thể chất", "HĐTN, HN"
];

// Reusing FileUpload UI component
const ExamUploadCard: React.FC<{
    onFileSelected: (file: File) => void;
    currentFile: File | null;
    onClear: () => void;
}> = ({ onFileSelected, currentFile, onClear }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelected(e.target.files[0]);
        }
    };

    if (currentFile) {
        return (
            <div className="border-2 border-green-300 bg-green-50 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="font-bold text-green-800 text-sm">{currentFile.name}</p>
                        <p className="text-xs text-green-600">{(currentFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <button onClick={onClear} className="text-slate-400 hover:text-red-500">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
        );
    }

    return (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-brand-blue rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64"
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf, .png, .jpg, .jpeg"
                onChange={handleFileChange}
            />
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-brand-blue">
                <CloudArrowUpIcon className="h-8 w-8" />
            </div>
            <p className="font-bold text-slate-700 text-lg mb-2">Nhấn để tải file đề thi</p>
            <p className="text-slate-500 text-sm">Hỗ trợ PDF, Hình ảnh (JPG, PNG).</p>
            <p className="text-slate-400 text-xs mt-2 italic">(Vui lòng xuất file Word/Excel sang PDF để AI xử lý chính xác nhất)</p>
        </div>
    );
};

const ExamManager: React.FC = () => {
    const { user } = useAuth();
    const { navigate } = useNavigation();
    
    // Step 1: Basic Info & Upload
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(ALL_SUBJECTS[0]);
    const [grade, setGrade] = useState('Lớp 6');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    
    // Step 2: Review & Edit
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Convert file to Base64 helper
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the "data:*/*;base64," prefix for Gemini
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleParse = async () => {
        if (!title || !uploadedFile) {
            alert("Vui lòng nhập tên đề và tải lên file đề thi.");
            return;
        }
        setIsLoading(true);
        try {
            const base64Data = await fileToBase64(uploadedFile);
            const mimeType = uploadedFile.type || 'application/pdf'; // Default fallback
            
            const parsedQuiz = await parseExamDocument(base64Data, mimeType);
            
            setQuestions(parsedQuiz.questions || []);
            setEssayQuestions(parsedQuiz.essayQuestions || []);
            setStep(2);
        } catch (error: any) {
            alert("Lỗi khi phân tích đề: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // Combine MCQ and Essay questions into a structure that can be saved
            const examData = {
                questions: questions,
                essayQuestions: essayQuestions
            };

            const { error } = await supabase.from('teacher_exams').insert({
                teacher_id: user.id,
                title,
                subject,
                grade,
                questions: examData, // Store combined structure
                status: 'published'
            });

            if (error) throw error;
            alert("Đã giao bài thành công! Học sinh có thể vào phần 'Thi thử' để làm bài.");
            navigate('teacher-dashboard');
        } catch (error: any) {
            alert("Lỗi lưu đề thi: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptionChange = (qIndex: number, option: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswer = option;
        setQuestions(newQuestions);
    };

    if (isLoading) return <LoadingSpinner text="AI đang đọc tài liệu..." subText="Đang trích xuất câu hỏi từ file của bạn..." />;

    return (
        <div className="container mx-auto max-w-5xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Quản lý & Giao đề' }]} />

            {step === 1 && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <CloudArrowUpIcon className="w-8 h-8 mr-2 text-brand-blue" />
                        Bước 1: Tải lên đề thi
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên bộ đề</label>
                            <input 
                                type="text" 
                                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-brand-blue outline-none"
                                placeholder="VD: Đề kiểm tra 1 tiết Toán 6..."
                                value={title} onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Môn học</label>
                                <select 
                                    className="w-full border rounded-lg p-3 bg-white"
                                    value={subject} onChange={e => setSubject(e.target.value)}
                                >
                                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Khối lớp</label>
                                <select 
                                    className="w-full border rounded-lg p-3 bg-white"
                                    value={grade} onChange={e => setGrade(e.target.value)}
                                >
                                    {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">File đề thi</label>
                        <ExamUploadCard 
                            currentFile={uploadedFile} 
                            onFileSelected={setUploadedFile} 
                            onClear={() => setUploadedFile(null)}
                        />
                    </div>

                    <button 
                        onClick={handleParse}
                        disabled={!uploadedFile || !title}
                        className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center shadow-lg ${
                            !uploadedFile || !title 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-brand-blue text-white hover:bg-brand-blue-dark'
                        }`}
                    >
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        Phân tích & Chọn đáp án
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="animate-scale-in">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg flex justify-between items-center sticky top-20 z-10 shadow-md">
                        <div>
                            <h3 className="font-bold text-green-800">Bước 2: Duyệt đề & Chọn đáp án đúng</h3>
                            <p className="text-sm text-green-700">Hãy tích chọn đáp án đúng cho phần trắc nghiệm trước khi giao.</p>
                        </div>
                        <button 
                            onClick={handlePublish}
                            disabled={isSaving}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center"
                        >
                            {isSaving ? 'Đang lưu...' : (
                                <>
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    Giao bài ngay
                                </>
                            )}
                        </button>
                    </div>

                    {questions.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">I. PHẦN TRẮC NGHIỆM ({questions.length} câu)</h3>
                            <div className="space-y-6">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex items-start mb-4">
                                            <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg mr-3 text-sm">Câu {idx + 1}</span>
                                            <h4 className="text-lg font-medium text-slate-800 flex-1">{q.question}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
                                            {q.options.map((opt, optIdx) => (
                                                <label 
                                                    key={optIdx} 
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                                        q.correctAnswer === opt 
                                                        ? 'bg-green-50 border-green-500 ring-1 ring-green-500' 
                                                        : 'hover:bg-slate-50 border-slate-200'
                                                    }`}
                                                >
                                                    <input 
                                                        type="radio" 
                                                        name={`question-${idx}`} 
                                                        className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300"
                                                        checked={q.correctAnswer === opt}
                                                        onChange={() => handleOptionChange(idx, opt)}
                                                    />
                                                    <span className={`ml-3 ${q.correctAnswer === opt ? 'font-bold text-green-800' : 'text-slate-700'}`}>
                                                        {opt}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {q.explanation && (
                                            <div className="ml-12 mt-4 bg-slate-50 p-3 rounded text-sm text-slate-600">
                                                <strong>Giải thích (AI):</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {essayQuestions.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">II. PHẦN TỰ LUẬN ({essayQuestions.length} câu)</h3>
                            <div className="space-y-6">
                                {essayQuestions.map((q, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                        <div className="mb-4">
                                            <span className="bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-lg mr-3 text-sm">Câu {idx + 1}</span>
                                            <h4 className="text-lg font-medium text-slate-800 mt-2">{q.question}</h4>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <p className="text-sm font-bold text-slate-700 mb-1">Gợi ý đáp án (AI):</p>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{q.sampleAnswer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-8 flex justify-between">
                        <button 
                            onClick={() => setStep(1)}
                            className="text-slate-500 hover:text-slate-700 font-medium"
                        >
                            ← Quay lại chỉnh sửa
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManager;
