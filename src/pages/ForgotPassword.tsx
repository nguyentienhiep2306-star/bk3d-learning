import { useState, type FormEvent } from 'react'
import { Alert, Button, Card, Input, PageHeader } from '../components/ui'
import { supabase } from '../lib/supabase'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const redirectTo = `${import.meta.env.VITE_APP_URL || window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setMessage(error ? 'Không gửi được email đặt lại mật khẩu.' : 'Đã gửi hướng dẫn đặt lại mật khẩu nếu email tồn tại.')
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Quên mật khẩu" eyebrow="Khôi phục tài khoản" />
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          {message ? <Alert>{message}</Alert> : null}
          <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Button className="w-full">Gửi email khôi phục</Button>
        </form>
      </Card>
    </div>
  )
}
