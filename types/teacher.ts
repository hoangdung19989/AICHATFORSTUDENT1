
export interface DigitalCompetency {
    code: string;
    description: string;
}

export interface LessonActivity {
    id: number;
    title: string;
    goal: string;
    content: string;
    product: string;
    execution: {
        step1: string; // Chuyển giao nhiệm vụ
        step2: string; // Thực hiện nhiệm vụ
        step3: string; // Báo cáo, thảo luận
        step4: string; // Kết luận, nhận định
    };
}

export interface NlsAnalysisRow {
    index: number;
    activityName: string;
    organization: string; // Cách thức tổ chức dạy học phát triển NLS
    competencyDetail: string; // Mã năng lực và biểu hiện
}

export interface LessonPlan {
    period: string;
    topic: string;
    grade: string;
    objectives: {
        knowledge: string[];
        commonCompetencies: string[];
        digitalCompetencies: DigitalCompetency[];
        virtues: string[];
    };
    materials: {
        teacher: string[]; // Thiết bị/Học liệu của Giáo viên
        student: string[]; // Thiết bị/Học liệu của Học sinh
    };
    activities: LessonActivity[];
    nlsAnalysisTable: NlsAnalysisRow[];
    homework: string;
}
