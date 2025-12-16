
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Corrected import path for types
import type { Course, Lesson } from '../../../types/index';
import LessonSidebar from './LessonSidebar';
import { isDirectVideoUrl, isYoutubeContent, transformGoogleDriveUrl, transformYoutubeUrl } from '../../../utils/url';
import { VideoCameraIcon, ArrowLeftIcon } from '../../../components/icons';

interface LectureViewProps {
  course: Course;
  onExit: () => void;
}

const LectureView: React.FC<LectureViewProps> = ({ course, onExit }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    // Select the first lesson of the first chapter by default
    if (course && course.chapters.length > 0 && course.chapters[0].lessons.length > 0) {
      setSelectedLesson(course.chapters[0].lessons[0]);
    }
  }, [course]);

  const videoUrl = useMemo(() => {
    if (!selectedLesson?.videoUrl) return null;
    let url = selectedLesson.videoUrl;
    if (isYoutubeContent(url)) return transformYoutubeUrl(url);
    if (url.includes('drive.google.com')) return transformGoogleDriveUrl(url);
    return url;
  }, [selectedLesson]);

  const renderVideoPlayer = () => {
    if (!videoUrl) {
      return (
        <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-400 rounded-xl border border-slate-700">
          <VideoCameraIcon className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">Video không khả dụng hoặc đang được cập nhật.</p>
        </div>
      );
    }

    const commonClasses = "w-full h-full rounded-xl shadow-2xl";

    if (isDirectVideoUrl(videoUrl) || videoUrl.includes('drive.google.com')) {
      return <video key={videoUrl} className={commonClasses} controls autoPlay src={videoUrl}></video>;
    }
    
    // Assume iframe for YouTube, Vimeo, etc.
    return (
      <iframe
        key={videoUrl}
        className={commonClasses}
        src={videoUrl}
        title={selectedLesson?.title || "Video bài giảng"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-950 animate-scale-in">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Main Video Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex items-center justify-center p-4 lg:p-8 bg-slate-900/50 backdrop-blur-sm relative">
            {/* Background ambient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            
            <div className="w-full max-w-5xl mx-auto">
                <div className="aspect-video w-full bg-black rounded-xl shadow-2xl ring-1 ring-white/10 relative z-10">
                    {renderVideoPlayer()}
                </div>
            </div>
        </div>

        {/* Lesson Info & Navigation Bar */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 lg:px-8 lg:py-5 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative z-20 flex items-center space-x-5">
          <button 
            onClick={onExit}
            className="flex-shrink-0 p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 group border border-slate-700 hover:border-slate-600 shadow-sm"
            title="Quay lại danh sách lớp"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-display font-bold truncate text-slate-100 leading-tight">
                {selectedLesson?.title || 'Chọn một bài học'}
            </h1>
            <p className="text-sm text-slate-400 truncate flex items-center mt-1.5">
                <span className="bg-indigo-600/20 text-indigo-300 px-2.5 py-0.5 rounded text-[10px] font-bold border border-indigo-500/30 mr-2 uppercase tracking-wide">
                    {course.subjectName}
                </span>
                <span className="opacity-75">
                    Lớp {course.gradeLevel} &bull; {course.title}
                </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <LessonSidebar
        course={course}
        activeLessonId={selectedLesson?.id || null}
        onSelectLesson={setSelectedLesson}
        onExit={onExit}
      />
    </div>
  );
};

export default LectureView;
