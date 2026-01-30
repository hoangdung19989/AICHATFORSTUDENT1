
import React, { useState, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { generateTestFromMatrixDocument } from '../../services/geminiService';
import type { Quiz } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MathRenderer from '../../components/common/MathRenderer';
import { 
    PencilSquareIcon, 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    ArrowLeftIcon,
    DocumentTextIcon,
    PrinterIcon,
    ExclamationTriangleIcon
} from '../../components/icons';

const SUBJECTS_LIST = ["Toán", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tin học", "Công nghệ", "GDCD"];
const GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

const TestGenerator: React.FC = () => {
    const { navigate } = useNavigation();
    const [subject, setSubject] = useState(SUBJECTS_LIST[0]);
    const [grade, setGrade] = useState(GRADES[0]);
    const [mcCount, setMcCount] = useState<number>(12);
    const [essayCount, setEssayCount] = useState<number>(3);
    const [uploadedFile, setUploadedFile] = useState<{ file: File, base64?: string, text?: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false); // Đổi tên state để rõ ràng hơn
    const [result, setResult] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);

        if (file.name.endsWith('.docx')) {
            setIsLoadingFile(true);
            try {
                // @ts-ignore
                const mammothModule = await import('https://esm.sh/mammoth@1.6.0');
                const mammoth = mammothModule.default || mammothModule;
                
                const arrayBuffer = await file.arrayBuffer();
                const conv = await mammoth.extractRawText({ arrayBuffer });
                setUploadedFile({ file, text: conv.value });
            } catch (e) {
                console.error(e);
                setError("Lỗi đọc file Word. Hãy thử dùng định dạng PDF hoặc Ảnh.");
            } finally {
                setIsLoadingFile(false);
            }
        } else {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setUploadedFile({ file, base64: (reader.result as string).split(',')[1] });
            };
        }
    };

    const handleGenerate = async () => {
        if (!uploadedFile) { setError("Vui lòng tải lên ma trận."); return; }
        setIsGenerating(true);
        setError(null);
        try {
            const base64 = uploadedFile.base64 || "";
            const mimeType = uploadedFile.file.type || 'application/pdf';
            const quiz = await generateTestFromMatrixDocument(subject, grade, base64, mimeType, mcCount, essayCount, uploadedFile.text);
            
            if (!quiz || !quiz.questions || quiz.questions.length === 0) {
              throw new Error("AI không thể tạo được câu hỏi từ ma trận này. Vui lòng kiểm tra lại nội dung ma trận.");
            }
            
            setResult(quiz);
        } catch (err: any) { 
          console.error("Test generation failed:", err);
          setError(err.message || "Đã xảy ra lỗi khi tạo đề thi. Vui lòng thử lại."); 
        }
        finally { setIsGenerating(false); }
    };

    const downloadAsDoc = () => {
        const content = document.getElementById('generated-test-content');
        if (!content) return;
        
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${result?.title || 'De Thi'}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.3; }
                    .header-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; border: none; }
                    .header-table td { border: none; vertical-align: top; text-align: center; }
                    .question-block { margin-bottom: 12px; page-break-inside: avoid; }
                    .options-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 5px; margin-left: 20px; }
                    .option-item { margin-bottom: 4px; }
                    .essay-block { margin-bottom: 15px; page-break-inside: avoid; }
                    .bold { font-weight: bold; }
                    .italic { font-style: italic; }
                    .uppercase { text-transform: uppercase; }
                </style>
            </head>
            <body>
        `;
        const footer = "</body></html>";
        const sourceHTML = header + content.innerHTML + footer;
        
        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `De_Thi_${subject.replace(/\s+/g, '_')}_${grade.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isGenerating) return <div className="h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner text="Đang phân tích ma trận..." subText="AI đang đối chiếu từng câu hỏi với ma trận đặc tả..." /></div>;

    if (result) {
        return (
            <div className="container mx-auto max-w-5xl py-8 animate-scale-in">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 justify-between items-center sticky top-4 z-50 no-print">
                    <button onClick={() => setResult(null)} className="flex items-center text-slate-500 font-bold hover:text-slate-800 transition-colors">
                        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Tạo đề khác
                    </button>
                    <div className="flex gap-3">
                        <button onClick={downloadAsDoc} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg hover:bg-emerald-700 transition-all">
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Tải file Word
                        </button>
                        <button onClick={() => window.print()} className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg hover:bg-brand-blue-dark transition-all">
                            <PrinterIcon className="h-5 w-5 mr-2" /> In đề
                        </button>
                    </div>
                </div>

                <div className="bg-gray-200 p-4 md:p-10 rounded-3xl overflow-auto">
                    <div 
                        id="generated-test-content" 
                        className="bg-white shadow-2xl p-[2cm] text-black leading-normal border border-slate-300 mx-auto"
                        style={{ 
                            width: '210mm', 
                            minHeight: '297mm', 
                            fontFamily: '"Times New Roman", Times, serif', 
                            fontSize: '13pt',
                            lineHeight: '1.4' 
                        }}
                    >
                        <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', border: 'none' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '40%', textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                                        <p style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>PHÒNG GD&ĐT .................</p>
                                        <p style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>TRƯỜNG THCS .................</p>
                                        <div style={{ height: '1px', width: '40%', background: '#000', margin: '5px auto' }}></div>
                                    </td>
                                    <td style={{ width: '60%', textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                                        <p style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>ĐỀ KIỂM TRA GIỮA KỲ/CUỐI KỲ</p>
                                        <p style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '5px 0' }}>NĂM HỌC 2024 - 2025</p>
                                        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Môn: {subject.toUpperCase()} - Lớp: {grade.replace('Lớp ', '')}</p>
                                        <p style={{ fontStyle: 'italic', margin: 0 }}>Thời gian làm bài: {result.timeLimit || '...'} phút</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '20px', fontSize: '11pt' }}>
                            (Đề thi được biên soạn dựa trên Ma trận đặc tả: {uploadedFile?.file.name})
                        </div>

                        {result.questions && result.questions.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>I. PHẦN TRẮC NGHIỆM</h3>
                                {result.questions.map((q, idx) => (
                                    <div key={idx} className="question-block" style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                            <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '5px' }}>Câu {idx + 1}:</span>
                                            <span><MathRenderer content={q.question} /></span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', paddingLeft: '20px', marginTop: '5px' }}>
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} style={{ marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{String.fromCharCode(65 + oIdx)}.</span> <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {result.essayQuestions && result.essayQuestions.length > 0 && (
                            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                                <h3 style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>II. PHẦN TỰ LUẬN</h3>
                                {result.essayQuestions.map((q, idx) => (
                                    <div key={idx} className="essay-block" style={{ marginBottom: '15px', pageBreakInside: 'avoid' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                            Câu {(result.questions?.length || 0) + idx + 1}:
                                        </p>
                                        <p style={{ margin: 0 }}><MathRenderer content={q.question} /></p>
                                        <div style={{ minHeight: '100px', border: '1px dashed #ccc', marginTop: '10px', padding: '10px', fontSize: '11pt', color: '#666', fontStyle: 'italic' }}>
                                            (Gợi ý: <MathRenderer content={q.sampleAnswer || 'Học sinh tự trình bày...'} />)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '40px', fontWeight: 'bold' }}>--- HẾT ---</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Tạo đề thi' }]} />
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h1 className="text-3xl font-black mb-8 uppercase text-brand-blue">Tạo đề thi từ Ma trận</h1>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 flex items-start">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-800 text-sm">Hướng dẫn quan trọng</h3>
                        <p className="text-xs text-blue-700 mt-1">
                            Tải lên ảnh hoặc file Word chứa <strong>Ma trận đặc tả</strong>. AI sẽ phân tích kỹ các mức độ để ra đề thi phù hợp.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Môn học</label>
                        <select className="w-full p-4 border-2 rounded-2xl bg-slate-50 outline-none focus:border-brand-blue transition-all" value={subject} onChange={e => setSubject(e.target.value)}>
                            {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Khối lớp</label>
                        <select className="w-full p-4 border-2 rounded-2xl bg-slate-50 outline-none focus:border-brand-blue transition-all" value={grade} onChange={e => setGrade(e.target.value)}>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Số câu trắc nghiệm</label>
                        <input type="number" min="0" className="w-full p-4 border-2 rounded-2xl bg-slate-50 outline-none focus:border-brand-blue transition-all font-bold text-center" value={mcCount} onChange={e => setMcCount(parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Số câu tự luận</label>
                        <input type="number" min="0" className="w-full p-4 border-2 rounded-2xl bg-slate-50 outline-none focus:border-brand-blue transition-all font-bold text-center" value={essayCount} onChange={e => setEssayCount(parseInt(e.target.value) || 0)} />
                    </div>
                </div>

                <div 
                    onClick={() => !isLoadingFile && fileInputRef.current?.click()}
                    className={`border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all mb-8 ${uploadedFile ? 'border-green-400 bg-green-50' : 'border-slate-100 hover:bg-slate-50 hover:border-brand-blue'}`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                    {isLoadingFile ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue border-t-transparent mb-3"></div>
                            <p className="text-slate-500 font-bold">Đang đọc file...</p>
                        </div>
                    ) : uploadedFile ? (
                        <div>
                            <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                            <p className="text-green-700 font-bold">{uploadedFile.file.name}</p>
                            <p className="text-xs text-green-600 mt-1">Nhấn để thay đổi file khác</p>
                        </div>
                    ) : (
                        <div>
                            <CloudArrowUpIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold text-lg">Tải lên Ma trận (Ảnh/Word/PDF)</p>
                            <p className="text-slate-400 text-sm mt-2">AI sẽ đọc bảng ma trận để ra đề.</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={!uploadedFile || isGenerating || isLoadingFile} 
                    className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                    <PencilSquareIcon className="h-6 w-6 mr-3" />
                    {isGenerating ? "ĐANG XỬ LÝ..." : "PHÂN TÍCH MA TRẬN & TẠO ĐỀ"}
                </button>
            </div>
        </div>
    );
};

export default TestGenerator;
