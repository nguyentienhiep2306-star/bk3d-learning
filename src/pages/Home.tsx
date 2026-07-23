import { ArrowRight, Briefcase, Clock, ExternalLink, GraduationCap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../features/siteSettings/siteSettingsContext'
import { DEFAULT_HOMEPAGE } from '../features/siteSettings/siteSettingsContext'
import { Button, Card } from '../components/ui'

type BenefitItem = {
  icon: LucideIcon
  title: string
  description: string
}

type ModuleItem = {
  title: string
  description: string
  gradient: string
  icon: string
}

type ProjectItem = {
  title: string
  description: string
  gradient: string
}

const benefits: BenefitItem[] = [
  {
    icon: GraduationCap,
    title: 'Bam Sat Do An Tot Nghiep',
    description: 'Ho tro len y tuong, tinh toan thiet ke chi tiet may, he thong truyen dong va xuat ban ve lap rap chuan hoc thuat.',
  },
  {
    icon: Briefcase,
    title: 'Ky Nang Chuan Doanh Nghiep',
    description: 'Nam vung dung sai, yeu cau gia cong thuc te va quy trinh thiet ke ung dung truc tiep tai cac cong ty tu dong hoa.',
  },
  {
    icon: Clock,
    title: 'Hoc Thuc Chien, Toi Uu',
    description: 'He thong bai giang truc quan, mo phong du an that. Theo doi tien do de bu dap lo hong kien thuc nhanh chong.',
  },
]

const trainingModules: ModuleItem[] = [
  {
    title: 'Thiet ke ket cau & Weldments',
    description: 'Ung dung ve khung gia do, he thong ga han, boc tach vat tu thep hinh.',
    gradient: 'from-[#0f6f64] to-[#0b5c53]',
    icon: '🔧',
  },
  {
    title: 'Mo phong dong hoc Robot',
    description: 'Tinh toan khong gian lam viec va quy dao canh tay robot SCARA, he thong tay don.',
    gradient: 'from-[#1a4a7a] to-[#0d3559]',
    icon: '🤖',
  },
  {
    title: 'Thiet ke chi tiet may & Truyen dong',
    description: 'Lua chon o bi, tinh toan khe ho an khop banh rang, truc vit, thanh rang.',
    gradient: 'from-[#7a4a1a] to-[#59350d]',
    icon: '⚙️',
  },
]

const projects: ProjectItem[] = [
  { title: 'May cap day han tu dong', description: 'He thong cap day han FH-2000 cho day chuyen san xuat', gradient: 'from-slate-800 to-slate-600' },
  { title: 'Cum nang ha thuy luc', description: 'He thong nang ha 5 tan su dung xi lanh thuy luc', gradient: 'from-slate-700 to-slate-500' },
  { title: 'Bang tai phan loai san pham', description: 'He thong bang tai phan loai theo kich thuoc & trong luong', gradient: 'from-slate-900 to-slate-700' },
  { title: 'Gia cong chi tiet banh rang', description: 'Bo truyen banh rang tru rang thang cap chinh xac 6', gradient: 'from-slate-800 to-slate-500' },
]

export function Home() {
  const { homepageContent } = useSiteSettings()
  const content = homepageContent ?? DEFAULT_HOMEPAGE

  return (
    <div className="space-y-16 pb-16">
      {/* === HERO SECTION === */}
      <section className="grid items-center gap-8 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {content.eyebrow ? (
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f6f64]">{content.eyebrow}</p>
          ) : null}
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-[#172033] sm:text-5xl">{content.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-[#4d6378]">{content.subtitle}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/courses">
              <Button>
                <ArrowRight size={18} /> Kham pha lo trinh hoc
              </Button>
            </Link>
            <a
              href="#"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#0f6f64] px-4 py-2 text-sm font-semibold text-[#0f6f64] transition hover:bg-[#e0f2ef]"
            >
              Tu van do an
            </a>
          </div>
        </div>
        <div className="rounded-lg border border-[#d9e2ea] bg-gradient-to-br from-[#0f6f64] to-[#0b5c53] p-6 shadow-sm">
          <div className="aspect-video rounded-md bg-[#172033]/30 p-5 text-white backdrop-blur">
            <div className="flex h-full flex-col justify-between">
              <GraduationCap size={40} />
              <div>
                <p className="text-sm text-[#b8d9d4]">BK3D Academy</p>
                <h2 className="mt-2 text-2xl font-bold">Thiet ke & Che tao</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === 3 GIA TRI COT LOI === */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-[#172033] sm:text-3xl">
          Gia Tri Cot Loi
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e0f2ef]">
                  <Icon className="text-[#0f6f64]" size={28} />
                </div>
                <h3 className="text-lg font-bold text-[#172033]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4d6378]">{item.description}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* === CAC MODULE DAO TAO NOI BAT === */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#172033] sm:text-3xl">Cac Module Dao Tao Noi Bat</h2>
          <p className="mt-2 text-[#4d6378]">Chuong trinh dao tao thuc chien, ap dung ngay vao cong viec</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {trainingModules.map((mod) => (
            <div
              key={mod.title}
              className="group relative overflow-hidden rounded-lg border border-[#d9e2ea] bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={"bg-gradient-to-br " + mod.gradient + " p-6 text-white"}>
                <span className="text-3xl">{mod.icon}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#172033]">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4d6378]">{mod.description}</p>
                <Link
                  to="/courses"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0f6f64] hover:underline"
                >
                  Tim hieu them <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === DU AN THUC TE === */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#172033] sm:text-3xl">Du An Thuc Te</h2>
          <p className="mt-2 text-[#4d6378]">San pham tu cac khoa hoc va du an tot nghiep cua hoc vien</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((p) => (
            <div
              key={p.title}
              className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#d9e2ea] bg-white shadow-sm"
            >
              <div className={"flex aspect-[4/3] items-end bg-gradient-to-br " + p.gradient + " p-5 transition duration-300 group-hover:scale-105"}>
                <div className="translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{p.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
                    <ExternalLink size={12} /> Xem chi tiet
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
