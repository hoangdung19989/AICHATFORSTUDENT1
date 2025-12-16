
export interface LessonPlan {
    topic: string;
    grade: string;
    objectives: string[];
    materials: string[];
    activities: {
        time: string;
        title: string;
        description: string;
    }[];
    homework: string;
}
