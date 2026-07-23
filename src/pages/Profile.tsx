import { useState, type FormEvent } from 'react'
import { Alert, Button, Card, Input, PageHeader } from '../components/ui'
import { useAuth } from '../features/auth/authContext'
import { supabase } from '../lib/supabase'

export function Profile() {
  const { profile, user, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ full_name: fullName, avatar_url: avatarUrl }).eq('id', user.id)
    setMessage(error ? 'Không cập nhật được hồ sơ.' : 'Đã cập nhật hồ sơ.')
    await refreshProfile()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Hồ sơ cá nhân" eyebrow={profile?.role || 'student'} />
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          {message ? <Alert>{message}</Alert> : null}
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Họ tên" />
          <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="Avatar URL" />
          <Input value={profile?.email || user?.email || ''} readOnly />
          <Button>Cập nhật</Button>
        </form>
      </Card>
    </div>
  )
}
