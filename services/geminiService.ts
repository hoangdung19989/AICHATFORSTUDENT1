
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

// Schema siêu gọn để AI tạo JSON nhanh nhất có thể
const FAST_LESSON_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        period: { type: Type.STRING },
        topic: { type: Type.STRING },
        grade: { type: Type.STRING },
        objectives: {
            type: Type.OBJECT,
            properties: {
                knowledge: { type: Type.ARRAY, items: { type: Type.STRING } },
                digitalCompetencies: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            domain: { type: Type.STRING },
                            code: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["domain", "code", "description"]
                    }
                }
            },
            required: ["knowledge", "digitalCompetencies"]
        },
        materials: {
            type: Type.OBJECT,
            properties: {
                equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        activities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    goal: { type: Type.STRING },
                    content: { type: Type.STRING },
                    product: { type: Type.STRING },
                    execution: {
                        type: Type.OBJECT,
                        properties: {
                            step1: { type: Type.STRING },
                            step2: { type: Type.STRING },
                            step3: { type: Type.STRING },
                            step4: { type: Type.STRING }
                        }
                    }
                }
            }
        },
        nlsAnalysisTable: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    index: { type: Type.INTEGER },
                    activityName: { type: Type.STRING },
                    organization: { type: Type.STRING },
                    competencyDetail: { type: Type.STRING }
                }
            }
        },
        homework: { type: Type.STRING }
    },
    required: ["topic", "objectives", "activities"]
};

export const generateLessonPlan = async (
    subject: string, 
    grade: string, 
    topic: string, 
    bookSeries: string, 
    contextFiles: { data: string, mimeType: string }[], 
    oldContentText?: string
): Promise<LessonPlan> => {
    try {
        const ai = getAiClient();
        const systemInstruction = `Làm giáo án 5512 + Năng lực số. Phải cực nhanh, ngắn gọn, đủ ý. Xuất JSON.`;
        const parts: any[] = [{ text: `Bài: ${topic}, Môn: ${subject}, Lớp: ${grade}. Nội dung: ${oldContentText || 'Trích từ file'}` }];
        contextFiles.forEach(file => parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } }));

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts }],
            config: {
                temperature: 0,
                topP: 0.1,
                topK: 1,
                responseMimeType: "application/json",
                responseSchema: FAST_LESSON_SCHEMA,
                systemInstruction: systemInstruction,
            },
        });
        
        if (!response.text) throw new Error("AI không phản hồi kịp.");
        return JSON.parse(response.text) as LessonPlan;
    } catch (error: any) {
        console.error(error);
        throw new Error("Lỗi hệ thống hoặc file quá lớn. Thầy/Cô hãy thử dán văn bản trực tiếp để nhanh hơn.");
    }
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config: { temperature: 0 }
    });
    return response.text || "";
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Gia sư ${subject.name}: ${message}` }] }],
        config: { temperature: 0 }
    });
    return response.text || "";
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Đề ${testType.name} ${subjectName} ${gradeName} ${semester}. JSON.` }] }],
        config: { temperature: 0, responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Đề thi thử ${subjectName} ${gradeName}. JSON.` }] }],
        config: { temperature: 0, responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Luyện tập ${subjectName} ${gradeName} bài ${lessonTitle}. JSON.` }] }],
        config: { temperature: 0, responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string): Promise<LearningPath> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Lộ trình ${gradeName} cho ${focusTopics.join(", ")}. JSON.` }] }],
        config: { temperature: 0, responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number): Promise<Quiz> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ inlineData: { data: base64Data, mimeType } }, { text: `Tạo đề ${subject} ${grade} từ ma trận.` }] }],
        config: { temperature: 0, responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
};

export const parseExamDocument = async (base64Data: string, mimeType: string): Promise<Quiz> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ inlineData: { data: base64Data, mimeType } }, { text: "Trích xuất đề." }] }],
        config: { temperature: 0, responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
};
