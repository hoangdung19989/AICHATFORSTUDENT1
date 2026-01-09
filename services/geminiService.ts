
import { GoogleGenAI } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';
import { getChatGPTResponse } from './openaiService';
import { API_KEYS } from '../config';

// --- CONFIG & UTILS ---

const getAiClient = () => {
    // 1. Ưu tiên lấy Key cá nhân từ LocalStorage
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey && localKey.trim().length > 0) {
        return new GoogleGenAI({ apiKey: localKey });
    }

    // 2. Lấy Key mặc định từ Config hoặc Env
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
    
    // Support nested structure if AI wraps it
    const root = data.quiz || data.exam || data;

    // Xử lý trắc nghiệm
    const questions = Array.isArray(root.questions) ? root.questions.map((q: any) => ({
        question: q.question || "Câu hỏi không có nội dung",
        options: Array.isArray(q.options) ? q.options.map((opt: string) => String(opt).replace(/^[A-D]\.\s*/, '').trim()) : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
        correctAnswer: q.correctAnswer ? String(q.correctAnswer).replace(/^[A-D]\.\s*/, '').trim() : "",
        explanation: q.explanation || "Giải thích đang cập nhật.",
        topics: Array.isArray(q.topics) ? q.topics : []
    })) : [];

    // Xử lý tự luận
    const essayQuestions = Array.isArray(root.essayQuestions) ? root.essayQuestions.map((eq: any) => ({
        question: eq.question || "Câu hỏi tự luận chưa có nội dung",
        sampleAnswer: eq.sampleAnswer || "Đáp án đang được cập nhật.",
        image: eq.image || undefined
    })) : [];

    return {
        sourceSchool: root.sourceSchool || "Ngân hàng đề thi Quốc gia",
        title: root.title || "Bài kiểm tra hệ thống",
        timeLimit: root.timeLimit || "45 phút",
        questions: questions,
        essayQuestions: essayQuestions
    };
};

// --- UNIFIED AI CALLER (SMART SWITCHING) ---

interface AIRequestParams {
    prompt: string;
    isJson?: boolean;
    subjectName?: string;
    images?: { data: string, mimeType: string }[]; // Định dạng ảnh của Gemini
}

const callSmartAI = async (params: AIRequestParams): Promise<string> => {
    const preference = getPreferredAI();
    const { prompt, isJson = false, subjectName = "Giáo dục", images = [] } = params;

    // Helper: Gọi Gemini
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

    // Helper: Gọi ChatGPT
    const callChatGPT = async () => {
        // Chuyển đổi ảnh sang định dạng base64 URI cho ChatGPT
        const gptImages = images.map(img => `data:${img.mimeType};base64,${img.data}`);
        return await getChatGPTResponse(subjectName, prompt, isJson, gptImages);
    };

    if (preference === 'chatgpt') {
        try {
            return await callChatGPT();
        } catch (gptError: any) {
            console.warn("⚠️ ChatGPT (Ưu tiên) gặp lỗi, chuyển sang Gemini...", gptError);
            try {
                return await callGemini();
            } catch (geminiError: any) {
                // Xử lý lỗi Quota của Gemini
                if (geminiError.message?.includes('429') || geminiError.message?.includes('RESOURCE_EXHAUSTED')) {
                    throw new Error("Hệ thống AI đang quá tải (Hết Quota). Vui lòng vào Cài đặt > Nhập Gemini API Key cá nhân để tiếp tục sử dụng.");
                }
                throw new Error(`Cả 2 AI đều thất bại. GPT: ${gptError.message} | Gemini: ${geminiError.message}`);
            }
        }
    } else {
        // Default: Gemini first
        try {
            return await callGemini();
        } catch (geminiError: any) {
            // Xử lý lỗi Quota của Gemini ngay lập tức
            if (geminiError.message?.includes('429') || geminiError.message?.includes('RESOURCE_EXHAUSTED')) {
                throw new Error("Hệ thống AI đang quá tải (Hết Quota). Vui lòng vào Cài đặt > Nhập Gemini API Key cá nhân để tiếp tục sử dụng.");
            }

            console.warn("⚠️ Gemini (Ưu tiên) gặp lỗi, chuyển sang ChatGPT...", geminiError);
            try {
                return await callChatGPT();
            } catch (gptError: any) {
                throw new Error(`Cả 2 AI đều thất bại. Gemini: ${geminiError.message} | GPT: ${gptError.message}`);
            }
        }
    }
};

