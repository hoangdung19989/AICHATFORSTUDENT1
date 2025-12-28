
import type { ComponentType } from 'react';

export interface TestSubject {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  tags?: string[];
  color?: string;
}

export interface MockExamSubject extends TestSubject {}

export interface LectureSubject {
    id: string;
    name: string;
    icon: ComponentType<{ className?: string }>;
    description?: string;
    tags?: string[];
    color?: string;
}

export interface SelfPracticeSubject {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tags: string[];
  color: string;
}

export type Semester = 'Học kỳ 1' | 'Học kỳ 2' | 'Cả năm';

export interface TestType {
    id: '15-minute' | '45-minute' | 'midterm' | 'semester';
    name: string;
    duration: string;
    description: string;
    questionCount: number;
    essayCount: number;
    color: string;
    requiresSemester: boolean; // Để biết có cần bước chọn Học kỳ không
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topics?: string[];
  image?: string; // Base64 string for question illustration
}

export interface EssayQuestion {
  question: string;
  sampleAnswer: string;
  image?: string; // Base64 string for question illustration
}

export interface Quiz {
  sourceSchool: string; // Nơi trích xuất đề (VD: Sở GD Hà Nội)
  title: string;
  timeLimit: string;
  questions: QuizQuestion[];
  essayQuestions?: EssayQuestion[];
  semester?: string;
  externalLink?: string; // Link đến file gốc (PDF/Word trên Drive)
}
