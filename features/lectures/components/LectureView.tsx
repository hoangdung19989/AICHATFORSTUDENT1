
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
        <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-400">
          <VideoCameraIcon className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">Video không khả dụng hoặc đang được cập nhật.</p>
        </div>
      );
    }

    if (isDirectVideoUrl(videoUrl) || videoUrl.includes('drive.google.com')) {
      return <video key={videoUrl} className="w-full h-full" controls autoPlay src={videoUrl}></video>;
    }
    
    // Assume iframe for YouTube, Vimeo, etc.
    return (
      <iframe
        key={videoUrl}
        className="w-full h-full"
        src={videoUrl}
        title={selectedLesson?.title || "Video bài giảng"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-900 animate-scale-in">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Main Video Content */}
        <div className="flex-1 bg-black aspect-video w-full relative z-0">
            {renderVideoPlayer()}
        </div>

        {/* Lesson Info & Navigation Bar */}
        <div className="bg-slate-800 border-t border-slate-700 p-4 text-white shadow-lg relative z-10 flex items-center space-x-4">
          <button 
            onClick={onExit}
            className="flex-shrink-0 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all duration-200 group"
            title="Quay lại danh sách lớp"
          >
            <ArrowLeftIcon className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate text-slate-100">
                {selectedLesson?.title || 'Chọn một bài học'}
            </h1>
            <p className="text-sm text-slate-400 truncate flex items-center mt-1">
                <span className="bg-brand-primary px-2 py-0.5 rounded text-[10px] font-bold text-white mr-2 uppercase tracking-wide">
                    {course.subjectName}
                </span>
                Lớp {course.gradeLevel} &bull; {course.title}
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
