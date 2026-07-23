# BK3D Learning Platform

Website học trực tuyến cho `https://bk3d.io.vn`, dùng React + Vite + TypeScript + Tailwind CSS ở frontend, Supabase Auth/PostgreSQL/RLS ở backend và Cloudflare Pages để host.

## Tính năng

- Đăng ký, đăng nhập, đăng xuất, quên mật khẩu và đặt lại mật khẩu bằng Supabase Auth.
- Role `admin` và `student`, route guard ở frontend và kiểm soát dữ liệu bằng RLS.
- Quản lý khóa học, chương, bài học, link YouTube Unlisted hoặc Video ID, học viên và enrollment.
- Học bài với video responsive, danh sách chương, bài trước/sau, đánh dấu hoàn thành và tiến độ.
- Quiz trắc nghiệm nộp qua RPC `submit_quiz_attempt`, không tải cột `is_correct` xuống browser.
- Responsive cho desktop và mobile, bảng admin có vùng cuộn ngang kiểm soát.

## Cài đặt local

```bash
npm install
cp .env.example .env
npm run dev
```

Cấu hình `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_APP_URL=http://localhost:5173
```

Supabase URL và anon key có thể dùng ở frontend khi RLS được cấu hình đúng. Không đưa Service Role Key vào frontend, repo hoặc Cloudflare Pages public logs.

## Database

Migration nằm tại `supabase/migrations/202607230001_init_bk3d_learning.sql`.

Chạy migration và seed bằng Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase db seed
```

Seed data tạo một khóa mẫu, hai chương, bốn bài học và một quiz. Seed không tạo tài khoản admin cố định. Sau khi tạo tài khoản qua UI, nâng quyền admin bằng SQL trong Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL=https://bk3d.io.vn`
- SPA refresh được xử lý bằng `public/_redirects`.
- Thêm custom domain `bk3d.io.vn`, bật HTTPS và cấu hình redirect `www.bk3d.io.vn` nếu dùng www.

Chi tiết xem `docs/`.

## Lưu ý YouTube Unlisted

Admin có thể dán link `watch`, `youtu.be`, `embed` hoặc Video ID trực tiếp. Frontend chuẩn hóa và chỉ lưu `youtube_video_id`, sau đó render iframe nhúng an toàn. YouTube Unlisted không phải DRM; bảo mật nội dung chính nằm ở enrollment, RLS và việc không render bài học khi người dùng không có quyền.
