import React from 'react';
import { OnLuyenLogo, XMarkIcon } from '../icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative p-8 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
        >
          <XMarkIcon className="h-6 w-6 text-slate-500" />
        </button>

        <div className="flex flex-col items-center text-center">
            <OnLuyenLogo className="h-20 w-20 mb-4" />
            <h2 className="text-2xl font-bold text-brand-blue-dark mb-2">Về OnLuyen AI</h2>
            <p className="text-slate-600 mb-6">
                Đây là một sản phẩm mô phỏng nền tảng học tập OnLuyen.vn, được xây dựng với mục đích trình diễn khả năng của Google Gemini API trong việc tạo ra các công cụ giáo dục thông minh và tương tác.
            </p>

            <div className="w-full text-left bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-2">Các công nghệ chính được sử dụng:</h3>
                <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                    <li><span className="font-semibold">Google Gemini API:</span> Tạo câu hỏi, giải thích, lộ trình học tập và chatbot.</li>
                    <li><span className="font-semibold">React & TypeScript:</span> Xây dựng giao diện người dùng.</li>
                    <li><span className="font-semibold">Tailwind CSS:</span> Thiết kế giao diện hiện đại.</li>
                    <li><span className="font-semibold">Supabase:</span> Quản lý người dùng và lưu trữ dữ liệu.</li>
                </ul>
            </div>
             <p className="text-xs text-slate-400 mt-6">
                Lưu ý: Sản phẩm này không phải là sản phẩm chính thức của OnLuyen.vn.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
