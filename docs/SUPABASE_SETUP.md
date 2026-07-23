# Supabase Setup

## 1. Tạo project

Tạo project Supabase, lưu lại Project URL và anon public key.

## 2. Chạy migration

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Migration tạo:

- Enum: `user_role`, `course_status`, `enrollment_status`.
- Bảng: `profiles`, `courses`, `course_sections`, `lessons`, `enrollments`, `lesson_progress`, `quizzes`, `quiz_questions`, `quiz_answers`, `quiz_attempts`, `quiz_attempt_answers`.
- Trigger sync `auth.users` sang `profiles`.
- Helper: `is_admin`, `has_active_enrollment`, `can_read_course`.
- RPC: `submit_quiz_attempt`.
- RLS policy cho toàn bộ bảng dữ liệu người dùng.

## 3. Chạy seed

```bash
supabase db seed
```

Seed không tạo user hoặc mật khẩu. Tạo user qua `/register`, sau đó nâng quyền:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin@email.com';
```

## 4. Auth Redirect URLs

Thêm trong Supabase Auth URL Configuration:

```text
http://localhost:5173
http://localhost:5173/**
https://bk3d.io.vn
https://bk3d.io.vn/**
```

Với Cloudflare preview, thêm domain dạng `https://<preview>.pages.dev/**` cho môi trường test.

## 5. Environment Variables

Frontend chỉ dùng:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_URL
```

Service role key chỉ dùng trong môi trường server/admin nội bộ, tuyệt đối không đưa vào browser.
