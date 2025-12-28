export interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'text' | 'quiz';
    videoUrl?: string;
    duration?: string;
    thumbnail?: string;
}

export interface Chapter {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Course {
    id: string;
    subjectName: string;
    gradeLevel: number;
    title: string;
    chapters: Chapter[];
}

export interface LessonLookupInfo {
  title: string;
  courseId: string;
  gradeName: string;
  subjectName: string;
}