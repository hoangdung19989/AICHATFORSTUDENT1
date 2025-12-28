
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
// FIX: Ngăn chặn lỗi reading 'length' of undefined
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

// Bảng mã Năng lực số MỚI (Cập nhật theo yêu cầu)
const NLS_FRAMEWORK_3456 = `
BẢNG MÃ CHỈ BÁO NĂNG LỰC SỐ (CẬP NHẬT MỚI):

1. MIỀN 1: THÔNG TIN VÀ DỮ LIỆU
- 1.1. Duyệt, tìm kiếm và lọc:
  + 1.1.TC1a-d (Mức L6-L7): Xác định nhu cầu, tìm kiếm dữ liệu, tạo chiến lược tìm kiếm.
  + 1.1.TC2a-d (Mức L8-L9): Cập nhật chiến lược tìm kiếm phức tạp.
- 1.2. Đánh giá dữ liệu:
  + 1.2.TC1a-b (Mức L6-L7): Phân tích, so sánh độ tin cậy nguồn dữ liệu.
  + 1.2.TC2a-b (Mức L8-L9): Đánh giá, giải thích dữ liệu phức tạp.
- 1.3. Quản lý dữ liệu:
  + 1.3.TC1a-b (Mức L6-L7): Tổ chức, lưu trữ, truy xuất dữ liệu có cấu trúc.
  + 1.3.TC2a-b (Mức L8-L9): Quản lý dữ liệu nâng cao.

2. MIỀN 2: GIAO TIẾP VÀ HỢP TÁC
- 2.1. Tương tác: 2.1.TC1a-b (L6-L7), 2.1.TC2a-b (L8-L9) - Chọn phương tiện giao tiếp phù hợp.
- 2.2. Chia sẻ: 2.2.TC1a-c (L6-L7), 2.2.TC2a-c (L8-L9) - Chia sẻ dữ liệu, trích dẫn nguồn.
- 2.3. Trách nhiệm công dân: 2.3.TC1a-b (L6-L7), 2.3.TC2a-b (L8-L9) - Tham gia dịch vụ công, trao quyền công dân số.
- 2.4. Hợp tác: 2.4.TC1a (L6-L7), 2.4.TC2a (L8-L9) - Sử dụng công cụ số để đồng sáng tạo.
- 2.5. Quy tắc ứng xử (Netiquette): 2.5.TC1a-c (L6-L7), 2.5.TC2a-c (L8-L9) - Chuẩn mực hành vi, đa dạng văn hóa.
- 2.6. Quản lý danh tính số: 2.6.TC1a-c (L6-L7), 2.6.TC2a-c (L8-L9) - Bảo vệ danh tiếng, quản lý dữ liệu định danh.

3. MIỀN 3: SÁNG TẠO NỘI DUNG SỐ
- 3.1. Phát triển nội dung: 3.1.TC1a-b (L6-L7), 3.1.TC2a-b (L8-L9) - Tạo, chỉnh sửa nội dung đa định dạng.
- 3.2. Tích hợp và tái tạo: 3.2.TC1a (L6-L7), 3.2.TC2a (L8-L9) - Sửa đổi, tích hợp nội dung mới vào kiến thức cũ.
- 3.3. Bản quyền: 3.3.TC1a (L6-L7), 3.3.TC2a (L8-L9) - Hiểu và áp dụng giấy phép bản quyền.
- 3.4. Lập trình: 3.4.TC1a (L6-L7), 3.4.TC2a (L8-L9) - Lập kế hoạch, viết chuỗi câu lệnh/giải quyết vấn đề bằng máy tính.

4. MIỀN 4: AN TOÀN
- 4.1. Bảo vệ thiết bị: 4.1.TC1a-d (L6-L7), 4.1.TC2a-d (L8-L9) - Bảo mật thiết bị, rủi ro an toàn.
- 4.2. Bảo vệ dữ liệu cá nhân: 4.2.TC1a-c (L6-L7), 4.2.TC2a-c (L8-L9) - Quyền riêng tư, chính sách dữ liệu.
- 4.3. Bảo vệ sức khỏe: 4.3.TC1a-c (L6-L7), 4.3.TC2a-c (L8-L9) - Tránh rủi ro sức khỏe thể chất/tinh thần (bắt nạt mạng).
- 4.4. Bảo vệ môi trường: 4.4.TC1a (L6-L7), 4.4.TC2a (L8-L9) - Tác động của công nghệ đến môi trường.

5. MIỀN 5: GIẢI QUYẾT VẤN ĐỀ
- 5.1. Vấn đề kỹ thuật: 5.1.TC1a-b (L6-L7), 5.1.TC2a-b (L8-L9) - Xác định và xử lý sự cố.
- 5.2. Xác định nhu cầu: 5.2.TC1a-c (L6-L7), 5.2.TC2a-c (L8-L9) - Chọn công cụ phù hợp nhu cầu.
- 5.3. Sáng tạo: 5.3.TC1a-b (L6-L7), 5.3.TC2a-b (L8-L9) - Dùng công nghệ để đổi mới quy trình/sản phẩm.
- 5.4. Lỗ hổng năng lực: 5.4.TC1a-b (L6-L7), 5.4.TC2a-c (L8-L9) - Tự đánh giá và cập nhật năng lực số.

6. MIỀN 6: TRÍ TUỆ NHÂN TẠO (AI)
- 6.1. Hiểu biết về AI: 6.1.TC1a-b (L6-L7), 6.1.TC2a-b (L8-L9) - Nguyên tắc hoạt động, ảnh hưởng của AI.
- 6.2. Sử dụng AI: 6.2.TC1a-c (L6-L7), 6.2.TC2a-c (L8-L9) - Dùng AI tạo nội dung, giải quyết vấn đề.
- 6.3. Đánh giá AI: 6.3.TC1a-b (L6-L7), 6.3.TC2a-b (L8-L9) - Đánh giá độ tin cậy, đạo đức, tác động của AI.
`;

