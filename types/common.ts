import type { ComponentType } from 'react';

export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  tags: string[];
}

export interface Grade {
  id: string;
  name: string;
  courseId: string;
}

export interface TestGrade {
  id: string;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
