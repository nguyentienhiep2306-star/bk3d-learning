import { BookOpen, GraduationCap, LogOut, Menu, Shield, UserRound, X, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useSiteSettings } from '../features/siteSettings/siteSettingsContext'
import { Button } from '../components/ui'
import { useAuth } from '../features/auth/authContext'
import { cn } from '../lib/utils'

const navItems: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/courses', label: 'Khóa học', icon: BookOpen },
  { to: '/my-learning', label: 'Học tập', icon: GraduationCap },
  { to: '/profile', label: 'Hồ sơ', icon: UserRound },
]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const { siteName, logoUrl } = useSiteSettings()
  const items = isAdmin ? [...navItems, { to: '/admin', label: 'Quản trị', icon: Shield }] : navItems

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 font-bold text-[#111827]">
            {logoUrl ? (
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt={siteName} className="h-[42px] w-[42px] rounded-full object-cover" />
                <span className="text-[18px] font-[650] tracking-tight">{siteName}</span>
              </div>
            ) : (
              <>
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-brand-soft">
                  <span className="text-[18px] font-bold text-brand">BK</span>
                </div>
                <span className="text-[18px] font-[650] tracking-tight">{siteName}</span>
              </>
            )}
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => <NavItem key={item.to} {...item} />)}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Button variant="ghost" onClick={() => void signOut()}>
                <LogOut size={18} /> Đăng xuất
              </Button>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Đăng nhập</Button></Link>
                <Link to="/register"><Button>Đăng ký</Button></Link>
              </>
            )}
          </div>
          <button
            className="grid h-11 w-11 place-items-center rounded-lg border border-border md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-border bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {items.map((item) => <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />)}
              {user ? (
                <Button variant="ghost" onClick={() => void signOut()} className="w-full justify-start">
                  <LogOut size={18} /> Đăng xuất
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login"><Button className="w-full" variant="secondary">Đăng nhập</Button></Link>
                  <Link to="/register"><Button className="w-full">Đăng ký</Button></Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Outlet /></main>
    </div>
  )
}

function NavItem({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: LucideIcon; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex min-h-11 items-center gap-2 rounded-lg px-3.5 text-[15px] font-medium text-[#475569] transition hover:bg-technical-soft',
          isActive && 'bg-brand-soft text-brand font-semibold',
        )
      }
    >
      <Icon size={18} strokeWidth={1.75} /> {label}
    </NavLink>
  )
}
