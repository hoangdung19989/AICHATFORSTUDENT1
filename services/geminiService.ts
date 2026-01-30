
import { GoogleGenAI, Type } from "@google/genai";
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- SCHEMA DEFINITIONS ---
const quizSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    sourceSchool: { type: Type.STRING },
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
          section: { type: Type.STRING },
          groupContent: { type: Type.STRING }
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
          sampleAnswer: { type: Type.STRING },
          section: { type: Type.STRING }
        },
        required: ["question", "sampleAnswer"]
      }
    }
  },
  required: ["title", "questions"]
};

const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    period: { type: Type.STRING },
    topic: { type: Type.STRING },
    grade: { type: Type.STRING },
    objectives: {
      type: Type.OBJECT,
      properties: {
        knowledge: { type: Type.ARRAY, items: { type: Type.STRING } },
        commonCompetencies: { type: Type.ARRAY, items: { type: Type.STRING } },
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
        },
        virtues: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["knowledge", "commonCompetencies", "digitalCompetencies", "virtues"]
    },
    materials: {
      type: Type.OBJECT,
      properties: {
        teacher: { type: Type.ARRAY, items: { type: Type.STRING } },
        student: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["teacher", "student"]
    },
    activities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
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
            },
            required: ["step1", "step2", "step3", "step4"]
          }
        },
        required: ["id", "title", "goal", "content", "product", "execution"]
      }
    },
    nlsAnalysisTable: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.NUMBER },
          activityName: { type: Type.STRING },
          organization: { type: Type.STRING },
          competencyDetail: { type: Type.STRING }
        },
        required: ["index", "activityName", "organization", "competencyDetail"]
      }
    },
    homework: { type: Type.STRING }
  },
  required: ["topic", "objectives", "activities", "nlsAnalysisTable"]
};

