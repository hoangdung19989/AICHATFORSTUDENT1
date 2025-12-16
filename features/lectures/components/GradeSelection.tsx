import React from 'react';
// FIX: Corrected import path for types
import type { LectureSubject, Grade } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ChevronRightIcon } from '../../../components/icons';

interface GradeSelectionProps {
  subject: LectureSubject;
  grades: Grade[];
  onSelectGrade: (grade: Grade) => void;
  onBackToSubjects: () => void;
  onBackToSelfStudy: () => void;
}

const GradeSelection: React.FC<GradeSelectionProps> = ({ subject, grades, onSelectGrade, onBackToSubjects, onBackToSelfStudy }) => {
  return (
    <div className="container mx-auto max-w-4xl">
       <Breadcrumb items={[
          { label: 'Tự học', onClick: onBackToSelfStudy }, 
          { label: 'Bài giảng', onClick: onBackToSubjects }, 
          { label: subject.name }
        ]} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Chọn khối lớp cho môn {subject.name}</h1>
        <p className="text-slate-500 mt-2">Tìm các bài giảng phù hợp với chương trình học của bạn.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <ul className="divide-y divide-slate-200">
          {grades.map((grade) => (
            <li key={grade.id}>
              <button onClick={() => onSelectGrade(grade)} className="w-full flex justify-between items-center py-4 px-2 hover:bg-slate-50 rounded-lg group">
                <span className="text-lg font-semibold text-slate-700 group-hover:text-brand-blue-dark">{grade.name}</span>
                <ChevronRightIcon className="h-6 w-6 text-slate-400 group-hover:text-brand-blue-dark" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GradeSelection;