
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Corrected import path for types
import type { Subject, Quiz, TestType, LearningPath, LessonPlan, QuizQuestion } from '../types/index';
import { API_KEYS } from '../config';

const GEMINI_API_KEY = (API_KEYS.GEMINI_API_KEY && API_KEYS.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE')
  ? API_KEYS.GEMINI_API_KEY
  : ((import.meta as any).env?.VITE_API_KEY || process.env.API_KEY);

if (!GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: API_KEY is missing. Please set it in config.ts or in Vercel Environment Variables (VITE_API_KEY).");
}

// FIX: Renamed geminiAI to ai to align with coding guidelines.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || 'MISSING_API_KEY' });

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini API call failed during ${context}:`, error);
    const errorMessage = error.toString().toLowerCase();
    
    if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('quota')) {
        throw new Error("Hệ thống đang quá tải (Hết lượt dùng miễn phí Google AI). Vui lòng thử lại sau vài phút hoặc sử dụng API Key khác.");
    }
    if (errorMessage.includes('400') || errorMessage.includes('invalid_argument') || errorMessage.includes('api key not valid')) {
        throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại Key trong file config.ts hoặc trong cấu hình Vercel (VITE_API_KEY).");
    }
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi kết nối không xác định. Vui lòng thử lại.");
};

const getSystemInstruction = (subjectName: string): string => {
  return `You are a world-class, friendly, and patient tutor for Vietnamese high school students. 
Your subject of expertise is ${subjectName}. 
Explain concepts clearly, concisely, and in Vietnamese. 
Use examples and analogies relevant to a student's life. 
When asked to solve a problem, break it down into simple, easy-to-follow steps. 
Maintain a positive and encouraging tone. 
Format your responses using Markdown for better readability, including code blocks for formulas or code when appropriate.`;
};

const getGenericSystemInstruction = (): string => {
  return `You are a helpful and friendly AI tutor for Vietnamese students. 
You can answer questions on a wide range of subjects like Math, Physics, Chemistry, English, Literature, and Programming. 
Explain concepts clearly, concisely, and in Vietnamese. 
Use examples relevant to a student's life. 
Maintain a positive and encouraging tone. 
Format your responses using Markdown for better readability, including code blocks for formulas or code when appropriate.`;
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: getGenericSystemInstruction(),
            }
        });
        return response.text || "Xin lỗi, tôi không có câu trả lời cho vấn đề này.";
    } catch (error) {
        handleGeminiError(error, "getGenericTutorResponse");
        throw error;
    }
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: getSystemInstruction(subject.name),
            }
        });
        return response.text || "Xin lỗi, tôi không có câu trả lời cho vấn đề này.";
    } catch (error) {
        handleGeminiError(error, "getTutorResponse");
        throw error;
    }
};

// Function to handle File Uploads (PDF, Images, etc.) for Exam Parsing
export const parseExamDocument = async (base64Data: string, mimeType: string): Promise<Quiz> => {
    try {
        const promptText = `Bạn là trợ lý ảo nhập liệu đề thi. Hãy phân tích nội dung trong TÀI LIỆU đính kèm (File PDF/Ảnh) và trích xuất thành cấu trúc đề thi.

        YÊU CẦU XỬ LÝ:
        1. **Phân loại**: Tách riêng câu hỏi TRẮC NGHIỆM và câu hỏi TỰ LUẬN.
        2. **Trắc nghiệm**: 
           - Tách câu hỏi và các lựa chọn (bỏ A, B, C, D ở đầu).
           - Tự động xác định đáp án đúng nếu trong tài liệu có đánh dấu (khoanh tròn, tô đậm, gạch chân, hoặc bảng đáp án ở cuối). Nếu không tìm thấy, hãy để trống hoặc suy luận đáp án đúng nhất.
           - Tự sinh lời giải thích (explanation) ngắn gọn.
        3. **Tự luận**:
           - Lấy nội dung câu hỏi.
           - Tự sinh đáp án mẫu/gợi ý trả lời (sampleAnswer).
        
        Output JSON Format:
        Trả về object chứa 2 mảng: "questions" (trắc nghiệm) và "essayQuestions" (tự luận).`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { text: promptText },
                { inlineData: { data: base64Data, mimeType: mimeType } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswer: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["question", "options", "correctAnswer"]
                            }
                        },
                        essayQuestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    sampleAnswer: { type: Type.STRING }
                                },
                                required: ["question", "sampleAnswer"]
                            }
                        }
                    },
                    required: ["questions", "essayQuestions"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response for exam parsing");
        
        const parsedData = JSON.parse(jsonText);
        
        return {
            sourceSchool: "Đề thi Giáo viên",
            title: "Đề thi tải lên",
            timeLimit: "45 phút",
            questions: parsedData.questions || [],
            essayQuestions: parsedData.essayQuestions || []
        } as Quiz;

    } catch (error) {
        handleGeminiError(error, "parseExamDocument");
        throw error;
    }
};

// Deprecated text-only version, keeping for backward compatibility if needed, but not used in new flow
export const parseExamContent = async (rawContent: string): Promise<Quiz> => {
    // Redirect to document parser assuming it's text
    // Encode text to base64 to reuse the same logic
    const base64Data = btoa(unescape(encodeURIComponent(rawContent)));
    return parseExamDocument(base64Data, 'text/plain');
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType): Promise<Quiz> => {
    try {
        const isEnglishSubject = subjectName.toLowerCase().includes('tiếng anh') || subjectName.toLowerCase().includes('english');
        const languageInstruction = isEnglishSubject 
            ? "QUAN TRỌNG: Đây là môn Tiếng Anh. Nội dung câu hỏi (question), các lựa chọn (options) và đề bài tự luận PHẢI VIẾT BẰNG TIẾNG ANH. Tuy nhiên, phần giải thích (explanation) hãy viết bằng TIẾNG VIỆT để học sinh hiểu bài."
            : "Nội dung 100% Tiếng Việt.";

        let typeSpecificInstruction = "";
        if (testType.id === '15-minute') {
            typeSpecificInstruction = `- Đây là bài KIỂM TRA 15 PHÚT.\n- Số lượng: ${testType.questionCount} câu TRẮC NGHIỆM.\n- KHÔNG có tự luận.\n- Nội dung: Tập trung vào 1-2 bài học gần nhất trong chương trình, kiểm tra mức độ Nhận biết và Thông hiểu.`;
        } else if (testType.id === '45-minute') {
            typeSpecificInstruction = `- Đây là bài KIỂM TRA 1 TIẾT (45 phút).\n- Số lượng: ${testType.questionCount} câu TRẮC NGHIỆM và ${testType.essayCount} câu TỰ LUẬN.\n- Phân hóa: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao.\n- Nội dung: Tổng hợp kiến thức của cả chương vừa học.`;
        } else if (testType.id === 'semester') {
            typeSpecificInstruction = `- Đây là bài THI HỌC KỲ (Cuối kỳ).\n- Số lượng: ${testType.questionCount} câu TRẮC NGHIỆM và ${testType.essayCount} câu TỰ LUẬN.\n- Độ khó: Cao. Bao phủ toàn bộ kiến thức học kỳ.\n- Cấu trúc đề thi chuẩn của Bộ Giáo dục.`;
        }

        const quizGenerationPrompt = `Bạn là giáo viên giỏi. Hãy soạn đề "${testType.name}" môn "${subjectName}" lớp "${gradeName}".\n\nYêu cầu cấu trúc:\n${typeSpecificInstruction}\n\nYêu cầu chung:\n1. **Nguồn đề**: Chọn ngẫu nhiên tên một trường THCS/THPT uy tín tại Việt Nam để điền vào "sourceSchool".\n2. **Trắc nghiệm**: Mỗi câu có 4 đáp án, chỉ 1 đúng. Giải thích chi tiết.\n   - **QUAN TRỌNG**: Các chuỗi trong mảng "options" CHỈ chứa nội dung câu trả lời, KHÔNG ĐƯỢC chứa các ký tự tiền tố như "A.", "B.", "C.", "D." hay số thứ tự. Ví dụ: Viết "5 cm" thay vì "A. 5 cm".\n3. **Chủ đề (Topics)**: Với mỗi câu hỏi, hãy gắn 1-3 thẻ chủ đề kiến thức cụ thể (Ví dụ: "Phân số", "Hình học phẳng", "Từ vựng Unit 1") vào trường "topics". Điều này rất quan trọng để phân tích điểm yếu học sinh.\n4. **Tự luận** (Nếu có): Yêu cầu vận dụng, giải bài tập hoặc viết đoạn văn (với môn Văn/Anh). Cung cấp đáp án mẫu chi tiết.\n5. ${languageInstruction}\n6. Xuất ra JSON hợp lệ.`;

        // FIX: Standardized variable name to 'response' to avoid reference errors.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: quizGenerationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sourceSchool: { type: Type.STRING, description: "Tên trường học." },
                        title: { type: Type.STRING, description: "Tiêu đề bài kiểm tra (VD: Kiểm tra 1 tiết Toán 7)." },
                        timeLimit: { type: Type.STRING, description: "Thời gian làm bài (VD: 45 phút)." },
                        questions: { type: Type.ARRAY, description: "Danh sách câu hỏi trắc nghiệm", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các chủ đề kiến thức liên quan đến câu hỏi này." } }, required: ["question", "options", "correctAnswer", "explanation"] } },
                        essayQuestions: { type: Type.ARRAY, description: "Danh sách câu hỏi tự luận (nếu có)", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, sampleAnswer: { type: Type.STRING, description: "Hướng dẫn giải" } }, required: ["question", "sampleAnswer"] } }
                    },
                    required: ["sourceSchool", "questions", "title", "timeLimit"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        const quizData: Quiz = JSON.parse(jsonText);

        if (!quizData.sourceSchool || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("Dữ liệu bài kiểm tra do AI tạo ra không hợp lệ.");
        }
        return quizData;
    } catch (error) {
        handleGeminiError(error, "generateQuiz");
    }
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const isEnglishSubject = subjectName.toLowerCase().includes('tiếng anh') || subjectName.toLowerCase().includes('english');
        const languageInstruction = isEnglishSubject 
            ? "QUAN TRỌNG: Đây là đề thi môn Tiếng Anh. Tất cả câu hỏi, đáp án, bài đọc hiểu, và đề bài viết luận PHẢI BẰNG TIẾNG ANH chuẩn ngữ pháp. Chỉ phần giải thích (explanation) là viết bằng TIẾNG VIỆT."
            : "Ngôn ngữ: Tiếng Việt.";

        const quizGenerationPrompt = `Bạn là chuyên gia ra đề thi. Hãy soạn một ĐỀ THI THỬ (Mock Exam) chuẩn cấu trúc cho môn "${subjectName}" lớp "${gradeName}".\n\nYêu cầu cụ thể:\n1. **Phần 1: Trắc nghiệm**: Tạo **30 câu hỏi** trắc nghiệm. Phân hóa: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao.\n   - **QUAN TRỌNG**: Các chuỗi trong mảng "options" CHỈ chứa nội dung câu trả lời, KHÔNG ĐƯỢC chứa các ký tự tiền tố như "A.", "B.", "C.", "D." hay số thứ tự. Ví dụ: Viết "5 cm" thay vì "A. 5 cm".\n2. **Phần 2: Tự luận**: Tạo **3 câu hỏi** tự luận (bài tập lớn, bài văn, hoặc câu hỏi giải thích sâu).\n3. **Nguồn đề**: Chọn ngẫu nhiên tên một trường Chuyên hoặc trường điểm uy tín tại Việt Nam (Ví dụ: THPT Chuyên Hà Nội - Amsterdam, THPT Chuyên Lam Sơn - Thanh Hóa, THPT Chuyên Trần Đại Nghĩa - TP.HCM, THCS & THPT Nguyễn Tất Thành, v.v.) để làm phong phú nguồn đề.\n4. **Chủ đề (Topics)**: Gắn thẻ chủ đề chi tiết cho từng câu hỏi (VD: "Đại số", "Phương trình", "Từ vựng").\n5. Xuất ra định dạng JSON chuẩn.\n6. ${languageInstruction}\n7. Giải thích (explanation) và Đáp án mẫu (sampleAnswer) phải cực kỳ chi tiết, giúp học sinh hiểu bản chất vấn đề.`;

        // FIX: Standardized variable name to 'response' to avoid reference errors.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: quizGenerationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        sourceSchool: { type: Type.STRING, description: "Tên trường học thực tế tại Việt Nam (ngẫu nhiên)." },
                        title: { type: Type.STRING, description: "Tiêu đề (VD: Đề thi thử vào 10)." },
                        timeLimit: { type: Type.STRING, description: "Thời gian làm bài." },
                        questions: { type: Type.ARRAY, description: "Danh sách câu hỏi trắc nghiệm", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các chủ đề kiến thức liên quan." } }, required: ["question", "options", "correctAnswer", "explanation"] } },
                        essayQuestions: { type: Type.ARRAY, description: "Danh sách câu hỏi tự luận", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, sampleAnswer: { type: Type.STRING, description: "Hướng dẫn giải chi tiết" } }, required: ["question", "sampleAnswer"] } }
                    }, required: ["sourceSchool", "questions"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        const quizData: Quiz = JSON.parse(jsonText);
        if (!quizData.sourceSchool || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("Dữ liệu bài thi thử do AI tạo ra không hợp lệ.");
        }
        return quizData;
    } catch (error) {
        handleGeminiError(error, "generateMockExam");
    }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const isEnglishSubject = subjectName.toLowerCase().includes('tiếng anh') || subjectName.toLowerCase().includes('english');
        const languageInstruction = isEnglishSubject ? "LƯU Ý: Môn Tiếng Anh. Câu hỏi và các lựa chọn phải bằng TIẾNG ANH. Giải thích bằng Tiếng Việt." : "";
        const generationPrompt = `Bạn là trợ giảng AI. Hãy tạo nhanh bài tập luyện tập cho học sinh.\n\nThông tin:\n- Môn: ${subjectName}\n- Lớp: ${gradeName}\n- Bài: "${lessonTitle}"\n- Sách giáo khoa: Kết nối tri thức / Chân trời sáng tạo.\n\nYêu cầu:\n1. **5 câu hỏi** trắc nghiệm bám sát nội dung bài học.\n   - **QUAN TRỌNG**: Các chuỗi trong mảng "options" CHỈ chứa nội dung câu trả lời, KHÔNG ĐƯỢC chứa các ký tự tiền tố như "A.", "B.", "C.", "D." hay số thứ tự.\n2. Định dạng JSON chuẩn.\n3. "sourceSchool" ghi là "Hệ thống Tự luyện OnLuyen AI".\n4. **Topics**: Gắn thẻ chủ đề cho từng câu hỏi (VD: "Phân số", "Từ vựng").\n5. ${languageInstruction}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        sourceSchool: { type: Type.STRING }, title: { type: Type.STRING }, timeLimit: { type: Type.STRING },
                        questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, topics: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["question", "options", "correctAnswer", "explanation"] } }
                    }, required: ["sourceSchool", "questions"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        const practiceData: Quiz = JSON.parse(jsonText);
        if (!practiceData.sourceSchool || !Array.isArray(practiceData.questions) || practiceData.questions.length === 0) {
            throw new Error("Dữ liệu bài tập do AI tạo ra không hợp lệ.");
        }
        return practiceData;
    } catch (error) {
        handleGeminiError(error, "generatePracticeExercises");
    }
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], grade: string): Promise<LearningPath> => {
    try {
        const topicsStr = focusTopics.length > 0 ? focusTopics.join(", ") : "các môn học chính (Toán, Văn, Anh, KHTN)";
        
        const prompt = `Bạn là một AI Coach (Huấn luyện viên học tập) nhiệt huyết và sáng tạo của OnLuyen.
        
        Học sinh đang học **${grade}**.
        Gần đây, học sinh đã quan tâm hoặc luyện tập về các chủ đề: **[${topicsStr}]**.

        Nhiệm vụ: Hãy thiết kế một **"Hành trình Chinh phục Tri thức" trong 7 ngày tới (6 ngày học + 1 ngày tổng kết)** để giúp học sinh nắm vững kiến thức này một cách hứng thú nhất.
        
        **TINH THẦN CHUNG:**
        - Đừng chỉ giao bài tập nhàm chán. Hãy biến việc học thành một cuộc phiêu lưu.
        - Kết hợp giữa Xem video (Lý thuyết), Thực hành (Game/Quiz) và Ứng dụng thực tế.
        - Giọng văn: Khuyến khích, sôi nổi, tạo động lực (Ví dụ: "Thử thách hôm nay", "Chinh phục đỉnh cao").

        **YÊU CẦU CẤU TRÚC (JSON):**
        1. **studentWeaknesses**: Trả lại danh sách các chủ đề trọng tâm (focusTopics).
        2. **weeklyPlan**: Mảng 7 ngày (Day 1 đến Day 7).
           - **Day 1-2**: Khởi động & Khám phá (Video ngắn, lý thuyết thú vị).
           - **Day 3-4**: Tăng tốc & Thực hành (Bài tập vừa sức, minigame).
           - **Day 5**: Vượt chướng ngại vật (Bài tập nâng cao/Vận dụng).
           - **Day 6**: Về đích (Tổng ôn, Sơ đồ tư duy).
           - **Day 7**: Phần thưởng & Thư giãn (Xem video khoa học vui, đọc truyện liên quan hoặc Quiz vui).

        Xuất ra JSON đúng theo schema bên dưới.`;

        // FIX: Standardized variable name to 'response' to fix reference errors.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, 
                    properties: {
                        studentWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weeklyPlan: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    day: { type: Type.NUMBER }, 
                                    title: { type: Type.STRING, description: "Tiêu đề ngày (VD: Thứ 2: Khởi động năng lượng)" }, 
                                    description: { type: Type.STRING, description: "Lời nhắn nhủ ngắn gọn của AI Coach." }, 
                                    tasks: { 
                                        type: Type.ARRAY, 
                                        items: { 
                                            type: Type.OBJECT, 
                                            properties: { 
                                                type: { type: Type.STRING, enum: ["video", "practice"] }, 
                                                content: { type: Type.STRING, description: "Nội dung cụ thể (VD: Xem video về Phân số)" }, 
                                                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] } 
                                            }, 
                                            required: ["type", "content"] 
                                        } 
                                    } 
                                }, 
                                required: ["day", "title", "description", "tasks"] 
                            } 
                        }
                    },
                    required: ["studentWeaknesses", "weeklyPlan"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response for learning path");
        return JSON.parse(jsonText) as LearningPath;
    } catch (error) {
        handleGeminiError(error, "generatePersonalizedLearningPath");
        throw error;
    }
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string = 'Kết nối tri thức', uploadedFiles: string[] = []): Promise<LessonPlan> => {
    try {
        let fileContext = "";
        if (uploadedFiles.length > 0) {
            fileContext = `Đã tích hợp nội dung từ các file sau: ${uploadedFiles.join(", ")}.`;
        }

        const prompt = `Bạn là một chuyên gia giáo dục và chuyên gia về chuyển đổi số trong dạy học. 
        Hãy soạn một **GIÁO ÁN (Kế hoạch bài dạy)** chi tiết, tích hợp **Khung năng lực số (NLS)**.
        
        Thông tin đầu vào:
        - Môn: ${subject}
        - Lớp: ${grade}
        - Bộ sách: ${bookSeries}
        - Tên bài dạy (hoặc Chủ đề): ${topic || "Tự động xác định dựa trên chương trình"}
        ${fileContext}

        Yêu cầu đặc biệt:
        1. **Cấu trúc chuẩn**: Tuân theo công văn 5512 (Mục tiêu, Thiết bị, Tiến trình).
        2. **Tích hợp Năng lực số**: Trong phần "Tiến trình dạy học", hãy chỉ rõ các hoạt động có ứng dụng công nghệ thông tin hoặc phát triển năng lực số cho học sinh (Ví dụ: Tra cứu thông tin, Sử dụng phần mềm mô phỏng, Làm việc nhóm trên Padlet/Canva, v.v.).
        3. **Chi tiết hoạt động**: Mô tả rõ Hoạt động của GV và Hoạt động của HS.
        4. **Ngôn ngữ**: Tiếng Việt chuẩn mực sư phạm.

        Xuất ra JSON chuẩn theo schema sau.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING, description: "Tên bài dạy chính xác" },
                        grade: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mục tiêu kiến thức, năng lực (đặc biệt là năng lực số), phẩm chất" },
                        materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Thiết bị dạy học, học liệu số, phần mềm sử dụng" },
                        activities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "Thời gian (VD: 5 phút)" },
                                    title: { type: Type.STRING, description: "Tên hoạt động (VD: Khởi động - Tích hợp Kahoot)" },
                                    description: { type: Type.STRING, description: "Nội dung chi tiết: GV chuyển giao nhiệm vụ, HS thực hiện, Báo cáo thảo luận..." }
                                },
                                required: ["time", "title", "description"]
                            }
                        },
                        homework: { type: Type.STRING, description: "Hướng dẫn về nhà và nhiệm vụ chuẩn bị bài sau" }
                    },
                    required: ["topic", "objectives", "activities", "homework"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response for lesson plan");
        return JSON.parse(jsonText) as LessonPlan;

    } catch (error) {
        handleGeminiError(error, "generateLessonPlan");
        throw error; // Make TS happy
    }
};

export const generateTestFromMatrixDocument = async (
    subject: string, 
    grade: string, 
    base64Data: string,
    mimeType: string,
    mcCount: number,
    essayCount: number
): Promise<Quiz> => {
    try {
        const prompt = `Bạn là một chuyên gia Khảo thí và Đánh giá chất lượng giáo dục hàng đầu Việt Nam.
        
        Nhiệm vụ: Hãy PHÂN TÍCH nội dung file MA TRẬN & ĐẶC TẢ ĐỀ THI đính kèm và soạn thảo một đề kiểm tra hoàn chỉnh.

        Quy trình xử lý (Bắt buộc tuân thủ):
        1. **ĐỌC HIỂU BẢNG MA TRẬN**:
           - Xác định các chủ đề/mạch kiến thức có trong bảng.
           - Đếm chính xác số lượng câu hỏi yêu cầu cho từng mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) ứng với từng chủ đề.
        
        2. **SOẠN CÂU HỎI**:
           - Tạo ra đúng **${mcCount} câu trắc nghiệm** và **${essayCount} câu tự luận**.
           - **QUAN TRỌNG**: Tỉ lệ các câu hỏi ở mức độ NB/TH/VD/VDC phải khớp với bảng ma trận trong file. Không được tự ý bịa ra tỉ lệ khác.
           - Nội dung câu hỏi phải mới mẻ, không sao chép y nguyên SGK nhưng phải bám sát chương trình ${grade} môn ${subject}.
        
        3. **ĐỊNH DẠNG ĐẦU RA**:
           - Trả về JSON có cấu trúc chuẩn.
           - Phần 'explanation' của mỗi câu hỏi: Ghi rõ câu hỏi này thuộc Mức độ nào (VD: [Thông hiểu]) và giải thích ngắn gọn.
           - Phần 'sourceSchool': Để trống "TRƯỜNG ................................." để giáo viên tự điền.

        Hãy thực hiện chính xác và nghiêm túc.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: mimeType } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sourceSchool: { type: Type.STRING, description: "Mẫu tên trường để trống" },
                        title: { type: Type.STRING, description: "Tiêu đề bài kiểm tra (VD: ĐỀ KIỂM TRA GIỮA KỲ I)" },
                        timeLimit: { type: Type.STRING, description: "Thời gian làm bài" },
                        questions: { 
                            type: Type.ARRAY, 
                            description: "Danh sách câu hỏi trắc nghiệm", 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    question: { type: Type.STRING }, 
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                                    correctAnswer: { type: Type.STRING }, 
                                    explanation: { type: Type.STRING, description: "Ghi chú mức độ nhận thức (NB/TH/VD/VDC) và giải thích" }, 
                                    topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Chủ đề kiến thức" } 
                                }, 
                                required: ["question", "options", "correctAnswer", "explanation"] 
                            } 
                        },
                        essayQuestions: { 
                            type: Type.ARRAY, 
                            description: "Danh sách câu hỏi tự luận", 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    question: { type: Type.STRING }, 
                                    sampleAnswer: { type: Type.STRING, description: "Hướng dẫn chấm và đáp án chi tiết" } 
                                }, 
                                required: ["question", "sampleAnswer"] 
                            } 
                        }
                    },
                    required: ["sourceSchool", "title", "timeLimit", "questions"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response for test generation");
        return JSON.parse(jsonText) as Quiz;

    } catch (error) {
        handleGeminiError(error, "generateTestFromMatrixDocument");
        throw error;
    }
};

// Deprecated: Keeping generic function for fallback but not used in UI anymore
export const generateTestFromMatrix = async (
    subject: string, 
    grade: string, 
    uploadedMatrixFile: string | null,
    mcCount: number,
    essayCount: number
): Promise<Quiz> => {
    // This function is now legacy, redirecting logic is handled in the UI component
    throw new Error("Deprecated function called. Use generateTestFromMatrixDocument instead.");
};
