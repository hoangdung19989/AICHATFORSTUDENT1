
import React, { useState, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { generateLessonPlan } from '../../services/geminiService';
import type { LessonPlan } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MathRenderer from '../../components/common/MathRenderer';
import { 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    ArrowPathIcon,
    ShieldCheckIcon,
    RobotIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
} from '../../components/icons';

const SUBJECTS_LIST = ["Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tin học", "Công nghệ", "Giáo dục công dân"];
const BOOK_SERIES = ["Kết nối tri thức với cuộc sống", "Chân trời sáng tạo", "Cánh diều"];
const GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

const LessonPlanner: React.FC = () => {
    const { navigate } = useNavigation();
    const [bookSeries, setBookSeries] = useState(BOOK_SERIES[0]);
    const [subject, setSubject] = useState(SUBJECTS_LIST[0]);
    const [grade, setGrade] = useState(GRADES[0]);
    const [lessonName, setLessonName] = useState('');
    
    const [oldContentText, setOldContentText] = useState('');
    const [oldFile, setOldFile] = useState<{ file: File, base64?: string, extractedText?: string } | null>(null);
    const [appendixFile, setAppendixFile] = useState<{ file: File, base64?: string, extractedText?: string } | null>(null);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<LessonPlan | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFileLoading, setIsFileLoading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const appendixInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File, callback: (data: { file: File, base64?: string, extractedText?: string }) => void) => {
        setIsFileLoading(true);
        setError(null);
        try {
            if (file.name.endsWith('.docx')) {
                // @ts-ignore
                const mammothModule = await import('https://esm.sh/mammoth@1.6.0');
                const mammoth = mammothModule.default || mammothModule;
                
                const arrayBuffer = await file.arrayBuffer();
                try {
                    const res = await mammoth.extractRawText({ arrayBuffer });
                    callback({ file, extractedText: res.value });
                } catch (err) {
                    console.error(err);
                    setError("Lỗi đọc file Word. Vui lòng thử dùng file PDF hoặc Ảnh.");
                } finally { setIsFileLoading(false); }
            } else {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    callback({ file, base64: (reader.result as string).split(',')[1] });
                    setIsFileLoading(false);
                };
            }
        } catch (err) {
            console.error(err);
            setError("Lỗi xử lý file.");
            setIsFileLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file, (data) => setOldFile(data));
    };

    const handleAppendixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file, (data) => setAppendixFile(data));
    };

    const handleGenerate = async () => {
        if (!lessonName.trim()) { setError("Vui lòng nhập tên bài dạy."); return; }
        setIsGenerating(true);
        setError(null);
        
        try {
            let contextFiles: { data: string, mimeType: string }[] = [];
            let combinedText = oldContentText;
            
            if (oldFile) {
                if (oldFile.base64) contextFiles.push({ data: oldFile.base64, mimeType: oldFile.file.type });
                if (oldFile.extractedText) combinedText = `${oldFile.extractedText}\n\n${combinedText}`;
            }

            let appendixText = "";
            if (appendixFile) {
                if (appendixFile.base64) contextFiles.push({ data: appendixFile.base64, mimeType: appendixFile.file.type });
                if (appendixFile.extractedText) appendixText = appendixFile.extractedText;
            }

            const plan = await generateLessonPlan(subject, grade, lessonName, bookSeries, contextFiles, combinedText, appendixText);
            setResult(plan);
        } catch (err: any) {
            setError(err.message || "Lỗi hệ thống khi soạn bài.");
        } finally { 
            setIsGenerating(false); 
        }
    };

    const downloadAsDoc = () => {
        const content = document.getElementById('lesson-plan-content');
        if (!content) return;
        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Giao an 5512</title><style>body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; } table { border-collapse: collapse; width: 100%; border: 1pt solid black; margin: 12pt 0; } th, td { border: 1pt solid black; padding: 6pt; vertical-align: top; } .font-bold { font-weight: bold; } .text-center { text-align: center; } .uppercase { text-transform: uppercase; }</style></head><body>`;
        const footer = "</body></html>";
        const sourceHTML = header + content.innerHTML + footer;
        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `GiaoAn_${lessonName.replace(/\s+/g, '_') || '5512'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isGenerating) return <div className="h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner text="AI đang soạn thảo giáo án..." subText="Đang thiết kế các hoạt động học tích hợp Năng lực số..." /></div>;

    if (result) {
        return (
            <div className="container mx-auto max-w-5xl py-10 animate-scale-in">
                <div className="bg-white p-4 rounded-2xl shadow-md border mb-6 flex flex-wrap gap-4 justify-between items-center sticky top-4 z-50 no-print">
                    <button onClick={() => setResult(null)} className="flex items-center text-slate-500 font-bold hover:text-slate-800 transition-colors">
                        <ArrowPathIcon className="h-5 w-5 mr-2" /> Soạn bài mới
                    </button>
                    <div className="flex gap-3">
                        <button onClick={downloadAsDoc} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg hover:bg-emerald-700 transition-all">
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Tải về máy (.doc)
                        </button>
                        <button onClick={() => window.print()} className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg hover:bg-brand-blue-dark transition-all">
                            <ChartBarIcon className="h-5 w-5 mr-2" /> In giáo án
                        </button>
                    </div>
                </div>

                <div 
                    id="lesson-plan-content" 
                    className="bg-white shadow-2xl p-[2.5cm] text-black leading-normal border border-slate-300 min-h-[29.7cm] mx-auto overflow-auto"
                    style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '14pt', width: '210mm' }}
                >
                    <div className="text-center mb-10">
                        <h1 className="font-bold text-2xl uppercase">KẾ HOẠCH BÀI DẠY</h1>
                        <p className="font-bold mt-2">MÔN HỌC: {subject.toUpperCase()}; LỚP: {grade.toUpperCase()}</p>
                        <p className="italic">Thời lượng: {result.period || '...'} tiết</p>
                        <h2 className="font-bold text-xl mt-4 uppercase">TÊN BÀI DẠY: {result.topic}</h2>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold uppercase mb-4 underline">I. MỤC TIÊU</h3>
                        <div className="pl-4 space-y-4">
                            <p className="font-bold">1. Về kiến thức:</p>
                            <ul className="list-disc pl-10 space-y-1">
                                {(result.objectives?.knowledge || []).map((k, i) => <li key={i}><MathRenderer content={k} /></li>)}
                            </ul>

                            <p className="font-bold">2. Về năng lực:</p>
                            <div className="pl-6">
                                <p className="font-bold italic">- Năng lực chung:</p>
                                <ul className="list-disc pl-10 space-y-1 mb-2">
                                    {(result.objectives?.commonCompetencies || []).map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                                <p className="font-bold italic text-blue-800">- Năng lực số (Tích hợp):</p>
                                <ul className="list-disc pl-10 space-y-1">
                                    {(result.objectives?.digitalCompetencies || []).map((d, i) => (
                                        <li key={i} className="text-blue-900">
                                            <strong>{d.domain} ({d.code}):</strong> {d.description}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="font-bold">3. Về phẩm chất:</p>
                            <ul className="list-disc pl-10 space-y-1">
                                {(result.objectives?.virtues || []).map((v, i) => <li key={i}>{v}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold uppercase mb-4 underline">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
                        <div className="pl-4">
                             <p className="font-bold">1. Giáo viên:</p>
                             <ul className="list-disc pl-10 space-y-1 mb-2">
                                {(result.materials?.teacher || []).map((t, i) => <li key={i}>{t}</li>)}
                             </ul>
                             <p className="font-bold">2. Học sinh:</p>
                             <ul className="list-disc pl-10 space-y-1">
                                {(result.materials?.student || []).map((s, i) => <li key={i}>{s}</li>)}
                             </ul>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h3 className="font-bold uppercase mb-6 underline">III. TIẾN TRÌNH DẠY HỌC</h3>
                        <div className="space-y-10">
                            {(result.activities || []).map((act, idx) => {
                                const isOneColumn = idx === 0 || act.title.toLowerCase().includes("khởi động") || act.title.toLowerCase().includes("vận dụng");
                                return (
                                    <div key={idx}>
                                        <h4 className="font-bold mb-4 bg-slate-100 p-2 border-l-8 border-black">{act.title}</h4>
                                        <div className="pl-4 space-y-2">
                                            <p><strong>a) Mục tiêu:</strong> {act.goal}</p>
                                            <p><strong>b) Nội dung:</strong> {act.content}</p>
                                            <p><strong>c) Sản phẩm:</strong> {act.product}</p>
                                            <div className="mt-4">
                                                <p className="font-bold italic underline mb-2">d) Tổ chức thực hiện:</p>
                                                {isOneColumn ? (
                                                    <div className="pl-4 space-y-2">
                                                        <p><strong>- Bước 1 (Chuyển giao nhiệm vụ):</strong> {act.execution?.step1}</p>
                                                        <p><strong>- Bước 2 (Thực hiện nhiệm vụ):</strong> {act.execution?.step2}</p>
                                                        <p><strong>- Bước 3 (Báo cáo, thảo luận):</strong> {act.execution?.step3}</p>
                                                        <p><strong>- Bước 4 (Kết luận, nhận định):</strong> {act.execution?.step4}</p>
                                                    </div>
                                                ) : (
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1pt solid black' }}>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ border: '1pt solid black', padding: '10px', textAlign: 'center', backgroundColor: '#f8fafc', width: '60%' }}>Hoạt động của giáo viên và học sinh</th>
                                                                <th style={{ border: '1pt solid black', padding: '10px', textAlign: 'center', backgroundColor: '#f8fafc', width: '40%' }}>Sản phẩm dự kiến</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ border: '1pt solid black', padding: '10px', verticalAlign: 'top' }}>
                                                                    <p className="mb-2"><strong>- Bước 1:</strong> {act.execution?.step1}</p>
                                                                    <p className="mb-2"><strong>- Bước 2:</strong> {act.execution?.step2}</p>
                                                                    <p className="mb-2"><strong>- Bước 3:</strong> {act.execution?.step3}</p>
                                                                    <p><strong>- Bước 4:</strong> {act.execution?.step4}</p>
                                                                </td>
                                                                <td style={{ border: '1pt solid black', padding: '10px', verticalAlign: 'top' }}>
                                                                    <MathRenderer content={act.product || ""} />
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-20">
                        <h3 className="font-bold uppercase mb-6 underline">IV. PHỤ LỤC: BẢNG PHÂN TÍCH NĂNG LỰC SỐ</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1pt solid black' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#e2e8f0' }}>
                                    <th style={{ border: '1pt solid black', padding: '8px', textAlign: 'center', width: '5%' }}>TT</th>
                                    <th style={{ border: '1pt solid black', padding: '8px', textAlign: 'left', width: '25%' }}>Hoạt động</th>
                                    <th style={{ border: '1pt solid black', padding: '8px', textAlign: 'left', width: '40%' }}>Tổ chức dạy học phát triển NLS</th>
                                    <th style={{ border: '1pt solid black', padding: '8px', textAlign: 'left', width: '30%' }}>Mã NLS và biểu hiện</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(result.nlsAnalysisTable || []).map((row, idx) => (
                                    <tr key={idx}>
                                        <td style={{ border: '1pt solid black', padding: '8px', textAlign: 'center' }}>{row.index || idx + 1}</td>
                                        <td style={{ border: '1pt solid black', padding: '8px', fontWeight: 'bold' }}>{row.activityName}</td>
                                        <td style={{ border: '1pt solid black', padding: '8px' }}>{row.organization}</td>
                                        <td style={{ border: '1pt solid black', padding: '8px', color: '#1e40af', fontStyle: 'italic' }}>{row.competencyDetail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-10 italic">.................., ngày ..... tháng ..... năm 202...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Soạn giáo án AI' }]} />
            <div className="bg-brand-blue rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md"><ShieldCheckIcon className="h-10 w-10 text-white" /></div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase">Soạn bài dạy chuẩn 5512 tích hợp Năng lực số</h1>
                        <p className="text-blue-100 mt-1">Hệ thống AI tự động hóa việc thiết kế tiến trình dạy học hiện đại.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start animate-scale-in">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5 shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Bộ sách</label>
                                <select className="w-full p-3 border rounded-xl font-bold bg-slate-50 text-sm" value={bookSeries} onChange={e => setBookSeries(e.target.value)}>
                                    {BOOK_SERIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Môn học</label>
                                <select className="w-full p-3 border rounded-xl font-bold bg-slate-50 text-sm" value={subject} onChange={e => setSubject(e.target.value)}>
                                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Lớp</label>
                                <select className="w-full p-3 border rounded-xl font-bold bg-slate-50 text-sm" value={grade} onChange={e => setGrade(e.target.value)}>
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Tên bài học</label>
                            <input type="text" className="w-full p-4 border-2 rounded-2xl focus:border-brand-blue outline-none font-bold text-lg" placeholder="VD: Bài 1. Tập hợp các số tự nhiên" value={lessonName} onChange={e => setLessonName(e.target.value)} />
                        </div>

                        <div className="space-y-6">
                            <div 
                                onClick={() => !isFileLoading && fileInputRef.current?.click()}
                                className={`border-4 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${oldFile ? 'border-green-400 bg-green-50' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.pdf,.jpg,.png" onChange={handleFileChange} />
                                {isFileLoading ? <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full mb-2" /> : (
                                    oldFile ? <><CheckCircleIcon className="h-8 w-8 text-green-500 mb-2" /><p className="text-green-800 font-bold text-sm">{oldFile.file.name}</p></> : 
                                    <><CloudArrowUpIcon className="h-8 w-8 text-slate-300 mb-2" /><p className="text-slate-500 font-bold text-sm">Tải lên bài soạn cũ (Word/Ảnh/PDF)</p></>
                                )}
                            </div>

                            <div 
                                onClick={() => !isFileLoading && appendixInputRef.current?.click()}
                                className={`border-4 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${appendixFile ? 'border-purple-400 bg-purple-50' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                                <input type="file" ref={appendixInputRef} className="hidden" accept=".docx,.pdf" onChange={handleAppendixChange} />
                                {appendixFile ? <><DocumentTextIcon className="h-8 w-8 text-purple-500 mb-2" /><p className="text-purple-800 font-bold text-sm">{appendixFile.file.name}</p></> : 
                                <><DocumentTextIcon className="h-8 w-8 text-slate-300 mb-2" /><p className="text-slate-500 font-bold text-sm">Tải lên Ma trận/YCCĐ (Phụ lục 3)</p></>}
                            </div>

                            <textarea 
                                className="w-full p-4 border-2 rounded-2xl bg-slate-50/50 focus:bg-white outline-none min-h-[120px] text-sm" 
                                placeholder="Ghi chú thêm yêu cầu cho AI (VD: tập trung vào hoạt động thảo luận nhóm...)"
                                value={oldContentText}
                                onChange={e => setOldContentText(e.target.value)}
                            />
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={!lessonName || isGenerating} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                        <RobotIcon className="h-8 w-8" />
                        {isGenerating ? "AI ĐANG SOẠN THẢO..." : "PHÂN TÍCH & SOẠN GIÁO ÁN"}
                    </button>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white sticky top-24 shadow-xl">
                        <h3 className="text-lg font-bold mb-6 text-brand-primary flex items-center"><ChartBarIcon className="h-5 w-5 mr-2" /> Tiêu chuẩn soạn thảo</h3>
                        <div className="space-y-6">
                            <div className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">1</span>
                                <p className="text-xs text-slate-400 leading-relaxed">Cấu trúc <strong>Công văn 5512</strong> với 4 hoạt động chính: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng.</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">2</span>
                                <p className="text-xs text-slate-400 leading-relaxed">Tích hợp các miền <strong>Năng lực số</strong> (Khai thác thông tin, Giao tiếp số, Sáng tạo nội dung, An toàn số) vào bài học.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlanner;
