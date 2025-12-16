import React from 'react';
// FIX: Corrected import path for types
import type { TestSubject, TestGrade, TestType } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ChevronRightIcon } from '../../../components/icons';

interface TypeSelectionProps {
  subject: TestSubject;
  grade: TestGrade;
  testTypes: TestType[];
  onSelectTestType: (type: TestType) => void;
  onBack: () => void;
  onBackToSubjects: () => void;
  onBackToSelfStudy: () => void;
}

const TypeSelection: React.FC<TypeSelectionProps> = ({ subject, grade, testTypes, onSelectTestType, onBack, onBackToSubjects, onBackToSelfStudy }) => {
  return (
    <div className="container mx-auto max-w-4xl">
      <Breadcrumb items={[
          { label: 'Tự học', onClick: onBackToSelfStudy },
          { label: 'Kiểm tra', onClick: onBackToSubjects },
          { label: subject.name, onClick: onBack },
          { label: grade.name }
      ]} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Chọn loại bài kiểm tra</h1>
        <p className="text-slate-500 mt-2">{subject.name} - {grade.name}</p>
      </div>
      <div className="space-y-4">
        {testTypes.map((type) => (
          <button 
            key={type.id} 
            onClick={() => onSelectTestType(type)}
            className={`group w-full text-left p-6 rounded-xl transition-all duration-200 flex items-center justify-between ${type.color} bg-opacity-10 border border-opacity-30 ${type.color.replace('bg-', 'border-')}`}
          >
            <div>
              <h3 className={`text-xl font-bold ${type.color.replace('bg-', 'text-')}`}>{type.name}</h3>
              <p className={`mt-1 text-sm ${type.color.replace('bg-', 'text-')} text-opacity-80`}>{type.description}</p>
            </div>
            <ChevronRightIcon className={`h-8 w-8 transition-transform group-hover:translate-x-1 ${type.color.replace('bg-', 'text-')}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeSelection;