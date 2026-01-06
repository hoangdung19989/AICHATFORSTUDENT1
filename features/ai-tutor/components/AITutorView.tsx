
import React, { useState, useRef, useEffect } from 'react';
import type { Subject, ChatMessage } from '../../../types/index';
import { getTutorResponse } from '../../../services/geminiService';
import { getChatGPTResponse } from '../../../services/openaiService';
import { PaperAirplaneIcon, ArrowLeftIcon, SparklesIcon, RobotIcon } from '../../../components/icons';

interface AITutorViewProps {
  subject: Subject;
  onBack: () => void;
}

type AIEngine = 'gemini' | 'chatgpt';

const AITutorView: React.FC<AITutorViewProps> = ({ subject, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEngine, setAiEngine] = useState<AIEngine>('gemini');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages([{
      role: 'model',
      content: `Xin chào! Tôi là gia sư AI môn ${subject.name} (Sử dụng trí tuệ nhân tạo ${aiEngine === 'gemini' ? 'Gemini 3' : 'ChatGPT 4o'}). Bạn cần tôi giải đáp kiến thức nào không?`
    }]);
    inputRef.current?.focus();
  }, [subject, aiEngine]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      let response = '';
      if (aiEngine === 'gemini') {
        response = await getTutorResponse(subject, currentInput);
      } else {
        response = await getChatGPTResponse(subject.name, currentInput);
      }
      
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'Xin lỗi, đã có lỗi kết nối với máy chủ AI. Vui lòng kiểm tra lại cấu hình API Key.'
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 gap-4">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all mr-3 text-slate-400 hover:text-slate-600">
            <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className={`p-2.5 rounded-2xl ${subject.color} shadow-lg mr-4`}>
                <subject.icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <h1 className="text-lg font-black text-slate-800 leading-none">Gia sư {subject.name}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trợ lý học tập thông minh</p>
            </div>
        </div>

        {/* AI Engine Switcher */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl self-center sm:self-auto">
            <button 
                onClick={() => setAiEngine('gemini')}
                className={`flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    aiEngine === 'gemini' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
                <SparklesIcon className="h-4 w-4 mr-2" />
                GEMINI
            </button>
            <button 
                onClick={() => setAiEngine('chatgpt')}
                className={`flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    aiEngine === 'chatgpt' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
                <RobotIcon className="h-4 w-4 mr-2" />
                CHATGPT
            </button>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-3xl shadow-sm ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl rounded-tl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-white p-2 rounded-[1.5rem] shadow-inner border border-slate-200">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Hỏi gia sư ${aiEngine === 'gemini' ? 'Gemini' : 'ChatGPT'} về ${subject.name}...`}
            className="flex-1 w-full px-4 py-3 bg-transparent focus:outline-none text-slate-700 font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-3.5 rounded-2xl text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale ${
                aiEngine === 'gemini' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
            }`}
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">AI có thể đưa ra câu trả lời chưa chính xác, hãy kiểm tra lại thông tin quan trọng.</p>
      </div>
    </div>
  );
};

export default AITutorView;
