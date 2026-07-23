import { ArrowRight, CheckCircle2, ShieldCheck, Video } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
 import { useSiteSettings } from '../features/siteSettings/siteSettingsContext'
 import { DEFAULT_HOMEPAGE } from '../features/siteSettings/siteSettingsContext'
import { Button, Card } from '../components/ui'

export function Home() {
  const { homepageContent } = useSiteSettings()
  const content = homepageContent ?? DEFAULT_HOMEPAGE

  const benefits: Array<[string, string, LucideIcon]> = [
    ['Phân quyền thật', 'RLS Supabase kiểm soát dữ liệu admin và học viên.', ShieldCheck],
    ['Theo dõi tiến độ', 'Lưu trạng thái hoàn thành và vị trí học gần nhất.', CheckCircle2],
    ['Responsive', 'Menu, video và form quản trị dùng tốt trên mobile.', Video],
  ]

  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
           {content.eyebrow ? (
             <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f6f64]">{content.eyebrow}</p>
           ) : null}
           <h1 className="max-w-3xl text-4xl font-bold leading-tight text-[#172033] sm:text-5xl">{content.title}</h1>
           <p className="mt-5 max-w-2xl text-lg text-[#4d6378]">{content.subtitle}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/courses"><Button><ArrowRight size={18} /> Xem khóa học</Button></Link>
            <Link to="/login"><Button variant="secondary">Đăng nhập</Button></Link>
          </div>
        </div>
        <div className="rounded-lg border border-[#d9e2ea] bg-white p-6 shadow-sm">
          <div className="aspect-video rounded-md bg-[#172033] p-5 text-white">
            <div className="flex h-full flex-col justify-between">
              <Video size={40} />
              <div>
                <p className="text-sm text-[#b8d9d4]">BK3D Academy</p>
                <h2 className="mt-2 text-2xl font-bold">Video, quiz, progress</h2>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {benefits.map(([title, body, Icon]) => (
          <Card key={String(title)}>
            <Icon className="mb-4 text-[#0f6f64]" size={28} />
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm text-[#4d6378]">{body}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}
