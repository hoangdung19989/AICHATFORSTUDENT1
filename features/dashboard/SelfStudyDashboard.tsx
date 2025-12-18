
import React from 'react';
import { MODULES } from '../../data';
import { useNavigation } from '../../contexts/NavigationContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import FeatureCard from '../../components/common/FeatureCard';
import { SparklesIcon, RocketLaunchIcon } from '../../components/icons';

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
        <h1 className="text-3xl font-bold text-slate-800 mb-3 font-display">
            Trung tâm Tự học
        </h1>
        <p className="text-slate-500 text-lg">
            Chọn một tính năng bên dưới để bắt đầu hành trình chinh phục kiến thức.
        </p>
      </div>

      {/* AI Promotion Banner */}
      <div className="mb-10 bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display">Xây dựng lộ trình học AI</h3>
                <p className="text-indigo-100 text-sm">Càng làm nhiều bài tập <strong>Tự luyện</strong>, lộ trình học của bạn sẽ càng thông minh hơn!</p>
              </div>
          </div>
          <button 
            onClick={() => navigate('personalized-dashboard')}
            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg z-10 flex items-center whitespace-nowrap"
          >
            <RocketLaunchIcon className="h-5 w-5 mr-2" />
            Kiểm tra lộ trình
          </button>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-indigo-500 rounded-full blur-xl opacity-50"></div>
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
