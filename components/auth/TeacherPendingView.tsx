
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { supabase } from '../../services/supabaseClient'; 
import { ClockIcon, ArrowPathIcon } from '../icons'; 

const TeacherPendingView: React.FC = () => {
  const { signOut, user, refreshProfile, profile } = useAuth();
  const { navigate } = useNavigation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
      let isMounted = true;

      const verifyRealStatus = async () => {
          if (!user) return;
          
          // 1. FAST CHECK: Kiểm tra ngay trong cache/context
          // Nếu là Admin hoặc Giáo viên Active -> Đi luôn, không cần hỏi server
          if (profile?.status === 'active' || profile?.role === 'admin') {
              navigate(profile.role === 'admin' ? 'admin-dashboard' : 'teacher-dashboard');
              return;
          }

          // 2. SERVER CHECK: Nếu cache vẫn là pending, hỏi lại server một lần nữa cho chắc
          // (Trường hợp Admin vừa duyệt xong bên kia, user F5 bên này)
          try {
              const { data, error } = await supabase
                  .from('profiles')
                  .select('status, role')
                  .eq('id', user.id)
                  .single();

              if (!error && data && isMounted) {
                  // Nếu server bảo OK -> Cập nhật cache -> Đi luôn
                  if (data.role === 'admin') {
                      await refreshProfile();
                      navigate('admin-dashboard');
                      return;
                  }
                  if (data.status === 'active') {
                      await refreshProfile();
                      navigate('teacher-dashboard');
                      return;
                  }
              }
          } catch (err) {
              console.error("Lỗi xác thực:", err);
          } finally {
              if (isMounted) setIsChecking(false);
          }
      };

      verifyRealStatus();
      
      return () => { isMounted = false; };
  }, [user, navigate, refreshProfile, profile]);

  // Nếu đang check (thường là rất nhanh do fast check), trả về null để không nháy giao diện
  // Hoặc trả về khung skeleton nhẹ nhàng nếu muốn
  if (isChecking) {
      return null; 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8 animate-fade-in" style={{ fontFamily: '"Times New Roman", serif', fontSize: '14pt' }}>
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center">
            
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
                <ClockIcon className="h-10 w-10 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Tài khoản đang chờ duyệt
            </h2>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
                Xin chào <strong>{user?.email}</strong>,<br/>
                Yêu cầu đăng ký của bạn đang được Ban Quản Trị xem xét.
                <br/><span className="text-sm text-slate-400 mt-2 block">(Vui lòng liên hệ Admin nếu bạn cần duyệt gấp)</span>
            </p>

            <div className="flex flex-col gap-3 justify-center">
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Kiểm tra lại trạng thái
                </button>
                
                <button
                    onClick={signOut}
                    className="inline-flex items-center justify-center px-6 py-3 text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold"
                >
                    Đăng xuất
                </button>
            </div>
      </div>
    </div>
  );
};

export default TeacherPendingView;
