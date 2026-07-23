import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Clock, Cpu, GraduationCap, Monitor, PenTool, Send, Trophy } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../features/siteSettings/siteSettingsContext'
import { DEFAULT_HOMEPAGE } from '../features/siteSettings/siteSettingsContext'
import { listPublishedProjects, type HomepageProject } from '../services/homepageProjects'
import { submitRegistration } from '../services/registrationLeads'
import { Alert, Button, Card, Input, Select, Textarea } from '../components/ui'

const values = [
  { icon: GraduationCap, title: 'Bam sat do an tot nghiep', desc: 'Ho tro len y tuong, tinh toan thiet ke chi tiet may, he thong truyen dong va xuat ban ve lap rap chuan hoc thuat.' },
  { icon: Trophy, title: 'Ky nang chuan doanh nghiep', desc: 'Nam vung dung sai, yeu cau gia cong thuc te va quy trinh thiet ke ung dung truc tiep tai cac cong ty tu dong hoa.' },
  { icon: Clock, title: 'Hoc thuc chien, de ap dung', desc: 'He thong bai giang truc quan, mo phong du an that. Theo doi tien do de bu dap lo hong kien thuc nhanh chong.' },
]

const modules = [
  { icon: PenTool, title: 'Thiet ke ket cau va Weldments', desc: 'Ung dung ve khung gia do, he thong ga han, boc tach vat tu thep hinh.' },
  { icon: Cpu, title: 'Mo phong dong hoc robot', desc: 'Tinh toan khong gian lam viec va quy dao canh tay robot SCARA, he thong tay don.' },
  { icon: Monitor, title: 'Thiet ke chi tiet may va truyen dong', desc: 'Lua chon o bi, tinh toan khe ho an khop banh rang, truc vit, thanh rang.' },
]

