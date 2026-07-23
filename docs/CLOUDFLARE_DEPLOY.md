# Cloudflare Pages Deploy

## Build Settings

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node version: dùng mặc định hiện đại của Cloudflare hoặc đặt `NODE_VERSION=24`.

## Environment Variables

Production:

```text
VITE_SUPABASE_URL=<supabase project url>
VITE_SUPABASE_ANON_KEY=<supabase anon key>
VITE_APP_URL=https://bk3d.io.vn
```

## SPA Routing

File `public/_redirects` chứa:

```text
/* /index.html 200
```

Cloudflare Pages sẽ phục vụ `index.html` khi refresh trực tiếp `/learn/:lessonId`, `/admin/*`, v.v.

## Domain

1. Kết nối GitHub repository với Cloudflare Pages.
2. Chọn branch production.
3. Cấu hình build command và output directory.
4. Thêm environment variables.
5. Thêm custom domain `bk3d.io.vn`.
6. Kiểm tra HTTPS active.
7. Nếu dùng `www.bk3d.io.vn`, cấu hình redirect sang `bk3d.io.vn`.
