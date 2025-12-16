
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { AcademicCapIcon, RocketLaunchIcon, ChatBubbleBottomCenterTextIcon, PencilSquareIcon, DocumentTextIcon, ClockIcon, KeyIcon } from '../icons';
import FeatureCard from '../common/FeatureCard';

const HomePage: React.FC = () => {
    const { user, profile } = useAuth();
    const { navigate } = useNavigation();

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'bạn';
    // Use profile role if available, else metadata
    const isTeacher = (profile?.role || user?.user_metadata?.role) === 'teacher';
    const isAdmin = profile?.role === 'admin';
    const isPending = profile?.status === 'pending';

    return (
        <div className="animate-slide-up">
            {/* Modern Header Section */}
            <div className="mb-10">
                <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight">
                    Xin chào, <span className="text-brand-primary">{userName}</span> 👋
                </h1>
                <p className="mt-3 text-slate-500 text-lg max-w-2xl">
                    {isAdmin ? 'Hệ thống đang hoạt động ổn định. Chúc bạn một ngày làm việc hiệu quả.' : 
                     isTeacher ? 'Chào mừng trở lại. Hôm nay thầy/cô muốn chuẩn bị bài giảng nào?' : 
                     'Đừng quên hoàn thành mục tiêu học tập hôm nay nhé!'}
                </p>
                {isTeacher && isPending && (
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center text-amber-800 shadow-sm">
                        <ClockIcon className="h-6 w-6 mr-3 text-amber-600" />
                        <span className="font-medium">Tài khoản của thầy/cô đang chờ xét duyệt. Một số tính năng sẽ bị hạn chế.</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Admin Features */}
                {isAdmin && (
                    <FeatureCard 
                        icon={KeyIcon}
                        title="Quản trị hệ thống"
                        description="Quản lý người dùng, phân quyền và xét duyệt tài khoản giáo viên."
                        color="bg-red-500"
                        onClick={() => navigate('admin-dashboard')}
                    />
                )}

                {/* Student Features */}
                {!isTeacher && !isAdmin && (
                    <>
                        <FeatureCard 
                            icon={AcademicCapIcon}
                            title="Trung tâm Tự học"
                            description="Kho tài liệu bài giảng, bài tập tự luyện và đề thi phong phú."
                            color="bg-indigo-500"
                            onClick={() => navigate('self-study')}
                        />
                        <FeatureCard 
                            icon={RocketLaunchIcon}
                            title="Lộ trình của tôi"
                            description="Kế hoạch học tập cá nhân hóa do AI thiết kế riêng cho bạn."
                            color="bg-purple-500"
                            onClick={() => navigate('personalized-dashboard')}
                        />
                    </>
                )}

                {/* Teacher Features */}
                {isTeacher && (
                    <>
                         <FeatureCard 
                            icon={PencilSquareIcon}
                            title="Công cụ giảng dạy"
                            description="Bộ công cụ AI hỗ trợ soạn đề, chấm bài và quản lý lớp học."
                            color="bg-indigo-500"
                            onClick={() => navigate('teacher-dashboard')}
                        />
                        {!isPending && (
                            <FeatureCard 
                                icon={DocumentTextIcon}
                                title="Soạn giáo án"
                                description="Tạo kế hoạch bài dạy chuẩn công văn 5512 chỉ trong vài giây."
                                color="bg-pink-500"
                                onClick={() => navigate('lesson-planner')}
                            />
                        )}
                    </>
                )}

                 <FeatureCard 
                    icon={ChatBubbleBottomCenterTextIcon}
                    title={isTeacher ? "Trợ lý Chuyên môn" : "Gia sư AI"}
                    description={isTeacher ? "Tra cứu phương pháp giảng dạy và ý tưởng bài học mới." : "Giải đáp thắc mắc 24/7 với gia sư thông minh."}
                    color="bg-teal-500"
                    onClick={() => navigate('ai-subjects')}
                />
            </div>
        </div>
    );
};

export default HomePage;
