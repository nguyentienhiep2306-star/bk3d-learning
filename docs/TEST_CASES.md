# Test Cases

## Commands

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

## Authentication

- Đăng ký email/password thành công.
- Trigger tạo record trong `profiles`.
- Đăng nhập đúng chuyển về route trước đó.
- Đăng nhập sai hiển thị lỗi tiếng Việt.
- Đăng xuất xóa session UI.
- Quên mật khẩu gửi email reset.
- Session hết hạn không làm trắng UI, app quay về login.
- Người chưa đăng nhập vào `/learn/:lessonId` bị chuyển `/login`.

## Authorization

- Student không vào được `/admin`.
- Student không đọc profile người khác.
- Student không insert/update enrollment.
- Student chưa có enrollment không đọc được lessons khóa học.
- Student nhập trực tiếp URL bài học không có quyền bị RLS chặn.
- Admin quản lý được course, section, lesson, quiz và enrollment.

## Learning

- Video iframe giữ tỷ lệ 16:9 trên 360, 390, 430, 768, 1024, 1440px.
- Admin dán được link YouTube dạng `watch`, `youtu.be`, `embed` hoặc Video ID trực tiếp.
- Admin thấy preview video hoặc lỗi rõ ràng khi link không hợp lệ.
- Hệ thống chỉ lưu `youtube_video_id`, không lưu iframe HTML.
- Đánh dấu hoàn thành tạo hoặc cập nhật một record `lesson_progress`.
- Bỏ hoàn thành cập nhật record cũ, không tạo trùng.
- Tiến độ = bài hoàn thành / tổng bài.
- Refresh trang tải lại tiến độ từ Supabase.
- Chuyển bài trước/sau đúng thứ tự `position`.

## Quiz

- Query quiz không trả `is_correct` cho browser student.
- Nộp đủ câu chấm điểm đúng.
- Nộp thiếu câu tính sai cho câu thiếu.
- Gửi answer ID không thuộc question bị bỏ qua, không được tính đúng.
- Student không update trực tiếp `quiz_attempts.score`.
- Lịch sử làm bài được lưu.

## Responsive/Admin

- Menu mobile mở/đóng được.
- Bảng học viên cuộn ngang trong card, không làm body overflow.
- Form khóa học và enrollment không tràn màn hình.
- Nút có chiều cao tối thiểu 44px cho touch.
