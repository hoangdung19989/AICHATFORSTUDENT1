
import type { TestGrade, TestType } from '../types/index';

export const TEST_TYPES: TestType[] = [
    { 
        id: '15-minute', 
        name: 'Kiểm tra 15 phút', 
        duration: '15 Phút', 
        description: 'Bài kiểm tra thường xuyên theo từng chương/bài.', 
        questionCount: 10, 
        essayCount: 0, 
        color: 'bg-sky-500',
        requiresSemester: false
    },
    { 
        id: '45-minute', 
        name: 'Kiểm tra 1 tiết', 
        duration: '45 Phút', 
        description: 'Kiểm tra định kỳ sau khi kết thúc một chủ đề lớn.', 
        questionCount: 25, 
        essayCount: 1, 
        color: 'bg-indigo-500',
        requiresSemester: true
    },
    { 
        id: 'midterm', 
        name: 'Kiểm tra Giữa kỳ', 
        duration: '60-90 Phút', 
        description: 'Đánh giá kiến thức giữa giai đoạn học tập.', 
        questionCount: 35, 
        essayCount: 2, 
        color: 'bg-orange-500',
        requiresSemester: true
    },
    { 
        id: 'semester', 
        name: 'Thi Học kỳ', 
        duration: '90 Phút', 
        description: 'Kỳ thi quan trọng tổng kết toàn bộ kiến thức học kỳ.', 
        questionCount: 40, 
        essayCount: 3, 
        color: 'bg-purple-500',
        requiresSemester: true 
    }
];

export const TEST_GRADES: TestGrade[] = [
    { id: 'grade-6', name: 'Lớp 6' },
    { id: 'grade-7', name: 'Lớp 7' },
    { id: 'grade-8', name: 'Lớp 8' },
    { id: 'grade-9', name: 'Lớp 9' },
];

export const MOCK_EXAM_GRADES: TestGrade[] = [
    { id: 'grade-6', name: 'Lớp 6' },
    { id: 'grade-7', name: 'Lớp 7' },
    { id: 'grade-8', name: 'Lớp 8' },
    { id: 'grade-9', name: 'Lớp 9' },
    { id: 'entrance-10', name: 'Thi vào lớp 10' }
];