// --- EXPORTED FUNCTIONS ---

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    return await callSmartAI({ prompt: message });
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    return await callSmartAI({ 
        prompt: `Bạn là gia sư môn ${subject.name}. Trả lời ngắn gọn, sư phạm: ${message}`, 
        subjectName: subject.name 
    });
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string, recentPerformance?: string): Promise<LearningPath> => {
    const prompt = `Tạo lộ trình học tập 7 ngày cho học sinh ${gradeName}. 
    Các chủ đề cần tập trung: ${focusTopics.join(", ")}. 
    Hiệu suất gần đây: ${recentPerformance}.
    Trả về JSON: { "grade": "string", "studentWeaknesses": ["string"], "weeklyPlan": [{"day": 1, "title": "string", "description": "string", "tasks": [{"type": "video"|"practice", "content": "string", "difficulty": "Easy"|"Medium"|"Hard"}]}] }`;
    
    const responseText = await callSmartAI({ prompt, isJson: true });
    return JSON.parse(cleanJsonString(responseText));
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    const prompt = `Tạo 10 câu hỏi trắc nghiệm luyện tập môn ${subjectName} ${gradeName}, bài học: "${lessonTitle}". 
    Đảm bảo kiến thức bám sát SGK Kết nối tri thức. 
    Trả về JSON định dạng: { "title": "Luyện tập: ${lessonTitle}", "questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "trùng với 1 trong 4 options", "explanation": "..."}] }`;
    
    const responseText = await callSmartAI({ prompt, isJson: true, subjectName });
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

    const responseText = await callSmartAI({ prompt, isJson: true, subjectName });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    const prompt = `Tạo đề thi thử vào lớp 10 (hoặc thi kết thúc năm) môn ${subjectName} ${gradeName}. 
    Cấu trúc đề chuẩn 45-60 phút. Bao gồm cả trắc nghiệm và tự luận (nếu môn học yêu cầu).
    Trả về JSON cấu trúc giống đề thi chuyên nghiệp.`;
    
    const responseText = await callSmartAI({ prompt, isJson: true, subjectName });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
    let promptText = `Bạn là trợ lý nhập liệu đề thi. Hãy phân tích tài liệu đính kèm và trích xuất thành JSON.
    
    YÊU CẦU CẤU TRÚC JSON (BẮT BUỘC):
    {
      "title": "Tên đề thi (VD: Đề thi giữa kỳ I...)",
      "questions": [
        {
          "question": "Nội dung câu hỏi",
          "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
          "correctAnswer": "Chuỗi text của đáp án đúng (ví dụ: 'Lựa chọn 1')",
          "explanation": "Giải thích (nếu có, hoặc tự sinh ra)",
          "topics": ["Chủ đề"]
        }
      ],
      "essayQuestions": [
        { "question": "Câu hỏi tự luận", "sampleAnswer": "Gợi ý trả lời" }
      ]
    }

    CHÚ Ý:
    - Loại bỏ các tiền tố như "Câu 1:", "A.", "B." trong nội dung.
    - Nếu không tìm thấy đáp án, hãy tự giải và điền vào correctAnswer.
    - JSON phải hợp lệ.`;

    // Nếu có textContent (từ file Word), nối vào prompt
    if (textContent) {
        promptText += `\n\nNỘI DUNG ĐỀ THI (VĂN BẢN):\n${textContent}`;
    }

    // Chuẩn bị ảnh cho AI (nếu có base64)
    const images = base64Data ? [{ data: base64Data, mimeType }] : [];

    const responseText = await callSmartAI({ prompt: promptText, isJson: true, images });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: { data: string, mimeType: string }[], oldContentText?: string, appendixText?: string): Promise<LessonPlan> => {
    const prompt = `
    Bạn là công cụ định dạng và trích xuất dữ liệu (Data Extractor).
    Nhiệm vụ: Chuyển đổi nội dung giáo án đầu vào sang JSON và bổ sung bảng năng lực số.

    TUÂN THỦ TUYỆT ĐỐI CÁC QUY TẮC SAU (KHÔNG ĐƯỢC PHÉP SAI):
    1. GIỮ NGUYÊN VĂN BẢN GỐC (VERBATIM): 
       - Giữ nguyên từng câu, từng chữ của giáo án gốc trong các phần: Mục tiêu, Thiết bị, Tiến trình dạy học.
       - KHÔNG sửa lỗi chính tả. KHÔNG viết lại cho hay hơn. KHÔNG tóm tắt.
       - Nếu giáo án gốc viết dài, hãy để nguyên độ dài đó.
    
    2. LOẠI BỎ HÌNH ẢNH:
       - Nếu nội dung gốc có hình ảnh, sơ đồ, biểu đồ minh họa: HÃY BỎ QUA CHÚNG.
       - KHÔNG chèn các dòng như "[Hình ảnh minh họa...]", "[Sơ đồ...]" vào JSON.
       - Chỉ lấy phần văn bản (text).

    3. PHẦN BỔ SUNG DUY NHẤT: BẢNG NĂNG LỰC SỐ (nlsAnalysisTable):
       - Dựa trên các hoạt động dạy học, hãy tra cứu "KHUNG NĂNG LỰC SỐ 6 MIỀN (Văn bản 3456)" dưới đây để điền vào bảng phụ lục.

    === KHUNG NĂNG LỰC SỐ (3456/BGDĐT-GDPT) ===
    
    1. Miền 1: Khai thác dữ liệu & thông tin
       - 1.1.TC1a/b/c/d: Duyệt, tìm kiếm dữ liệu.
       - 1.1.TC2a/b/c/d: Chiến lược tìm kiếm.
       - 1.2.TC1/TC2: Đánh giá độ tin cậy.
       - 1.3.TC1/TC2: Quản lý, lưu trữ dữ liệu.

    2. Miền 2: Giao tiếp & Hợp tác
       - 2.1.TC1/TC2: Tương tác qua công nghệ.
       - 2.2.TC1/TC2: Chia sẻ dữ liệu.
       - 2.3.TC1/TC2: Tham gia xã hội số.
       - 2.4.TC1/TC2: Hợp tác trực tuyến.
       - 2.5.TC1/TC2: Quy tắc ứng xử (Netiquette).
       - 2.6.TC1/TC2: Quản lý danh tính số.

    3. Miền 3: Sáng tạo nội dung số
       - 3.1.TC1/TC2: Phát triển nội dung (Word, PP, Video).
       - 3.2.TC1/TC2: Chỉnh sửa, tích hợp nội dung.
       - 3.3.TC1/TC2: Bản quyền.
       - 3.4.TC1/TC2: Lập trình (nếu có).

    4. Miền 4: An toàn số
       - 4.1.TC1/TC2: Bảo vệ thiết bị.
       - 4.2.TC1/TC2: Bảo vệ thông tin cá nhân.
       - 4.3.TC1/TC2: Bảo vệ sức khỏe.
       - 4.4.TC1/TC2: Bảo vệ môi trường.

    5. Miền 5: Giải quyết vấn đề
       - 5.1.TC1/TC2: Sự cố kỹ thuật.
       - 5.2.TC1/TC2: Chọn công cụ phù hợp.
       - 5.3.TC1/TC2: Sáng tạo bằng công nghệ.
       - 5.4.TC1/TC2: Tự đánh giá năng lực số.

    6. Miền 6: Trí tuệ nhân tạo (AI)
       - 6.1.TC1/TC2: Hiểu biết về AI.
       - 6.2.TC1/TC2: Sử dụng AI hỗ trợ học tập.
       - 6.3.TC1/TC2: Đánh giá hệ thống AI.

    CẤU TRÚC JSON TRẢ VỀ (BẮT BUỘC):
    {
      "period": "Số tiết (lấy từ giáo án gốc, nếu không có để trống)",
      "topic": "${topic}",
      "grade": "${grade}",
      "objectives": {
        "knowledge": ["Sao chép nguyên văn từ mục Kiến thức"],
        "commonCompetencies": ["Sao chép nguyên văn từ mục Năng lực chung"],
        "digitalCompetencies": [
           { "domain": "Miền 6. Trí tuệ nhân tạo", "code": "6.2.TC1a", "description": "Mô tả biểu hiện NLS nếu có trong mục tiêu" }
        ],
        "virtues": ["Sao chép nguyên văn từ mục Phẩm chất"]
      },
      "materials": {
        "teacher": ["Sao chép nguyên văn"],
        "student": ["Sao chép nguyên văn"]
      },
      "activities": [
        {
          "id": 1,
          "title": "Tên hoạt động (Sao chép nguyên văn)",
          "goal": "Mục tiêu (Sao chép nguyên văn)",
          "content": "Nội dung (Sao chép nguyên văn)",
          "product": "Sản phẩm (Sao chép nguyên văn)",
          "execution": {
            "step1": "Chuyển giao nhiệm vụ (SAO CHÉP NGUYÊN VĂN)",
            "step2": "Thực hiện nhiệm vụ (SAO CHÉP NGUYÊN VĂN)",
            "step3": "Báo cáo, thảo luận (SAO CHÉP NGUYÊN VĂN)",
            "step4": "Kết luận, nhận định (SAO CHÉP NGUYÊN VĂN)"
          }
        }
      ],
      "nlsAnalysisTable": [
        {
          "index": 1,
          "activityName": "Tên hoạt động tương ứng",
          "organization": "Mô tả ngắn gọn cách tổ chức có dùng công nghệ",
          "competencyDetail": "Mã (VD: 6.1.TC1a) - Mô tả biểu hiện cụ thể"
        }
      ],
      "homework": "Dặn dò (Sao chép nguyên văn)"
    }
    
    ${oldContentText ? `\n\n[NỘI DUNG GIÁO ÁN CŨ]:\n${oldContentText}` : ''}
    ${appendixText ? `\n\n[PHỤ LỤC 3 / MA TRẬN]:\n${appendixText}` : ''}
    `;

    const responseText = await callSmartAI({ 
        prompt, 
        isJson: true, 
        images: contextFiles
    });
    
    return JSON.parse(cleanJsonString(responseText)) as LessonPlan;
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
    let prompt = `Tạo đề thi môn ${subject} ${grade} dựa trên ma trận đặc tả đính kèm. 
    Yêu cầu: ${mcCount} câu trắc nghiệm và ${essayCount} câu tự luận. 
    Đảm bảo độ khó phân bổ đúng như ma trận yêu cầu.
    Trả về JSON chuẩn đề thi.`;

    if (textContent) {
        prompt += `\n\nNỘI DUNG MA TRẬN (VĂN BẢN):\n${textContent}`;
    }
    
    const images = base64Data ? [{ data: base64Data, mimeType }] : [];

    const responseText = await callSmartAI({ prompt, isJson: true, images });
    return ensureQuizFormat(JSON.parse(cleanJsonString(responseText)));
};
