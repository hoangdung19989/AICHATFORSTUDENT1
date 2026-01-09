
import { GoogleGenAI } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';
import { getChatGPTResponse } from './openaiService';
import { API_KEYS } from '../config';

// --- CONFIG & UTILS ---

const getAiClient = () => {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey && localKey.trim().length > 0) {
        return new GoogleGenAI({ apiKey: localKey });
    }
    let apiKey = API_KEYS.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_GEMINI_API_KEY')) {
        apiKey = (process.env as any).API_KEY || '';
    }
    return new GoogleGenAI({ apiKey });
};

const getPreferredAI = (): 'gemini' | 'chatgpt' => {
    return localStorage.getItem('ai_preference') as 'gemini' | 'chatgpt' || 'gemini';
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
    const root = data.quiz || data.exam || data;
    const questions = Array.isArray(root.questions) ? root.questions.map((q: any) => ({
        question: q.question || "Câu hỏi không có nội dung",
        // Clean options: remove A., B., C. prefix AND trim extra spaces/newlines
        options: Array.isArray(q.options) ? q.options.map((opt: string) => String(opt).replace(/^[A-D]\.\s*/, '').trim()) : ["A", "B", "C", "D"],
        correctAnswer: q.correctAnswer ? String(q.correctAnswer).replace(/^[A-D]\.\s*/, '').trim() : "",
        explanation: q.explanation || "Giải thích đang cập nhật.",
        topics: Array.isArray(q.topics) ? q.topics : [],
        section: q.section || "",
        groupContent: q.groupContent || ""
    })) : [];
    const essayQuestions = Array.isArray(root.essayQuestions) ? root.essayQuestions.map((eq: any) => ({
        question: eq.question || "Câu hỏi tự luận chưa có nội dung",
        sampleAnswer: eq.sampleAnswer || "Đáp án đang được cập nhật.",
        image: eq.image || undefined,
        section: eq.section || ""
    })) : [];
    return {
        sourceSchool: root.sourceSchool || "Ngân hàng đề thi Quốc gia",
        title: root.title || "Bài kiểm tra hệ thống",
        timeLimit: root.timeLimit || "45 phút",
        questions: questions,
        essayQuestions: essayQuestions
    };
};

// --- UNIFIED AI CALLER ---

interface AIRequestParams {
    prompt: string;
    isJson?: boolean;
    subjectName?: string;
    images?: { data: string, mimeType: string }[];
}

const callSmartAI = async (params: AIRequestParams): Promise<string> => {
    const preference = getPreferredAI();
    const { prompt, isJson = false, subjectName = "Giáo dục", images = [] } = params;

    const callGemini = async () => {
        const ai = getAiClient();
        const parts: any[] = [{ text: prompt }];
        images.forEach(img => parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } }));
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts }],
            config: isJson ? { responseMimeType: "application/json", temperature: 0.7 } : { temperature: 0.8 }
        });
        if (response.text) return response.text;
        throw new Error("GEMINI_EMPTY_RESPONSE");
    };

    const callChatGPT = async () => {
        const gptImages = images.map(img => `data:${img.mimeType};base64,${img.data}`);
        return await getChatGPTResponse(subjectName, prompt, isJson, gptImages);
    };

    if (preference === 'chatgpt') {
        try { return await callChatGPT(); } catch (e) { return await callGemini(); }
    } else {
        try { return await callGemini(); } catch (e) { return await callChatGPT(); }
    }
};

