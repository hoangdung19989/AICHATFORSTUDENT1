
import React from 'react';
// FIX: Corrected import path for types
import type { TestSubject } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import FeatureCard from '../../../components/common/FeatureCard';
import { useNavigation } from '../../../contexts/NavigationContext';

interface SubjectSelectionProps {
  subjects: TestSubject[];
  onSelectSubject: (subject: TestSubject) => void;
  onBack: () => void;
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ subjects, onSelectSubject, onBack }) => {
  const { navigate } = useNavigation();
  return (
    <div className="container mx-auto max-w-6xl">
      <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Tự học', onClick: onBack }, { label: 'Kiểm tra' }]} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Chọn môn học để kiểm tra</h1>
        <p className="text-slate-500 mt-2">Thử sức với các bài kiểm tra 15 phút, 1 tiết và học kỳ.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject) => (
          <FeatureCard
            key={subject.id}
            title={subject.name}
            description={subject.description || ''}
            icon={subject.icon}
            tags={subject.tags}
            color={subject.color}
            onClick={() => onSelectSubject(subject)}
          />
        ))}
      </div>
    </div>
  );
};

export default SubjectSelection;
