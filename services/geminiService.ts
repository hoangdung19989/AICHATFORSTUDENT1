
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

// FIX: Initialize Gemini API client using process.env.API_KEY directly
const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpenBrace = clean.indexOf('{');
    const firstOpenBracket = clean.indexOf('[');
    let startIndex = -1;
    if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) startIndex = firstOpenBrace;
    else startIndex = firstOpenBracket;
    if (startIndex === -1) return "{}";
    const isObject = clean[startIndex] === '{';
    const lastCloseIndex = isObject ? clean.lastIndexOf('}') : clean.lastIndexOf(']');
    if (lastCloseIndex === -1) return "{}";
    return clean.substring(startIndex, lastCloseIndex + 1);
};

const ensureQuizFormat = (data: any): Quiz => {
    if (!data) return { title: "Lỗi dữ liệu", sourceSchool: "", timeLimit: "", questions: [] };
    const questions = Array.isArray(data.questions) ? data.questions.map((q: any) => ({
        question: q.question || "Câu hỏi không có nội dung",
        options: Array.isArray(q.options) ? q.options : ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "Chưa có giải thích cho câu hỏi này.",
        topics: Array.isArray(q.topics) ? q.topics : []
    })) : [];
    return {
        sourceSchool: data.sourceSchool || "Hệ thống AI Tutor",
        title: data.title || "Bài tập tự luyện",
        timeLimit: data.timeLimit || "20 phút",
        questions: questions,
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
        return response.text || "Xin lỗi, tôi không thể trả lời ngay lúc này.";
    } catch (e: any) { return `Lỗi kết nối AI: ${e.message}`; }
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string, recentPerformance?: string): Promise<LearningPath> => {
    try {
        const ai = getAiClient();
        const prompt = `Bạn là chuyên gia tư vấn giáo dục cấp cao. Dựa trên dữ liệu học tập của học sinh ${gradeName}:
        - Các chủ đề cần cải thiện: ${focusTopics.join(", ")}
        - Kết quả gần đây: ${recentPerformance || "Đang bắt đầu luyện tập"}

        NHIỆM VỤ: Hãy thiết lập một lộ trình học tập "Cá nhân hóa" trong 7 ngày tới. 
        Mỗi ngày phải có tiêu đề truyền cảm hứng, mô tả mục tiêu cụ thể và ít nhất 2 nhiệm vụ (1 Học lý thuyết qua video, 1 Thực hành bài tập).

        TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON THEO ĐỊNH DẠNG:
        {
          "grade": "${gradeName}",
          "studentWeaknesses": ${JSON.stringify(focusTopics)},
          "weeklyPlan": [
            {
              "day": 1,
              "title": "Chinh phục nền tảng...",
              "description": "Hôm nay chúng ta sẽ tập trung vào...",
              "tasks": [
                { "type": "video", "content": "Tên bài học/Chủ đề video", "difficulty": "Easy" },
                { "type": "practice", "content": "Tên bài luyện tập tập trung vào...", "difficulty": "Medium" }
              ]
            }
          ]
        }
        (Lưu ý: Tạo đủ từ ngày 1 đến ngày 7)`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(cleanJsonString(response.text || '{}'));
    } catch (e) { 
        console.error("Path Gen Error:", e);
        throw new Error("Không thể khởi tạo lộ trình. Vui lòng thử lại."); 
    }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `Tạo 10 câu hỏi trắc nghiệm luyện tập môn ${subjectName} ${gradeName}, bài: "${lessonTitle}". JSON format: { "title": "...", "questions": [...] }`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" },
        });
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e: any) { throw new Error("Hệ thống AI đang bận."); }
};

// Các hàm khác giữ nguyên...
export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts: [{ text: `Bạn là gia sư môn ${subject.name}. Trả lời: ${message}` }] }] });
        return response.text || "";
    } catch (e) { return "Lỗi kết nối."; }
};
export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts: [{ text: `Tạo đề thi ${subjectName} ${gradeName} (${testType.name}). JSON.` }] }], config: { responseMimeType: "application/json" } });
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e) { throw e; }
};
export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts: [{ text: `Tạo đề thi thử ${subjectName} ${gradeName}. JSON.` }] }], config: { responseMimeType: "application/json" } });
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e) { throw e; }
};
export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const parts: any[] = [{ text: "Trích xuất đề thi sang JSON." }];
        if (textContent) parts.push({ text: textContent });
        else if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ parts }], config: { responseMimeType: "application/json" } });
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e) { throw e; }
};
export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: { data: string, mimeType: string }[], oldContentText?: string, appendixText?: string): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        const parts: any[] = [{ text: `Soạn giáo án 5512 môn ${subject} ${grade} bài ${topic} theo ${bookSeries}. JSON.` }];
        if (oldContentText) parts.push({ text: `Cũ: ${oldContentText}` });
        if (appendixText) parts.push({ text: `Phụ lục: ${appendixText}` });
        contextFiles.forEach(f => parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts }], config: { responseMimeType: "application/json" } });
        return JSON.parse(cleanJsonString(response.text || '{}')) as LessonPlan;
    } catch (e) { throw e; }
};
export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `Tạo đề từ ma trận môn ${subject} ${grade}. TN: ${mcCount}, TL: ${essayCount}. JSON.`;
        const parts: any[] = [{ text: prompt }];
        if (textContent) parts.push({ text: textContent });
        else if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts }], config: { responseMimeType: "application/json" } });
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e) { throw e; }
};
