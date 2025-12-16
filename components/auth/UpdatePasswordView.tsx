import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { OnLuyenLogo } from '../icons';

interface UpdatePasswordViewProps {
  onPasswordUpdated: () => void;
}

const UpdatePasswordView: React.FC<UpdatePasswordViewProps> = ({ onPasswordUpdated }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        setIsSubmitting(false);
        return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Cập nhật mật khẩu thành công! Bạn sẽ được chuyển hướng ngay bây giờ.");
      setTimeout(() => {
        onPasswordUpdated();
      }, 2000);

    } catch (err: any) {
      setError(err.error_description || err.message || 'Không thể cập nhật mật khẩu. Liên kết có thể đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-brand-bg px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <OnLuyenLogo className="mx-auto h-20 w-auto" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Đặt lại mật khẩu của bạn
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
          <div>
            <input
              id="new-password" name="password" type="password" required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
              placeholder="Mật khẩu mới"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-blue-dark py-3 px-4 text-sm font-medium text-white hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-slate-400"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordView;
