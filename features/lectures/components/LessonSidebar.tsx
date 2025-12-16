import React from 'react';
// FIX: Corrected import path for types
import type { Course, Chapter, Lesson } from '../../../types/index';
import { PlayCircleIcon } from '../../../components/icons';

interface LessonSidebarProps {
  course: Course;
  activeLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onExit: () => void;
}

const LessonSidebar: React.FC<LessonSidebarProps> = ({ course, activeLessonId, onSelectLesson, onExit }) => {
  return (
    <aside className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 truncate">{course.title}</h2>
        <p className="text-sm text-slate-500">{course.subjectName} - Lớp {course.gradeLevel}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {course.chapters.map((chapter: Chapter) => (
          <div key={chapter.id} className="border-b border-slate-200">
            <h3 className="font-bold text-slate-600 bg-slate-50 p-3 sticky top-0">{chapter.title}</h3>
            <ul>
              {chapter.lessons.map((lesson: Lesson) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => onSelectLesson(lesson)}
                    className={`w-full text-left flex items-center p-3 text-sm transition-colors ${
                      activeLessonId === lesson.id ? 'bg-sky-100 text-sky-700 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <PlayCircleIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${activeLessonId === lesson.id ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{lesson.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200">
          <button onClick={onExit} className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
            Quay lại chọn lớp
          </button>
      </div>
    </aside>
  );
};

export default LessonSidebar;