
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

    const commonClasses = "w-full h-full rounded-xl shadow-2xl bg-black";

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
        
        {/* Main Video Content Area - Cinema Mode Layout */}
        {/* Sử dụng flex để căn giữa video, không ép chiều cao cố định để tránh khoảng đen lớn */}
        <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 lg:p-6 relative overflow-hidden">
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            
            {/* Video Container: Giữ tỷ lệ 16:9 nhưng giới hạn max-width/height để vừa màn hình */}
            <div className="w-full max-w-[1600px] aspect-video max-h-full relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl ring-1 ring-white/10 bg-black">
                {renderVideoPlayer()}
            </div>
        </div>

        {/* Lesson Info & Navigation Bar */}
        <div className="bg-slate-800 border-t border-slate-700 p-4 lg:px-6 lg:py-4 text-white shadow-lg relative z-20 flex items-center space-x-4">
          <button 
            onClick={onExit}
            className="flex-shrink-0 p-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 group border border-slate-600 shadow-sm"
            title="Quay lại danh sách lớp"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-xl font-display font-bold truncate text-slate-100 leading-tight">
                {selectedLesson?.title || 'Chọn một bài học'}
            </h1>
            <p className="text-sm text-slate-400 truncate flex items-center mt-1">
                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-500/30 mr-2 uppercase tracking-wide">
                    {course.subjectName}
                </span>
                <span className="opacity-80">
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
