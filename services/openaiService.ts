
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
    if (processKey && !processKey.includes('YOUR_OPENAI_API_KEY')) return processKey;

    // 4. Lấy từ localStorage (User tự nhập)
    const localKey = localStorage.getItem('openai_api_key');
    if (localKey) return localKey;

    return '';
};

export const getChatGPTResponse = async (
    subjectName: string, 
    message: string, 
    isJsonResponse: boolean = false,
    images: string[] = [] // Hỗ trợ danh sách ảnh base64 (có prefix data:image...)
): Promise<string> => {
    const apiKey = getOpenAIKey();

    if (!apiKey) {
        console.error("Missing OpenAI API Key");
        throw new Error("Hệ thống chưa tìm thấy OpenAI API Key. Vui lòng kiểm tra config.ts, biến môi trường hoặc nhập trong Cài đặt.");
    }

    // Xây dựng payload content
    const contentPayload: any[] = [{ type: "text", text: message }];
    
    if (images && images.length > 0) {
        images.forEach(img => {
            // Đảm bảo ảnh có prefix đúng chuẩn data URI
            const imageUrl = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
            contentPayload.push({
                type: "image_url",
                image_url: { url: imageUrl }
            });
        });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            mode: 'cors',
            body: JSON.stringify({
                model: "gpt-4o-mini", // Dùng model hỗ trợ Vision nhanh và rẻ
                messages: [
                    {
                        role: "system",
                        content: isJsonResponse 
                            ? "Bạn là một AI chuyên xuất dữ liệu giáo dục dạng JSON. Chỉ trả về JSON đúng cú pháp, không kèm markdown ```json." 
                            : `Bạn là một chuyên gia giáo dục, gia sư môn ${subjectName}. Hãy trả lời học sinh một cách dễ hiểu, sư phạm. Sử dụng Markdown.`
                    },
                    {
                        role: "user",
                        content: contentPayload
                    }
                ],
                response_format: isJsonResponse ? { type: "json_object" } : { type: "text" },
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Lỗi API OpenAI (${response.status})`);
        }

        const data = await response.json();
        return data.choices[0].message.content || "";
    } catch (error: any) {
        console.error("OpenAI API Error:", error);
        
        // Handle "Failed to fetch" specifically
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error("Không thể kết nối đến máy chủ OpenAI. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau (Lỗi CORS/Network).");
        }
        
        throw error;
    }
};
