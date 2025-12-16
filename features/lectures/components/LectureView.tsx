
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Corrected import path for types
import type { Course, Lesson } from '../../../types/index';
import LessonSidebar from './LessonSidebar';
import { isDirectVideoUrl, isYoutubeContent, transformGoogleDriveUrl, transformYoutubeUrl } from '../../../utils/url';
import { VideoCameraIcon, ArrowLeftIcon, ChevronRightIcon, ChatBubbleLeftRightIcon } from '../../../components/icons';

interface LectureViewProps {
  course: Course;
  onExit: () => void;
}

const LectureView: React.FC<LectureViewProps> = ({ course, onExit }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    // Select the first lesson of the first chapter by default if none selected
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

  // Handle Next Lesson Navigation
  const handleNextLesson = () => {
    if (!selectedLesson) return;
    let foundCurrent = false;
    for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
            if (foundCurrent) {
                setSelectedLesson(lesson);
                return;
            }
            if (lesson.id === selectedLesson.id) {
                foundCurrent = true;
            }
        }
    }
  };

  const renderVideoPlayer = () => {
    if (!videoUrl) {
      return (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-400">
          <VideoCameraIcon className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">Video không khả dụng hoặc đang được cập nhật.</p>
        </div>
      );
    }

    const commonClasses = "w-full h-full";

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
    <div className="flex flex-col lg:flex-row h-full w-full bg-white overflow-hidden animate-scale-in">
      
      {/* LEFT COLUMN: Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* 1. Header Bar (Mobile only) */}
        <div className="bg-slate-900 text-white p-4 flex items-center lg:hidden flex-shrink-0">
             <button onClick={onExit} className="mr-3 text-slate-400 hover:text-white">
                <ArrowLeftIcon className="h-6 w-6" />
             </button>
             <span className="font-bold truncate">{course.title}</span>
        </div>

        {/* 2. Video Player Container - FIXED at Top (Not scrollable) */}
        <div className="w-full bg-black flex-shrink-0 z-20 shadow-lg relative">
            <div className="w-full aspect-video mx-auto max-h-[60vh] lg:max-h-[70vh]">
                {renderVideoPlayer()}
            </div>
        </div>

        {/* 3. Lesson Details & Content - SCROLLABLE Independently */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white w-full relative">
            <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
                
                {/* Title & Navigation Row */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                            {selectedLesson?.title || 'Chọn bài học'}
                        </h1>
                        <div className="flex items-center text-sm text-slate-500">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-100 mr-3">
                                {course.subjectName} &bull; Lớp {course.gradeLevel}
                            </span>
                            <span>Cập nhật mới nhất</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <button 
                            onClick={handleNextLesson}
                            className="flex items-center px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg shadow-sm transition-all hover:translate-x-1"
                        >
                            Bài tiếp theo
                            <ChevronRightIcon className="h-4 w-4 ml-2" />
                        </button>
                    </div>
                </div>

                {/* Description / Tabs */}
                <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-slate-500" />
                            Ghi chú bài học
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            Nội dung chi tiết, tóm tắt lý thuyết và các bài tập vận dụng cho bài học <strong>"{selectedLesson?.title}"</strong> sẽ được hiển thị tại đây. 
                            Học sinh nên ghi chép lại các ý chính trong quá trình xem video.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-500">#lythuyet</span>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-500">#baitap</span>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-500">#onluyen</span>
                        </div>
                    </div>
                    
                    {/* Placeholder for long content to demonstrate scrolling */}
                    <div className="prose prose-slate max-w-none text-slate-500 text-sm pb-10">
                        <p>
                            Khi xem video bài giảng, hãy chú ý đến các công thức quan trọng và ví dụ minh họa. 
                            Bạn có thể tạm dừng video để ghi chép hoặc tua lại nếu chưa hiểu rõ.
                            Sau khi học xong lý thuyết, đừng quên làm bài tập tự luyện để củng cố kiến thức nhé!
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </div>
      
      {/* RIGHT COLUMN: Sidebar (Lesson List) */}
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
