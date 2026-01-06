
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';
import { getChatGPTResponse } from './openaiService';
import { API_KEYS } from '../config';

const getAiClient = () => {
    let apiKey = API_KEYS.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_GEMINI_API_KEY')) {
        apiKey = (process.env as any).API_KEY || '';
    }
    return new GoogleGenAI({ apiKey });
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
    
    // Xử lý trắc nghiệm
    const questions = Array.isArray(data.questions) ? data.questions.map((q: any) => ({
        question: q.question || "Câu hỏi không có nội dung",
        options: Array.isArray(q.options) ? q.options.map((opt: string) => opt.replace(/^[A-D]\.\s*/, '')) : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "Giải thích đang cập nhật.",
        topics: Array.isArray(q.topics) ? q.topics : []
    })) : [];

    // Xử lý tự luận
    const essayQuestions = Array.isArray(data.essayQuestions) ? data.essayQuestions.map((eq: any) => ({
        question: eq.question || "Câu hỏi tự luận chưa có nội dung",
        sampleAnswer: eq.sampleAnswer || "Đáp án đang được cập nhật.",
        image: eq.image || undefined
    })) : [];

    return {
        sourceSchool: data.sourceSchool || "Ngân hàng đề thi Quốc gia",
        title: data.title || "Bài kiểm tra hệ thống",
        timeLimit: data.timeLimit || "45 phút",
        questions: questions,
        essayQuestions: essayQuestions
    };
};

const callAiWithFallback = async (prompt: string, isJson: boolean = false, subjectName: string = "Giáo dục"): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: isJson ? { 
                responseMimeType: "application/json",
                temperature: 0.7 
            } : { temperature: 0.8 }
        });
        
        if (response.text) return response.text;
        throw new Error("GEMINI_EMPTY");
        
    } catch (geminiError) {
        console.warn("⚠️ Gemini Fallback Triggered:", geminiError);
        try {
            return await getChatGPTResponse(subjectName, prompt, isJson);
        } catch (openaiError) {
            throw new Error("Không thể kết nối với hệ thống trí tuệ nhân tạo.");
        }
    }
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    return await callAiWithFallback(message);
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    return await callAiWithFallback(`Bạn là gia sư môn ${subject.name}. Trả lời ngắn gọn, sư phạm: ${message}`, false, subject.name);
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string, recentPerformance?: string): Promise<LearningPath> => {
    const prompt = `Tạo lộ trình học tập 7 ngày cho học sinh ${gradeName}. 
    Các chủ đề cần tập trung: ${focusTopics.join(", ")}. 
    Hiệu suất gần đây: ${recentPerformance}.
    Trả về JSON: { "grade": "string", "studentWeaknesses": ["string"], "weeklyPlan": [{"day": 1, "title": "string", "description": "string", "tasks": [{"type": "video"|"practice", "content": "string", "difficulty": "Easy"|"Medium"|"Hard"}]}] }`;
    const responseText = await callAiWithFallback(prompt, true);
    return JSON.parse(cleanJsonString(responseText));
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    const prompt = `Tạo 10 câu hỏi trắc nghiệm luyện tập môn ${subjectName} ${gradeName}, bài học: "${lessonTitle}". 
    Đảm bảo kiến thức bám sát SGK Kết nối tri thức. 
    Trả về JSON định dạng: { "title": "Luyện tập: ${lessonTitle}", "questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "trùng với 1 trong 4 options", "explanation": "..."}] }`;
    const responseText = await callAiWithFallback(prompt, true, subjectName);
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    const mcCount = testType.questionCount || 10;
    const essayCount = testType.essayCount || 0;
    
    const prompt = `Bạn là chuyên gia khảo thí. Hãy tạo đề thi ${testType.name} môn ${subjectName}, ${gradeName}, ${semester}.
    Yêu cầu:
    1. Số câu trắc nghiệm: ${mcCount} câu.
    2. Số câu tự luận: ${essayCount} câu.
    3. Nội dung: Phân bổ 40% nhận biết, 30% thông hiểu, 20% vận dụng, 10% vận dụng cao.
    
    TRẢ VỀ DUY NHẤT JSON THEO CẤU TRÚC:
    {
      "sourceSchool": "Sở Giáo dục và Đào tạo",
      "title": "${testType.name} môn ${subjectName} - ${gradeName}",
      "timeLimit": "${testType.duration}",
      "questions": [
        {
          "question": "Nội dung câu hỏi...",
          "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          "correctAnswer": "Phải trùng khớp chính xác với 1 trong 4 lựa chọn trên",
          "explanation": "Giải thích chi tiết tại sao chọn đáp án đó...",
          "topics": ["Tên chủ đề kiến thức"]
        }
      ],
      "essayQuestions": [
        {
          "question": "Nội dung câu hỏi tự luận...",
          "sampleAnswer": "Hướng dẫn chấm hoặc đáp án mẫu..."
        }
      ]
    }`;

    const responseText = await callAiWithFallback(prompt, true, subjectName);
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    const prompt = `Tạo đề thi thử vào lớp 10 (hoặc thi kết thúc năm) môn ${subjectName} ${gradeName}. 
    Cấu trúc đề chuẩn 45-60 phút. Bao gồm cả trắc nghiệm và tự luận (nếu môn học yêu cầu).
    Trả về JSON cấu trúc giống đề thi chuyên nghiệp.`;
    const responseText = await callAiWithFallback(prompt, true, subjectName);
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
    const promptText = `Hãy phân tích tài liệu đề thi đính kèm và trích xuất sang định dạng JSON chuẩn để học sinh làm bài online.
    Yêu cầu:
    - Trích xuất tất cả câu hỏi trắc nghiệm (đủ câu hỏi, 4 lựa chọn, đáp án đúng, giải thích).
    - Trích xuất các câu hỏi tự luận (nếu có).
    - Chỉ trả về JSON.`;
    
    const parts: any[] = [{ text: promptText }];
    if (textContent) parts.push({ text: textContent });
    else parts.push({ inlineData: { data: base64Data, mimeType } });

    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config: { responseMimeType: "application/json" }
    });
    return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: { data: string, mimeType: string }[], oldContentText?: string, appendixText?: string): Promise<LessonPlan> => {
    const ai = getAiClient();
    const parts: any[] = [{ text: `Soạn giáo án 5512 môn ${subject} ${grade} bài ${topic} theo bộ sách ${bookSeries}. Tích hợp năng lực số.` }];
    if (oldContentText) parts.push({ text: `Nội dung tham khảo: ${oldContentText}` });
    if (appendixText) parts.push({ text: `Yêu cầu cần đạt: ${appendixText}` });
    contextFiles.forEach(f => parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));
    
    const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview", 
        contents: [{ role: 'user', parts }], 
        config: { responseMimeType: "application/json" } 
    });
    return JSON.parse(cleanJsonString(response.text || '{}')) as LessonPlan;
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
    const ai = getAiClient();
    const prompt = `Tạo đề thi môn ${subject} ${grade} dựa trên ma trận đặc tả đính kèm. 
    Yêu cầu: ${mcCount} câu trắc nghiệm và ${essayCount} câu tự luận. 
    Đảm bảo độ khó phân bổ đúng như ma trận yêu cầu.`;
    
    const parts: any[] = [{ text: prompt }];
    if (textContent) parts.push({ text: textContent });
    else parts.push({ inlineData: { data: base64Data, mimeType } });
    
    const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview", 
        contents: [{ role: 'user', parts }], 
        config: { responseMimeType: "application/json" } 
    });
    return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
};
