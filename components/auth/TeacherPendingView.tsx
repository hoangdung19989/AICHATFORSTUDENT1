
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient'; 
import { ClockIcon, ArrowPathIcon } from '../icons'; 

const TeacherPendingView: React.FC = () => {
  const { signOut, user, refreshProfile, profile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
      if (!user) return;
      setIsChecking(true);
      setStatusMessage(null);
      
      try {
          // 1. Gửi request trực tiếp lên Supabase (Bỏ qua mọi cache)
          const { data, error } = await supabase
              .from('profiles')
              .select('status, role')
              .eq('id', user.id)
              .single();

          if (error) throw error;

          // 2. Kiểm tra điều kiện
          const isActive = data?.status === 'active';
          const isAdmin = data?.role === 'admin';

          if (isActive || isAdmin) {
              setStatusMessage("✅ Tài khoản đã được duyệt! Đang vào hệ thống...");
              await refreshProfile();
              // Force reload để xóa sạch bộ nhớ đệm và chuyển hướng
              setTimeout(() => window.location.reload(), 1000);
          } else {
              setStatusMessage("⚠️ Tài khoản vẫn đang chờ duyệt. Vui lòng quay lại sau.");
          }
          
      } catch (error: any) {
          console.error("Lỗi kiểm tra trạng thái:", error);
          setStatusMessage("❌ Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      } finally {
          setIsChecking(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-yellow-200 p-8 text-center">
            
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
                <ClockIcon className="h-10 w-10 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Tài khoản đang chờ xét duyệt
            </h2>
            
            <p className="text-slate-600 mb-6">
                Xin chào <strong>{profile?.full_name || user?.email}</strong>,<br/>
                Yêu cầu đăng ký tài khoản Giáo viên của bạn đã được ghi nhận. Vui lòng đợi Ban quản trị kích hoạt.
            </p>

            {statusMessage && (
                <div className={`mb-6 p-3 rounded-lg font-medium text-sm break-words transition-all ${
                    statusMessage.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : 
                    statusMessage.includes("❌") ? "bg-red-50 text-red-700 border border-red-200" :
                    "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                    {statusMessage}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors shadow-sm disabled:opacity-70"
                >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                    {isChecking ? 'Đang kiểm tra...' : 'Cập nhật trạng thái'}
                </button>
                <button
                    onClick={signOut}
                    className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                    Đăng xuất
                </button>
            </div>
      </div>
    </div>
  );
};

export default TeacherPendingView;
