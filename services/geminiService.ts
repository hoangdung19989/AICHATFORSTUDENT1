
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

// Khởi tạo AI Client an toàn
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const responseCache = new Map<string, any>();

const getCachedOrFetch = async <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
    if (responseCache.has(key)) return responseCache.get(key);
    const result = await fetchFn();
    responseCache.set(key, result);
    return result;
};

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini Error during ${context}:`, error);
    if (error.message?.includes('429')) {
        throw new Error("Hệ thống AI đang bận. Vui lòng thử lại sau 30 giây.");
    }
    throw new Error(error.message || "Lỗi kết nối AI.");
};

const FAST_CONFIG = {
    thinkingConfig: { thinkingBudget: 0 },
    temperature: 0.7,
};

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
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: message }] }],
            config: { 
                ...FAST_CONFIG,
                systemInstruction: "Bạn là trợ lý AI giáo dục thông minh. Trả lời ngắn gọn, súc tích bằng tiếng Việt." 
            }
        });
        return response.text || "Lỗi phản hồi.";
    } catch (error) { throw error; }
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: message }] }],
            config: { 
                ...FAST_CONFIG,
                systemInstruction: `Bạn là gia sư chuyên môn môn ${subject.name}. Hãy giải thích cặn kẽ.` 
            }
        });
        return response.text || "Lỗi phản hồi.";
    } catch (error) { throw error; }
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType): Promise<Quiz> => {
    const cacheKey = `quiz-${subjectName}-${gradeName}-${testType.id}`;
    return getCachedOrFetch(cacheKey, async () => {
        try {
            const ai = getAiClient();
            const prompt = `Soạn đề ${testType.name} ${subjectName} ${gradeName}. Số lượng: ${testType.questionCount} trắc nghiệm, ${testType.essayCount} tự luận. Trả về JSON.`;
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { 
                    ...FAST_CONFIG,
                    responseMimeType: "application/json",
                    responseSchema: QUIZ_SCHEMA
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return handleGeminiError(error, "generateQuiz"); }
    });
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    const cacheKey = `mock-${subjectName}-${gradeName}`;
    return getCachedOrFetch(cacheKey, async () => {
        try {
            const ai = getAiClient();
            const prompt = `Soạn đề thi thử lớp ${gradeName} môn ${subjectName}. Trả về JSON.`;
            const response = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { 
                    ...FAST_CONFIG,
                    responseMimeType: "application/json",
                    responseSchema: QUIZ_SCHEMA
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return handleGeminiError(error, "generateMockExam"); }
    });
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    const cacheKey = `practice-${subjectName}-${gradeName}-${lessonTitle}`;
    return getCachedOrFetch(cacheKey, async () => {
        try {
            const ai = getAiClient();
            const prompt = `Tạo 10 câu bài tập luyện tập cho bài "${lessonTitle}" môn ${subjectName} ${gradeName}.`;
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { 
                    ...FAST_CONFIG,
                    responseMimeType: "application/json",
                    responseSchema: QUIZ_SCHEMA
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return handleGeminiError(error, "generatePracticeExercises"); }
    });
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], grade: string): Promise<LearningPath> => {
    const cacheKey = `path-${grade}-${focusTopics.join(',')}`;
    return getCachedOrFetch(cacheKey, async () => {
        try {
            const ai = getAiClient();
            const prompt = `Thiết kế lộ trình học 7 ngày lớp ${grade} cho các chủ đề: ${focusTopics.join(', ')}.`;
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { 
                    ...FAST_CONFIG,
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
                                                    type: { type: Type.STRING },
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
    });
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, uploadedFiles: string[]): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        const prompt = `Soạn giáo án 5512 môn ${subject} ${grade}, bài "${topic}", sách ${bookSeries}. Files: ${uploadedFiles.join(', ')}`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                ...FAST_CONFIG,
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

export const parseExamDocument = async (base64Data: string, mimeType: string): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{
                role: 'user',
                parts: [
                    { text: "Trích xuất đề thi trắc nghiệm và tự luận từ file này." },
                    { inlineData: { data: base64Data, mimeType: mimeType } }
                ]
            }],
            config: {
                ...FAST_CONFIG,
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "parseExamDocument"); }
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number): Promise<Quiz> => {
    try {
        const ai = getAiClient();
        const prompt = `Soạn đề ${subject} ${grade} gồm ${mcCount} trắc nghiệm và ${essayCount} tự luận từ ma trận này.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ 
                role: 'user',
                parts: [
                    { text: prompt }, 
                    { inlineData: { data: base64Data, mimeType: mimeType } }
                ] 
            }],
            config: { 
                ...FAST_CONFIG,
                responseMimeType: "application/json",
                responseSchema: QUIZ_SCHEMA
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) { return handleGeminiError(error, "generateFromMatrix"); }
};
