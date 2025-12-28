
export interface UserProgress {
    item_id: string;
    item_type: 'lecture' | 'practice' | 'test';
    is_completed: boolean;
    completed_at: string;
}

export interface ExamResult {
    id: number;
    subject_name: string;
    grade_name: string;
    score: number;
    total_questions: number;
    exam_type?: 'practice' | 'test' | 'mock';
    created_at: string;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: 'student' | 'teacher' | 'admin';
    status: 'active' | 'pending' | 'blocked';
    province?: string;
    ward_commune?: string;
    school_name?: string;
    created_at?: string;
}

export interface DailyTask {
    day: number;
    title: string;
    description: string;
    tasks: {
        type: 'video' | 'practice';
        content: string;
        difficulty?: 'Easy' | 'Medium' | 'Hard';
    }[];
}

export interface LearningPath {
    grade?: string;
    studentWeaknesses: string[];
    weeklyPlan: DailyTask[];
}
