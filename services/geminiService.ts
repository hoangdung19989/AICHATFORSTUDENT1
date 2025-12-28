
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

// Helper to ensure Quiz data structure is valid
const ensureQuizFormat = (data: any): Quiz => {
    if (!data) {
        return { title: "Lỗi dữ liệu", sourceSchool: "", timeLimit: "", questions: [] };
    }
    return {
        sourceSchool: data.sourceSchool || "AI Tutor",
        title: data.title || "Bài tập tự luyện",
        timeLimit: data.timeLimit || "Không giới hạn",
        questions: Array.isArray(data.questions) ? data.questions : [],
        essayQuestions: Array.isArray(data.essayQuestions) ? data.essayQuestions : [],
        semester: data.semester
    };
};

const NLS_FRAMEWORK_3456 = `
BẢNG MÃ CHỈ BÁO NĂNG LỰC SỐ (CẬP NHẬT MỚI):
// ... (Giữ nguyên nội dung bảng mã NLS nếu cần dùng cho hàm khác) ...
`;

const LESSON_PLAN_TEMPLATE = {
    period: "Số tiết",
    topic: "Tên bài dạy",
    grade: "Khối lớp",
    objectives: {
        knowledge: ["Kiến thức 1"],
        commonCompetencies: ["Năng lực chung 1"],
        virtues: ["Phẩm chất 1"],
        digitalCompetencies: [{ domain: "Tên miền NL", code: "Mã", description: "Mô tả" }]
    },
    materials: { 
        teacher: ["Máy tính..."], 
        student: ["SGK..."] 
    },
    activities: [
        {
            id: 1, 
            title: "Hoạt động 1", 
            goal: "Mục tiêu", 
            content: "Nội dung", 
            product: "Sản phẩm",
            execution: { step1: "", step2: "", step3: "", step4: "" }
        }
    ],
    nlsAnalysisTable: [{ index: 1, activityName: "", organization: "", competencyDetail: "" }],
    homework: "Nhiệm vụ về nhà"
};

export const generateLessonPlan = async (
    subject: string, 
    grade: string, 
    topic: string, 
    bookSeries: string, 
    contextFiles: { data: string, mimeType: string }[], 
    oldContentText?: string,
    appendixContent?: string
): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        const systemPrompt = `
VAI TRÒ: Bạn là trợ lý số hoá giáo án chuyên nghiệp.
NHIỆM VỤ: Chuyển đổi nội dung giáo án cũ sang JSON và TÍCH HỢP thêm Năng lực số.
MẪU JSON ĐẦU RA (BẮT BUỘC):
${JSON.stringify(LESSON_PLAN_TEMPLATE)}
`;
        const parts: any[] = [
            { text: systemPrompt },
            { text: `THÔNG TIN: Môn ${subject}, Lớp ${grade}, Bài ${topic}, Sách ${bookSeries}` }
        ];
        
        if (oldContentText) parts.push({ text: `NỘI DUNG GIÁO ÁN CŨ: \n${oldContentText}` });
        else parts.push({ text: "Soạn mới chi tiết." });

        if (appendixContent) parts.push({ text: `PHỤ LỤC 3: \n${appendixContent}` });
        
        contextFiles.forEach(file => {
            parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });
        });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: [{ role: 'user', parts }],
            config: { temperature: 0.1, maxOutputTokens: 8192 },
        });
        
        return { ...LESSON_PLAN_TEMPLATE, ...JSON.parse(cleanJsonString(response.text || '{}')) } as unknown as LessonPlan;
    } catch (error: any) {
        console.error("Lỗi tạo giáo án:", error);
        return { ...LESSON_PLAN_TEMPLATE, topic: topic, objectives: { ...LESSON_PLAN_TEMPLATE.objectives, knowledge: ["Lỗi: " + error.message] } } as unknown as LessonPlan;
    }
};

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
        return ensureQuizFormat(JSON.parse(response.text || '{}'));
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
        return ensureQuizFormat(JSON.parse(response.text || '{}'));
    } catch (e) { return { title: "Lỗi", sourceSchool: "", timeLimit: "", questions: [] }; }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `
        Vai trò: Giáo viên bộ môn ${subjectName} dạy theo bộ sách "Kết nối tri thức với cuộc sống".
        Nhiệm vụ: Tạo 10 câu hỏi trắc nghiệm ôn tập cho bài học: "${lessonTitle}".
        Yêu cầu:
        1. Nội dung câu hỏi phải BÁM SÁT kiến thức cụ thể của bài "${lessonTitle}" trong SGK ${subjectName} ${gradeName} (Bộ Kết nối tri thức).
        2. Không lấy câu hỏi của bài khác hoặc kiến thức chung chung.
        3. Có 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
        4. Trả về định dạng JSON chuẩn.

        Format JSON:
        {
          "sourceSchool": "Sách Kết nối tri thức",
          "title": "Bài tập: ${lessonTitle}",
          "timeLimit": "15 phút",
          "questions": [
            {
              "question": "Nội dung câu hỏi...",
              "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
              "correctAnswer": "Đáp án đúng (nguyên văn text trong options)",
              "explanation": "Giải thích chi tiết tại sao đúng/sai dựa trên bài học..."
            }
          ]
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" },
        });
        return ensureQuizFormat(JSON.parse(response.text || '{}'));
    } catch (e) { 
        console.error("Lỗi tạo bài tập:", e);
        return { title: "Lỗi tạo bài tập", sourceSchool: "", timeLimit: "", questions: [] }; 
    }
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

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        
        const systemPrompt = `
