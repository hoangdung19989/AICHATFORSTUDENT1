
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

// Hàm làm sạch chuỗi JSON từ Markdown của AI
const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = clean.indexOf('{');
    const lastClose = clean.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
        clean = clean.substring(firstOpen, lastClose + 1);
        return clean;
    }
    console.warn("AI không trả về JSON hợp lệ:", text.substring(0, 100) + "...");
    return "{}";
};

// Dữ liệu khung năng lực số 3456/BGDĐT-GDPT
const NLS_FRAMEWORK_3456 = `
BẢNG MÃ CHỈ BÁO NĂNG LỰC SỐ (Theo văn bản 3456/BGDĐT-GDPT):
1. MIỀN 1: THÔNG TIN VÀ DỮ LIỆU (1.1.CB1a -> 1.3.NC1b)
2. MIỀN 2: GIAO TIẾP VÀ HỢP TÁC (2.1.CB1a -> 2.6.NC1c)
3. MIỀN 3: SÁNG TẠO NỘI DUNG SỐ (3.1.CB1a -> 3.4.NC1a)
4. MIỀN 4: AN TOÀN (4.1.CB1a -> 4.4.NC1a)
5. MIỀN 5: GIẢI QUYẾT VẤN ĐỀ (5.1.CB1a -> 5.4.NC1c)
6. MIỀN 6: TRÍ TUỆ NHÂN TẠO (AI) (6.1.CB2a -> 6.3.NC1b)
`;

// Mẫu JSON mặc định
const LESSON_PLAN_TEMPLATE = {
    period: "Số tiết",
    topic: "Tên bài dạy",
    grade: "Khối lớp",
    objectives: {
        knowledge: ["Kiến thức 1 (Chép y nguyên từ file cũ)", "Kiến thức 2"],
        commonCompetencies: ["Năng lực chung 1 (Chép y nguyên từ file cũ)", "Năng lực chung 2"],
        virtues: ["Phẩm chất 1 (Chép y nguyên từ file cũ)", "Phẩm chất 2"],
        digitalCompetencies: [{ domain: "Tên miền NL", code: "Mã (VD: 1.1.CB1a)", description: "Mô tả biểu hiện" }]
    },
    materials: { 
        teacher: ["Máy tính, tivi...", "Phiếu học tập..."], 
        student: ["SGK, vở ghi...", "Bảng nhóm..."] 
    },
    activities: [
        {
            id: 1, 
            title: "Tên hoạt động (VD: Hoạt động 1: Khởi động)", 
            goal: "Mục tiêu", 
            content: "Nội dung", 
            product: "Nội dung cột 'Sản phẩm' trong file cũ",
            execution: { 
                step1: "GV chuyển giao nhiệm vụ...", 
                step2: "HS thực hiện...", 
                step3: "Báo cáo thảo luận...", 
                step4: "Kết luận..." 
            }
        }
    ],
    nlsAnalysisTable: [{ index: 1, activityName: "Hoạt động 1", organization: "Mô tả cách dùng công nghệ", competencyDetail: "Mã NLS (VD: 1.1.TC1a)" }],
    homework: "Nhiệm vụ về nhà"
};

