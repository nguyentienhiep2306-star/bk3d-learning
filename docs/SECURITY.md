# Security

## Nguyên tắc

- Không commit `.env`, mật khẩu, token hoặc service role key.
- Supabase anon key được phép ở frontend khi RLS đúng.
- Route guard frontend chỉ cải thiện UX, không thay thế RLS.
- Không render HTML tùy ý từ database.
- YouTube Unlisted không phải bảo mật tuyệt đối; enrollment và RLS mới là lớp kiểm soát truy cập.

## RLS

RLS bật cho toàn bộ bảng người dùng. Student chỉ đọc profile của mình, khóa học published đã có enrollment active, nội dung khóa học đã được cấp quyền, progress và attempt của chính mình.

Admin dùng helper `public.is_admin()` để quản lý course, section, lesson, quiz, enrollment và xem dữ liệu học viên.

## Quiz

Frontend chỉ select các cột `id`, `question_id`, `answer_text`, `position` từ `quiz_answers`. Migration revoke quyền select toàn bảng và chỉ grant quyền đọc các cột không nhạy cảm cho `authenticated`.

Chấm điểm qua RPC `submit_quiz_attempt(p_quiz_id, p_answers)`, có kiểm tra quyền khóa học, validate answer thuộc question/quiz và lưu lịch sử attempt.

## Manual Checklist

- Kiểm tra Git không có secret: `git grep -n "service_role\\|SUPABASE_SERVICE\\|password"`.
- Kiểm tra `.env` nằm trong `.gitignore`.
- Kiểm tra Supabase Auth redirect URL đúng production.
- Kiểm tra user student không tự insert enrollment.
- Kiểm tra user student không tự update được `role` hoặc `is_active`.
- Kiểm tra student không select được `quiz_answers.is_correct`.
