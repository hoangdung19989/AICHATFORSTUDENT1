import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
// FIX: Corrected import path for types
import type { LabCategory, PhetSimulation } from '../../types/index';
import { LAB_CATEGORIES, PHET_SIMULATIONS } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

import CategorySelection from './components/CategorySelection';
import SubCategorySelection from './components/SubCategorySelection';
import SimulationList from './components/SimulationList';
import SimulationView from './components/SimulationView';

const LaboratoryFlow: React.FC = () => {
    const { navigate } = useNavigation();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<LabCategory | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<LabCategory | null>(null);
    const [selectedSimulation, setSelectedSimulation] = useState<PhetSimulation | null>(null);

    const handleSelectSimulation = (simulation: PhetSimulation) => {
        if (!user) {
            alert("Bạn cần đăng nhập để sử dụng phòng thí nghiệm.");
            navigate('login');
            return;
        }
        setSelectedSimulation(simulation);
    };

    if (selectedSimulation && selectedCategory) {
        return (
            <SimulationView 
                simulation={selectedSimulation}
                subjectName={selectedCategory.name}
                onBack={() => setSelectedSimulation(null)}
            />
        );
    }

    if (selectedCategory && selectedSubCategory) {
        const simulations = PHET_SIMULATIONS[selectedSubCategory.id] || [];
        return (
            <SimulationList
                parentCategory={selectedCategory}
                subcategory={selectedSubCategory}
                simulations={simulations}
                onSelectSimulation={handleSelectSimulation}
                onBack={() => {
                    setSelectedSubCategory(null);
                    setSelectedCategory(null); // Go all the way back to main lab page
                }}
            />
        );
    }
    
    if (selectedCategory) {
        return (
            <SubCategorySelection
                parentCategory={selectedCategory}
                onSelectSubcategory={(sub) => setSelectedSubCategory(sub)}
                onBack={() => setSelectedCategory(null)}
            />
        );
    }

    return <CategorySelection categories={LAB_CATEGORIES} onSelectCategory={setSelectedCategory} onBack={() => navigate('self-study')} />;
};

export default LaboratoryFlow;