export function Home() {
  const { homepageContent } = useSiteSettings()
  const hc = homepageContent ?? DEFAULT_HOMEPAGE
  const heroImageUrl = hc.hero_image_url || null
  const heroImageAlt = hc.hero_image_alt || 'Hoc SolidWorks theo du an thuc te'
  const heroImagePos = hc.hero_image_position || 'center'
  const eyebrow = hc.eyebrow || ''
  const heroTitle = hc.title || 'Lam chu SolidWorks'
  const heroSubtitle = hc.subtitle || 'Lo trinh hoc chuyen sau danh cho sinh vien va ky su co khi.'

  const [projectsData, setProjectsData] = useState<HomepageProject[]>([])
  const projectRailRef = useRef<HTMLDivElement>(null)
  useEffect(() => { listPublishedProjects().then(setProjectsData).catch(() => setProjectsData([])) }, [])

  function scrollRail(dir: number) {
    projectRailRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden py-14 lg:py-16">
        <div className="bg-grid-pattern pointer-events-none absolute inset-0" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {eyebrow ? (<p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-brand">{eyebrow}</p>) : null}
            <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.01em] text-[#111827]">{heroTitle}</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#475569]">{heroSubtitle}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses"><Button className="min-h-[44px] px-5 text-[14px]">Kham pha lo trinh hoc <ArrowRight size={16} /></Button></Link>
              <Link to="/courses"><Button variant="secondary" className="min-h-[44px] px-5 text-[14px]">Xem cac khoa hoc</Button></Link>
            </div>
          </div>
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="aspect-[4/3] bg-gradient-to-br from-technical to-slate-700">
                <img src={heroImageUrl || '/hero.png'} alt={heroImageAlt} className="h-full w-full object-cover" style={{ objectPosition: heroImagePos }} onError={(e) => { e.currentTarget.src = '/hero.png'; e.currentTarget.style.objectPosition = 'center' }} />
              </div>
              <div className="border-t border-border bg-surface px-4 py-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] text-[#475569]">
                  <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-brand" /> Hoc truc tuyen tren website</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand" /> Chu dong thoi gian</span>
                  <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-brand" /> Theo doi tien do</span>
                  <span className="flex items-center gap-1.5"><PenTool size={14} className="text-brand" /> Thuc hanh theo do an</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GIA TRI COT LOI ===== */}
      <section className="py-14 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#111827]">Gia tri cot loi</h2>
          <p className="mt-2 text-[15px] text-[#475569]">Nen tang duoc xay dung de giup ban dat ket qua tot nhat</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v) => { const Icon = v.icon; return (
            <Card key={v.title} className="group transition hover:-translate-y-[2px] hover:border-brand-border motion-reduce:transition-none motion-reduce:hover:translate-y-0 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface"><Icon size={18} className="text-brand" strokeWidth={1.75} /></div>
              <h3 className="text-[16px] font-bold text-[#111827]">{v.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#475569]">{v.desc}</p>
            </Card>
          )})}
        </div>
      </section>

      {/* ===== MO-DUN DAO TAO ===== */}
      <section className="py-14 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#111827]">Cac mo-dun dao tao noi bat</h2>
          <p className="mt-2 text-[15px] text-[#475569]">Chuong trinh dao tao thuc chien, ap dung ngay vao cong viec</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {modules.map((m) => { const Icon = m.icon; return (
            <Card key={m.title} className="group flex flex-col transition hover:-translate-y-[2px] hover:border-brand-border motion-reduce:transition-none motion-reduce:hover:translate-y-0 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface"><Icon size={18} className="text-brand" strokeWidth={1.75} /></div>
              <h3 className="text-[16px] font-bold text-[#111827]">{m.title}</h3>
              <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-[#475569] line-clamp-3">{m.desc}</p>
              <Link to="/courses" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline">Tim hieu them <ArrowRight size={14} /></Link>
            </Card>
          )})}
        </div>
      </section>

      {/* ===== DU AN THUC TE CAROUSEL ===== */}
      {projectsData.length > 0 ? (
        <section className="py-14 lg:py-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#111827]">Du an thuc te</h2>
              <p className="mt-1 text-[15px] text-[#475569]">Kham pha cac do an va san pham ky thuat duoc thuc hien trong qua trinh hoc tap.</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button onClick={() => scrollRail(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white hover:bg-technical-soft" aria-label="Cuon trai"><ChevronLeft size={18} /></button>
              <button onClick={() => scrollRail(1)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white hover:bg-technical-soft" aria-label="Cuon phai"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div ref={projectRailRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2" style={{ scrollSnapType: 'x mandatory', overscrollBehaviorInline: 'contain', scrollbarWidth: 'none' }}>
            {projectsData.map((p) => (
              <div key={p.id} className="group shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:shadow-md" style={{ width: 'clamp(260px, 28vw, 340px)' }}>
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img src={p.image_url} alt={p.image_alt || p.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-technical/60 to-transparent" />
                  {p.category ? (<span className="absolute left-4 top-4 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">{p.category}</span>) : null}
                </div>
                <div className="p-4">
                  <h3 className="text-[15px] font-bold text-[#111827]">{p.title}</h3>
                  {p.short_description ? (<p className="mt-1 text-[13px] leading-relaxed text-[#475569] line-clamp-2">{p.short_description}</p>) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ===== DANG KY TU VAN ===== */}
      <RegistrationFormSection />

      {/* ===== CTA CUOI TRANG ===== */}
      <section className="py-14 lg:py-16">
        <div className="rounded-2xl bg-gradient-to-r from-brand to-brand-hover p-10 text-center text-white sm:p-14">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold">Bat dau lo trinh hoc ky thuat thuc chien</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-white/85">Kham pha cac khoa hoc SolidWorks va thiet ke co khi duoc xay dung theo du an thuc te.</p>
          <Link to="/courses"><Button className="mt-6 min-h-[44px] bg-white px-6 text-[14px] font-bold text-brand hover:bg-brand-soft">Xem cac khoa hoc <ArrowRight size={16} /></Button></Link>
        </div>
      </section>
    </div>
  )
}

function RegistrationFormSection() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', interest: '', message: '', consent: false })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [honeypot, setHoneypot] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Vui long nhap ho ten.'); return }
    if (!form.phone.trim()) { setError('Vui long nhap so dien thoai.'); return }
    if (!form.consent) { setError('Vui long dong y de BK3D lien he tu van.'); return }
    if (honeypot) return // honeypot caught a bot

    setSending(true); setError('')
    try {
      await submitRegistration({ full_name: form.full_name, phone: form.phone, email: form.email, interest: form.interest, message: form.message, source_page: 'homepage' })
      setSuccess(true)
    } catch (err) { setError(err instanceof Error ? err.message : 'Khong the gui thong tin.') }
    finally { setSending(false) }
  }

  if (success) {
    return (
      <div className="pt-8">
        <div className="rounded-xl border border-brand-border bg-brand-soft p-6 text-center">
          <Send size={32} className="mx-auto text-brand" />
          <h3 className="mt-3 text-lg font-bold text-[#111827]">Da nhan thong tin</h3>
          <p className="mt-2 text-[15px] text-[#475569]">BK3D da nhan duoc thong tin va se lien he voi ban trong thoi gian som nhat.</p>
          <Button variant="secondary" className="mt-4" onClick={() => { setSuccess(false); setForm({ full_name: '', phone: '', email: '', interest: '', message: '', consent: false }) }}>Gui them thong tin khac</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
        <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div>
        <label className="block text-sm font-semibold text-[#111827] mb-1">Ho ten <span className="text-brand">*</span></label>
        <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Nguyen Van A" required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#111827] mb-1">So dien thoai <span className="text-brand">*</span></label>
        <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxx" required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#111827] mb-1">Email</label>
        <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="email@example.com" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#111827] mb-1">Ban quan tam den noi dung nao?</label>
        <Select value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })}>
          <option value="">-- Chon --</option>
          <option value="SolidWorks co ban">SolidWorks co ban</option>
          <option value="Thiet ke ket cau va Weldments">Thiet ke ket cau va Weldments</option>
          <option value="Mo phong chuyen dong">Mo phong chuyen dong</option>
          <option value="Thiet ke chi tiet may">Thiet ke chi tiet may</option>
          <option value="Tu van lo trinh khac">Tu van lo trinh khac</option>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#111827] mb-1">Ghi chu</label>
        <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={2} placeholder="Ghi chu them neu can..." />
      </div>
      <label className="flex items-start gap-2 text-[14px] text-[#475569] cursor-pointer">
        <input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} className="mt-1" />
        <span>Toi dong y de BK3D lien he tu van theo thong tin da cung cap.</span>
      </label>
      <Button className="w-full min-h-[44px]" disabled={sending}>
        {sending ? 'Dang gui...' : <><Send size={16} /> Gui thong tin dang ky</>}
      </Button>
    </form>
  )
}
