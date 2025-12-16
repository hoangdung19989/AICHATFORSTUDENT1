import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path for types
import type { Subject, ChatMessage } from '../../../types/index';
import { getTutorResponse } from '../../../services/geminiService';
import { PaperAirplaneIcon, ArrowLeftIcon } from '../../../components/icons';

interface AITutorViewProps {
  subject: Subject;
  onBack: () => void;
}

const AITutorView: React.FC<AITutorViewProps> = ({ subject, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages([{
      role: 'model',
      content: `Xin chào! Tôi là gia sư AI môn ${subject.name}. Bạn có câu hỏi nào không?`
    }]);
    inputRef.current?.focus();
  }, [subject]);

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
      const response = await getTutorResponse(subject, currentInput);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: 'model',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200">
      <header className="flex items-center p-4 border-b border-slate-200 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 mr-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div className={`p-2 rounded-lg ${subject.color.replace('bg-','bg-').replace('500','100')}`}>
            <subject.icon className={`h-6 w-6 ${subject.color.replace('bg-','text-').replace('500','600')}`} />
        </div>
        <h1 className="text-xl font-bold ml-3 text-slate-800">Gia sư AI - {subject.name}</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <p className="whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-lg px-4 py-3 rounded-2xl bg-slate-100 flex items-center space-x-2 shadow-sm">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Hỏi về ${subject.name}...`}
            className="flex-1 w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-sky-600 rounded-full text-white hover:bg-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutorView;