
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

// --- Mobile Top Header ---
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
            <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>
    );
};

// --- Mobile Bottom Navigation ---
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
                        currentView === item.view || (item.view === 'self-study' && !['home', 'personalized-dashboard'].includes(currentView))
                        ? 'text-brand-primary' 
                        : 'text-slate-400'
                    }`}
                >
                    <item.icon className="h-6 w-6 mb-1" />
                    <span className="text-[10px] font-bold">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

// --- Floating AI Button Component ---
const FloatingAIButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 h-14 w-14 md:h-16 md:w-16 bg-gradient-to-tr from-brand-primary-dark to-brand-secondary rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-300 hover:scale-110 hover:-rotate-3 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 animate-float"
      aria-label="Mở Trợ lý AI"
    >
      <SparklesIcon className="h-7 w-7 md:h-8 md:w-8 text-white" />
    </button>
  );
};

// --- AI Chat Popup Component ---
const AIChatPopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        if (messages.length === 0) {
            setMessages([{
                role: 'model',
                content: `Xin chào! Tôi là trợ lý AI của OnLuyen. Tôi có thể giúp gì cho bạn hôm nay?`
            }]);
        }
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await getGenericTutorResponse(currentInput);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
       const modelMessage: ChatMessage = { role: 'model', content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." };
      setMessages((prev) => [...prev, modelMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:right-8 md:w-[400px] md:h-[600px] flex flex-col bg-white md:bg-white/90 md:backdrop-blur-2xl md:rounded-3xl shadow-2xl md:border md:border-white/50 transition-all duration-300 ease-in-out transform origin-bottom-right animate-scale-in overflow-hidden">
      <div className="flex items-center p-5 bg-gradient-to-r from-brand-primary to-brand-primary-dark rounded-t-none md:rounded-t-3xl flex-shrink-0">
        <div className="bg-white/20 p-2 rounded-xl">
            <RobotIcon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-3">
            <h2 className="text-lg font-display font-bold text-white">Trợ lý AI OnLuyen</h2>
            <p className="text-indigo-100 text-xs flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Sẵn sàng hỗ trợ
            </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 scroll-smooth">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-brand-primary text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 pb-safe-area-inset">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi bất cứ điều gì..."
            className="flex-1 w-full pl-5 pr-12 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/50 text-slate-700 placeholder-slate-400 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-brand-primary rounded-xl text-white hover:bg-brand-primary-dark disabled:opacity-50 disabled:bg-slate-300 transition-all hover:scale-105"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Main App Component ---
const AppContent: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const { currentView, navigate } = useNavigation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Close sidebar on view change
  useEffect(() => {
      setIsSidebarOpen(false);
  }, [currentView]);

  // Listen for Password Recovery
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDescription = params.get('error_description');
        if (errorDescription) {
            setAuthError(errorDescription.replace(/\+/g, ' '));
            navigate('login');
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('update-password');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Strict Redirect Logic
  useEffect(() => {
    if (isLoading) return;
    const isRecovery = window.location.hash.includes('type=recovery');
    if (user && (currentView === 'login' || currentView === 'admin-login') && !isRecovery) {
      const isAdmin = profile?.role === 'admin' || user.user_metadata?.role === 'admin';
      if (isAdmin) navigate('admin-dashboard');
      else navigate('home');
    }
    if (!user && currentView !== 'login' && currentView !== 'admin-login' && currentView !== 'update-password') {
       navigate('login');
    }
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
      case 'admin-dashboard': return <AdminDashboard />;
      case 'ai-tutor':
      case 'ai-subjects': return <AITutorFlow />;
      case 'lecture-subjects':
      case 'lecture-grades':
      case 'lecture-video': return <LecturesFlow />;
      case 'laboratory-categories':
      case 'laboratory-subcategories':
      case 'laboratory-list':
      case 'laboratory-simulation': return <LaboratoryFlow />;
      case 'test-subjects':
      case 'test-grades':
      case 'test-types':
      case 'quiz-view': return <TestsFlow />;
      case 'mock-exam-subjects':
      case 'mock-exam-grades':
      case 'mock-exam-view': return <MockExamsFlow />;
      case 'self-practice-subjects':
      case 'self-practice-grades':
      case 'self-practice-lessons':
      case 'practice-view': return <SelfPracticeFlow />;
      default: return <HomePage />;
    }
  };

  if (isLoading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
            <LoadingSpinner text="Đang tải dữ liệu..." />
        </div>
    );
  }

  if (!user) {
    if (currentView === 'update-password') return <UpdatePasswordView onPasswordUpdated={() => navigate('home')} />;
    if (currentView === 'admin-login') return <AdminLoginView onLoginSuccess={() => {}} />;
    return (
        <div className="bg-brand-bg min-h-screen">
            {authError && (
                <div className="fixed top-0 left-0 w-full bg-red-100 border-b border-red-200 text-red-700 px-4 py-3 z-[100] text-center shadow-md">
                    <p className="text-sm font-bold">{authError}</p>
                    <button onClick={() => setAuthError(null)} className="absolute top-2 right-2">✕</button>
                </div>
            )}
            <LoginView onLoginSuccess={() => {}} />
        </div>
    );
  }

  if (currentView === 'login' || currentView === 'admin-login') {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
              <LoadingSpinner text="Đang vào hệ thống..." />
          </div>
      );
  }

  const role = profile?.role || user.user_metadata?.role;
  const status = profile?.status || (role === 'teacher' ? 'pending' : 'active');
  if (role === 'teacher' && status === 'pending') return <TeacherPendingView />;

  const isLectureView = currentView === 'lecture-video';

  return (
    <div className="flex h-screen w-full font-sans bg-transparent overflow-hidden">
      {/* Sidebar for Desktop & Mobile Overlay */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenAboutModal={() => setIsAboutModalOpen(true)} 
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header (Visible only on small screens) */}
        {!isLectureView && <MobileHeader onMenuOpen={() => setIsSidebarOpen(true)} />}

        <main className={`flex-1 overflow-y-auto custom-scrollbar ${isLectureView ? 'p-0' : 'p-4 sm:p-6 lg:p-8 pb-24 md:pb-8'}`}>
          <div className={`${isLectureView ? '' : 'max-w-7xl mx-auto'} animate-scale-in`}>
             {renderAuthenticatedView()}
          </div>
        </main>
        
        {/* Navigation Elements */}
        {!isLectureView && <BottomNav />}
        <FloatingAIButton onClick={() => setIsChatOpen(true)} />
        <AIChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
