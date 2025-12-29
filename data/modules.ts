// FIX: Corrected import path for Module type
import type { Module } from '../types/index';
import { 
    VideoCameraIcon, 
    PencilSquareIcon, 
    ClockIcon, 
    AcademicCapIcon,
    BeakerIcon
} from '../components/icons';

export const MODULES: Module[] = [
  { id: 1, title: 'Bài giảng', description: 'Video bài giảng chi tiết, sinh động, giúp học sinh tự học và ôn tập hiệu quả.', icon: VideoCameraIcon, color: 'bg-blue-500', tags: ['Video', 'AI NotebookLM', 'Trực quan'] },
  { id: 2, title: 'Tự luyện', description: 'Bài luyện được sắp xếp theo từng đơn vị kiến thức, từ dễ đến khó.', icon: PencilSquareIcon, color: 'bg-emerald-500', tags: ['Theo chủ đề', 'Luyện tập', 'Đáp án chi tiết'] },
  { id: 3, title: 'Kiểm tra', description: 'Tập hợp đề thi, kiểm tra của các trường trên toàn quốc.', icon: ClockIcon, color: 'bg-orange-500', tags: ['15 Phút', '1 Tiết', 'Học Kỳ'] },
  { id: 4, title: 'Thi thử', description: 'Các kì thi thử do trường THCS Minh Thanh tổ chức.', icon: AcademicCapIcon, color: 'bg-purple-500', tags: ['Vào 10', 'Áp lực thời gian', 'Tổng hợp'] },
  { id: 5, title: 'Phòng thí nghiệm', description: 'Phần mềm mô phỏng thí nghiệm giúp hiểu sâu, nhớ lâu các hiện tượng khoa học.', icon: BeakerIcon, color: 'bg-pink-500', tags: ['Mô phỏng PhET', 'Tương tác', 'Thực hành'] },
];