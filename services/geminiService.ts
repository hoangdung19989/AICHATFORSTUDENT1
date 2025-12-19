
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

const responseCache = new Map<string, any>();

const getCachedOrFetch = async <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
    if (responseCache.has(key)) return responseCache.get(key);
    const result = await fetchFn();
    responseCache.set(key, result);
    return result;
};

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini Error during ${context}:`, error);
    if (error.message?.includes('429')) {
        throw new Error("Hệ thống AI đang bận (Too many requests). Vui lòng thử lại sau 30 giây.");
    }
    if (error.message?.includes('thinking mode')) {
        throw new Error("Lỗi cấu hình mô hình AI. Vui lòng liên hệ quản trị viên.");
    }
    throw new Error(error.message || "Lỗi kết nối AI.");
};

const FLASH_CONFIG = { temperature: 0.7 };
const PRO_CONFIG = { temperature: 0.8 };

const QUIZ_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        sourceSchool: { type: Type.STRING, description: "Tên trường hoặc Sở GD trích xuất đề (VD: Sở GD&ĐT Hà Nội, THPT Chuyên Lam Sơn...)" },
        title: { type: Type.STRING },
        timeLimit: { type: Type.STRING },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
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
    required: ["title", "questions", "sourceSchool"]
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: message }] }],
            config: { 
                ...FLASH_CONFIG,
                systemInstruction: "Bạn là trợ lý AI giáo dục của hệ thống OnLuyen. Hãy trả lời ngắn gọn, thân thiện và chính xác về các vấn đề học tập."
            },
        });
        return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
    } catch (error) {
        return handleGeminiError(error, "getGenericTutorResponse");
    }
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: message }] }],
            config: {
                ...FLASH_CONFIG,
                systemInstruction: `Bạn là một gia sư chuyên gia môn ${subject.name}. Hãy giải thích các khái niệm một cách dễ hiểu, có ví dụ minh họa và khuyến khích học sinh tư duy.`
            },
        });
        return response.text || "Tôi chưa rõ câu hỏi của bạn, bạn có thể nói chi tiết hơn không?";
    } catch (error) {
        return handleGeminiError(error, "getTutorResponse");
    }
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    const cacheKey = `quiz-${subjectName}-${gradeName}-${testType.id}-${semester}`;
    return getCachedOrFetch(cacheKey, async () => {
        try {
            const ai = getAiClient();
            const prompt = `Bạn là chuyên gia khảo thí quốc gia. Hãy trích xuất một đề ${testType.name} môn ${subjectName} cho ${gradeName}, giai đoạn ${semester}.
            YÊU CẦU QUAN TRỌNG: 
            1. Các câu hỏi phải được lấy từ ngân hàng đề thi chính thức đã được kiểm duyệt của các Sở GD&ĐT trên toàn quốc (Hà Nội, Nam Định, Thái Bình, TP.HCM...) hoặc các trường THCS/THPT uy tín.
            2. Đảm bảo đúng tỉ lệ: NB (40%), TH (30%), VD (20%), VDC (10%).
            3. Số lượng: ${testType.questionCount} câu trắc nghiệm và ${testType.essayCount} câu tự luận.
            4. Phải ghi rõ nguồn trích xuất (VD: Đề thi học kỳ 1 - Sở GD&ĐT Hà Nội 2023-2024) vào trường 'sourceSchool'.
            Trả về JSON chuẩn theo schema.`;

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    ...FLASH_CONFIG,
                    responseMimeType: "application/json",
                    responseSchema: QUIZ_SCHEMA,
                },
            });
            return JSON.parse(response.text || '{}') as Quiz;
        } catch (error) {
            return handleGeminiError(error, "generateQuiz");
        }
    });
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `Hãy đóng vai ban ra đề thi quốc gia. Tạo một đề thi thử quan trọng môn ${subjectName} cho ${gradeName}. 
        YÊU CẦU: Trích xuất các câu hỏi từ đề thi tuyển sinh vào lớp 10 hoặc thi THPTQG chính thức của các tỉnh thành lớn. 
        Đề thi phải cực kỳ sát thực tế và đã được kiểm duyệt. Ghi rõ nguồn trích xuất. Trả về JSON chuẩn.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                ...PRO_CONFIG,
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA,
            },
        });
        return JSON.parse(response.text || '{}') as Quiz;
    } catch (error) {
        return handleGeminiError(error, "generateMockExam");
    }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `Tạo 10 câu bài tập luyện tập cho bài học "${lessonTitle}" môn ${subjectName} - ${gradeName}. 
        Trích dẫn các bài tập trong SGK (Kết nối tri thức, Cánh diều, Chân trời sáng tạo) hoặc các sách bài tập bổ trợ chính thức. 
        Ghi nguồn là "Ngân hàng bài tập OnLuyen". Trả về JSON chuẩn.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                ...FLASH_CONFIG,
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA,
            },
        });
        return JSON.parse(response.text || '{}') as Quiz;
    } catch (error) {
        return handleGeminiError(error, "generatePracticeExercises");
    }
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string): Promise<LearningPath> => {
    try {
        const ai = getAiClient();
        const prompt = `Dựa trên các chủ đề: ${focusTopics.join(", ")}, hãy tạo một lộ trình học tập 7 ngày cho học sinh ${gradeName}. Trả về JSON chuẩn.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                ...FLASH_CONFIG,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        grade: { type: Type.STRING },
                        studentWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weeklyPlan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.INTEGER },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    tasks: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                type: { type: Type.STRING },
                                                content: { type: Type.STRING },
                                                difficulty: { type: Type.STRING }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    required: ["weeklyPlan", "studentWeaknesses"]
                }
            },
        });
        return JSON.parse(response.text || '{}') as LearningPath;
    } catch (error) {
        return handleGeminiError(error, "generatePersonalizedLearningPath");
    }
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: string[]): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        const prompt = `Hãy soạn một giáo án chuẩn công văn 5512 cho môn ${subject}, lớp ${grade}, bài "${topic}", bộ sách "${bookSeries}". 
        Yêu cầu tích hợp Khung năng lực số. Các file tham khảo đi kèm: ${contextFiles.join(", ")}. Trả về JSON chuẩn.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                ...PRO_CONFIG,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        grade: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                        activities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        homework: { type: Type.STRING }
                    },
                    required: ["topic", "objectives", "activities"]
                }
            },
        });
        return JSON.parse(response.text || '{}') as LessonPlan;
    } catch (error) {
        return handleGeminiError(error, "generateLessonPlan");
    }
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
                {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: `Dựa trên file ma trận và đặc tả đề thi này, hãy tạo đề thi môn ${subject} - ${grade}. 
                                 Yêu cầu tạo ${mcCount} câu trắc nghiệm và ${essayCount} câu tự luận đúng tỉ lệ mức độ nhận thức trong ma trận. Trả về JSON chuẩn.` }
                    ]
                }
            ],
            config: {
                ...PRO_CONFIG,
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA,
            },
        });
        return JSON.parse(response.text || '{}') as Quiz;
    } catch (error) {
        return handleGeminiError(error, "generateTestFromMatrixDocument");
    }
};

export const parseExamDocument = async (base64Data: string, mimeType: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
                {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: "Hãy đọc file đề thi này và trích xuất tất cả câu hỏi trắc nghiệm (gồm 4 lựa chọn, đáp án đúng và giải thích) và câu hỏi tự luận (gồm đề bài và gợi ý đáp án). Trả về JSON chuẩn." }
                    ]
                }
            ],
            config: {
                ...PRO_CONFIG,
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA,
            },
        });
        return JSON.parse(response.text || '{}') as Quiz;
    } catch (error) {
        return handleGeminiError(error, "parseExamDocument");
    }
};
