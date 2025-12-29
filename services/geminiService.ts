
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

// FIX: Initialize Gemini API client using process.env.API_KEY directly as per guidelines
const getAiClient = () => {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Hàm làm sạch chuỗi JSON từ Markdown của AI
const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = clean.indexOf('{');
    const lastClose = clean.lastIndexOf('}');
    const firstArrayOpen = clean.indexOf('[');
    const lastArrayClose = clean.lastIndexOf(']');

    // Ưu tiên Object nếu xuất hiện trước
    if (firstOpen !== -1 && (firstArrayOpen === -1 || firstOpen < firstArrayOpen)) {
        return clean.substring(firstOpen, lastClose + 1);
    } else if (firstArrayOpen !== -1) {
        return clean.substring(firstArrayOpen, lastArrayClose + 1);
    }
    
    return clean;
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

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: message }] }],
        });
        // FIX: Access .text property directly (not a method)
        return response.text || "Xin lỗi, tôi không thể trả lời ngay lúc này.";
    } catch (e: any) { 
        console.error("Gemini Error:", e);
        return `Lỗi kết nối AI: ${e.message}`; 
    }
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Bạn là gia sư môn ${subject.name}. Hãy trả lời ngắn gọn: ${message}` }] }],
        });
        // FIX: Access .text property directly
        return response.text || "";
    } catch (e) { return "Lỗi kết nối."; }
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Tạo đề thi trắc nghiệm môn ${subjectName} ${gradeName} (${testType.name}, ${semester}). JSON Format: { "sourceSchool": "string", "title": "string", "timeLimit": "string", "questions": [{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "...", "explanation": "..."}], "essayQuestions": [] }` }] }],
            config: { responseMimeType: "application/json" }, 
        });
        // FIX: Access .text property directly
        return ensureQuizFormat(JSON.parse(response.text || '{}'));
    } catch (e: any) { 
        console.error("Quiz Gen Error:", e);
        throw e;
    }
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Tạo đề thi thử ${subjectName} ${gradeName} định dạng JSON chuẩn.` }] }],
            config: { responseMimeType: "application/json" },
        });
        // FIX: Access .text property directly
        return ensureQuizFormat(JSON.parse(response.text || '{}'));
    } catch (e) { throw e; }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `Tạo 10 câu hỏi trắc nghiệm ôn tập môn ${subjectName} ${gradeName} bài: "${lessonTitle}". JSON Format.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" },
        });
        // FIX: Access .text property directly
        return ensureQuizFormat(JSON.parse(response.text || '{}'));
    } catch (e) { throw e; }
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string): Promise<LearningPath> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Lộ trình học 7 ngày cho ${gradeName}, tập trung: ${focusTopics.join(", ")}. JSON: { "grade": "string", "studentWeaknesses": [], "weeklyPlan": [{"day": 1, "title": "...", "description": "...", "tasks": [{"type": "video", "content": "...", "difficulty": "Medium"}]}] }` }] }],
            config: { responseMimeType: "application/json" },
        });
        // FIX: Access .text property directly
        return JSON.parse(response.text || '{}');
    } catch (e) { throw new Error("Lỗi tạo lộ trình"); }
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
        // FIX: Access .text property directly
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e: any) { 
        console.error("Parse Error:", e); 
        throw e;
    }
};

/**
 * Generates a lesson plan.
 * FIX: Updated signature to accept 7th argument 'appendixText' as expected by LessonPlanner.tsx line 98
 */
export const generateLessonPlan = async (
    subject: string, 
    grade: string, 
    topic: string, 
    bookSeries: string, 
    contextFiles: { data: string, mimeType: string }[], 
    oldContentText?: string,
    appendixText?: string
): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        const parts: any[] = [
            { text: `Soạn giáo án 5512 môn ${subject} ${grade} bài ${topic} theo bộ sách ${bookSeries}. Trả về JSON.` }
        ];
        if (oldContentText) parts.push({ text: `Nội dung cũ: ${oldContentText}` });
        // FIX: Included handling for appendixText provided by the frontend
        if (appendixText) parts.push({ text: `Nội dung Phụ lục 3 (Yêu cầu cần đạt/Đặc tả): ${appendixText}` });
        contextFiles.forEach(f => parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts }],
            config: { responseMimeType: "application/json" }
        });
        // FIX: Access .text property directly (getter)
        return JSON.parse(response.text || '{}') as LessonPlan;
    } catch (e) { throw e; }
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `Phân tích ma trận và tạo đề thi môn ${subject} ${grade}. Yêu cầu ${mcCount} câu TN, ${essayCount} câu TL. Trả về JSON.`;
        const parts: any[] = [{ text: prompt }];
        if (textContent) parts.push({ text: `Ma trận: ${textContent}` });
        else if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts }],
            config: { responseMimeType: "application/json" }
        });
        // FIX: Access .text property directly
        return ensureQuizFormat(JSON.parse(response.text || '{}'));
    } catch (e) { throw e; }
};
