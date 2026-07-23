import { useEffect, useState } from 'react'
import { Alert, Card, PageHeader } from '../../components/ui'
import { listUsers } from '../../services/admin'
import type { Profile } from '../../types/database'

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    listUsers().then(setUsers).catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div>
      <PageHeader title="Quản lý học viên" eyebrow="Admin" />
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b"><th className="p-3">Tên</th><th>Email</th><th>Role</th><th>Trạng thái</th><th>Ngày tạo</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-b"><td className="p-3">{user.full_name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.is_active ? 'active' : 'locked'}</td><td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  )
}