export const generateLessonPlan = async (
    subject: string, 
    grade: string, 
    topic: string, 
    bookSeries: string, 
    contextFiles: { data: string, mimeType: string }[], 
    oldContentText?: string
): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        
        const systemPrompt = `
VAI TRÒ: Bạn là trợ lý số hoá giáo án chuyên nghiệp.
NHIỆM VỤ: Chuyển đổi nội dung giáo án cũ sang JSON và TÍCH HỢP thêm Năng lực số.

QUY TẮC SỐ 1: GIỮ NGUYÊN CẤU TRÚC GỐC (TUYỆT ĐỐI QUAN TRỌNG)
- **Mục II. Thiết bị dạy học và học liệu**: Phải chia rõ 2 phần riêng biệt:
  + \`teacher\`: Thiết bị/Học liệu của GIÁO VIÊN.
  + \`student\`: Thiết bị/Học liệu của HỌC SINH.
- **Hoạt động dạy học**: 
  + Giữ nguyên tên hoạt động (Ví dụ: "Hoạt động 1: Mở đầu" hoặc "Hoạt động 2.1...").
  + Cột "Sản phẩm" trong file cũ phải được đưa vào trường \`product\`.
  + Cột "Hoạt động của GV và HS" (Tổ chức thực hiện) phải được chia thành 4 bước (step1, step2, step3, step4) trong \`execution\`.

QUY TẮC SỐ 2: TÍCH HỢP NĂNG LỰC SỐ
- Tra cứu bảng mã 3456/BGDĐT-GDPT để gán mã vào \`digitalCompetencies\` và \`nlsAnalysisTable\`.
- Chỉ gán mã cho các hoạt động thực sự sử dụng công nghệ.

QUY TẮC SỐ 3: ĐẦU RA JSON
- Trả về JSON khớp hoàn toàn với mẫu sau. Không thêm bớt trường.

MẪU JSON:
${JSON.stringify(LESSON_PLAN_TEMPLATE)}
`;

        const parts: any[] = [
            { text: systemPrompt },
            { text: `THÔNG TIN: Môn ${subject}, Lớp ${grade}, Bài ${topic}, Sách ${bookSeries}` }
        ];
        
        if (oldContentText) {
            parts.push({ text: `NỘI DUNG GIÁO ÁN CŨ (CHÚ Ý PHÂN TÁCH RÕ MỤC GIÁO VIÊN VÀ HỌC SINH Ở PHẦN II): \n${oldContentText}` });
        } else {
            parts.push({ text: "Không có văn bản cũ. Hãy soạn mới chi tiết." });
        }
        
        contextFiles.forEach(file => {
            parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });
        });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: [{ role: 'user', parts }],
            config: {
                temperature: 0.1, 
                maxOutputTokens: 8192, 
            },
        });
        
        if (!response.text) throw new Error("AI không trả về dữ liệu.");
        
        const cleanJson = cleanJsonString(response.text);
        const parsedData = JSON.parse(cleanJson);

        return {
            ...LESSON_PLAN_TEMPLATE,
            ...parsedData
        } as unknown as LessonPlan;

    } catch (error: any) {
        console.error("Lỗi tạo giáo án:", error);
        return {
            ...LESSON_PLAN_TEMPLATE,
            topic: topic,
            objectives: { 
                ...LESSON_PLAN_TEMPLATE.objectives, 
                knowledge: ["Lỗi xử lý: " + error.message] 
            }
        } as unknown as LessonPlan;
    }
};

// --- CÁC HÀM KHÁC GIỮ NGUYÊN ---

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: message }] }],
        });
        return response.text || "Xin lỗi, tôi không thể trả lời ngay lúc này.";
    } catch (e) { return "Lỗi kết nối AI."; }
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Bạn là gia sư môn ${subject.name}. Hãy trả lời ngắn gọn: ${message}` }] }],
        });
        return response.text || "";
    } catch (e) { return "Lỗi kết nối."; }
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Tạo đề thi trắc nghiệm môn ${subjectName} ${gradeName} (${testType.name}, ${semester}). JSON Format: { sourceSchool: string, title: string, timeLimit: string, questions: [{question, options[], correctAnswer, explanation}], essayQuestions: [] }` }] }],
            config: { responseMimeType: "application/json" }, 
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return { title: "Lỗi tạo đề", sourceSchool: "", timeLimit: "", questions: [] }; }
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Đề thi thử ${subjectName} ${gradeName}. JSON Format.` }] }],
            config: { responseMimeType: "application/json" },
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return { title: "Lỗi", sourceSchool: "", timeLimit: "", questions: [] }; }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Bài tập trắc nghiệm bài: "${lessonTitle}" môn ${subjectName} ${gradeName}. JSON Format.` }] }],
            config: { responseMimeType: "application/json" },
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return { title: "Lỗi", sourceSchool: "", timeLimit: "", questions: [] }; }
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string): Promise<LearningPath> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Lộ trình học 7 ngày cho ${gradeName}, tập trung: ${focusTopics.join(", ")}. JSON: { grade, studentWeaknesses[], weeklyPlan: [{day, title, description, tasks: [{type, content, difficulty}]}] }` }] }],
            config: { responseMimeType: "application/json" },
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { throw new Error("Lỗi tạo lộ trình"); }
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts: [{ inlineData: { data: base64Data, mimeType } }, { text: `Tạo đề thi ${subject} ${grade} từ ma trận này. ${mcCount} câu TN, ${essayCount} câu TL. Trả về JSON.` }] }],
        });
        return JSON.parse(cleanJsonString(response.text || '{}'));
    } catch (e) { console.error(e); return { title: "Lỗi xử lý file", sourceSchool: "", timeLimit: "", questions: [] }; }
};

export const parseExamDocument = async (base64Data: string, mimeType: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts: [{ inlineData: { data: base64Data, mimeType } }, { text: "Trích xuất câu hỏi thành JSON: { questions: [], essayQuestions: [] }" }] }],
        });
        return JSON.parse(cleanJsonString(response.text || '{}'));
    } catch (e) { console.error(e); return { title: "Lỗi đọc file", sourceSchool: "", timeLimit: "", questions: [] }; }
};
