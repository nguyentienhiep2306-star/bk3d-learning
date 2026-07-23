import { BookOpen, FolderKanban, GraduationCap, MessageSquareText, Settings, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, PageHeader } from '../../components/ui'
import { getAdminStats } from '../../services/admin'

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, activeEnrollments: 0 })

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => setStats({ users: 0, courses: 0, activeEnrollments: 0 }))
  }, [])

  return (
    <div>
      <PageHeader title="Dashboard quản trị" eyebrow="Admin" actions={<Link to="/admin/courses"><Button>Quản lý khóa học</Button></Link>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Học viên" value={stats.users} icon={Users} />
        <Stat title="Khóa học" value={stats.courses} icon={BookOpen} />
        <Stat title="Enrollment active" value={stats.activeEnrollments} icon={GraduationCap} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link to="/admin/courses"><Button className="w-full" variant="secondary">Khóa học</Button></Link>
        <Link to="/admin/users"><Button className="w-full" variant="secondary">Học viên</Button></Link>
       <Link to="/admin/enrollments"><Button className="w-full" variant="secondary">Cấp quyền</Button></Link>
      <Link to="/admin/settings"><Button className="w-full" variant="secondary"><Settings size={16} /> Cài đặt</Button></Link>
      <Link to="/admin/projects"><Button className="w-full" variant="secondary"><FolderKanban size={16} /> Dự án thực tế</Button></Link>
      <Link to="/admin/leads"><Button className="w-full" variant="secondary"><MessageSquareText size={16} /> Đăng ký tư vấn</Button></Link>
      </div>
    </div>
  )
}

function Stat({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Users }) {
  return (
    <Card>
      <Icon className="text-[#0f6f64]" size={28} />
      <p className="mt-4 text-sm text-[#607589]">{title}</p>
      <strong className="text-3xl">{value}</strong>
    </Card>
  )
}
