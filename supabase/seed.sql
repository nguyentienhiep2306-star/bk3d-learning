insert into public.courses (id, title, slug, description, thumbnail_url, status)
values ('00000000-0000-0000-0000-000000000101', 'Nhập môn thiết kế 3D BK3D', 'nhap-mon-thiet-ke-3d-bk3d', 'Khóa học mẫu để kiểm thử chương, bài học, video và quiz.', null, 'published')
on conflict (id) do nothing;

insert into public.course_sections (id, course_id, title, position)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Làm quen nền tảng', 1),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Thực hành mô hình hóa', 2)
on conflict (id) do nothing;

insert into public.lessons (id, section_id, course_id, title, description, youtube_video_id, duration_seconds, position, is_preview)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Tổng quan quy trình học', 'Giới thiệu lộ trình và cách theo dõi tiến độ.', 'dQw4w9WgXcQ', 210, 1, true),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Thiết lập công cụ', 'Chuẩn bị môi trường học 3D.', 'dQw4w9WgXcQ', 320, 2, false),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Dựng khối cơ bản', 'Thực hành dựng hình từ primitive.', 'dQw4w9WgXcQ', 480, 1, false),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Xuất file và kiểm tra', 'Kiểm tra mô hình trước khi nộp.', 'dQw4w9WgXcQ', 390, 2, false)
on conflict (id) do nothing;

insert into public.quizzes (id, course_id, lesson_id, title, passing_score)
values ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000304', 'Kiểm tra nhập môn BK3D', 70)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, position)
values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000401', 'Tiến độ khóa học được tính theo gì?', 1),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000401', 'Video bài giảng nên lưu trong database dưới dạng nào?', 2)
on conflict (id) do nothing;

insert into public.quiz_answers (question_id, answer_text, is_correct, position)
values
  ('00000000-0000-0000-0000-000000000501', 'Số bài hoàn thành chia cho tổng số bài', true, 1),
  ('00000000-0000-0000-0000-000000000501', 'Số lần đăng nhập', false, 2),
  ('00000000-0000-0000-0000-000000000501', 'Số khóa học đang published', false, 3),
  ('00000000-0000-0000-0000-000000000502', 'Chỉ lưu YouTube Video ID', true, 1),
  ('00000000-0000-0000-0000-000000000502', 'Lưu toàn bộ iframe HTML', false, 2),
  ('00000000-0000-0000-0000-000000000502', 'Lưu service role key kèm URL', false, 3);
