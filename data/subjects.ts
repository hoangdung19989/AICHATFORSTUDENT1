
// FIX: Corrected import path for types
import type { Subject, LectureSubject, TestSubject, MockExamSubject, SelfPracticeSubject } from '../types/index';
import { 
    CalculatorIcon, 
    BookOpenIcon, 
    BeakerIcon, 
    GlobeAltIcon, 
    ChatBubbleLeftRightIcon, 
    CodeBracketIcon,
    DocumentTextIcon,
    TowerIcon,
    ScienceIcon,
    HistoryIcon,
    UserGroupIcon,
    SparklesIcon
} from '../components/icons';

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Toán học', description: 'Giải phương trình, hình học và các khái niệm toán học.', color: 'bg-sky-500', icon: CalculatorIcon },
  { id: 'physics', name: 'Vật lý', description: 'Khám phá các định luật về chuyển động, năng lượng và vũ trụ.', color: 'bg-indigo-500', icon: BookOpenIcon },
  { id: 'chemistry', name: 'Hóa học', description: 'Tìm hiểu về các nguyên tố, hợp chất và phản ứng hóa học.', color: 'bg-emerald-500', icon: BeakerIcon },
  { id: 'english', name: 'Tiếng Anh', description: 'Cải thiện ngữ pháp, từ vựng và kỹ năng viết.', color: 'bg-rose-500', icon: GlobeAltIcon },
  { id: 'literature', name: 'Văn học', description: 'Phân tích tác phẩm, tìm hiểu tác giả và các trào lưu văn học.', color: 'bg-amber-500', icon: ChatBubbleLeftRightIcon },
  { id: 'programming', name: 'Tin học', description: 'Học các khái niệm lập trình, thuật toán và cấu trúc dữ liệu.', color: 'bg-fuchsia-500', icon: CodeBracketIcon },
];

export const LECTURE_SUBJECTS: LectureSubject[] = [
  { id: 'lecture-math', name: 'Toán', icon: CalculatorIcon, description: 'Video bài giảng Đại số và Hình học trực quan, dễ hiểu.', tags: ['Lớp 6-9', 'Bám sát SGK', 'Video 4K'], color: 'bg-blue-500' },
  { id: 'lecture-literature', name: 'Ngữ văn', icon: DocumentTextIcon, description: 'Phân tích tác phẩm văn học và rèn luyện kỹ năng Tiếng Việt.', tags: ['Soạn văn', 'Văn mẫu', 'Lớp 6-9'], color: 'bg-amber-500' },
  { id: 'lecture-english', name: 'Tiếng Anh', icon: TowerIcon, description: 'Học từ vựng, ngữ pháp và phát âm chuẩn bản xứ.', tags: ['Global Success', 'Nghe - Nói', 'Ngữ pháp'], color: 'bg-rose-500' },
  { id: 'lecture-history-geo', name: 'Lịch sử và Địa lí', icon: HistoryIcon, description: 'Khám phá các sự kiện lịch sử và đặc điểm địa lí Việt Nam & Thế giới.', tags: ['Lớp 6-9', 'Bản đồ số', 'Dòng thời gian'], color: 'bg-orange-500' },
];

export const SELF_PRACTICE_SUBJECTS: SelfPracticeSubject[] = [
  { id: 'sp-math', name: 'Toán', description: 'Đại số, Hình học và Thống kê.', icon: CalculatorIcon, tags: ['Lớp 6 - 9', 'Đồng bộ SGK'], color: 'bg-blue-500' },
  { id: 'sp-literature', name: 'Ngữ văn', description: 'Đọc hiểu văn bản và Tiếng Việt.', icon: DocumentTextIcon, tags: ['Lớp 6 - 9', 'Đồng bộ SGK'], color: 'bg-amber-500' },
  { id: 'sp-english', name: 'Tiếng Anh', description: 'Từ vựng, Ngữ pháp và Kỹ năng.', icon: TowerIcon, tags: ['Lớp 6 - 9', 'Đồng bộ SGK'], color: 'bg-rose-500' },
  { id: 'sp-science', name: 'Khoa học tự nhiên', description: 'Lý, Hóa, Sinh tích hợp.', icon: ScienceIcon, tags: ['Lớp 6 - 9', 'Đồng bộ SGK'], color: 'bg-green-500' },
  { id: 'sp-history-geo', name: 'Lịch sử và Địa lí', description: 'Khám phá thế giới và quá khứ.', icon: HistoryIcon, tags: ['Lớp 6 - 9', 'Đồng bộ SGK'], color: 'bg-orange-500' },
];

