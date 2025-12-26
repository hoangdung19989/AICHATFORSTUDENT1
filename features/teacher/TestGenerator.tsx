
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
// @ts-ignore
import mammoth from 'https://esm.sh/mammoth';

const SUBJECTS_LIST = ["Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tin học", "Công nghệ"];
const GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

const TestGenerator: React.FC = () => {
    const { navigate } = useNavigation();
    const [subject, setSubject] = useState(SUBJECTS_LIST[0]);
    const [grade, setGrade] = useState(GRADES[0]);
    const [mcCount, setMcCount] = useState<number>(12);
    const [essayCount, setEssayCount] = useState<number>(3);
    const [uploadedFile, setUploadedFile] = useState<{ file: File, base64?: string, text?: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleGenerate = async () => {
        if (!uploadedFile) return;
        setIsGenerating(true);
        try {
            const base64 = uploadedFile.base64 || "";
            const mimeType = uploadedFile.file.type || 'application/pdf';
            const quiz = await generateTestFromMatrixDocument(subject, grade, base64, mimeType, mcCount, essayCount);
            setResult(quiz);
        } catch (err: any) { setError(err.message); }
        finally { setIsGenerating(false); }
    };

    if (isGenerating) return <div className="h-screen flex items-center justify-center"><LoadingSpinner text="Đang tạo đề từ ma trận..." /></div>;

    if (result) {
        return (
            <div className="container mx-auto max-w-5xl py-8">
                <div className="bg-white rounded-3xl p-10 shadow-xl text-center">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-6">Đã tạo đề thi thành công!</h2>
                    <button onClick={() => setResult(null)} className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold">Tạo đề khác</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Tạo đề thi' }]} />
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h1 className="text-3xl font-black mb-8 uppercase text-brand-blue">Tạo đề thi từ Ma trận</h1>
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Môn học</label>
                        <select className="w-full p-4 border-2 rounded-2xl bg-slate-50" value={subject} onChange={e => setSubject(e.target.value)}>
                            {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Khối lớp</label>
                        <select className="w-full p-4 border-2 rounded-2xl bg-slate-50" value={grade} onChange={e => setGrade(e.target.value)}>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>

                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all mb-8 ${uploadedFile ? 'border-green-400 bg-green-50' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.pdf,.png,.jpg" onChange={handleFileChange} />
                    {uploadedFile ? (
                        <p className="text-green-700 font-bold">{uploadedFile.file.name}</p>
                    ) : (
                        <p className="text-slate-400">Tải lên file Ma trận & Đặc tả (.docx, .pdf, .png)</p>
                    )}
                </div>

                <button onClick={handleGenerate} disabled={!uploadedFile} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xl disabled:opacity-50">
                    BẮT ĐẦU TẠO ĐỀ
                </button>
            </div>
        </div>
    );
};

export default TestGenerator;