// --- EXPORTED FUNCTIONS ---

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    return await callSmartAI({ prompt: message });
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    return await callSmartAI({ 
        prompt: `Bạn là gia sư môn ${subject.name}. Nếu có công thức toán học, hãy dùng định dạng LaTeX bao quanh bởi dấu $ (ví dụ: $\\frac{1}{2}$). Trả lời ngắn gọn: ${message}`, 
        subjectName: subject.name 
    });
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string, recentPerformance?: string): Promise<LearningPath> => {
    const prompt = `Tạo lộ trình học tập 7 ngày cho học sinh ${gradeName}. Chủ đề: ${focusTopics.join(", ")}. Hiệu suất: ${recentPerformance}. Trả về JSON...`;
    const responseText = await callSmartAI({ prompt, isJson: true });
    return JSON.parse(cleanJsonString(responseText));
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    const prompt = `Tạo 10 câu hỏi trắc nghiệm môn ${subjectName} ${gradeName}, bài: "${lessonTitle}".
    QUAN TRỌNG:
    - Nếu có công thức Toán/Lý/Hóa, BẮT BUỘC dùng định dạng LaTeX đặt trong dấu $ (ví dụ: $\\frac{x^2}{2}$).
    - Trả về JSON: { "title": "...", "questions": [...] }`;
    const responseText = await callSmartAI({ prompt, isJson: true, subjectName });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    const prompt = `Tạo đề thi ${testType.name} môn ${subjectName}, ${gradeName}.
    QUAN TRỌNG:
    - Toán/Lý/Hóa: Dùng LaTeX $...$.
    - Tiếng Anh: Chia rõ các phần (I. LISTENING, II. LANGUAGE, III. READING, IV. WRITING).
    - Trả về JSON chuẩn.`;
    const responseText = await callSmartAI({ prompt, isJson: true, subjectName });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    const prompt = `Tạo đề thi thử vào 10 môn ${subjectName}.
    YÊU CẦU:
    - Sử dụng LaTeX cho TẤT CẢ công thức toán học ($...$).
    - Với Tiếng Anh: Cấu trúc gồm I. LISTENING, II. LANGUAGE, III. READING, IV. WRITING.
    - Trả về JSON.`;
    const responseText = await callSmartAI({ prompt, isJson: true, subjectName });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
    let promptText = `Bạn là hệ thống số hóa đề thi thông minh. Nhiệm vụ: Chuyển đổi đề thi đính kèm thành JSON.
    
    1. XỬ LÝ TOÁN HỌC: Nhận diện công thức và chuyển sang LaTeX ($...$).
    
    2. XỬ LÝ ĐỀ TIẾNG ANH (QUAN TRỌNG):
       - Nhận diện các phần lớn (Section): I. LISTENING, II. LANGUAGE, III. READING, IV. WRITING.
       - Lưu tên phần vào trường "section".
       - Nếu có bài đọc (Passage), đưa vào trường "groupContent".
       - CỰC KỲ QUAN TRỌNG: Với phần trắc nghiệm, các phương án lựa chọn ("options") CHỈ được chứa nội dung đáp án, KHÔNG chứa ký tự trùng lặp. 
       - Ví dụ SAI: "carefully\ncarefully", "A. carefully".
       - Ví dụ ĐÚNG: "carefully".

    Cấu trúc JSON trả về:
    {
      "title": "Tên đề thi",
      "questions": [
        { 
          "section": "I. LISTENING",
          "groupContent": "Listen to the conversation...", 
          "question": "Question content...", 
          "options": ["Option A", "Option B", "Option C", "Option D"], 
          "correctAnswer": "Option A", 
          "explanation": "..." 
        }
      ],
      "essayQuestions": []
    }`;

    if (textContent) promptText += `\n\nNỘI DUNG VĂN BẢN THÔ:\n${textContent}`;
    const images = base64Data ? [{ data: base64Data, mimeType }] : [];
    const responseText = await callSmartAI({ prompt: promptText, isJson: true, images });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
    let prompt = `Tạo đề thi môn ${subject} ${grade} dựa trên ma trận đặc tả.
    YÊU CẦU:
    - Toán/Lý/Hóa: Dùng LaTeX.
    - Tránh lặp lại nội dung trong các đáp án.
    - Trả về JSON.`;
    if (textContent) prompt += `\n\nNỘI DUNG MA TRẬN:\n${textContent}`;
    const images = base64Data ? [{ data: base64Data, mimeType }] : [];
    const responseText = await callSmartAI({ prompt, isJson: true, images });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: { data: string, mimeType: string }[], oldContentText?: string, appendixText?: string): Promise<LessonPlan> => {
    const prompt = `
    Bạn là công cụ định dạng và trích xuất dữ liệu.
    Nhiệm vụ: Chuyển đổi giáo án sang JSON.
    Nếu có công thức toán, hãy dùng LaTeX $...$.
    
    (Giữ nguyên các quy tắc 5512 cũ...)
    
    CẤU TRÚC JSON TRẢ VỀ: {...}
    
    ${oldContentText ? `\n\n[NỘI DUNG CŨ]:\n${oldContentText}` : ''}
    `;
    
    const responseText = await callSmartAI({ prompt, isJson: true, images: contextFiles });
    return JSON.parse(cleanJsonString(responseText)) as LessonPlan;
};
