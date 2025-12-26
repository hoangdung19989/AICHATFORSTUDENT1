
import React, { useState, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { generateLessonPlan } from '../../services/geminiService';
import type { LessonPlan } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    ArrowPathIcon,
    ShieldCheckIcon,
    RobotIcon,
    ChartBarIcon
} from '../../components/icons';
// @ts-ignore
import mammoth from 'https://esm.sh/mammoth';

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
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<LessonPlan | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                try {
                    const res = await mammoth.extractRawText({ arrayBuffer });
                    setOldFile({ file, extractedText: res.value });
                } catch (err) {
                    alert("Không thể đọc file Word này.");
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setOldFile({ file, base64: (reader.result as string).split(',')[1] });
            };
        }
    };

    const handleGenerate = async () => {
        if (!lessonName.trim()) { alert("Nhập tên bài học."); return; }
        setIsGenerating(true);
        try {
            let contextFiles: { data: string, mimeType: string }[] = [];
            let combinedText = oldContentText;
            if (oldFile) {
                if (oldFile.base64) contextFiles.push({ data: oldFile.base64, mimeType: oldFile.file.type });
                else if (oldFile.extractedText) combinedText = `[NỘI DUNG TỪ FILE WORD]:\n${oldFile.extractedText}\n\n${combinedText}`;
            }
            const plan = await generateLessonPlan(subject, grade, lessonName, bookSeries, contextFiles, combinedText);
            setResult(plan);
        } catch (err: any) { alert("Lỗi: " + err.message); }
        finally { setIsGenerating(false); }
    };

    const downloadAsDoc = () => {
        const content = document.getElementById('lesson-plan-content');
        if (!content) return;
        
        // Cập nhật style cho file Word: Times New Roman, 14pt
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Giao an 5512</title><style>body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; } table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 14pt; } th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; } .font-bold { font-weight: bold; } .text-center { text-align: center; } .uppercase { text-transform: uppercase; } .page-break { page-break-after: always; }</style></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + content.innerHTML + footer;
        
        const blob = new Blob(['\ufeff', sourceHTML], {
            type: 'application/msword'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `GiaoAn_${lessonName.replace(/\s+/g, '_') || '5512'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isGenerating) return <div className="h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner text="Đang xử lý dữ liệu..." subText="AI đang phân tích và giữ nguyên cấu trúc bài dạy của bạn..." /></div>;

    if (result) {
        return (
            <div className="container mx-auto max-w-5xl py-10 animate-scale-in">
                {/* Thanh công cụ kết quả */}
                <div className="bg-white p-4 rounded-2xl shadow-md border mb-6 flex flex-wrap gap-4 justify-between items-center sticky top-4 z-50">
                    <button onClick={() => setResult(null)} className="flex items-center text-slate-500 font-bold hover:text-slate-800 transition-colors">
                        <ArrowPathIcon className="h-5 w-5 mr-2" /> Làm lại bản khác
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

                {/* KHU VỰC GIÁO ÁN CHUẨN CẤU TRÚC */}
                {/* Áp dụng inline style font-family và font-size để đảm bảo chính xác */}
                <div 
                    id="lesson-plan-content" 
                    className="bg-white shadow-2xl p-[2cm] text-black leading-normal border border-slate-300 min-h-[29.7cm]"
                    style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '14pt' }}
                >
                    {/* Header chuẩn hành chính */}
                    <div className="grid grid-cols-2 mb-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <div className="text-center font-bold">
                            <p className="text-sm uppercase">TRƯỜNG: .............................</p>
                            <p className="text-sm uppercase underline">TỔ CHUYÊN MÔN: .................</p>
                        </div>
                        <div className="text-center font-bold">
                            <p className="text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                            <p className="text-sm underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="font-bold text-2xl uppercase">KẾ HOẠCH BÀI DẠY</h1>
                        <p className="font-bold mt-2">MÔN HỌC: {subject.toUpperCase()}; LỚP: {grade.toUpperCase()}</p>
                        <p className="italic">Thời lượng: {result.period || '...'} tiết</p>
                        <h2 className="font-bold text-xl mt-4 uppercase">TÊN BÀI DẠY: {result.topic}</h2>
                    </div>

                    {/* Section I: Mục tiêu */}
                    <div className="mb-8">
                        <h3 className="font-bold uppercase mb-4">I. MỤC TIÊU</h3>
                        <div className="pl-8 space-y-4">
                            <p className="font-bold">1. Về kiến thức:</p>
                            <ul className="list-disc pl-10 space-y-1">
                                {(result.objectives?.knowledge || []).map((k, i) => <li key={i}>{k}</li>)}
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
                                        <li key={i} className="text-blue-800">
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

                    {/* Section II: Thiết bị dạy học */}
                    <div className="mb-8">
                        <h3 className="font-bold uppercase mb-4">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
                        <div className="pl-4 space-y-4">
                             <div>
                                <p className="font-bold">1. Giáo viên</p>
                                <ul className="list-disc pl-10 space-y-1">
                                    {(result.materials?.teacher || []).map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                             </div>
                             <div>
                                <p className="font-bold">2. Học sinh</p>
                                <ul className="list-disc pl-10 space-y-1">
                                    {(result.materials?.student || []).map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                             </div>
                        </div>
                    </div>

                    {/* Section III: Tiến trình dạy học */}
                    <div className="mb-12">
                        <h3 className="font-bold uppercase mb-6">III. TIẾN TRÌNH DẠY HỌC</h3>
                        <div className="space-y-10">
                            {(result.activities || []).map((act, idx) => (
                                <div key={act.id} className="pl-0">
                                    <h4 className="font-bold mb-4 bg-slate-100 p-2 border-l-4 border-black">{act.title}</h4>
                                    <div className="pl-4 space-y-2">
                                        <p><strong>a) Mục tiêu:</strong> {act.goal}</p>
                                        <p><strong>b) Nội dung:</strong> {act.content}</p>
                                        <p><strong>c) Sản phẩm:</strong> {act.product}</p>
                                        
                                        <div className="mt-4">
                                            <p className="font-bold italic underline mb-2">d) Tổ chức thực hiện:</p>
                                            
                                            {/* BẢNG TỔ CHỨC THỰC HIỆN - Cỡ chữ 14pt */}
                                            <table className="w-full border-collapse border border-black mt-2" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '14pt' }}>
                                                <thead>
                                                    <tr className="bg-slate-50">
                                                        <th className="border border-black p-2 text-center w-2/3" style={{ border: '1px solid black' }}>Hoạt động của giáo viên và học sinh</th>
                                                        <th className="border border-black p-2 text-center w-1/3" style={{ border: '1px solid black' }}>Sản phẩm dự kiến</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-black p-3 align-top" style={{ border: '1px solid black' }}>
                                                            {act.execution?.step1 && <p className="mb-2"><strong>Bước 1: Chuyển giao nhiệm vụ</strong><br/>{act.execution.step1}</p>}
                                                            {act.execution?.step2 && <p className="mb-2"><strong>Bước 2: Thực hiện nhiệm vụ</strong><br/>{act.execution.step2}</p>}
                                                            {act.execution?.step3 && <p className="mb-2"><strong>Bước 3: Báo cáo, thảo luận</strong><br/>{act.execution.step3}</p>}
                                                            {act.execution?.step4 && <p><strong>Bước 4: Kết luận, nhận định</strong><br/>{act.execution.step4}</p>}
                                                        </td>
                                                        <td className="border border-black p-3 align-top" style={{ border: '1px solid black' }}>
                                                            <div dangerouslySetInnerHTML={{ __html: (act.product || "Học sinh hoàn thành nhiệm vụ.").replace(/\n/g, '<br/>') }} />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section IV: Bảng phân tích NLS (Minh chứng) - Cỡ chữ 14pt */}
                    <div className="mt-20 page-break">
                        <h3 className="font-bold uppercase mb-6">IV. PHỤ LỤC: BẢNG MÃ HOÁ NĂNG LỰC SỐ</h3>
                        <p className="italic text-sm mb-4">(Bảng này được AI trích xuất dựa trên các hoạt động có sử dụng công nghệ trong bài dạy)</p>
                        <table className="w-full border-collapse border border-black" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '14pt' }}>
                            <thead>
                                <tr className="bg-slate-200">
                                    <th className="border border-black p-2 w-12 text-center" style={{ border: '1px solid black' }}>TT</th>
                                    <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Hoạt động</th>
                                    <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Cách thức tổ chức</th>
                                    <th className="border border-black p-2 text-left w-64" style={{ border: '1px solid black' }}>Mã NLS & Biểu hiện (Theo 3456)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(result.nlsAnalysisTable || []).map(row => (
                                    <tr key={row.index}>
                                        <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{row.index}</td>
                                        <td className="border border-black p-2 font-bold" style={{ border: '1px solid black' }}>{row.activityName}</td>
                                        <td className="border border-black p-2" style={{ border: '1px solid black' }}>{row.organization}</td>
                                        <td className="border border-black p-2 text-sm text-blue-800 font-medium" style={{ border: '1px solid black' }}>{row.competencyDetail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-20 grid grid-cols-2 text-center italic" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                            <p>Đã duyệt của Tổ chuyên môn</p>
                            <p className="font-bold not-italic mt-2">Tổ trưởng</p>
                            <div className="h-24"></div>
                            <p className="font-bold not-italic">..........................................</p>
                        </div>
                        <div>
                            <p>............, ngày .... tháng .... năm 20...</p>
                            <p className="font-bold not-italic mt-2">Giáo viên soạn</p>
                            <div className="h-24"></div>
                            <p className="font-bold not-italic">..........................................</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Tích hợp Năng lực số' }]} />
            
            <div className="bg-brand-blue rounded-3xl p-10 mb-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl border border-white/30">
                        <ShieldCheckIcon className="h-12 w-12 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Số hoá giáo án</h1>
                        <p className="text-blue-100 mt-2 opacity-95 text-lg">Giữ nguyên giáo án gốc, chỉ thêm Năng lực số.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Bộ sách</label>
                                <select className="w-full p-4 border rounded-xl font-bold bg-slate-50 text-sm" value={bookSeries} onChange={e => setBookSeries(e.target.value)}>
                                    {BOOK_SERIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Môn học</label>
                                <select className="w-full p-4 border rounded-xl font-bold bg-slate-50 text-sm" value={subject} onChange={e => setSubject(e.target.value)}>
                                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Lớp</label>
                                <select className="w-full p-4 border rounded-xl font-bold bg-slate-50 text-sm" value={grade} onChange={e => setGrade(e.target.value)}>
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-10">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Tên bài dạy</label>
                            <input type="text" className="w-full p-4 border-2 rounded-2xl focus:border-brand-blue outline-none font-bold text-xl transition-all" placeholder="VD: Bài 3. Luỹ thừa với số mũ tự nhiên..." value={lessonName} onChange={e => setLessonName(e.target.value)} />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-slate-700">Tải giáo án cũ (.docx)</label>
                                <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold">Word (Khuyên dùng)</span>
                            </div>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-4 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${oldFile ? 'border-green-400 bg-green-50 shadow-inner' : 'border-slate-100 hover:border-brand-blue hover:bg-indigo-50/30'}`}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                                {oldFile ? (
                                    <>
                                        <div className="bg-green-500 p-3 rounded-2xl mb-3 shadow-lg">
                                            <CheckCircleIcon className="h-8 w-8 text-white" />
                                        </div>
                                        <p className="text-green-800 font-bold">{oldFile.file.name}</p>
                                        <button onClick={(e) => { e.stopPropagation(); setOldFile(null); }} className="mt-4 text-xs font-bold text-red-500 hover:underline">Xóa và chọn file khác</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-slate-100 p-4 rounded-2xl mb-4 group-hover:bg-brand-blue/10 transition-colors">
                                            <CloudArrowUpIcon className="h-12 w-12 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-bold">Nhấn để tải file giáo án</p>
                                        <p className="text-slate-400 text-xs mt-1">Hệ thống sẽ giữ nguyên nội dung gốc</p>
                                    </>
                                )}
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Hoặc nhập nội dung</span></div>
                            </div>

                            <textarea 
                                className="w-full p-5 border-2 rounded-2xl bg-slate-50/50 focus:border-brand-blue focus:bg-white outline-none min-h-[150px] text-sm transition-all" 
                                placeholder="Dán nội dung giáo án cũ vào đây (đầy đủ các mục)..."
                                value={oldContentText}
                                onChange={e => setOldContentText(e.target.value)}
                            />
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={!lessonName || (!oldFile && !oldContentText)} className="w-full py-8 bg-brand-blue text-white rounded-[2rem] font-black text-3xl shadow-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 uppercase">
                        <RobotIcon className="h-10 w-10" />
                        Xử lý giáo án
                    </button>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-10 shadow-2xl">
                        <h3 className="text-xl font-bold mb-8 text-brand-yellow flex items-center border-b border-white/10 pb-4">
                            <ChartBarIcon className="h-6 w-6 mr-2" /> Lưu ý quan trọng
                        </h3>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-brand-yellow border border-white/20">1</span>
                                <p className="text-sm text-slate-300 leading-relaxed"><strong>Nguyên vẹn:</strong> AI sẽ không tự ý cắt bỏ Năng lực chung, Phẩm chất hay các bước dạy học.</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-brand-yellow border border-white/20">2</span>
                                <p className="text-sm text-slate-300 leading-relaxed"><strong>Bổ sung:</strong> Chỉ thêm mã Năng lực số vào các hoạt động có sử dụng công nghệ.</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-brand-yellow border border-white/20">3</span>
                                <p className="text-sm text-slate-300 leading-relaxed"><strong>Định dạng:</strong> Kết quả hiển thị đúng dạng bảng (Hoạt động - Sản phẩm) như file gốc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlanner;