// --- DATA: BẢNG MÃ NĂNG LỰC SỐ 3456 ---
const DIGITAL_COMPETENCY_3456_TEXT = `
BẢNG MÃ CHỈ BÁO NĂNG LỰC SỐ (THEO VĂN BẢN 3456/BGDĐT-GDPT):

1. MIỀN KHAI THÁC DỮ LIỆU VÀ THÔNG TIN
1.1. Duyệt, tìm kiếm và lọc dữ liệu:
- L6-L7 (1.1.TC1a): Giải thích được nhu cầu thông tin.
- L6-L7 (1.1.TC1b): Thực hiện được rõ ràng và theo quy trình các tìm kiếm để tìm dữ liệu, thông tin trong môi trường số.
- L6-L7 (1.1.TC1c): Giải thích được cách truy cập và điều hướng các kết quả tìm kiếm.
- L6-L7 (1.1.TC1d): Giải thích được rõ ràng và theo quy trình chiến lược tìm kiếm.
- L8-L9 (1.1.TC2a): Minh họa được nhu cầu thông tin.
- L8-L9 (1.1.TC2b): Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số.
- L8-L9 (1.1.TC2c): Mô tả được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.
- L8-L9 (1.1.TC2d): Tổ chức được các chiến lược tìm kiếm.

1.2. Đánh giá dữ liệu, thông tin:
- L6-L7 (1.2.TC1a): Thực hiện phân tích, so sánh, đánh giá được độ tin cậy và độ chính xác của nguồn dữ liệu số.
- L6-L7 (1.2.TC1b): Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin số.
- L8-L9 (1.2.TC2a): Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số.
- L8-L9 (1.2.TC2b): Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số.

1.3. Quản lý dữ liệu:
- L6-L7 (1.3.TC1a): Lựa chọn được dữ liệu, thông tin để tổ chức, lưu trữ và truy xuất thường xuyên.
- L6-L7 (1.3.TC1b): Sắp xếp chúng một cách trật tự trong một môi trường có cấu trúc.
- L8-L9 (1.3.TC2a): Sắp xếp được thông tin, dữ liệu để dễ dàng lưu trữ và truy xuất.
- L8-L9 (1.3.TC2b): Tổ chức được thông tin, dữ liệu trong một môi trường có cấu trúc.

2. MIỀN GIAO TIẾP VÀ HỢP TÁC
2.1. Tương tác thông qua công nghệ số:
- L6-L7 (2.1.TC1a): Thực hiện được các tương tác xác định rõ ràng và thường xuyên với công nghệ số.
- L6-L7 (2.1.TC1b): Lựa chọn được các phương tiện giao tiếp số phù hợp với bối cảnh.
- L8-L9 (2.1.TC2a): Lựa chọn được nhiều công nghệ số để tương tác.
- L8-L9 (2.1.TC2b): Lựa chọn được nhiều phương tiện truyền thông số cho phù hợp với bối cảnh nhất định.

2.2. Chia sẻ thông tin:
- L6-L7 (2.2.TC1a): Lựa chọn các công nghệ số phù hợp để trao đổi dữ liệu, thông tin.
- L6-L7 (2.2.TC1b): Giải thích cách thức hoạt động như một trung gian để chia sẻ thông tin.
- L6-L7 (2.2.TC1c): Minh họa rõ ràng các phương pháp tham chiếu và ghi chú nguồn.
- L8-L9 (2.2.TC2a): Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu.
- L8-L9 (2.2.TC2b): Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin qua công nghệ số.
- L8-L9 (2.2.TC2c): Áp dụng được các phương pháp tham chiếu và ghi chú nguồn.

2.3. Trách nhiệm công dân số:
- L6-L7 (2.3.TC1a): Lựa chọn được các dịch vụ số phổ biến để tham gia vào xã hội.
- L6-L7 (2.3.TC1b): Xác định được các công nghệ số thích hợp để tự trang bị và tham gia xã hội.
- L8-L9 (2.3.TC2a): Lựa chọn được các dịch vụ số để tham gia vào xã hội.
- L8-L9 (2.3.TC2b): Thảo luận về các công nghệ số phù hợp để nâng cao năng lực bản thân.

2.4. Hợp tác qua công nghệ số:
- L6-L7 (2.4.TC1a): Lựa chọn được các công cụ và công nghệ số cho quá trình hợp tác.
- L8-L9 (2.4.TC2a): Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác.

2.5. Quy tắc ứng xử trên mạng:
- L6-L7 (2.5.TC1a): Làm rõ các chuẩn mực hành vi khi sử dụng công nghệ số.
- L6-L7 (2.5.TC1b): Thể hiện được chiến lược giao tiếp và phương thức giao tiếp phù hợp.
- L6-L7 (2.5.TC1c): Mô tả các khía cạnh đa dạng văn hóa cần xem xét trong môi trường số.
- L8-L9 (2.5.TC2a): Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số.
- L8-L9 (2.5.TC2b): Thảo luận các chiến lược giao tiếp phù hợp.
- L8-L9 (2.5.TC2c): Thảo luận các khía cạnh đa dạng văn hóa trong môi trường số.

2.6. Quản lý danh tính số:
- L6-L7 (2.6.TC1a): Phân biệt được một loạt các danh tính số thông thường.
- L6-L7 (2.6.TC1b): Giải thích những cách để bảo vệ danh tiếng trực tuyến.
- L6-L7 (2.6.TC1c): Mô tả dữ liệu thường xuyên thu được qua công cụ số.
- L8-L9 (2.6.TC2a): Hiển thị được nhiều danh tính số cụ thể.
- L8-L9 (2.6.TC2b): Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến.
- L8-L9 (2.6.TC2c): Thao tác dữ liệu cá nhân tạo ra thông qua các công cụ số.

3. MIỀN SÁNG TẠO NỘI DUNG SỐ
3.1. Phát triển nội dung số:
- L6-L7 (3.1.TC1a): Chỉ ra cách tạo và chỉnh sửa nội dung bằng định dạng rõ ràng.
- L6-L7 (3.1.TC1b): Thể hiện bản thân qua việc tạo ra các nội dung số.
- L8-L9 (3.1.TC2a): Chỉ ra cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.
- L8-L9 (3.1.TC2b): Thể hiện được bản thân thông qua việc tạo ra các nội dung số.

3.2. Tích hợp và tái tạo:
- L6-L7 (3.2.TC1a): Giải thích cách sửa đổi, tinh chỉnh, cải thiện nội dung số.
- L8-L9 (3.2.TC2a): Thảo luận các cách sửa đổi, tinh chỉnh, tích hợp nội dung mới.

3.3. Bản quyền và giấy phép:
- L6-L7 (3.3.TC1a): Chỉ ra các quy tắc bản quyền và giấy phép áp dụng cho dữ liệu số.
- L8-L9 (3.3.TC2a): Thảo luận các quy tắc về bản quyền và giấy phép.

3.4. Lập trình:
- L6-L7 (3.4.TC1a): Liệt kê các hướng dẫn thông thường cho hệ thống máy tính giải quyết vấn đề.
- L8-L9 (3.4.TC2a): Liệt kê các hướng dẫn cho hệ thống máy tính để giải quyết vấn đề nhất định.

4. MIỀN AN TOÀN
4.1. Bảo vệ thiết bị:
- L6-L7 (4.1.TC1a): Chỉ ra cách thức cơ bản bảo vệ thiết bị và nội dung số.
- L6-L7 (4.1.TC1b): Phân biệt được rủi ro và mối đe dọa cơ bản trong môi trường số.
- L6-L7 (4.1.TC1c): Chọn lựa được biện pháp an toàn và bảo mật.
- L6-L7 (4.1.TC1d): Chỉ ra cách quan tâm đến mức độ tin cậy và quyền riêng tư.
- L8-L9 (4.1.TC2a): Thiết lập được cách thức bảo vệ thiết bị và nội dung số.
- L8-L9 (4.1.TC2b): Phân biệt được rủi ro và mối đe dọa trong môi trường số.
- L8-L9 (4.1.TC2c): Chọn lựa được biện pháp an toàn bảo mật.
- L8-L9 (4.1.TC2d): Giải thích cách thức quan tâm đến mức độ tin cậy và quyền riêng tư.

4.2. Bảo vệ dữ liệu cá nhân:
- L6-L7 (4.2.TC1a): Giải thích cách thức cơ bản bảo vệ dữ liệu cá nhân.
- L6-L7 (4.2.TC1b): Giải thích cách sử dụng và chia sẻ thông tin định danh an toàn.
- L6-L7 (4.2.TC1c): Chỉ ra tuyên bố cơ bản trong chính sách quyền riêng tư.
- L8-L9 (4.2.TC2a): Thảo luận về cách bảo vệ dữ liệu cá nhân.
- L8-L9 (4.2.TC2b): Thảo luận về cách sử dụng và chia sẻ thông tin định danh an toàn.
- L8-L9 (4.2.TC2c): Chỉ ra các tuyên bố trong chính sách quyền riêng tư.

4.3. Bảo vệ sức khỏe:
- L6-L7 (4.3.TC1a): Giải thích cách tránh rủi ro sức khỏe thể chất/tinh thần khi dùng công nghệ.
- L6-L7 (4.3.TC1b): Lựa chọn cách bảo vệ bản thân khỏi nguy cơ (bắt nạt mạng).
- L6-L7 (4.3.TC1c): Chỉ ra công nghệ số giúp tăng cường thịnh vượng xã hội.
- L8-L9 (4.3.TC2a): Giải thích cách tránh sự đe dọa sức khỏe khi dùng công nghệ.
- L8-L9 (4.3.TC2b): Lựa chọn cách bảo vệ bản thân và người khác.
- L8-L9 (4.3.TC2c): Thảo luận công nghệ số giúp tăng cường thịnh vượng.

4.4. Bảo vệ môi trường:
- L6-L7 (4.4.TC1a): Chỉ ra tác động cơ bản của công nghệ số đến môi trường.
- L8-L9 (4.4.TC2a): Thảo luận các cách bảo vệ môi trường khỏi tác động của công nghệ số.

5. MIỀN GIẢI QUYẾT VẤN ĐỀ
5.1. Giải quyết vấn đề kỹ thuật:
- L6-L7 (5.1.TC1a): Chỉ ra các vấn đề kỹ thuật thông thường.
- L6-L7 (5.1.TC1b): Chọn được giải pháp xác định rõ ràng.
- L8-L9 (5.1.TC2a): Phân biệt được các vấn đề kỹ thuật khi vận hành.
- L8-L9 (5.1.TC2b): Chọn được giải pháp cho chúng.

5.2. Xác định nhu cầu và giải pháp:
- L6-L7 (5.2.TC1a): Chỉ ra nhu cầu được xác định rõ ràng.
- L6-L7 (5.2.TC1b): Chọn được công cụ số thông thường để giải quyết.
- L6-L7 (5.2.TC1c): Chọn được cách điều chỉnh môi trường số theo nhu cầu.
- L8-L9 (5.2.TC2a): Giải thích nhu cầu cá nhân.
- L8-L9 (5.2.TC2b): Lựa chọn công cụ số và giải pháp công nghệ có thể có.
- L8-L9 (5.2.TC2c): Chọn được cách điều chỉnh và tùy chỉnh môi trường số.

5.3. Sử dụng sáng tạo:
- L6-L7 (5.3.TC1a): Chọn được công cụ số để tạo ra kiến thức mới.
- L6-L7 (5.3.TC1b): Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức.
- L8-L9 (5.3.TC2a): Phân biệt công cụ số có thể dùng để tạo kiến thức và đổi mới.
- L8-L9 (5.3.TC2b): Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức phức tạp.

5.4. Xác định vấn đề năng lực số (NLS):
- L6-L7 (5.4.TC1a): Giải thích được NLS bản thân cần cải thiện.
- L6-L7 (5.4.TC1b): Chỉ ra nơi tìm kiếm cơ hội phát triển NLS.
- L8-L9 (5.4.TC2a): Thảo luận về lĩnh vực NLS bản thân cần cải thiện.
- L8-L9 (5.4.TC2b): Chỉ ra cách hỗ trợ người khác phát triển NLS.
- L8-L9 (5.4.TC2c): Chỉ ra nơi tìm kiếm cơ hội phát triển NLS nâng cao.

6. MIỀN TRÍ TUỆ NHÂN TẠO (AI)
6.1. Hiểu biết về AI:
- L6-L7 (6.1.TC1a): Giải thích nguyên tắc hoạt động cơ bản của AI.
- L6-L7 (6.1.TC1b): Diễn giải thuật ngữ và khái niệm liên quan AI.
- L8-L9 (6.1.TC2a): Áp dụng nguyên tắc cơ bản AI giải quyết vấn đề đơn giản.
- L8-L9 (6.1.TC2b): Thực hiện thao tác cơ bản trên công cụ AI.

6.2. Sử dụng AI:
- L6-L7 (6.2.TC1a): Sử dụng công cụ AI trong công việc/học tập hàng ngày.
- L6-L7 (6.2.TC1b): Thực hành kỹ năng sử dụng AI qua bài tập nhỏ.
- L6-L7 (6.2.TC1c): Xem xét khía cạnh đạo đức khi dùng AI.
- L8-L9 (6.2.TC2a): Tối ưu hóa việc sử dụng công cụ AI.
- L8-L9 (6.2.TC2b): Quản lý việc triển khai công cụ AI trong dự án nhỏ.
- L8-L9 (6.2.TC2c): Bảo vệ dữ liệu cá nhân khi dùng AI.

6.3. Đánh giá AI:
- L6-L7 (6.3.TC1a): Giải thích cách thức hoạt động hệ thống AI đơn giản.
- L6-L7 (6.3.TC1b): Tóm tắt đặc điểm và ứng dụng của hệ thống AI.
- L8-L9 (6.3.TC2a): Phân tích hiệu quả hệ thống AI trong giải quyết vấn đề cụ thể.
- L8-L9 (6.3.TC2b): So sánh hiệu suất các hệ thống AI khác nhau.
`;

