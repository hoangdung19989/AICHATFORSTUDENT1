import React from 'react';
// FIX: Corrected import path for types
import type { SelfPracticeSubject, TestGrade, PracticeChapter, PracticeLesson } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { PencilSquareIcon } from '../../../components/icons';

interface LessonSelectionProps {
  subject: SelfPracticeSubject;
  grade: TestGrade;
  chapters: PracticeChapter[];
  onSelectLesson: (lesson: PracticeLesson) => void;
  onBack: () => void;
  onBackToSubjects: () => void;
  onBackToSelfStudy: () => void;
}

const LessonSelection: React.FC<LessonSelectionProps> = ({ subject, grade, chapters, onSelectLesson, onBack, onBackToSubjects, onBackToSelfStudy }) => {
  return (
    <div className="container mx-auto max-w-4xl">
      <Breadcrumb items={[
        { label: 'Tự học', onClick: onBackToSelfStudy },
        { label: 'Tự luyện', onClick: onBackToSubjects },
        { label: subject.name, onClick: onBack },
        { label: grade.name }
      ]} />
       <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Chọn bài học để luyện tập</h1>
        <p className="text-slate-500 mt-2">{subject.name} - {grade.name}</p>
      </div>

      <div className="space-y-6">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{chapter.title}</h2>
            <ul className="divide-y divide-slate-200">
              {chapter.lessons.map((lesson) => (
                 <li key={lesson.id}>
                    <button onClick={() => onSelectLesson(lesson)} className="w-full flex items-center text-left py-3 px-2 hover:bg-slate-50 rounded-lg group">
                        <PencilSquareIcon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-sky-500 flex-shrink-0" />
                        <span className="text-slate-600 group-hover:text-sky-600 font-medium">{lesson.title}</span>
                    </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonSelection;