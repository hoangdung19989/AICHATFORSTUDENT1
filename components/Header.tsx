import React from 'react';
import { AcademicCapIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="h-8 w-8 text-sky-400" />
            <span className="text-xl font-bold tracking-tight text-white">
              OnLuyen AI Tutor
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;