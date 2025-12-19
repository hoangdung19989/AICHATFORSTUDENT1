
import React from 'react';
import type { TestSubject, TestGrade, TestType, Semester } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ChevronRightIcon, ClockIcon } from '../../../components/icons';

interface SemesterSelectionProps {
  subject: TestSubject;
  grade: TestGrade;
  testType: TestType;
  onSelectSemester: (semester: Semester) => void;
  onBack: () => void;
}

const SemesterSelection: React.FC<SemesterSelectionProps> = ({ subject, grade, testType, onSelectSemester, onBack }) => {
  const semesters: Semester[] = ['Học kỳ 1', 'Học kỳ 2'];

  return (
    <div className="container mx-auto max-w-4xl animate-scale-in">
      <Breadcrumb items={[
          { label: 'Kiểm tra', onClick: onBack },
          { label: subject.name, onClick: onBack },
          { label: testType.name, onClick: onBack },
          { label: 'Chọn học kỳ' }
      ]} />
      
      <div className="text-center mb-10">
        <div className={`inline-flex p-3 rounded-2xl ${testType.color} bg-opacity-10 mb-4`}>
             <ClockIcon className={`h-8 w-8 ${testType.color.replace('bg-', 'text-')}`} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Chọn giai đoạn học tập</h1>
        <p className="text-slate-500 mt-2">{subject.name} - {grade.name} ({testType.name})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {semesters.map((sem) => (
          <button 
            key={sem} 
            onClick={() => onSelectSemester(sem)}
            className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-brand-primary hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-brand-primary/10 transition-colors"></div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-brand-primary transition-colors">{sem}</h3>
            <p className="text-slate-500 text-sm mb-6">Đề thi được tuyển chọn từ các Sở GD&ĐT trên toàn quốc giai đoạn {sem}.</p>
            
            <div className="flex items-center text-brand-primary font-bold text-sm">
                Bắt đầu làm bài
                <ChevronRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start">
          <div className="bg-blue-100 p-1.5 rounded-lg mr-3 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Ghi chú:</strong> Tất cả đề thi trong hệ thống OnLuyen AI được lấy từ ngân hàng dữ liệu đề thi chính thức đã được kiểm duyệt của các Sở Giáo dục & Đào tạo trên toàn quốc.
          </p>
      </div>
    </div>
  );
};

export default SemesterSelection;