const LESSON_PLAN_TEMPLATE = {
    period: "Số tiết",
    topic: "Tên bài dạy",
    grade: "Khối lớp",
    objectives: {
        knowledge: ["Kiến thức 1 (Chép y nguyên từ file cũ)", "Kiến thức 2"],
        commonCompetencies: ["Năng lực chung 1 (Chép y nguyên từ file cũ)", "Năng lực chung 2"],
        virtues: ["Phẩm chất 1 (Chép y nguyên từ file cũ)", "Phẩm chất 2"],
        digitalCompetencies: [{ domain: "Tên miền NL", code: "Mã (VD: 6.2.TC1a)", description: "Mô tả biểu hiện cụ thể trong bài" }]
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
            product: "Nội dung cột 'Sản phẩm'",
            execution: { 
                step1: "GV chuyển giao nhiệm vụ...", 
                step2: "HS thực hiện...", 
                step3: "Báo cáo thảo luận...", 
                step4: "Kết luận..." 
            }
        }
    ],
    nlsAnalysisTable: [{ index: 1, activityName: "Hoạt động 1", organization: "Mô tả cách dùng công nghệ", competencyDetail: "Mã NLS (VD: 6.2.TC1a)" }],
    homework: "Nhiệm vụ về nhà"
};

export const generateLessonPlan = async (
    subject: string, 
    grade: string, 
    topic: string, 
    bookSeries: string, 
    contextFiles: { data: string, mimeType: string }[], 
    oldContentText?: string,
    appendixContent?: string // Tham số mới cho Phụ lục 3
): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        
        const systemPrompt = `
VAI TRÒ: Bạn là trợ lý số hoá giáo án chuyên nghiệp.
NHIỆM VỤ: Chuyển đổi nội dung giáo án cũ sang JSON và TÍCH HỢP thêm Năng lực số dựa trên bảng mã mới nhất.

QUY TẮC SỐ 1: GIỮ NGUYÊN CẤU TRÚC GỐC & NỘI DUNG CHUYÊN MÔN
- **Mục II. Thiết bị dạy học và học liệu**: Phải chia rõ 2 phần riêng biệt (teacher/student).
- **Hoạt động dạy học**: 
  + Giữ nguyên tên hoạt động.
  + Cột "Sản phẩm" trong file cũ phải được đưa vào trường \`product\`.
  + Cột "Hoạt động của GV và HS" phải được chia thành 4 bước (step1, step2, step3, step4) trong \`execution\`.

QUY TẮC SỐ 2: TÍCH HỢP NĂNG LỰC SỐ (QUAN TRỌNG)
- Sử dụng Bảng mã Năng lực số mới (đặc biệt là Miền 6 về AI nếu phù hợp).
- Tham khảo nội dung "Phụ lục 3" (nếu được cung cấp) để phân tích năng lực chính xác hơn.
- Gán mã NLS vào \`digitalCompetencies\` (Mục tiêu) và \`nlsAnalysisTable\` (Phụ lục phân tích).

QUY TẮC SỐ 3: ĐỊNH DẠNG TỔ CHỨC THỰC HIỆN
- **Với Hoạt động Mở đầu (Khởi động)**: Trong phần JSON trả về, nội dung các bước (step1...step4) phải được viết liền mạch, tự nhiên, KHÔNG YÊU CẦU chia cột trong văn bản hiển thị sau này (Client sẽ tự xử lý hiển thị, nhưng bạn cứ trả về đủ 4 bước).
- **Các Hoạt động khác**: Giữ nguyên cấu trúc.

${NLS_FRAMEWORK_3456}

MẪU JSON ĐẦU RA (BẮT BUỘC):
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

        if (appendixContent) {
            parts.push({ text: `NỘI DUNG PHỤ LỤC 3 (ĐẶC TẢ/YÊU CẦU CẦN ĐẠT CỦA BÀI HỌC) ĐỂ THAM KHẢO:\n${appendixContent}` });
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
        // Cập nhật Prompt: Yêu cầu rõ ràng về bộ sách Kết nối tri thức
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
        
        const parts: any[] = [
             { text: `Tạo đề thi ${subject} ${grade} từ ma trận này. ${mcCount} câu TN, ${essayCount} câu TL. Trả về JSON.` }
        ];

        if (textContent) {
             parts.push({ text: `NỘI DUNG MA TRẬN (Trích xuất từ văn bản): \n${textContent}` });
        } else if (base64Data && !mimeType.includes('wordprocessingml')) {
             parts.push({ inlineData: { data: base64Data, mimeType } });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts }],
        });
        return ensureQuizFormat(JSON.parse(cleanJsonString(response.text || '{}')));
    } catch (e) { console.error(e); return { title: "Lỗi xử lý file", sourceSchool: "", timeLimit: "", questions: [] }; }
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        
        const promptText = `
        NHIỆM VỤ: Phân tích file đề thi này và trích xuất thành dữ liệu JSON.
        
        YÊU CẦU:
        1. Tách biệt phần TRẮC NGHIM (Multiple Choice) và TỰ LUẬN (Essay).
        2. Với câu trắc nghiệm:
           - Trích xuất nội dung câu hỏi.
           - Trích xuất 4 phương án (A, B, C, D) vào mảng options. Giữ nguyên nội dung, bỏ tiền tố "A." "B.".
           - CỐ GẮNG tìm đáp án đúng nếu trong đề có đánh dấu (bôi đậm, gạch chân, hoặc bảng đáp án cuối đề). Nếu không tìm thấy, hãy để chuỗi rỗng "".
        3. Với câu tự luận:
           - Trích xuất nội dung câu hỏi.
        
        ĐỊNH DẠNG JSON TRẢ VỀ:
        {
          "title": "Tên đề thi (nếu có)",
          "questions": [
            {
              "question": "Nội dung câu hỏi 1",
              "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
              "correctAnswer": "Lựa chọn đúng (chính xác theo text trong options) hoặc để trống",
              "explanation": ""
            }
          ],
          "essayQuestions": [
            {
              "question": "Nội dung câu tự luận 1",
              "sampleAnswer": ""
            }
          ]
        }
        `;

        const parts: any[] = [{ text: promptText }];

        if (textContent) {
             parts.push({ text: `NỘI DUNG ĐỀ THI (Trích xuất từ văn bản): \n${textContent}` });
        } else if (base64Data && !mimeType.includes('wordprocessingml')) {
             parts.push({ inlineData: { data: base64Data, mimeType } });
        }

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
