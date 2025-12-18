
import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import FeatureCard from '../../components/common/FeatureCard';
import { PencilSquareIcon, DocumentTextIcon, ChartBarIcon, ChatBubbleBottomCenterTextIcon, BriefcaseIcon } from '../../components/icons';

const TeacherDashboard: React.FC = () => {
  const { navigate } = useNavigation();

  const handleSelectTool = (id: string) => {
    switch (id) {
      case 'lesson-planner': navigate('lesson-planner'); break;
      case 'test-generator': navigate('test-generator'); break;
      case 'ai-subjects': navigate('ai-subjects'); break;
      case 'exam-manager': navigate('exam-manager'); break;
      case 'exam-results': navigate('exam-results-viewer'); break;
      default: alert("Chức năng đang phát triển.");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Công cụ giảng dạy' }]} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Góc Giáo Viên</h1>
        <p className="text-slate-500 text-lg">Hệ thống AI hỗ trợ giảng dạy và quản lý học tập thông minh.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureCard
          title="Soạn giáo án AI"
          description="Tạo kế hoạch bài dạy chuẩn 5512 tích hợp năng lực số."
          icon={DocumentTextIcon} color="bg-purple-500"
          onClick={() => handleSelectTool('lesson-planner')}
        />
         <FeatureCard
          title="Tạo đề từ Ma trận"
          description="Phân tích bảng ma trận để sinh đề thi Word chuẩn xác."
          icon={PencilSquareIcon} color="bg-sky-500"
          onClick={() => handleSelectTool('test-generator')}
        />
        <FeatureCard
          title="Quản lý & Giao đề"
          description="Tải đề PDF/Ảnh lên, AI trích xuất và giao cho học sinh làm online."
          icon={BriefcaseIcon} color="bg-orange-500"
          onClick={() => handleSelectTool('exam-manager')}
        />
        <FeatureCard
          title="Báo cáo kết quả thi"
          description="Xem điểm số, thống kê lỗi sai và lịch sử vi phạm của học sinh."
          icon={ChartBarIcon} color="bg-rose-500"
          onClick={() => handleSelectTool('exam-results')}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;
