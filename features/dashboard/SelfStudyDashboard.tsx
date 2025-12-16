import React from 'react';
import { MODULES } from '../../data';
import { useNavigation } from '../../contexts/NavigationContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import FeatureCard from '../../components/common/FeatureCard';

const SelfStudyDashboard: React.FC = () => {
  const { navigate } = useNavigation();

  const handleSelectModule = (moduleTitle: string) => {
    switch (moduleTitle) {
      case 'Bài giảng':
        navigate('lecture-subjects');
        break;
      case 'Tự luyện':
        navigate('self-practice-subjects');
        break;
      case 'Kiểm tra':
        navigate('test-subjects');
        break;
      case 'Thi thử':
        navigate('mock-exam-subjects');
        break;
      case 'Phòng thí nghiệm':
        navigate('laboratory-categories');
        break;
      default:
        alert(`Chức năng "${moduleTitle}" đang được phát triển.`);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Tự học' }]} />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Trung tâm Tự học
        </h1>
        <p className="text-slate-500 text-lg">
            Chọn một tính năng bên dưới để bắt đầu hành trình chinh phục kiến thức.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MODULES.map((module) => (
          <FeatureCard
            key={module.id}
            title={module.title}
            description={module.description}
            icon={module.icon}
            tags={module.tags}
            color={module.color}
            onClick={() => handleSelectModule(module.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default SelfStudyDashboard;
