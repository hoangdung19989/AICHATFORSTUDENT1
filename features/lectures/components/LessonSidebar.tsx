
import React from 'react';
// FIX: Corrected import path for types
import type { Course, Chapter, Lesson } from '../../../types/index';
import { PlayCircleIcon, ArrowLeftIcon } from '../../../components/icons';

interface LessonSidebarProps {
  course: Course;
  activeLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onExit: () => void;
}

const LessonSidebar: React.FC<LessonSidebarProps> = ({ course, activeLessonId, onSelectLesson, onExit }) => {
  return (
    <aside className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 h-full lg:h-auto overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 truncate leading-tight">{course.title}</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">{course.subjectName} - Lớp {course.gradeLevel}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {course.chapters.map((chapter: Chapter) => (
          <div key={chapter.id} className="border-b border-slate-100 last:border-0">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider bg-white p-4 sticky top-0 z-10 border-b border-slate-50 backdrop-blur-sm bg-white/95">
                {chapter.title}
            </h3>
            <ul className="pb-2">
              {chapter.lessons.map((lesson: Lesson) => (
                <li key={lesson.id} className="px-2 mb-1">
                  <button
                    onClick={() => onSelectLesson(lesson)}
                    className={`w-full text-left flex items-start p-3 rounded-lg text-sm transition-all duration-200 ${
                      activeLessonId === lesson.id 
                        ? 'bg-brand-primary/10 text-brand-primary font-bold shadow-sm ring-1 ring-brand-primary/20' 
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PlayCircleIcon className={`h-5 w-5 mr-3 flex-shrink-0 mt-0.5 ${
                        activeLessonId === lesson.id ? 'text-brand-primary' : 'text-slate-400'
                    }`} />
                    <span className="leading-snug">{lesson.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={onExit} 
            className="w-full flex items-center justify-center bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-300 hover:border-red-200 font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Thoát ra chọn môn khác
          </button>
      </div>
    </aside>
  );
};

export default LessonSidebar;
