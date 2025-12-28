
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { supabase } from '../../services/supabaseClient'; 
import { ClockIcon, ArrowPathIcon } from '../icons'; 

const TeacherPendingView: React.FC = () => {
  const { signOut, user, refreshProfile, profile } = useAuth();
  const { navigate } = useNavigation();
  const [isChecking, setIsChecking] = useState(true);

  // Tự động kiểm tra trạng thái thực tế từ Server ngay khi component được render
  useEffect(() => {
      const verifyRealStatus = async () => {
          if (!user) return;
          
          // FAST TRACK: Nếu profile đã có trong context (từ cache) và đã active, chuyển ngay lập tức
          if (profile?.status === 'active' || profile?.role === 'admin') {
              navigate(profile.role === 'admin' ? 'admin-dashboard' : 'teacher-dashboard');
              return;
          }

          try {
              // Lấy dữ liệu mới nhất trực tiếp từ bảng profiles (bỏ qua cache local)
              const { data, error } = await supabase
                  .from('profiles')
                  .select('status, role')
                  .eq('id', user.id)
                  .single();

              if (!error && data) {
                  // ƯU TIÊN 1: Nếu là Admin -> Chuyển ngay sang trang Admin
                  if (data.role === 'admin') {
                      await refreshProfile();
                      navigate('admin-dashboard');
                      return;
                  }

                  // ƯU TIÊN 2: Nếu là Giáo viên đã Active -> Chuyển ngay sang trang Teacher
                  if (data.status === 'active') {
                      await refreshProfile();
                      navigate('teacher-dashboard');
                      return;
                  }
              }
          } catch (err) {
              console.error("Lỗi xác thực:", err);
          } finally {
              // Chỉ hiện giao diện chờ nếu thực sự chưa được duyệt
              setIsChecking(false);
          }
      };

      verifyRealStatus();
  }, [user, navigate, refreshProfile, profile]);

  if (isChecking) {
      // Hiển thị một màn hình trắng hoặc loading rất tối giản để tránh flicker
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              {/* Chỉ hiện spinner nếu chờ quá lâu, tránh nháy màn hình */}
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8" style={{ fontFamily: '"Times New Roman", serif', fontSize: '14pt' }}>
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center animate-scale-in">
            
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
                <ClockIcon className="h-10 w-10 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Tài khoản đang chờ duyệt
            </h2>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
                Xin chào <strong>{user?.email}</strong>,<br/>
                Yêu cầu đăng ký Giáo viên của bạn đang được xem xét. Vui lòng quay lại sau khi Quản trị viên phê duyệt.
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
