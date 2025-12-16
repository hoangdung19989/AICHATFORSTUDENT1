import React from 'react';
// FIX: Corrected import path for types
import type { PhetSimulation, LabCategory } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { PlayCircleIcon } from '../../../components/icons';

interface SimulationListProps {
    parentCategory: LabCategory;
    subcategory: LabCategory;
    simulations: PhetSimulation[];
    onSelectSimulation: (simulation: PhetSimulation) => void;
    onBack: () => void;
}

const SimulationList: React.FC<SimulationListProps> = ({ parentCategory, subcategory, simulations, onSelectSimulation, onBack }) => {
    return (
        <div className="container mx-auto max-w-4xl">
             <Breadcrumb items={[{ label: 'Phòng thí nghiệm', onClick: onBack }, { label: parentCategory.name, onClick: onBack }, { label: subcategory.name }]} />
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">{subcategory.name}</h1>
                <p className="text-slate-500 mt-2">Chọn một mô phỏng để bắt đầu thí nghiệm.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <ul className="divide-y divide-slate-200">
                    {simulations.map((sim) => (
                        <li key={sim.id}>
                            <button onClick={() => onSelectSimulation(sim)} className="w-full text-left flex items-start py-4 px-2 hover:bg-slate-50 rounded-lg group space-x-4">
                               <PlayCircleIcon className="h-8 w-8 text-sky-500 flex-shrink-0 mt-1" />
                               <div>
                                 <h3 className="text-lg font-semibold text-slate-700 group-hover:text-brand-blue-dark">{sim.title}</h3>
                                 <p className="text-sm text-slate-500 mt-1">{sim.description}</p>
                               </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SimulationList;