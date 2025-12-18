
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan, QuizQuestion } from '../types/index';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini Error during ${context}:`, error);
    if (error.message?.includes('429')) {
        throw new Error("Hệ thống AI đang bận (Quá giới hạn yêu cầu). Vui lòng đợi khoảng 30 giây và thử lại.");
    }
    if (error.message?.includes('400') && error.message?.includes('MIME type')) {
        throw new Error("Định dạng file không được hỗ trợ. Vui lòng sử dụng PDF hoặc Hình ảnh thay vì file Word/Excel.");
    }
    throw new Error(error.message || "Lỗi kết nối AI.");
};

// Schema chung cho cấu trúc Đề thi/Bài tập
const QUIZ_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        sourceSchool: { type: Type.STRING },
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
    required: ["title", "questions"]
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: message,
            config: { systemInstruction: "Bạn là trợ lý AI giáo dục thông minh." }
        });
        return response.text || "Lỗi phản hồi.";
    } catch (error) { throw error; }
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: message,
            config: { systemInstruction: `Bạn là gia sư chuyên môn môn ${subject.name}. Hãy giải thích cặn kẽ và dễ hiểu.` }
        });
        return response.text || "Lỗi phản hồi.";
    } catch (error) { throw error; }
};

export const parseExamDocument = async (base64Data: string, mimeType: string): Promise<Quiz> => {
    try {
        const promptText = `Hãy trích xuất đề thi từ tài liệu đính kèm này. Trích xuất nguyên văn, đầy đủ các câu trắc nghiệm và tự luận.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { text: promptText },
                    { inlineData: { data: base64Data, mimeType: mimeType } }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "parseExamDocument"); }
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType): Promise<Quiz> => {
    try {
        const prompt = `Hãy soạn một đề ${testType.name} môn ${subjectName} ${gradeName}. Số lượng: ${testType.questionCount} câu trắc nghiệm và ${testType.essayCount} câu tự luận. Nội dung bám sát chương trình GDPT mới.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "generateQuiz"); }
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const prompt = `Soạn đề thi thử lớp ${gradeName} môn ${subjectName}. Đề thi cần có tính phân hóa cao, gồm 30 câu trắc nghiệm và 3 câu tự luận.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "generateMockExam"); }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const prompt = `Tạo 10 câu bài tập luyện tập cho bài "${lessonTitle}" môn ${subjectName} ${gradeName}. Có giải thích chi tiết cho từng câu.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "generatePracticeExercises"); }
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], grade: string): Promise<LearningPath> => {
    try {
        const prompt = `Dựa trên các chủ đề học sinh còn yếu: ${focusTopics.join(', ')}, hãy thiết kế lộ trình học 7 ngày cho trình độ ${grade}.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
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
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    tasks: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                type: { type: Type.STRING }, // 'video' hoặc 'practice'
                                                content: { type: Type.STRING },
                                                difficulty: { type: Type.STRING }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "generateLearningPath"); }
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, uploadedFiles: string[]): Promise<LessonPlan> => {
    try {
        const prompt = `Hãy soạn giáo án theo công văn 5512 cho môn ${subject} ${grade}, bài "${topic}", bộ sách ${bookSeries}. Tích hợp các năng lực số phù hợp.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
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
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "generateLessonPlan"); }
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number): Promise<Quiz> => {
    try {
        const prompt = `Dựa vào file ma trận đặc tả này, hãy soạn một đề thi môn ${subject} ${grade} gồm chính xác ${mcCount} câu trắc nghiệm và ${essayCount} câu tự luận.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: mimeType } }] },
            config: { 
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "generateFromMatrix"); }
};
