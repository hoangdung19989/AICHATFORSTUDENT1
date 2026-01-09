
import React, { memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, View } from '../../contexts/NavigationContext';
import {
  HomeIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  OnLuyenLogo,
  PencilSquareIcon,
  DocumentTextIcon,
  KeyIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BriefcaseIcon,
  ChartBarIcon
} from '../icons';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  view: View;
  isActive: boolean;
  onClick: (view: View) => void;
}

const NavItem: React.FC<NavItemProps> = memo(({ icon: Icon, label, view, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(view)}
      className={`group flex items-center w-full px-4 py-3 mb-1 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${
        isActive
          ? 'bg-brand-primary text-white shadow-md shadow-indigo-200'
          : 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm'
      }`}
    >
      <Icon className={`h-5 w-5 mr-3 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
      <span className="truncate relative z-10">{label}</span>
      {!isActive && <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />}
    </button>
  );
});

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAboutModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenAboutModal }) => {
  const { user, profile, signOut } = useAuth();
  const { currentView, navigate } = useNavigation();

  let role = profile?.role || user?.user_metadata?.role;
  const status = profile?.status || 'active';
  
  let roleLabel = 'Học sinh';
  let roleBadgeColor = 'bg-indigo-100 text-indigo-700';

  if (role === 'teacher') {
      roleLabel = 'Giáo viên';
      roleBadgeColor = 'bg-pink-100 text-pink-700';
  } else if (role === 'admin') {
      roleLabel = 'Quản trị viên';
      roleBadgeColor = 'bg-red-100 text-red-700';
  }

  const isViewActive = (view: View) => {
      return currentView === view;
  };

  const handleNavigate = (view: View) => {
      navigate(view);
      onClose(); // Auto close on mobile
  };

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 p-3 transform transition-transform duration-300 ease-in-out bg-transparent shrink-0
        md:relative md:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl md:shadow-soft rounded-2xl p-3">
          
          {/* Header & Close Button */}
          <div className="flex items-center justify-between px-2 py-3 mb-2">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
                <OnLuyenLogo className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-lg font-display font-bold text-slate-800 leading-none">OnLuyen</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">v2.1.1</span>
              </div>
            </div>
            <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2"></div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-1 custom-scrollbar">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-2">Menu chính</div>
            <NavItem icon={HomeIcon} label="Trang chủ" view="home" isActive={isViewActive('home')} onClick={handleNavigate} />
            
            {role !== 'teacher' && role !== 'admin' && (
              <>
                <NavItem icon={AcademicCapIcon} label="Tự học" view="self-study" isActive={['self-study', 'lecture-subjects', 'test-subjects', 'mock-exam-subjects', 'laboratory-categories'].includes(currentView)} onClick={handleNavigate} />
                <NavItem icon={RocketLaunchIcon} label="Lộ trình của tôi" view="personalized-dashboard" isActive={isViewActive('personalized-dashboard')} onClick={handleNavigate} />
              </>
            )}

            {role === 'teacher' && (
              <>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-3">Giảng dạy</div>
                <NavItem icon={PencilSquareIcon} label="Công cụ hỗ trợ" view="teacher-dashboard" isActive={isViewActive('teacher-dashboard')} onClick={handleNavigate} />
                {status === 'active' && (
                    <>
                        <NavItem icon={BriefcaseIcon} label="Giao bài tập" view="exam-manager" isActive={isViewActive('exam-manager')} onClick={handleNavigate} />
                        <NavItem icon={ChartBarIcon} label="Kết quả học sinh" view="exam-results-viewer" isActive={isViewActive('exam-results-viewer')} onClick={handleNavigate} />
                        <NavItem icon={DocumentTextIcon} label="Soạn giáo án" view="lesson-planner" isActive={isViewActive('lesson-planner')} onClick={handleNavigate} />
                    </>
                )}
              </>
            )}

            {role === 'admin' && (
              <>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-3">Hệ thống</div>
                <NavItem icon={KeyIcon} label="Quản trị người dùng" view="admin-dashboard" isActive={isViewActive('admin-dashboard')} onClick={handleNavigate} />
              </>
            )}
          </nav>

          {/* Footer Profile Area */}
          <div className="mt-auto pt-3">
            <button
              onClick={() => { onOpenAboutModal(); onClose(); }}
              className="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-brand-primary transition-colors mb-2"
            >
              <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
              Trợ giúp & Thông tin
            </button>

            {user ? (
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 shadow-sm">
                <button
                  onClick={() => handleNavigate('profile-settings')}
                  className="flex items-center space-x-2.5 mb-2 px-1 w-full text-left group"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 p-0.5 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <UserCircleIcon className="h-5 w-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0">
                      <span className="text-xs font-bold text-slate-700 truncate font-display group-hover:text-brand-primary transition-colors">{profile?.full_name || user.user_metadata?.full_name || 'Người dùng'}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${roleBadgeColor}`}>
                          {roleLabel} - {profile?.grade_name || user.user_metadata?.grade_name || 'Lớp ?'}
                      </span>
                  </div>
                </button>
                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-600 font-bold py-2 px-3 rounded-lg text-[10px] uppercase tracking-wide transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { navigate('login'); onClose(); }}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 text-sm"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
