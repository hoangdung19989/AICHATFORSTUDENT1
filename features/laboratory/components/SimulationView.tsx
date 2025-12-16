import React from 'react';
// FIX: Corrected import path for types
import type { PhetSimulation } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';

interface SimulationViewProps {
    simulation: PhetSimulation;
    subjectName: string;
    onBack: () => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ simulation, subjectName, onBack }) => {
    return (
        <div className="flex flex-col h-full">
            <Breadcrumb items={[{ label: 'Phòng thí nghiệm', onClick: onBack }, { label: subjectName, onClick: onBack }, { label: simulation.title }]} />
            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <iframe
                    src={simulation.embedUrl}
                    title={simulation.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="geolocation; microphone; camera; midi; encrypted-media; xr-spatial-tracking; fullscreen"
                ></iframe>
            </div>
        </div>
    );
};

export default SimulationView;