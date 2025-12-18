
# 📘 ONLUYEN AI TUTOR - HƯỚNG DẪN VẬN HÀNH

Hệ thống hiện tại sử dụng phương thức xác thực tập trung qua Email & Mật khẩu để đảm bảo quyền riêng tư và quản lý vai trò (Học sinh/Giáo viên) chặt chẽ.

### 1. Cấu hình xác thực (Authentication)
Tất cả dữ liệu người dùng được lưu trữ tại **Supabase**. Để hệ thống hoạt động:
- Đảm bảo đã điền đúng `SUPABASE_URL` và `SUPABASE_ANON_KEY` trong file `config.ts`.
- Trong Supabase Dashboard, vào mục **Authentication > Providers**, đảm bảo **Email** đã được bật (Enable).
- Bạn có thể tùy chỉnh mẫu Email xác nhận (Confirm Email) trong mục **Email Templates**.

### 2. Quản lý vai trò (Roles)
- **Học sinh**: Được truy cập ngay sau khi đăng ký và xác nhận email.
- **Giáo viên**: Sau khi đăng ký, tài khoản sẽ ở trạng thái `pending`. Quản trị viên (Admin) cần vào **Portal Quản trị** để phê duyệt (Active) trước khi giáo viên có thể sử dụng các công cụ soạn giáo án.

### 3. Tài khoản Quản trị (Admin)
- Admin có thể quản lý người dùng, khóa/mở khóa tài khoản và thay đổi vai trò.
- Truy cập vào nút "Portal Quản trị" ở dưới cùng trang đăng nhập.
