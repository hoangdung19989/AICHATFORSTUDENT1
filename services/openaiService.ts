
/**
 * Dịch vụ kết nối API OpenAI (ChatGPT) - Nâng cấp hỗ trợ Fallback hệ thống
 */

export const getChatGPTResponse = async (subjectName: string, message: string, isJsonResponse: boolean = false): Promise<string> => {
    const apiKey = (process.env as any).OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OPENAI_API_KEY_MISSING");
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
                            : `Bạn là một chuyên gia giáo dục, gia sư môn ${subjectName}. Hãy trả lời học sinh một cách dễ hiểu, sư phạm.`
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
