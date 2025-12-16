
import React from 'react';
// FIX: Corrected import path for types
import type { Subject } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import FeatureCard from '../../../components/common/FeatureCard';

interface SubjectSelectionProps {
    subjects: Subject[];
    onSelectSubject: (subject: Subject) => void;
    onBack: () => void;
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ subjects, onSelectSubject, onBack }) => {
    return (
        <div className="container mx-auto max-w-6xl">
             <Breadcrumb items={[{ label: 'Trang chủ', onClick: onBack }, { label: 'Gia sư AI' }]} />
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Chọn một môn học</h1>
                <p className="text-slate-500 mt-2">Gia sư AI sẽ giúp bạn giải đáp mọi thắc mắc.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjects.map(subject => (
                    <FeatureCard
                        key={subject.id}
                        title={subject.name}
                        description={subject.description}
                        icon={subject.icon}
                        color={subject.color}
                        onClick={() => onSelectSubject(subject)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SubjectSelection;
