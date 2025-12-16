
import React from 'react';
// FIX: Corrected import path for types
import type { SelfPracticeSubject } from '../../../types/index';
import { SELF_PRACTICE_SUBJECTS } from '../../../data';
import { useNavigation } from '../../../contexts/NavigationContext';
import Breadcrumb from '../../../components/common/Breadcrumb';
import FeatureCard from '../../../components/common/FeatureCard';

interface SubjectSelectionProps {
  onSelectSubject: (subject: SelfPracticeSubject) => void;
  onBack: () => void;
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ onSelectSubject, onBack }) => {
  const { navigate } = useNavigation();
  return (
    <div className="container mx-auto max-w-6xl">
      <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Tự học', onClick: onBack }, { label: 'Tự luyện' }]} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Chọn môn học để Tự luyện</h1>
        <p className="text-slate-500 mt-2">Luyện tập theo từng bài học trong sách giáo khoa.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SELF_PRACTICE_SUBJECTS.map((subject) => (
          <FeatureCard
            key={subject.id}
            title={subject.name}
            description={subject.description}
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