// --- API GENERATION FUNCTIONS ---

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType, semester: string = 'Cả năm'): Promise<Quiz> => {
  const ai = getAiClient();
  const prompt = `Tạo đề thi ${testType.name} môn ${subjectName}, khối ${gradeName}, ${semester}. Đúng ${testType.questionCount} câu.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    questions: (parsed.questions || []).map((q: any) => ({
      ...q,
      options: (q.options || []).map((opt: string) => opt.replace(/^[A-D]\.\s*/, '').trim()),
      correctAnswer: (q.correctAnswer || "").replace(/^[A-D]\.\s*/, '').trim()
    }))
  };
};

export const getGenericTutorResponse = async (message: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bạn là trợ lý OnLuyen AI. Trả lời: ${message}`
  });
  return response.text || "Lỗi.";
};

export const getTutorResponse = async (subject: Subject, message: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bạn là GV môn ${subject.name}. Giải đáp: ${message}`
  });
  return response.text || "Lỗi.";
};

export const generatePersonalizedLearningPath = async (focusTopics: string[], gradeName: string, recentPerformance?: string): Promise<LearningPath> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tạo lộ trình học 7 ngày cho ${gradeName}, tập trung: ${focusTopics.join(", ")}.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tạo 10 câu trắc nghiệm môn ${subjectName} ${gradeName}, bài: ${lessonTitle}.`,
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    questions: (parsed.questions || []).map((q: any) => ({
      ...q,
      options: (q.options || []).map((opt: string) => opt.replace(/^[A-D]\.\s*/, '').trim()),
      correctAnswer: (q.correctAnswer || "").replace(/^[A-D]\.\s*/, '').trim()
    }))
  };
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tạo đề thi thử môn ${subjectName} khối ${gradeName}.`,
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    questions: (parsed.questions || []).map((q: any) => ({
      ...q,
      options: (q.options || []).map((opt: string) => opt.replace(/^[A-D]\.\s*/, '').trim()),
      correctAnswer: (q.correctAnswer || "").replace(/^[A-D]\.\s*/, '').trim()
    }))
  };
};

export const parseExamDocument = async (base64Data: string, mimeType: string, textContent?: string): Promise<Quiz> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: "Số hóa đề thi này sang JSON chuẩn schema." }];
  if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });
  if (textContent) parts.push({ text: textContent });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text || '{}');
};

export const generateTestFromMatrixDocument = async (subject: string, grade: string, base64Data: string, mimeType: string, mcCount: number, essayCount: number, textContent?: string): Promise<Quiz> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: `Tạo đề môn ${subject} lớp ${grade} (${mcCount} trắc nghiệm, ${essayCount} tự luận) từ ma trận.` }];
  if (base64Data) parts.push({ inlineData: { data: base64Data, mimeType } });
  if (textContent) parts.push({ text: textContent });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text || '{}');
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string, bookSeries: string, contextFiles: { data: string, mimeType: string }[], oldContentText?: string, appendixText?: string): Promise<LessonPlan> => {
  const ai = getAiClient();
  
  // Xác định bộ chỉ báo dựa trên khối lớp
  const isLowerSecondaryStart = grade.includes("6") || grade.includes("7");
  const competencyLevelNote = isLowerSecondaryStart 
    ? "CHÚ Ý ĐẶC BIỆT: Đây là lớp 6/7. BẮT BUỘC CHỈ chọn các mã chỉ báo có tiền tố 'L6-L7' (TC1) trong bảng tham chiếu." 
    : "CHÚ Ý ĐẶC BIỆT: Đây là lớp 8/9. BẮT BUỘC CHỈ chọn các mã chỉ báo có tiền tố 'L8-L9' (TC2) trong bảng tham chiếu.";

  const prompt = `
    Vai trò: Bạn là một chuyên gia giáo dục và công nghệ, am hiểu tường tận Công văn 5512 và Khung năng lực số (Digital Competency) theo văn bản 3456/BGDĐT-GDPT.

    Nhiệm vụ: Soạn kế hoạch bài dạy (Giáo án) môn ${subject} lớp ${grade}, bộ sách ${bookSeries}, bài: "${topic}".

    DỮ LIỆU THAM CHIẾU BẮT BUỘC (BẢNG MÃ 3456):
    ${DIGITAL_COMPETENCY_3456_TEXT}

    YÊU CẦU CỤ THỂ:
    1. Cấu trúc: Tuân thủ chặt chẽ mẫu giáo án 5512 (4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).
    2. Tích hợp Năng lực số:
       - ${competencyLevelNote}
       - Chọn ra 2-3 năng lực số CỤ THỂ và PHÙ HỢP NHẤT với nội dung bài học này từ bảng trên.
       - Trong phần "Mục tiêu" (objectives.digitalCompetencies), phải ghi rõ: Mã (VD: 1.1.TC1a), Tên miền và Mô tả hành vi (chép nguyên văn từ bảng).
    3. Hoạt động dạy học:
       - Hoạt động 1 trình bày 4 bước (không kẻ bảng).
       - Các hoạt động khác kẻ bảng (Hoạt động GV/HS - Sản phẩm).
       - Trong cột "Hoạt động của GV/HS", phải mô tả rõ cách tổ chức để học sinh đạt được năng lực số đã chọn (VD: Học sinh sử dụng công cụ gì, tra cứu ra sao để đạt được mã 1.1.TC1a...).
    4. Phụ lục: Tạo bảng phân tích (nlsAnalysisTable) chỉ rõ hoạt động nào phát triển năng lực số nào (ghi rõ mã).

    Trả về kết quả dưới dạng JSON chuẩn theo schema đã định nghĩa.
  `;

  const parts: any[] = [{ text: prompt }];
  contextFiles.forEach(f => parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));
  if (oldContentText) parts.push({ text: `Nội dung bài dạy tham khảo: ${oldContentText}` });
  if (appendixText) parts.push({ text: `Yêu cầu cần đạt bổ sung: ${appendixText}` });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        responseSchema: lessonPlanSchema,
        temperature: 0.5 // Giảm nhiệt độ để AI tuân thủ bảng mã chính xác hơn
      }
    });
    return JSON.parse(response.text || '{}') as LessonPlan;
  } catch (err) {
    console.error("Generate Lesson Plan error:", err);
    throw new Error("Không thể tạo giáo án. Vui lòng kiểm tra API Key hoặc nội dung file.");
  }
};
