
export * from './common';
export * from './course';
export * from './lab';
export * from './practice';
export * from './quiz';
export * from './user';
export * from './teacher';

export interface TeacherExam {
    id: string;
    teacher_id: string;
    title: string;
    subject: string;
    grade: string;
    questions: any[]; // QuizQuestion[]
    status: 'draft' | 'published';
    created_at: string;
}
