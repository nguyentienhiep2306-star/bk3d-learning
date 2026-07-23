import { ArrowRight, BookOpen, Clock, Cpu, GraduationCap, Monitor, PenTool, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../features/siteSettings/siteSettingsContext'
import { DEFAULT_HOMEPAGE } from '../features/siteSettings/siteSettingsContext'
import { Button, Card } from '../components/ui'

const values = [
  { icon: GraduationCap, title: 'Bám sát đồ án tốt nghiệp', desc: 'Hỗ trợ lên ý tưởng, tính toán thiết kế chi tiết máy, hệ thống truyền động và xuất bản vẽ lắp ráp chuẩn học thuật.' },
  { icon: Trophy, title: 'Kỹ năng chuẩn doanh nghiệp', desc: 'Nắm vững dung sai, yêu cầu gia công thực tế và quy trình thiết kế ứng dụng trực tiếp tại các công ty tự động hóa.' },
  { icon: Clock, title: 'Học thực chiến, dễ áp dụng', desc: 'Hệ thống bài giảng trực quan, mô phỏng dự án thật. Theo dõi tiến độ để bù đắp lỗ hổng kiến thức nhanh chóng.' },
]

const modules = [
  { icon: PenTool, title: 'Thiết kế kết cấu và Weldments', desc: 'Ứng dụng vẽ khung giá đỡ, hệ thống gá hàn, bóc tách vật tư thép hình.' },
  { icon: Cpu, title: 'Mô phỏng động học robot', desc: 'Tính toán không gian làm việc và quỹ đạo cánh tay robot SCARA, hệ thống tay đòn.' },
  { icon: Monitor, title: 'Thiết kế chi tiết máy và truyền động', desc: 'Lựa chọn ổ bi, tính toán khe hở ăn khớp bánh răng, trục vít, thanh răng.' },
]

const projects = [
  { name: 'Máy cấp dây hàn tự động', skill: 'Weldments & Kết cấu', desc: 'Hệ thống cấp dây hàn FH-2000 cho dây chuyền sản xuất' },
  { name: 'Cụm nâng hạ thủy lực', skill: 'Chi tiết máy & Truyền động', desc: 'Hệ thống nâng hạ 5 tấn sử dụng xi lanh thủy lực' },
  { name: 'Băng tải phân loại sản phẩm', skill: 'Kết cấu & Tự động hóa', desc: 'Băng tải phân loại theo kích thước và trọng lượng' },
]

export function Home() {
  const { homepageContent } = useSiteSettings()
  const hc = homepageContent ?? DEFAULT_HOMEPAGE
  const heroImageUrl = hc.hero_image_url || null
  const heroImageAlt = hc.hero_image_alt || 'Học SolidWorks theo dự án thực tế'
  const heroImagePos = hc.hero_image_position || 'center'
  const eyebrow = hc.eyebrow || ''
  const heroTitle = hc.title || 'Làm chủ SolidWorks – Tự tin hoàn thiện đồ án và sẵn sàng cho công việc thực tế'
  const heroSubtitle = hc.subtitle || 'Lộ trình học chuyên sâu dành cho sinh viên và kỹ sư cơ khí.'

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden py-14 lg:py-16">
        <div className="bg-grid-pattern pointer-events-none absolute inset-0" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {eyebrow ? (
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-brand">{eyebrow}</p>
            ) : null}
            <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.01em] text-[#111827]">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#475569]">
              {heroSubtitle}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses">
                <Button className="min-h-[44px] px-5 text-[14px]">
                  Khám phá lộ trình học <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary" className="min-h-[44px] px-5 text-[14px]">
                  Xem các khóa học
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero image card */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="aspect-[4/3] bg-gradient-to-br from-technical to-slate-700">
                <img
                  src={heroImageUrl || '/hero.png'}
                  alt={heroImageAlt}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: heroImagePos === 'center' ? 'center' :
                                   heroImagePos === 'top' ? 'top' :
                                   heroImagePos === 'bottom' ? 'bottom' :
                                   heroImagePos === 'left' ? 'left' :
                                   heroImagePos === 'right' ? 'right' : 'center'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/hero.png'
                    e.currentTarget.style.objectPosition = 'center'
                  }}
                />
              </div>
              <div className="border-t border-border bg-surface px-4 py-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] text-[#475569]">
                  <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-brand" /> Học trực tuyến trên website</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand" /> Chủ động thời gian</span>
                  <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-brand" /> Theo dõi tiến độ</span>
                  <span className="flex items-center gap-1.5"><PenTool size={14} className="text-brand" /> Thực hành theo đồ án</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GIÁ TRỊ CỐT LÕI ===== */}
      <section className="py-14 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#111827]">Giá trị cốt lõi</h2>
          <p className="mt-2 text-[15px] text-[#475569]">Nền tảng được xây dựng để giúp bạn đạt kết quả tốt nhất</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v) => {
            const Icon = v.icon
            return (
              <Card key={v.title} className="group transition hover:-translate-y-[2px] hover:border-brand-border motion-reduce:transition-none motion-reduce:hover:translate-y-0 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface">
                  <Icon size={18} className="text-brand" strokeWidth={1.75} />
                </div>
                <h3 className="text-[16px] font-bold text-[#111827]">{v.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#475569]">{v.desc}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ===== MÔ-ĐUN ĐÀO TẠO ===== */}
      <section className="py-14 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#111827]">Các mô-đun đào tạo nổi bật</h2>
          <p className="mt-2 text-[15px] text-[#475569]">Chương trình đào tạo thực chiến, áp dụng ngay vào công việc</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {modules.map((m) => {
            const Icon = m.icon
            return (
              <Card key={m.title} className="group flex flex-col transition hover:-translate-y-[2px] hover:border-brand-border motion-reduce:transition-none motion-reduce:hover:translate-y-0 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface">
                  <Icon size={18} className="text-brand" strokeWidth={1.75} />
                </div>
                <h3 className="text-[16px] font-bold text-[#111827]">{m.title}</h3>
                <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-[#475569] line-clamp-3">{m.desc}</p>
                <Link to="/courses" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline">
                  Tìm hiểu thêm <ArrowRight size={14} />
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ===== DỰ ÁN THỰC TẾ ===== */}
      <section className="py-14 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#111827]">Dự án thực tế</h2>
          <p className="mt-2 text-[15px] text-[#475569]">Sản phẩm từ các khóa học và đồ án tốt nghiệp của học viên</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {projects.map((p) => (
            <div key={p.name} className="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:shadow-md">
              <div className="flex aspect-[4/3] items-end bg-gradient-to-br from-technical to-slate-600 p-5">
                <div>
                  <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/90">{p.skill}</span>
                  <h3 className="mt-2 text-[15px] font-bold text-white">{p.name}</h3>
                  <p className="mt-1 text-[12px] text-white/75">{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA CUỐI TRANG ===== */}
      <section className="py-14 lg:py-16">
        <div className="rounded-2xl bg-gradient-to-r from-brand to-brand-hover p-10 text-center text-white sm:p-14">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold">Bắt đầu lộ trình học kỹ thuật thực chiến</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-white/85">
            Khám phá các khóa học SolidWorks và thiết kế cơ khí được xây dựng theo dự án thực tế.
          </p>
          <Link to="/courses">
            <Button className="mt-6 min-h-[44px] bg-white px-6 text-[14px] font-bold text-brand hover:bg-brand-soft">
              Xem các khóa học <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
