
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan, QuizQuestion } from '../types/index';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini Error during ${context}:`, error);
    throw new Error(error.message || "Lỗi kết nối AI.");
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: message,
            config: { systemInstruction: "Bạn là trợ lý AI giáo dục." }
        });
        return response.text || "Lỗi phản hồi.";
    } catch (error) { throw error; }
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: message,
            config: { systemInstruction: `Bạn là gia sư chuyên môn ${subject.name}.` }
        });
        return response.text || "Lỗi phản hồi.";
    } catch (error) { throw error; }
};

export const parseExamDocument = async (base64Data: string, mimeType: string): Promise<Quiz> => {
    try {
        const promptText = `Bạn là trợ lý nhập liệu đề thi chuyên nghiệp. Hãy phân tích tài liệu đính kèm.
        
        YÊU CẦU QUAN TRỌNG NHẤT:
        1. **CHÍNH XÁC TUYỆT ĐỐI**: Trích xuất nguyên văn (từng từ, từng chữ, từng dấu câu) của câu hỏi và các lựa chọn đáp án. Không được tự ý tóm tắt hay sửa đổi ngôn ngữ của giáo viên.
        2. **Cấu trúc**: Tách rõ Trắc nghiệm (có 4 lựa chọn) và Tự luận.
        3. **Hình ảnh**: Nếu câu hỏi có chứa mô tả hình ảnh hoặc đồ thị, hãy cố gắng mô tả ngắn gọn nội dung hình ảnh đó vào trong văn bản câu hỏi.
        
        Trả về JSON: { "questions": [...], "essayQuestions": [...] }`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                parts: [
                    { text: promptText },
                    { inlineData: { data: base64Data, mimeType: mimeType } }
                ]
            },
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
        const parsedData = JSON.parse(jsonText || "{}");
        return {
            sourceSchool: "Đề thi của Giáo viên",
            title: "Đề thi tải lên hệ thống",
            timeLimit: "45 phút",
            questions: parsedData.questions || [],
            essayQuestions: parsedData.essayQuestions || []
        } as Quiz;
    } catch (error) { handleGeminiError(error, "parseExamDocument"); }
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType): Promise<Quiz> => {
    try {
        const prompt = `Soạn đề ${testType.name} môn ${subjectName} lớp ${gradeName}.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { throw error; }
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const prompt = `Soạn đề thi thử lớp ${gradeName} môn ${subjectName}. 30 câu trắc nghiệm, 3 câu tự luận.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { throw error; }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const prompt = `Tạo bài tập môn ${subjectName} lớp ${gradeName} bài ${lessonTitle}.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { throw error; }
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], grade: string): Promise<LearningPath> => {
    try {
        const prompt = `Tạo lộ trình 7 ngày cho học sinh ${grade} các chủ đề ${focusTopics.join(',')}.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { throw error; }
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, uploadedFiles: string[]): Promise<LessonPlan> => {
    try {
        const prompt = `Soạn giáo án 5512 môn ${subject} lớp ${grade} bài ${topic}.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { throw error; }
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number): Promise<Quiz> => {
    try {
        const prompt = `Soạn đề thi từ ma trận cho môn ${subject} lớp ${grade}. ${mcCount} câu trắc nghiệm, ${essayCount} tự luận.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: { parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: mimeType } }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { throw error; }
};
