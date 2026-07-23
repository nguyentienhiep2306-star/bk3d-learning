import { BookOpen, GraduationCap, LogOut, Menu, Shield, UserRound, X, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
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
  const items = isAdmin ? [...navItems, { to: '/admin', label: 'Quản trị', icon: Shield }] : navItems

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="sticky top-0 z-30 border-b border-[#d9e2ea] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-[#172033]">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0f6f64] text-white">BK</span>
            <span>BK3D Learning</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">{items.map((item) => <NavItem key={item.to} {...item} />)}</nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Button variant="ghost" onClick={() => void signOut()}><LogOut size={18} /> Đăng xuất</Button>
            ) : (
              <>
                <Link to="/login"><Button variant="secondary">Đăng nhập</Button></Link>
                <Link to="/register"><Button>Đăng ký</Button></Link>
              </>
            )}
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-md border border-[#d9e2ea] md:hidden" onClick={() => setOpen(!open)} aria-label="Mở menu">
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-[#d9e2ea] bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {items.map((item) => <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />)}
              {user ? <Button variant="ghost" onClick={() => void signOut()}><LogOut size={18} /> Đăng xuất</Button> : <Link to="/login"><Button className="w-full" variant="secondary">Đăng nhập</Button></Link>}
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
      className={({ isActive }) => cn('flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[#365066] hover:bg-[#edf4f8]', isActive && 'bg-[#e0f2ef] text-[#0f6f64]')}
    >
      <Icon size={18} /> {label}
    </NavLink>
  )
}
