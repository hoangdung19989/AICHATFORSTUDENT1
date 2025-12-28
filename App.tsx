
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from './types/index';
import Sidebar from './components/layout/Sidebar';
import HomePage from './components/home/HomePage';
import AboutModal from './components/modals/AboutModal';
import LoginView from './components/auth/LoginView';
import AdminLoginView from './components/auth/AdminLoginView';
import UpdatePasswordView from './components/auth/UpdatePasswordView';
import TeacherPendingView from './components/auth/TeacherPendingView'; 
import PersonalizedDashboard from './features/personalized-dashboard/PersonalizedDashboardView';
import SelfStudyDashboard from './features/dashboard/SelfStudyDashboard';
import AITutorFlow from './features/ai-tutor/AITutorFlow';
import LecturesFlow from './features/lectures/LecturesFlow';
import LaboratoryFlow from './features/laboratory/LaboratoryFlow';
import TestsFlow from './features/tests/TestsFlow';
import MockExamsFlow from './features/mock-exams/MockExamsFlow';
import SelfPracticeFlow from './features/self-practice/SelfPracticeFlow';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import LessonPlanner from './features/teacher/LessonPlanner';
import TestGenerator from './features/teacher/TestGenerator'; 
import ExamManager from './features/teacher/ExamManager';
import ExamResultsViewer from './features/teacher/ExamResultsViewer';
import AdminDashboard from './features/admin/AdminDashboard';

import { useAuth } from './contexts/AuthContext';
import { useNavigation, View } from './contexts/NavigationContext';
import { supabase } from './services/supabaseClient';
import { getGenericTutorResponse } from './services/geminiService';
import { 
    RobotIcon, 
    PaperAirplaneIcon, 
    XMarkIcon, 
    SparklesIcon, 
    Bars3Icon, 
    OnLuyenLogo,
    HomeIcon,
    AcademicCapIcon,
    ChatBubbleBottomCenterTextIcon
} from './components/icons';
import LoadingSpinner from './components/common/LoadingSpinner';

// ... (các component phụ giữ nguyên) ...

const MobileHeader: React.FC<{ onMenuOpen: () => void }> = ({ onMenuOpen }) => {
    return (
        <header className="md:hidden bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3 sticky top-0 z-[50] flex items-center justify-between">
            <button onClick={onMenuOpen} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
                <OnLuyenLogo className="h-7 w-7" />
                <span className="font-display font-bold text-slate-800 text-lg">OnLuyen</span>
            </div>
            <div className="w-10"></div>
        </header>
    );
};

const BottomNav: React.FC = () => {
    const { currentView, navigate } = useNavigation();
    const { profile, user } = useAuth();
    const role = profile?.role || user?.user_metadata?.role;
    if (role === 'teacher' || role === 'admin') return null;
    const navItems = [
        { label: 'Trang chủ', icon: HomeIcon, view: 'home' as View },
        { label: 'Tự học', icon: AcademicCapIcon, view: 'self-study' as View },
        { label: 'Gia sư AI', icon: ChatBubbleBottomCenterTextIcon, view: 'ai-subjects' as View },
    ];
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-2 pb-safe-area-inset z-40 flex items-center justify-around shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => (
                <button
                    key={item.label}
                    onClick={() => navigate(item.view)}
                    className={`flex flex-col items-center p-2 transition-all ${
                        currentView === item.view ? 'text-brand-primary' : 'text-slate-400'
                    }`}
                >
                    <item.icon className="h-6 w-6 mb-1" />
                    <span className="text-[10px] font-bold">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

const FloatingAIButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 h-14 w-14 md:h-16 md:w-16 bg-gradient-to-tr from-brand-primary-dark to-brand-secondary rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-300 hover:scale-110 hover:-rotate-3 transition-all duration-300 animate-float">
      <SparklesIcon className="h-7 w-7 md:h-8 md:w-8 text-white" />
    </button>
  );
};

const AIChatPopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{ role: 'model', content: `Xin chào! Tôi là trợ lý AI của OnLuyen. Tôi có thể giúp gì cho bạn hôm nay?` }]);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await getGenericTutorResponse(input);
      setMessages((prev) => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'model', content: "Xin lỗi, đã có lỗi xảy ra." }]);
    } finally { setIsLoading(false); }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:right-8 md:w-[400px] md:h-[600px] flex flex-col bg-white md:bg-white/90 md:backdrop-blur-2xl md:rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
      <div className="flex items-center p-5 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white">
        <RobotIcon className="h-6 w-6 mr-3" />
        <h2 className="font-bold">Trợ lý AI OnLuyen</h2>
        <button onClick={onClose} className="ml-auto p-2 hover:bg-white/20 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-white border text-slate-700'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white flex space-x-2">
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Hỏi bất cứ điều gì..." className="flex-1 px-4 py-2 bg-slate-100 rounded-xl outline-none" />
        <button type="submit" className="p-2 bg-brand-primary text-white rounded-xl"><PaperAirplaneIcon className="h-5 w-5" /></button>
      </form>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const { currentView, navigate } = useNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  
  useEffect(() => { setIsSidebarOpen(false); }, [currentView]);
  useEffect(() => {
    if (isLoading) return;
    if (user && (currentView === 'login' || currentView === 'admin-login')) {
      // Ưu tiên check role từ profile trước vì nó chính xác hơn metadata
      const isAdmin = profile?.role === 'admin' || (!profile && user.user_metadata?.role === 'admin');
      if (isAdmin) navigate('admin-dashboard');
      else navigate('home');
    }
    if (!user && !['login', 'admin-login', 'update-password'].includes(currentView)) navigate('login');
  }, [user, profile, isLoading, currentView, navigate]);

  const renderAuthenticatedView = () => {
    switch (currentView) {
      case 'home': return <HomePage />;
      case 'personalized-dashboard': return <PersonalizedDashboard />;
      case 'self-study': return <SelfStudyDashboard />;
      case 'teacher-dashboard': return <TeacherDashboard />;
      case 'lesson-planner': return <LessonPlanner />;
      case 'test-generator': return <TestGenerator />;
      case 'exam-manager': return <ExamManager />; 
      case 'exam-results-viewer': return <ExamResultsViewer />;
      case 'admin-dashboard': return <AdminDashboard />;
      case 'ai-tutor': case 'ai-subjects': return <AITutorFlow />;
      case 'lecture-subjects': case 'lecture-grades': case 'lecture-video': return <LecturesFlow />;
      case 'laboratory-categories': case 'laboratory-subcategories': case 'laboratory-list': case 'laboratory-simulation': return <LaboratoryFlow />;
      case 'test-subjects': case 'test-grades': case 'test-types': case 'quiz-view': return <TestsFlow />;
      case 'mock-exam-subjects': case 'mock-exam-grades': case 'mock-exam-view': return <MockExamsFlow />;
      case 'self-practice-subjects': case 'self-practice-grades': case 'self-practice-lessons': case 'practice-view': return <SelfPracticeFlow />;
      default: return <HomePage />;
    }
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner text="Khởi động hệ thống..." /></div>;
  if (!user) {
    if (currentView === 'update-password') return <UpdatePasswordView onPasswordUpdated={() => navigate('home')} />;
    if (currentView === 'admin-login') return <AdminLoginView onLoginSuccess={() => {}} />;
    return <LoginView onLoginSuccess={() => {}} />;
  }
  
  // LOGIC ĐIỀU HƯỚNG QUAN TRỌNG:
  // 1. Lấy role và status. Ưu tiên profile (DB) hơn metadata (Auth).
  const role = profile?.role || user.user_metadata?.role;
  const status = profile?.status || (role === 'teacher' ? 'pending' : 'active');
  
  // 2. Chỉ hiện TeacherPendingView nếu:
  // - Role là Teacher VÀ Status là Pending
  // - VÀ QUAN TRỌNG: Role trong Profile KHÔNG phải là admin (đề phòng metadata sai)
  // - VÀ Profile KHÔNG phải là active (đề phòng metadata sai)
  if (role === 'teacher' && status === 'pending') {
      // Double check: Nếu profile đã load và xác nhận là admin hoặc active, thì bỏ qua pending view
      if (profile?.role === 'admin' || profile?.status === 'active') {
          // Cho phép render view bình thường
      } else {
          return <TeacherPendingView />;
      }
  }

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onOpenAboutModal={() => setIsAboutModalOpen(true)} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <MobileHeader onMenuOpen={() => setIsSidebarOpen(true)} />
        <main className={`flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 pb-24 md:pb-8`}>
          <div className="max-w-7xl mx-auto animate-scale-in">{renderAuthenticatedView()}</div>
        </main>
        <BottomNav />
        <FloatingAIButton onClick={() => setIsChatOpen(true)} />
        <AIChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      </div>
    </div>
  );
};

const App: React.FC = () => <AppContent />;
export default App;
