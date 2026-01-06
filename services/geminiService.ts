
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
    
    const prompt = `
    Đóng vai là chuyên gia giáo dục, hãy soạn Kế hoạch bài dạy (Giáo án) môn ${subject} ${grade} bài "${topic}" (${bookSeries}) theo công văn 5512.
    
    YÊU CẦU QUAN TRỌNG NHẤT:
    Tích hợp Năng lực số dựa trên văn bản 3456/BGDĐT-GDPT. 
    BẮT BUỘC SỬ DỤNG CHÍNH XÁC CÁC MÃ SAU (KHÔNG ĐƯỢC BỊA MÃ KHÁC):

    1. Khai thác dữ liệu và thông tin:
       - 1.1.TC1a/b/c/d (Duyệt, tìm kiếm dữ liệu)
       - 1.2.TC1a/b (Đánh giá dữ liệu)
       - 1.3.TC1a/b (Quản lý dữ liệu)
    2. Giao tiếp và hợp tác:
       - 2.1.TC1a/b (Tương tác qua công nghệ)
       - 2.2.TC1a/b/c (Chia sẻ thông tin)
       - 2.3.TC1a/b (Công dân số)
       - 2.4.TC1a (Hợp tác qua công nghệ)
       - 2.5.TC1a/b/c (Quy tắc ứng xử)
       - 2.6.TC1a/b/c (Quản lý danh tính số)
    3. Sáng tạo nội dung số:
       - 3.1.TC1a/b (Phát triển nội dung)
       - 3.2.TC1a (Tích hợp và tái tạo)
       - 3.3.TC1a (Bản quyền)
       - 3.4.TC1a (Lập trình/Tư duy máy tính)
    4. An toàn:
       - 4.1.TC1a/b/c/d (Bảo vệ thiết bị)
       - 4.2.TC1a/b/c (Bảo vệ dữ liệu cá nhân)
       - 4.3.TC1a/b/c (Sức khỏe và an sinh)
       - 4.4.TC1a (Bảo vệ môi trường)
    5. Giải quyết vấn đề:
       - 5.1.TC1a/b (Vấn đề kỹ thuật)
       - 5.2.TC1a/b/c (Nhu cầu công nghệ)
       - 5.3.TC1a/b (Sáng tạo công nghệ)
       - 5.4.TC1a/b (Cải thiện năng lực)
    6. Sử dụng trí tuệ nhân tạo (AI):
       - 6.1.TC1a/b (Hiểu biết về AI)
       - 6.2.TC1a/b/c (Sử dụng AI)
       - 6.3.TC1a/b (Đánh giá AI)

    HÃY CHỌN 2-3 HOẠT ĐỘNG TRONG BÀI CÓ THỂ ỨNG DỤNG CÔNG NGHỆ VÀ GÁN MÃ NĂNG LỰC SỐ TƯƠNG ỨNG TỪ DANH SÁCH TRÊN.

    CẤU TRÚC JSON TRẢ VỀ (BẮT BUỘC):
    {
      "period": "Số tiết",
      "topic": "${topic}",
      "grade": "${grade}",
      "objectives": {
        "knowledge": ["Yêu cầu kiến thức 1", "..."],
        "commonCompetencies": ["Tự chủ và tự học", "Giao tiếp và hợp tác", "Giải quyết vấn đề và sáng tạo"],
        "digitalCompetencies": [
           { "domain": "Miền 1. Khai thác dữ liệu", "code": "1.1.TC1a", "description": "Học sinh tìm kiếm được thông tin..." }
        ],
        "virtues": ["Chăm chỉ", "Trung thực", "Trách nhiệm"]
      },
      "materials": {
        "teacher": ["Máy tính", "Tivi", "Phần mềm..."],
        "student": ["SGK", "Vở ghi"]
      },
      "activities": [
        {
          "id": 1,
          "title": "Hoạt động 1: Khởi động",
          "goal": "...",
          "content": "...",
          "product": "...",
          "execution": {
            "step1": "GV chuyển giao...",
            "step2": "HS thực hiện...",
            "step3": "Báo cáo...",
            "step4": "Kết luận..."
          }
        },
        {
          "id": 2,
          "title": "Hoạt động 2: Hình thành kiến thức",
          "goal": "...",
          "content": "...",
          "product": "...",
          "execution": {
            "step1": "GV yêu cầu HS dùng Google để tìm kiếm...",
            "step2": "HS thực hiện...",
            "step3": "...",
            "step4": "..."
          }
        }
      ],
      "nlsAnalysisTable": [
        {
          "index": 1,
          "activityName": "Hoạt động 2: Hình thành kiến thức",
          "organization": "GV yêu cầu HS tìm kiếm thông tin trên Internet...",
          "competencyDetail": "1.1.TC1a: Xác định nhu cầu thông tin và tìm kiếm dữ liệu."
        }
      ],
      "homework": "..."
    }
    `;

    const parts: any[] = [{ text: prompt }];
    if (oldContentText) parts.push({ text: `Tài liệu tham khảo (Giáo án cũ/Nội dung bài): ${oldContentText}` });
    if (appendixText) parts.push({ text: `Phụ lục 3 (Yêu cầu cần đạt/Đặc tả): ${appendixText}` });
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
    Đảm bảo độ khó phân bổ đúng như ma trận yêu cầu.
    Trả về JSON chuẩn đề thi.`;
    
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
