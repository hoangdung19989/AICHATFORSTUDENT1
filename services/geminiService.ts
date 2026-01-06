
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';
import { getChatGPTResponse } from './openaiService';

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
        options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "Giải thích đang cập nhật.",
        topics: Array.isArray(q.topics) ? q.topics : []
    })) : [];
    return {
        sourceSchool: data.sourceSchool || "Hệ thống OnLuyen",
        title: data.title || "Bài tập tự luyện",
        timeLimit: data.timeLimit || "20 phút",
        questions: questions,
        essayQuestions: Array.isArray(data.essayQuestions) ? data.essayQuestions : []
    };
};

/**
 * HÀM WRAPPER: Tự động chuyển sang ChatGPT nếu Gemini lỗi
 */
const callAiWithFallback = async (prompt: string, isJson: boolean = false, subjectName: string = "Giáo dục"): Promise<string> => {
    try {
        // Thử chạy Gemini trước
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: isJson ? { responseMimeType: "application/json" } : undefined
        });
        
        if (response.text) return response.text;
        throw new Error("GEMINI_EMPTY_RESPONSE");
        
    } catch (geminiError) {
        console.warn("⚠️ Gemini gặp lỗi, đang kích hoạt ChatGPT làm dự phòng...", geminiError);
        try {
            // Nếu Gemini chết, gọi ChatGPT ứng cứu
            return await getChatGPTResponse(subjectName, prompt, isJson);
        } catch (openaiError) {
            console.error("❌ Cả 2 hệ thống AI đều không khả dụng.");
            throw new Error("Hệ thống trí tuệ nhân tạo đang bảo trì. Vui lòng thử lại sau.");
        }
    }
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    return await callAiWithFallback(message);
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    return await callAiWithFallback(`Bạn là gia sư môn ${subject.name}. Trả lời ngắn gọn: ${message}`, false, subject.name);
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string, recentPerformance?: string): Promise<LearningPath> => {
    const prompt = `Lộ trình học 7 ngày cho ${gradeName}, tập trung: ${focusTopics.join(", ")}. Kết quả gần đây: ${recentPerformance}. Trả về JSON theo cấu trúc: { "grade": "string", "studentWeaknesses": [], "weeklyPlan": [{"day": 1, "title": "string", "description": "string", "tasks": [{"type": "video", "content": "string", "difficulty": "Easy"}]}] }`;
    const responseText = await callAiWithFallback(prompt, true);
    return JSON.parse(cleanJsonString(responseText));
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    const prompt = `Tạo 10 câu hỏi trắc nghiệm luyện tập môn ${subjectName} ${gradeName}, bài: "${lessonTitle}". Trả về JSON định dạng { "title": "...", "questions": [{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "...", "explanation": "..."}] }`;
    const responseText = await callAiWithFallback(prompt, true, subjectName);
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

// Các hàm khác như generateQuiz, generateMockExam... cũng sẽ sử dụng cơ chế callAiWithFallback tương tự.
export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    const prompt = `Tạo đề thi ${subjectName} ${gradeName} (${testType.name}). Trả về JSON chuẩn đề thi.`;
    const responseText = await callAiWithFallback(prompt, true, subjectName);
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    const prompt = `Tạo đề thi thử ${subjectName} ${gradeName}. Trả về JSON chuẩn.`;
    const responseText = await callAiWithFallback(prompt, true, subjectName);
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
    // Với phân tích tài liệu nặng, ta vẫn ưu tiên Gemini do khả năng Multimodal tốt hơn
    // Nhưng nếu chỉ có Text, ChatGPT có thể thay thế.
    const ai = getAiClient();
    const promptText = `Trích xuất đề thi sang JSON.`;
    const parts: any[] = [{ text: promptText }];
    if (textContent) parts.push({ text: textContent });
    else parts.push({ inlineData: { data: base64Data, mimeType } });

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config: { responseMimeType: "application/json" }
    });
    return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: { data: string, mimeType: string }[], oldContentText?: string, appendixText?: string): Promise<LessonPlan> => {
    const ai = getAiClient();
    const parts: any[] = [{ text: `Soạn giáo án 5512 môn ${subject} ${grade} bài ${topic} theo ${bookSeries}. Trả về JSON.` }];
    if (oldContentText) parts.push({ text: `Cũ: ${oldContentText}` });
    if (appendixText) parts.push({ text: `Phụ lục: ${appendixText}` });
    contextFiles.forEach(f => parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));
    const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts }], config: { responseMimeType: "application/json" } });
    return JSON.parse(cleanJsonString(response.text || '{}')) as LessonPlan;
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
    const ai = getAiClient();
    const prompt = `Tạo đề từ ma trận môn ${subject} ${grade}. TN: ${mcCount}, TL: ${essayCount}. JSON.`;
    const parts: any[] = [{ text: prompt }];
    if (textContent) parts.push({ text: textContent });
    else parts.push({ inlineData: { data: base64Data, mimeType } });
    const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts }], config: { responseMimeType: "application/json" } });
    return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
};
