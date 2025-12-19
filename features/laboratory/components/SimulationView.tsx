
import React from 'react';
// FIX: Corrected import path for types
import type { PhetSimulation } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { ArrowLeftIcon } from '../../../components/icons';

interface SimulationViewProps {
    simulation: PhetSimulation;
    subjectName: string;
    onBack: () => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ simulation, subjectName, onBack }) => {
    return (
        <div className="flex flex-col h-full space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
                <Breadcrumb items={[
                    { label: 'Phòng thí nghiệm', onClick: onBack }, 
                    { label: subjectName, onClick: onBack }, 
                    { label: simulation.title }
                ]} />
                
                <button 
                    onClick={onBack}
                    className="mb-6 flex items-center text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Quay lại danh sách
                </button>
            </div>

            <div className="flex-1 min-h-[75vh] md:min-h-[80vh] bg-white rounded-3xl shadow-2xl border-4 border-slate-100 overflow-hidden relative group">
                {/* Overlay loading indication or decoration if needed */}
                <div className="absolute inset-0 bg-slate-900 pointer-events-none opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                
                <iframe
                    src={simulation.embedUrl}
                    title={simulation.title}
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    allow="geolocation; microphone; camera; midi; encrypted-media; xr-spatial-tracking; fullscreen"
                ></iframe>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start">
                <div className="bg-blue-100 p-1.5 rounded-lg mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-800">Hướng dẫn thực hành</h4>
                    <p className="text-xs text-blue-700 leading-relaxed mt-1">
                        Sử dụng chuột hoặc màn hình cảm ứng để tương tác với các thiết bị trong phòng thí nghiệm. Bạn có thể nhấn vào biểu tượng <strong>Toàn màn hình</strong> ở góc dưới cùng bên phải của mô phỏng để có trải nghiệm tốt nhất.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SimulationView;
