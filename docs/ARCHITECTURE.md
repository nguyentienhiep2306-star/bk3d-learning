# Architecture

## Frontend

- React + Vite + TypeScript.
- Tailwind CSS v4 qua `@tailwindcss/vite`.
- `react-router-dom` quản lý route.
- `src/features/auth/AuthProvider.tsx` duy trì session, profile, role và logout.
- `src/routes/ProtectedRoute.tsx` bảo vệ route học viên và route admin.
- `src/services/*` là lớp truy cập Supabase, tránh đặt query rải rác trong UI.

## Backend

Không có server riêng. Backend là Supabase:

- Supabase Auth cho email/password, reset password, session refresh.
- Supabase PostgreSQL cho courses, lessons, enrollments, progress, quiz.
- RLS là lớp bảo mật chính.
- RPC `submit_quiz_attempt` chấm quiz trong database để không lộ `is_correct`.

## Routes

- Public: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/courses`, `/courses/:courseId`.
- Student protected: `/learn/:lessonId`, `/quiz/:quizId`, `/my-learning`, `/profile`.
- Admin protected: `/admin`, `/admin/courses`, `/admin/users`, `/admin/enrollments`.

## Data Flow

1. User đăng nhập qua Supabase Auth.
2. Trigger `handle_new_user` tạo `profiles`.
3. Frontend tải profile để biết role.
4. Queries vẫn phải qua RLS, nên route guard chỉ là UX.
5. Student học bài khi có enrollment active.
6. Progress lưu bằng upsert unique `(user_id, lesson_id)`.
7. Quiz gửi answer IDs vào RPC, database tính điểm và lưu attempt.
