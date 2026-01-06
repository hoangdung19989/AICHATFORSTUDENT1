
/**
 * Dịch vụ kết nối API OpenAI (ChatGPT) - Tối ưu hóa cho Vercel & Vite
 */
import { API_KEYS } from '../config';

const getOpenAIKey = (): string => {
    // 1. Ưu tiên lấy từ file config.ts nếu bạn đã điền vào đó
    if (API_KEYS.OPENAI_API_KEY && !API_KEYS.OPENAI_API_KEY.includes('YOUR_OPENAI_API_KEY')) {
        return API_KEYS.OPENAI_API_KEY;
    }
    
    // 2. Lấy từ biến môi trường Vite (cho Vercel)
    const viteKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
    if (viteKey) return viteKey;

    // 3. Lấy từ shim process.env (được định nghĩa trong vite.config.ts)
    const processKey = (process.env as any).OPENAI_API_KEY;
    if (processKey) return processKey;

    return '';
};

export const getChatGPTResponse = async (subjectName: string, message: string, isJsonResponse: boolean = false): Promise<string> => {
    const apiKey = getOpenAIKey();

    if (!apiKey) {
        console.error("Missing OpenAI API Key");
        return "⚠️ Lỗi: Hệ thống chưa tìm thấy OpenAI API Key. Hãy điền vào file config.ts hoặc gán VITE_OPENAI_API_KEY trên Vercel và REDEPLOY.";
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: isJsonResponse 
                            ? "Bạn là một AI chuyên xuất dữ liệu giáo dục dạng JSON. Chỉ trả về JSON, không kèm văn bản giải thích." 
                            : `Bạn là một chuyên gia giáo dục, gia sư môn ${subjectName}. Hãy trả lời học sinh một cách dễ hiểu, sư phạm. Sử dụng Markdown.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                response_format: isJsonResponse ? { type: "json_object" } : { type: "text" },
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Lỗi kết nối OpenAI");
        }

        const data = await response.json();
        return data.choices[0].message.content || "";
    } catch (error: any) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
};
