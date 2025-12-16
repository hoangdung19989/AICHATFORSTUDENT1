
import React, { useState, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { generateLessonPlan } from '../../services/geminiService';
import type { LessonPlan } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
    DocumentTextIcon, 
    ClockIcon, 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    DocumentCheckIcon, 
    ArrowDownTrayIcon, 
    EyeIcon,
    ArrowLeftIcon
} from '../../components/icons';

const SUBJECTS_LIST = [
    "Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", 
    "Lịch sử và Địa lí", "Giáo dục công dân", "Tin học", 
    "Công nghệ", "Nghệ thuật", "Giáo dục thể chất"
];

const BOOK_SERIES = [
    "Kết nối tri thức với cuộc sống",
    "Chân trời sáng tạo",
    "Cánh diều"
];

const GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

interface FileUploadState {
    name: string | null;
    status: 'idle' | 'uploading' | 'done';
}

const FileUploadCard: React.FC<{
    title: string;
    description: string;
    fileState: FileUploadState;
    onUpload: (file: File) => void;
    accept?: string;
}> = ({ title, description, fileState, onUpload, accept = ".doc,.docx,.xls,.xlsx" }) => {
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

const LessonPlanner: React.FC = () => {
    const { navigate } = useNavigation();
    
    // Form State
    const [bookSeries, setBookSeries] = useState(BOOK_SERIES[0]);
    const [subject, setSubject] = useState(SUBJECTS_LIST[0]);
    const [grade, setGrade] = useState(GRADES[0]);
    const [lessonName, setLessonName] = useState(''); // Optional manual input if file not provided

    // File States
    const [lessonFile, setLessonFile] = useState<FileUploadState>({ name: null, status: 'idle' });
    const [curriculumFile, setCurriculumFile] = useState<FileUploadState>({ name: null, status: 'idle' });
    const [nlsFile, setNlsFile] = useState<FileUploadState>({ name: null, status: 'idle' });

    // Process State
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<LessonPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (setter: React.Dispatch<React.SetStateAction<FileUploadState>>) => (file: File) => {
        // Simulate upload
        setter({ name: file.name, status: 'uploading' });
        setTimeout(() => {
            setter({ name: file.name, status: 'done' });
        }, 1500);
    };

    const handleGenerate = async () => {
        if (!subject || !grade || !bookSeries) return;
        
        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            // Collect filenames to simulate context for AI
            const uploadedFiles = [];
            if (lessonFile.name) uploadedFiles.push(`Giáo án cũ: ${lessonFile.name}`);
            if (curriculumFile.name) uploadedFiles.push(`PPCT: ${curriculumFile.name}`);
            if (nlsFile.name) uploadedFiles.push(`Khung NLS: ${nlsFile.name}`);

            // If user didn't type a topic but uploaded a file, we use the filename as a hint
            const topicToUse = lessonName || (lessonFile.name ? lessonFile.name.split('.')[0] : "Tự chọn bài phù hợp");

            const plan = await generateLessonPlan(subject, grade, topicToUse, bookSeries, uploadedFiles);
            setResult(plan);
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra khi soạn giáo án.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        // Mock download by creating a blob from the JSON content (in real app, this would be a docx blob)
        const textContent = `
GIÁO ÁN: ${result.topic.toUpperCase()}
Môn: ${subject} - ${grade}
Bộ sách: ${bookSeries}
--------------------------------------------------

I. MỤC TIÊU
${result.objectives.map(o => `- ${o}`).join('\n')}

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
${result.materials.map(m => `- ${m}`).join('\n')}

III. TIẾN TRÌNH DẠY HỌC
${result.activities.map(a => `
[${a.time}] ${a.title}
${a.description}
`).join('\n')}

IV. HƯỚNG DẪN VỀ NHÀ
${result.homework}
        `;
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Giao_an_NLS_${subject}_${grade}.txt`; // Using .txt for demo, .docx requires library
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isGenerating) {
        return (
            <div className="container mx-auto max-w-5xl h-screen flex flex-col justify-center items-center">
                <LoadingSpinner text="Hệ thống đang phân tích dữ liệu..." subText="Đang tích hợp khung Năng lực số vào bài dạy..." color="amber" />
            </div>
        );
    }

    if (result) {
        return (
            <div className="container mx-auto max-w-5xl py-8 px-4">
                <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden text-center p-12 animate-scale-in">
                    <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <DocumentCheckIcon className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Soạn giáo án thành công!</h2>
                    <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
                        Hệ thống đã tích hợp xong năng lực số vào bài dạy <strong>"{result.topic}"</strong> của bạn.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            className="flex items-center justify-center px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Tải về .docx
                        </button>
                        <button 
                            onClick={() => setResult(null)} // Reset to create new
                            className="flex items-center justify-center px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Soạn bài khác
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="mt-12 text-left bg-slate-50 rounded-xl border border-slate-200 p-8 max-h-[500px] overflow-y-auto shadow-inner">
                        <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-4">
                            <EyeIcon className="h-5 w-5 text-slate-400" />
                            <span className="font-bold text-slate-500 uppercase text-sm">Xem trước nội dung</span>
                        </div>
                        <div className="prose max-w-none text-slate-700">
                            <h3 className="text-xl font-bold text-brand-blue">{result.topic}</h3>
                            <p className="text-sm text-slate-500 italic mb-4">{grade} - {subject} ({bookSeries})</p>
                            
                            <h4 className="font-bold mt-4">I. MỤC TIÊU</h4>
                            <ul className="list-disc pl-5">
                                {result.objectives.map((o, i) => <li key={i}>{o}</li>)}
                            </ul>

                            <h4 className="font-bold mt-4">II. HOẠT ĐỘNG DẠY HỌC CHỦ YẾU</h4>
                            <div className="space-y-4 mt-2">
                                {result.activities.map((act, i) => (
                                    <div key={i} className="bg-white p-4 rounded border border-slate-200">
                                        <div className="font-bold text-slate-800 flex justify-between">
                                            <span>{act.title}</span>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">{act.time}</span>
                                        </div>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{act.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Soạn giáo án NLS' }]} />

            {/* Header Banner */}
            <div className="bg-brand-blue-dark rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                        <DocumentTextIcon className="h-8 w-8 mr-3 text-brand-yellow" />
                        SOẠN GIÁO ÁN NLS
                    </h1>
                    <p className="text-blue-200 text-lg">Hệ thống hỗ trợ tích hợp Năng lực số toàn cấp</p>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 right-20 w-20 h-20 bg-brand-yellow opacity-10 rounded-full blur-xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Config */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Section 1: Lesson Plan Info */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">Thông tin Kế hoạch bài dạy</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Bộ sách</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-slate-50"
                                    value={bookSeries}
                                    onChange={(e) => setBookSeries(e.target.value)}
                                >
                                    {BOOK_SERIES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
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
                        
                        <div className="mt-4">
                             <label className="block text-sm font-semibold text-slate-700 mb-2">Tên bài dạy (Nếu không tải file giáo án)</label>
                             <input 
                                type="text"
                                className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                                placeholder="Nhập tên bài dạy..."
                                value={lessonName}
                                onChange={(e) => setLessonName(e.target.value)}
                             />
                        </div>
                    </section>

                    {/* Section 2: Input Materials */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">Tài liệu đầu vào</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-1 h-48">
                                <FileUploadCard 
                                    title="File Giáo án (Tuỳ chọn)" 
                                    description="Tải lên file giáo án cũ (.docx) để AI tham khảo nội dung."
                                    fileState={lessonFile}
                                    onUpload={handleFileUpload(setLessonFile)}
                                />
                            </div>
                            <div className="md:col-span-1 h-48">
                                <FileUploadCard 
                                    title="File Phân phối chương trình (Tuỳ chọn)" 
                                    description="Giúp AI xác định năng lực cụ thể của trường."
                                    fileState={curriculumFile}
                                    onUpload={handleFileUpload(setCurriculumFile)}
                                />
                            </div>
                            <div className="md:col-span-2 h-32">
                                <FileUploadCard 
                                    title="File Khung năng lực số mẫu (Tuỳ chọn)" 
                                    description="Nếu có khung mẫu riêng, hãy tải lên tại đây."
                                    fileState={nlsFile}
                                    onUpload={handleFileUpload(setNlsFile)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Advanced Options (Mock) */}
                    <div className="flex items-center space-x-6 px-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-brand-blue focus:ring-brand-blue h-4 w-4" />
                            <span className="text-sm text-slate-600">Chỉ phân tích, không chỉnh sửa</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-brand-blue focus:ring-brand-blue h-4 w-4" defaultChecked />
                            <span className="text-sm text-slate-600">Kèm báo cáo chi tiết</span>
                        </label>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        className="w-full py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center"
                    >
                        <DocumentCheckIcon className="h-6 w-6 mr-2" />
                        BẮT ĐẦU SOẠN GIÁO ÁN
                    </button>
                </div>

                {/* Right Column: Instructions & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-brand-blue-dark text-white p-6 rounded-xl shadow-lg">
                        <h3 className="font-bold text-lg mb-4">Hướng dẫn nhanh</h3>
                        <ul className="space-y-4 text-sm text-blue-100">
                            <li className="flex items-start">
                                <span className="bg-blue-500/30 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">1</span>
                                <span>Chọn thông tin bộ sách, môn học và khối lớp.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500/30 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">2</span>
                                <span>Tải lên file giáo án cũ (bắt buộc hoặc tuỳ chọn) để AI hiểu ngữ cảnh.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500/30 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">3</span>
                                <span>Nhấn "Bắt đầu" và đợi AI xử lý trong vài giây.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Miền năng lực số</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-brand-blue rounded-full mr-2"></div>Khai thác dữ liệu và thông tin</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-brand-blue rounded-full mr-2"></div>Giao tiếp và Hợp tác</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-brand-blue rounded-full mr-2"></div>Sáng tạo nội dung số</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-brand-blue rounded-full mr-2"></div>An toàn số</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-brand-blue rounded-full mr-2"></div>Giải quyết vấn đề</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-brand-blue rounded-full mr-2"></div>Ứng dụng AI</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlanner;
