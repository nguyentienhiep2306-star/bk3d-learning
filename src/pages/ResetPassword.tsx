import { useState, type FormEvent } from 'react'
import { Alert, Button, Card, Input, PageHeader } from '../components/ui'
import { supabase } from '../lib/supabase'

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const { error } = await supabase.auth.updateUser({ password })
    setMessage(error ? 'Không cập nhật được mật khẩu.' : 'Mật khẩu đã được cập nhật.')
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Đặt lại mật khẩu" eyebrow="Bảo mật" />
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          {message ? <Alert>{message}</Alert> : null}
          <Input type="password" minLength={6} placeholder="Mật khẩu mới" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button className="w-full">Cập nhật mật khẩu</Button>
        </form>
      </Card>
    </div>
  )
}
