import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
// FIX: Corrected import path for Subject type
import type { Subject } from '../../types/index';
import { SUBJECTS } from '../../data';
import SubjectSelection from './components/SubjectSelection';
import AITutorView from './components/AITutorView';

const AITutorFlow: React.FC = () => {
    const { navigate } = useNavigation();
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    if (!selectedSubject) {
        return (
            <SubjectSelection 
                subjects={SUBJECTS}
                onSelectSubject={(subject) => setSelectedSubject(subject)}
                onBack={() => navigate('home')}
            />
        );
    }

    return (
        <AITutorView 
            subject={selectedSubject}
            onBack={() => setSelectedSubject(null)}
        />
    );
};

export default AITutorFlow;