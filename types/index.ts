
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
    questions: any; // Cấu trúc { questions: QuizQuestion[], essayQuestions: EssayQuestion[] }
    status: 'draft' | 'published';
    deadline: string; // ISO string
    created_at: string;
}
