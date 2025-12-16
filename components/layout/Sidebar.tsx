
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
  KeyIcon
} from '../icons';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  view: View;
  isActive: boolean;
  onClick: (view: View) => void;
}

// Optimization: Define NavItem outside to prevent re-creation on every render
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

const Sidebar: React.FC<{ onOpenAboutModal: () => void }> = ({ onOpenAboutModal }) => {
  const { user, profile, signOut } = useAuth();
  const { currentView, navigate } = useNavigation();

  let role = profile?.role;
  if (!role && currentView === 'admin-dashboard') {
      role = 'admin';
  }
  if (!role) {
      role = user?.user_metadata?.role;
  }

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
      return currentView === view || (view === 'self-study' && !['home', 'personalized-dashboard', 'teacher-dashboard', 'admin-dashboard'].includes(currentView));
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-full p-3 shrink-0">
      <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-soft rounded-2xl p-3">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3 px-2 py-3 mb-2">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
             <OnLuyenLogo className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="block text-lg font-display font-bold text-slate-800 leading-none">
              OnLuyen
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest">AI TUTOR</span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2"></div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-2">Menu</div>
          <NavItem icon={HomeIcon} label="Trang chủ" view="home" isActive={isViewActive('home')} onClick={navigate} />
          
          {role !== 'teacher' && role !== 'admin' && (
            <>
              <NavItem icon={AcademicCapIcon} label="Tự học" view="self-study" isActive={isViewActive('self-study')} onClick={navigate} />
              <NavItem icon={RocketLaunchIcon} label="Lộ trình của tôi" view="personalized-dashboard" isActive={isViewActive('personalized-dashboard')} onClick={navigate} />
            </>
          )}

          {role === 'teacher' && (
            <>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-3">Giảng dạy</div>
               <NavItem icon={PencilSquareIcon} label="Công cụ giảng dạy" view="teacher-dashboard" isActive={isViewActive('teacher-dashboard')} onClick={navigate} />
               {status === 'active' && (
                  <NavItem icon={DocumentTextIcon} label="Soạn giáo án" view="lesson-planner" isActive={isViewActive('lesson-planner')} onClick={navigate} />
               )}
            </>
          )}

          {role === 'admin' && (
              <>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-3">Hệ thống</div>
                <NavItem icon={KeyIcon} label="Quản trị hệ thống" view="admin-dashboard" isActive={isViewActive('admin-dashboard')} onClick={navigate} />
              </>
          )}
        </nav>

        {/* Footer / User Profile */}
        <div className="mt-auto pt-3">
          <button
            onClick={onOpenAboutModal}
            className="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-brand-primary transition-colors mb-2"
          >
            <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
            Trợ giúp & Thông tin
          </button>

          {user ? (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-2.5 mb-2">
                 <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 p-0.5 shadow-md flex-shrink-0">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                        <UserCircleIcon className="h-5 w-5 text-slate-600" />
                    </div>
                 </div>
                 <div className="flex flex-col overflow-hidden min-w-0">
                     <span className="text-xs font-bold text-slate-700 truncate font-display">{user.user_metadata?.full_name || 'Người dùng'}</span>
                     <div className="flex items-center">
                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${roleBadgeColor}`}>
                             {roleLabel}
                         </span>
                     </div>
                 </div>
              </div>
              <button
                onClick={signOut}
                className="w-full text-center bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-600 font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wide transition-all duration-200"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('login')}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 text-sm"
            >
              Đăng nhập ngay
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
