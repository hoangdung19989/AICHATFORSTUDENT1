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

export interface TestType {
    id: '15-minute' | '45-minute' | 'semester';
    name: string;
    duration: string;
    description: string;
    questionCount: number;
    essayCount: number;
    color: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topics?: string[];
}

export interface EssayQuestion {
  question: string;
  sampleAnswer: string;
}

export interface Quiz {
  sourceSchool: string;
  title: string;
  timeLimit: string;
  questions: QuizQuestion[];
  essayQuestions?: EssayQuestion[];
}