export const TEST_SUBJECTS: TestSubject[] = [
  { id: 'test-math', name: 'Toán', icon: CalculatorIcon, description: 'Kiểm tra 15 phút, 1 tiết và đề thi học kỳ.', tags: ['15 Phút', '45 Phút', 'Học Kỳ'], color: 'bg-blue-500' },
  { id: 'test-literature', name: 'Ngữ văn', icon: DocumentTextIcon, description: 'Đọc hiểu văn bản, Tiếng Việt và Làm văn.', tags: ['Đọc hiểu', 'Nghị luận', 'Tự sự'], color: 'bg-amber-500' },
  { id: 'test-english', name: 'Tiếng Anh', icon: TowerIcon, description: 'Ngữ pháp, Từ vựng, Đọc hiểu và Viết.', tags: ['Grammar', 'Reading', 'Writing'], color: 'bg-rose-500' },
  { id: 'test-science', name: 'Khoa học tự nhiên', icon: ScienceIcon, description: 'Lý - Hóa - Sinh tích hợp theo chương trình mới.', tags: ['KHTN 6-9', 'Trắc nghiệm', 'Thí nghiệm'], color: 'bg-green-500' },
  { id: 'test-history-geo', name: 'Lịch sử và Địa lí', icon: HistoryIcon, description: 'Kiểm tra kiến thức Lịch sử và Địa lí.', tags: ['Lịch sử', 'Địa lí', 'Trắc nghiệm'], color: 'bg-orange-500' },
];

export const MOCK_EXAM_SUBJECTS: MockExamSubject[] = [
    { id: 'mock-math', name: 'Toán', icon: CalculatorIcon, description: 'Đề thi thử vào 10, thi thử THPTQG.', tags: ['Thi vào 10', 'Chuyên Toán', '90 Phút'], color: 'bg-blue-500' },
    { id: 'mock-literature', name: 'Ngữ văn', icon: DocumentTextIcon, description: 'Đề thi thử Văn vào lớp 10 các trường chuyên.', tags: ['Vào 10', 'Văn mẫu', '120 Phút'], color: 'bg-amber-500' },
    { id: 'mock-english', name: 'Tiếng Anh', icon: TowerIcon, description: 'Đề thi thử chuẩn form vào lớp 10 và THPTQG.', tags: ['Đề chuyên', 'IELTS form', '60 Phút'], color: 'bg-rose-500' },
    { id: 'mock-science', name: 'Khoa học tự nhiên', icon: ScienceIcon, description: 'Đề thi thử tổng hợp KHTN.', tags: ['Thi vào 10', 'Đánh giá năng lực'], color: 'bg-green-500' },
    { id: 'mock-history-geo', name: 'Lịch sử và Địa lí', icon: HistoryIcon, description: 'Đề thi thử Sử - Địa.', tags: ['Thi vào 10', 'Tổng hợp'], color: 'bg-orange-500' },
    { id: 'mock-informatics', name: 'Tin học', icon: CodeBracketIcon, description: 'Đề thi trắc nghiệm Tin học, lập trình và ứng dụng.', tags: ['Python/Pascal', 'Office', '45 Phút'], color: 'bg-fuchsia-500' },
    { id: 'mock-technology', name: 'Công nghệ', icon: SparklesIcon, description: 'Đề thi Công nghệ nông nghiệp và công nghiệp.', tags: ['Lý thuyết', 'Thực hành', '45 Phút'], color: 'bg-teal-500' },
    { id: 'mock-gdcd', name: 'GDCD', icon: UserGroupIcon, description: 'Đề thi Giáo dục công dân, pháp luật và đời sống.', tags: ['Tình huống', 'Pháp luật', '45 Phút'], color: 'bg-pink-500' },
];