VAI TRÒ: Bạn là một giáo viên chuyên ra đề thi theo chuẩn Bộ Giáo dục.
NHIỆM VỤ: Phân tích tài liệu MA TRẬN ĐỀ THI được cung cấp (ảnh hoặc văn bản) và soạn thảo đề thi hoàn chỉnh.

QUY TRÌNH XỬ LÝ (BẮT BUỘC):
1. **Phân tích Ma trận**: Đọc kỹ bảng ma trận để xác định:
   - Các chủ đề kiến thức.
   - Số lượng câu hỏi cho mỗi mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) trong từng chủ đề.
   - Tổng số câu trắc nghiệm (TN) và tự luận (TL).

2. **Soạn câu hỏi**: Tạo ra các câu hỏi KHỚP 100% VỚI MA TRẬN ĐÃ PHÂN TÍCH.
   - Nếu ma trận ghi "Chủ đề A: 2 câu Nhận biết", hãy tạo đúng 2 câu hỏi dễ về Chủ đề A.
   - Nếu ma trận ghi "Chủ đề B: 1 câu Vận dụng cao", hãy tạo 1 câu hỏi khó về Chủ đề B.
   - Tổng số câu hỏi phải khớp với yêu cầu: ${mcCount} câu TN và ${essayCount} câu TL.

3. **Định dạng Output**: Trả về JSON chuẩn.

JSON FORMAT:
{
  "title": "ĐỀ KIỂM TRA GIỮA KỲ/CUỐI KỲ...",
  "sourceSchool": "Đề xuất bản từ Ma trận",
  "timeLimit": "45 phút",
  "questions": [
    {
      "question": "Nội dung câu hỏi (VD: Kết quả của phép tính...)",
      "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
      "correctAnswer": "Đáp án đúng (nguyên văn text trong options)",
      "explanation": "Giải thích ngắn gọn (chỉ rõ thuộc mức độ nào: NB/TH/VD/VDC)"
    }
  ],
  "essayQuestions": [
    {
      "question": "Nội dung câu hỏi tự luận",
      "sampleAnswer": "Gợi ý trả lời chi tiết..."
    }
  ]
}
`;

        const parts: any[] = [
             { text: systemPrompt },
             { text: `THÔNG TIN: Môn ${subject}, Lớp ${grade}. Yêu cầu: ${mcCount} câu TN, ${essayCount} câu TL.` }
        ];

        if (textContent) {
             parts.push({ text: `NỘI DUNG MA TRẬN (Trích xuất từ file): \n${textContent}` });
        } else if (base64Data) {
             parts.push({ inlineData: { data: base64Data, mimeType } });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Sử dụng model thông minh hơn để phân tích ma trận
            contents: [{ role: 'user', parts }],
            config: {
                temperature: 0.3, // Giảm temperature để AI bám sát ma trận hơn, ít sáng tạo lung tung
                maxOutputTokens: 8192
            }
        });
        
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e) { 
        console.error("Generate Test Error:", e); 
        return { title: "Lỗi xử lý file", sourceSchool: "", timeLimit: "", questions: [] }; 
    }
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const promptText = `
        NHIỆM VỤ: Phân tích file đề thi này và trích xuất thành dữ liệu JSON.
        YÊU CẦU: Tách biệt phần TRẮC NGHIỆM và TỰ LUẬN.
        ĐỊNH DẠNG JSON TRẢ VỀ:
        {
          "title": "Tên đề thi",
          "questions": [{ "question": "...", "options": ["..."], "correctAnswer": "...", "explanation": "" }],
          "essayQuestions": [{ "question": "...", "sampleAnswer": "" }]
        }
        `;
        const parts: any[] = [{ text: promptText }];
        if (textContent) parts.push({ text: `NỘI DUNG ĐỀ THI: \n${textContent}` });
        else if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts }],
        });
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e) { 
        console.error(e); 
        return { title: "Lỗi đọc file", sourceSchool: "", timeLimit: "", questions: [] }; 
    }
};
