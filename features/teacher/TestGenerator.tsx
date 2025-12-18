
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
    ExclamationTriangleIcon
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
            const file = e.target.files[0];
            if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.xlsx')) {
                alert("AI chưa hỗ trợ đọc file Word/Excel trực tiếp.\n\nVui lòng chọn 'Save As' -> định dạng PDF cho file ma trận của bạn trước khi tải lên nhé!");
                e.target.value = '';
                return;
            }
            onUpload(file);
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
            const mimeType = combinedFile.file.type || 'application/pdf';

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

            <div className="bg-gradient-to-r from-sky-600 to-brand-blue rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                        <PencilSquareIcon className="h-8 w-8 mr-3 text-brand-yellow" />
                        TẠO ĐỀ KIỂM TRA
                    </h1>
                    <p className="text-blue-100 text-lg">Tải lên Ma trận & Đặc tả (PDF) - Xuất file Word chuẩn format</p>
                </div>
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">1. Thông tin chung</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Môn học</label>
                                <select className="w-full rounded-lg border-slate-300 border px-3 py-2.5 bg-slate-50" value={subject} onChange={(e) => setSubject(e.target.value)}>
                                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Khối lớp</label>
                                <select className="w-full rounded-lg border-slate-300 border px-3 py-2.5 bg-slate-50" value={grade} onChange={(e) => setGrade(e.target.value)}>
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">2. Cấu trúc & Tài liệu</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Số câu Trắc nghiệm</label>
                                <input type="number" min="0" className="w-full rounded-lg border-slate-300 border px-3 py-2.5" value={mcCount} onChange={(e) => setMcCount(parseInt(e.target.value) || 0)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Số câu Tự luận</label>
                                <input type="number" min="0" className="w-full rounded-lg border-slate-300 border px-3 py-2.5" value={essayCount} onChange={(e) => setEssayCount(parseInt(e.target.value) || 0)} />
                            </div>
                        </div>
                        <div className="h-48">
                            <FileUploadCard title="Tải Ma trận & Đặc tả (PDF)" description="Chọn file PDF hoặc Ảnh chứa bảng ma trận đề thi của bạn." fileState={combinedFile} onUpload={handleFileUpload} accept=".pdf,image/*" />
                        </div>
                    </section>

                    <button onClick={handleGenerate} disabled={!combinedFile.file} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center ${!combinedFile.file ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-brand-blue hover:bg-brand-blue-dark text-white hover:-translate-y-1'}`}>
                        <PencilSquareIcon className="h-6 w-6 mr-2" /> TẠO ĐỀ KIỂM TRA NGAY
                    </button>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                            <span>Lưu ý về định dạng file</span>
                        </div>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Hiện tại, trí tuệ nhân tạo (AI) yêu cầu file ma trận phải ở định dạng <strong>PDF</strong> hoặc <strong>Ảnh</strong> để xử lý chính xác nhất các bảng biểu phức tạp.
                            <br/><br/>
                            Nếu Thầy/Cô đang có file ma trận trong Word hoặc Excel, vui lòng nhấn <strong>F12</strong> (hoặc Save As) và chọn định dạng <strong>PDF</strong> trước khi tải lên nhé!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestGenerator;
