import React from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowRightCircleIcon } from '../../../components/icons';

interface TestResultsViewProps {
  score: number;
  totalQuestions: number;
  onRetake: () => void;
  onBackToSubjects: () => void;
}

const TestResultsView: React.FC<TestResultsViewProps> = ({ score, totalQuestions, onRetake, onBackToSubjects }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPass = percentage >= 50;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-lg border border-slate-200 animate-scale-in">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành!</h2>
      <p className="text-slate-500 mb-6">Đây là kết quả bài làm của bạn.</p>

      <div className={`relative w-48 h-48 flex items-center justify-center mb-6`}>
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-slate-200"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={isPass ? 'text-green-500' : 'text-red-500'}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            strokeDashoffset="25"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-800">{percentage}%</span>
            <span className="text-sm text-slate-500">Chính xác</span>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="h-6 w-6" />
            <span className="font-semibold">{score} Đúng</span>
        </div>
         <div className="flex items-center space-x-2 text-red-600">
            <XCircleIcon className="h-6 w-6" />
            <span className="font-semibold">{totalQuestions - score} Sai</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={onRetake}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Làm lại bài này
        </button>
        <button
          onClick={onBackToSubjects}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Chọn bài khác
        </button>
      </div>
    </div>
  );
};

export default TestResultsView;
