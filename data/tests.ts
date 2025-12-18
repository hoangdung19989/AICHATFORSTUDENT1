
// FIX: Corrected import path for types
import type { TestGrade, TestType } from '../types/index';

export const TEST_TYPES: TestType[] = [
    { id: '15-minute', name: 'Kiểm tra 15 phút', duration: '15 Phút', description: 'Bài kiểm tra ngắn để ôn tập kiến thức vừa học.', questionCount: 10, essayCount: 0, color: 'bg-sky-500' },
    { id: '45-minute', name: 'Kiểm tra 1 tiết', duration: '45 Phút', description: 'Bài kiểm tra định kỳ, bao gồm cả trắc nghiệm và tự luận.', questionCount: 25, essayCount: 2, color: 'bg-orange-500' },
    { id: 'semester', name: 'Thi Học kỳ', duration: '60-90 Phút', description: 'Đề thi tổng hợp kiến thức toàn học kỳ. Thời gian tuỳ môn học.', questionCount: 40, essayCount: 3, color: 'bg-purple-500' }
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
