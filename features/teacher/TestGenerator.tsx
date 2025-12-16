
import React, { useState, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { generateTestFromMatrixDocument } from '../../services/geminiService';
import type { Quiz } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
    PencilSquareIcon, 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    EyeIcon,
    ArrowLeftIcon,
    DocumentTextIcon,
    ArrowPathIcon
} from '../../components/icons';

const SUBJECTS_LIST = [
    "Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", 
    "Lịch sử và Địa lí", "Giáo dục công dân", "Tin học", 
    "Công nghệ", "Nghệ thuật", "Giáo dục thể chất"
];

const GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

interface FileUploadState {
    name: string | null;
    file: File | null;
    status: 'idle' | 'uploading' | 'done';
}

const FileUploadCard: React.FC<{
    title: string;
    description: string;
    fileState: FileUploadState;
    onUpload: (file: File) => void;
    accept?: string;
}> = ({ title, description, fileState, onUpload, accept = ".pdf,.png,.jpg,.jpeg" }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 h-full ${
                fileState.status === 'done' 
                ? 'border-green-300 bg-green-50' 
                : 'border-slate-300 hover:border-brand-blue hover:bg-slate-50'
            }`}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept={accept}
                onChange={handleFileChange}
            />
            
            {fileState.status === 'done' ? (
                <>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-800 text-sm line-clamp-1 break-all px-2">{fileState.name}</p>
                    <p className="text-green-600 text-xs mt-1">Đã tải lên thành công. Nhấn để thay đổi.</p>
                </>
            ) : (
                <>
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                        {fileState.status === 'uploading' ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
                        ) : (
                            <CloudArrowUpIcon className="h-6 w-6" />
                        )}
                    </div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">{title}</p>
                    <p className="text-slate-400 text-xs">{description}</p>
                </>
            )}
        </div>
    );
};

const TestGenerator: React.FC = () => {
    const { navigate } = useNavigation();
    
    // Form State
    const [subject, setSubject] = useState(SUBJECTS_LIST[0]);
    const [grade, setGrade] = useState(GRADES[0]);
    
    // Custom Question Counts
    const [mcCount, setMcCount] = useState<number>(12);
    const [essayCount, setEssayCount] = useState<number>(3);

    // File States
    const [combinedFile, setCombinedFile] = useState<FileUploadState>({ name: null, file: null, status: 'idle' });

    // Process State
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (file: File) => {
        setCombinedFile({ name: file.name, file: file, status: 'uploading' });
        setTimeout(() => {
            setCombinedFile(prev => ({ ...prev, status: 'done' }));
        }, 1000);
    };

    // Helper: Convert file to Base64
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

    const handleGenerate = async () => {
        if (!subject || !grade || !combinedFile.file) return;
        
        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const base64Data = await fileToBase64(combinedFile.file);
            const mimeType = combinedFile.file.type || 'application/pdf'; // Default to pdf if unknown, helps Gemini context

            const quiz = await generateTestFromMatrixDocument(
                subject, 
                grade, 
                base64Data,
                mimeType,
                mcCount,
                essayCount
            );
            setResult(quiz);
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra khi tạo đề kiểm tra.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;

        // Build HTML content for Word
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${result.title}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; }
                    h1, h2, h3, h4, h5, h6 { font-family: 'Times New Roman', serif; font-weight: bold; }
                    .header { text-align: center; font-weight: bold; margin-bottom: 20px; }
                    .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 10px; text-transform: uppercase; }
                    .question { margin-bottom: 10px; }
                    .options { margin-left: 20px; }
                    .answer-key { color: #333; margin-top: 30px; border-top: 1px solid #000; padding-top: 20px; }
                </style>
            </head>
            <body>
        `;

        const bodyContent = `
            <div class="header">
                <p>${result.sourceSchool.toUpperCase()}</p>
                <p style="font-size: 16pt;">${result.title.toUpperCase()}</p>
                <p style="font-style: italic;">Môn: ${subject} - ${grade}</p>
                <p style="font-style: italic;">Thời gian làm bài: ${result.timeLimit}</p>
            </div>
            <hr />

            <div class="section-title">I. TRẮC NGHIỆM KHÁCH QUAN (${mcCount} câu)</div>
            ${result.questions.map((q, i) => `
                <div class="question">
                    <strong>Câu ${i + 1}:</strong> ${q.question}<br/>
                    <div class="options">
                        A. ${q.options[0]}<br/>
                        B. ${q.options[1]}<br/>
                        C. ${q.options[2]}<br/>
                        D. ${q.options[3]}
                    </div>
                </div>
            `).join('')}

            ${result.essayQuestions && result.essayQuestions.length > 0 ? `
                <div class="section-title">II. TỰ LUẬN (${essayCount} câu)</div>
                ${result.essayQuestions.map((q, i) => `
                    <div class="question">
                        <strong>Câu ${i + 1}:</strong> ${q.question}
                    </div>
                `).join('')}
            ` : ''}

            <br/><br/>
            <div class="answer-key">
                <div class="section-title" style="text-align: center;">HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN</div>
                <p><strong>I. Trắc nghiệm</strong></p>
                ${result.questions.map((q, i) => `
                    <p><strong>${i + 1}.</strong> ${q.correctAnswer} <em>(${q.explanation})</em></p>
                `).join('')}

                ${result.essayQuestions && result.essayQuestions.length > 0 ? `
                    <p><strong>II. Tự luận</strong></p>
                    ${result.essayQuestions.map((q, i) => `
                        <p><strong>Câu ${i + 1}:</strong><br/>${q.sampleAnswer}</p>
                    `).join('')}
                ` : ''}
            </div>
        `;

        const footer = "</body></html>";
        const sourceHTML = header + bodyContent + footer;

        const blob = new Blob(['\ufeff', sourceHTML], { 
            type: 'application/msword' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `De_Kiem_Tra_${subject}_${grade}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isGenerating) {
        return (
            <div className="container mx-auto max-w-5xl h-screen flex flex-col justify-center items-center">
                <LoadingSpinner text="Đang phân tích Ma trận & Đặc tả..." subText="AI đang đọc file, đếm số lượng câu hỏi NB/TH/VD/VDC để tạo đề chính xác nhất..." color="amber" />
            </div>
        );
    }

    if (result) {
        return (
            <div className="container mx-auto max-w-5xl py-8 px-4">
                <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden text-center p-12 animate-scale-in">
                    <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Tạo đề thành công!</h2>
                    <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
                        Đề kiểm tra <strong>"{result.title}"</strong> đã sẵn sàng dựa trên ma trận của bạn.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            className="flex items-center justify-center px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Tải file Word chuẩn
                        </button>
                        <button 
                            onClick={() => setResult(null)} 
                            className="flex items-center justify-center px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Tạo đề khác
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="mt-12 text-left bg-slate-50 rounded-xl border border-slate-200 p-8 max-h-[500px] overflow-y-auto shadow-inner font-serif">
                        <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-4 font-sans">
                            <EyeIcon className="h-5 w-5 text-slate-400" />
                            <span className="font-bold text-slate-500 uppercase text-sm">Xem trước nội dung</span>
                        </div>
                        <div className="prose max-w-none text-slate-900 leading-relaxed" style={{ fontFamily: '"Times New Roman", serif', fontSize: '1.1em' }}>
                            <h3 className="text-center font-bold text-lg mb-1">{result.sourceSchool.toUpperCase()}</h3>
                            <h4 className="text-center font-bold text-xl mb-4">{result.title.toUpperCase()}</h4>
                            <p className="text-center italic mb-6">Môn: {subject} - Thời gian: {result.timeLimit}</p>
                            
                            <h5 className="font-bold border-b border-slate-300 pb-2 mb-4">I. TRẮC NGHIỆM KHÁCH QUAN</h5>
                            <div className="space-y-6">
                                {result.questions.map((q, i) => (
                                    <div key={i}>
                                        <p className="font-bold">Câu {i + 1}: {q.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ml-4">
                                            {q.options.map((opt, idx) => (
                                                <div key={idx}>
                                                    <span className="font-bold">{String.fromCharCode(65 + idx)}.</span> {opt}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 italic">
                                            ({q.explanation})
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {result.essayQuestions && result.essayQuestions.length > 0 && (
                                <>
                                    <h5 className="font-bold border-b border-slate-300 pb-2 mb-4 mt-8">II. TỰ LUẬN</h5>
                                    <div className="space-y-6">
                                        {result.essayQuestions.map((q, i) => (
                                            <div key={i}>
                                                <p className="font-bold">Câu {i + 1}: {q.question}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Tạo đề kiểm tra' }]} />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-sky-600 to-brand-blue rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                        <PencilSquareIcon className="h-8 w-8 mr-3 text-brand-yellow" />
                        TẠO ĐỀ KIỂM TRA
                    </h1>
                    <p className="text-blue-100 text-lg">Tải lên Ma trận & Đặc tả (1 file duy nhất) - Xuất file Word chuẩn format</p>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Config */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Section 1: General Info */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">1. Thông tin chung</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Môn học</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-slate-50"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                >
                                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Khối lớp</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-slate-50"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                >
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Structure Config */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">2. Cấu trúc đề thi</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Số câu Trắc nghiệm</label>
                                <div className="relative">
                                    <input 
                                        type="number" min="0" max="100"
                                        className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-center font-bold text-lg"
                                        value={mcCount}
                                        onChange={(e) => setMcCount(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="absolute right-4 top-3 text-slate-400 text-sm">Câu</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Số câu Tự luận</label>
                                <div className="relative">
                                    <input 
                                        type="number" min="0" max="20"
                                        className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-center font-bold text-lg"
                                        value={essayCount}
                                        onChange={(e) => setEssayCount(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="absolute right-4 top-3 text-slate-400 text-sm">Câu</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-48">
                            <FileUploadCard 
                                title="Tải lên File Ma trận & Đặc tả" 
                                description="Hỗ trợ file PDF hoặc Hình ảnh bảng ma trận (Vui lòng xuất Word/Excel sang PDF)."
                                fileState={combinedFile}
                                onUpload={handleFileUpload}
                                accept=".pdf,.png,.jpg,.jpeg"
                            />
                        </div>
                    </section>

                    <button 
                        onClick={handleGenerate}
                        disabled={!combinedFile.file}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center ${
                            !combinedFile.file 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-brand-blue hover:bg-brand-blue-dark text-white hover:shadow-xl hover:-translate-y-1'
                        }`}
                    >
                        <PencilSquareIcon className="h-6 w-6 mr-2" />
                        TẠO ĐỀ KIỂM TRA NGAY
                    </button>
                </div>

                {/* Right Column: Instructions & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-brand-blue" />
                            Quy trình xử lý
                        </h3>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li className="flex items-start">
                                <span className="bg-slate-100 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold text-slate-700">1</span>
                                <span>Thầy/Cô chọn số lượng câu hỏi mong muốn.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-slate-100 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold text-slate-700">2</span>
                                <span>AI phân tích file Ma trận & Đặc tả để hiểu mức độ nhận thức (NB, TH, VD, VDC).</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-slate-100 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold text-slate-700">3</span>
                                <span>Hệ thống tạo đề thi và cho phép tải về dưới dạng file Word chuẩn font <strong>Times New Roman (14pt)</strong>.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-yellow-800">
                        <h3 className="font-bold text-sm mb-2">Lưu ý quan trọng</h3>
                        <p className="text-xs mb-2">Để đảm bảo tính chính xác, file tải lên cần chứa đầy đủ thông tin về các đơn vị kiến thức.</p>
                        <p className="text-xs">
                            Hệ thống sẽ tự động định dạng văn bản chuẩn để Thầy/Cô có thể in ấn ngay sau khi tải về.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestGenerator;
