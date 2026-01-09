
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

// Khởi tạo client AI - Luôn sử dụng process.env.API_KEY
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Định nghĩa Schema chuẩn cho đề thi để ép AI trả về đúng cấu trúc
const quizSchema = {
  type: Type.OBJECT,
  properties: {
    title: { 
      type: Type.STRING, 
      description: "Tiêu đề của đề thi (VD: Kiểm tra 15 phút môn Toán)" 
    },
    sourceSchool: { 
      type: Type.STRING, 
      description: "Nguồn gốc đề thi (VD: Ngân hàng đề thi OnLuyen)" 
    },
    timeLimit: { 
      type: Type.STRING, 
      description: "Thời gian làm bài (VD: 15 phút)" 
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Nội dung câu hỏi, dùng LaTeX $...$ nếu có công thức" },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Mảng chứa đúng 4 lựa chọn trả lời" 
          },
          correctAnswer: { type: Type.STRING, description: "Nội dung chính xác của đáp án đúng (phải khớp hoàn toàn với 1 trong các options)" },
          explanation: { type: Type.STRING, description: "Giải thích chi tiết tại sao đáp án đó đúng" },
          section: { type: Type.STRING, description: "Phần của đề thi (tùy chọn)" },
          groupContent: { type: Type.STRING, description: "Nội dung dùng chung cho nhóm câu hỏi (tùy chọn)" }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
      }
    }
  },
  required: ["title", "questions"]
};

/**
 * Tạo đề thi trắc nghiệm từ AI
 */
export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
  const ai = getAiClient();
  const prompt = `Bạn là một chuyên gia khảo thí giáo dục tại Việt Nam.
  Hãy tạo một đề thi ${testType.name} cho môn ${subjectName}, khối ${gradeName}, ${semester}.
  
  YÊU CẦU QUAN TRỌNG:
  1. Số lượng câu hỏi: Đúng ${testType.questionCount} câu trắc nghiệm.
  2. Nội dung: Bám sát chương trình giáo dục phổ thông mới.
  3. Định dạng: Các công thức Toán/Lý/Hóa PHẢI nằm trong dấu $...$ (VD: $x^2 + y^2 = z^2$).
  4. Ngôn ngữ: Tiếng Việt.
  5. Trả về định dạng JSON thuần túy theo schema đã cung cấp.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.7
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("AI không trả về nội dung.");
    
    const parsedData = JSON.parse(resultText);
    
    // Đảm bảo dữ liệu trả về luôn sạch sẽ
    return {
      title: parsedData.title || `${testType.name} ${subjectName}`,
      sourceSchool: parsedData.sourceSchool || "Hệ thống OnLuyen AI",
      timeLimit: parsedData.timeLimit || testType.duration,
      questions: parsedData.questions.map((q: any) => ({
        ...q,
        options: q.options.map((opt: string) => opt.replace(/^[A-D]\.\s*/, '').trim()),
        correctAnswer: q.correctAnswer.replace(/^[A-D]\.\s*/, '').trim()
      }))
    };
  } catch (err) {
    console.error("Lỗi generateQuiz:", err);
    throw new Error("Không thể tạo đề thi lúc này. Vui lòng thử lại sau vài giây.");
  }
};

/**
 * Trò chuyện với gia sư AI tổng quát
 */
export const getGenericTutorResponse = async (message: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bạn là trợ lý học tập OnLuyen AI. Hãy trả lời câu hỏi sau của học sinh một cách ngắn gọn, súc tích: ${message}`
  });
  return response.text || "Tôi gặp lỗi khi xử lý câu hỏi này.";
};

/**
 * Trò chuyện với gia sư chuyên môn
 */
export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bạn là một giáo viên giỏi môn ${subject.name}. Hãy giải đáp thắc mắc sau của học sinh, sử dụng LaTeX $...$ cho công thức nếu cần: ${message}`
  });
  return response.text || "Tôi chưa có câu trả lời cho vấn đề này.";
};

/**
 * Tạo lộ trình học tập cá nhân hóa
 */
export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string, recentPerformance?: string): Promise<LearningPath> => {
  const ai = getAiClient();
  const prompt = `Tạo lộ trình học tập 7 ngày cho học sinh ${gradeName}. 
  Chủ đề cần tập trung: ${focusTopics.join(", ")}. 
  Hiệu suất gần đây: ${recentPerformance}. 
  Trả về JSON chứa mảng weeklyPlan.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  
  return JSON.parse(response.text || '{}');
};

/**
 * Tạo bài tập tự luyện cho một bài học cụ thể
 */
export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
  const ai = getAiClient();
  const prompt = `Tạo 10 câu hỏi trắc nghiệm luyện tập môn ${subjectName} ${gradeName}, bài: "${lessonTitle}". Dùng LaTeX $...$ cho công thức.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: quizSchema
    }
  });
  
  return JSON.parse(response.text || '{}');
};

/**
 * Các hàm hỗ trợ khác (Giữ cấu trúc tương tự)
 */
export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
  const ai = getAiClient();
  const prompt = `Tạo một đề thi thử vào lớp 10 môn ${subjectName} tiêu chuẩn.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: quizSchema
    }
  });
  return JSON.parse(response.text || '{}');
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: "Hãy số hóa đề thi này sang định dạng JSON chuẩn." }];
  if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });
  if (textContent) parts.push({ text: `Nội dung văn bản: ${textContent}` });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: { 
      responseMimeType: "application/json",
      responseSchema: quizSchema
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: `Dựa trên ma trận này, hãy tạo đề thi môn ${subject} lớp ${grade} gồm ${mcCount} câu trắc nghiệm và ${essayCount} câu tự luận.` }];
  if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });
  if (textContent) parts.push({ text: `Nội dung ma trận: ${textContent}` });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: { data: string, mimeType: string }[], oldContentText?: string, appendixText?: string): Promise<LessonPlan> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: `Soạn giáo án 5512 môn ${subject} lớp ${grade}, bộ sách ${bookSeries}, bài: ${topic}.` }];
  contextFiles.forEach(f => parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));
  if (oldContentText) parts.push({ text: `Gợi ý nội dung: ${oldContentText}` });
  if (appendixText) parts.push({ text: `Phụ lục đi kèm: ${appendixText}` });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}') as LessonPlan;
};
