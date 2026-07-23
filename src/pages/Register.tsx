import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Input, PageHeader } from '../components/ui'
import { supabase } from '../lib/supabase'

export function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/login` },
    })
    if (signUpError) return setError('Không đăng ký được. Vui lòng kiểm tra email và mật khẩu.')
    setMessage('Đăng ký thành công. Vui lòng kiểm tra email nếu Supabase đang bật xác nhận email.')
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Đăng ký" eyebrow="Tài khoản học viên" />
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          {message ? <Alert tone="success">{message}</Alert> : null}
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Input placeholder="Họ tên" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input type="password" placeholder="Mật khẩu tối thiểu 6 ký tự" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button className="w-full">Tạo tài khoản</Button>
        </form>
        <p className="mt-4 text-sm text-[#4d6378]"><Link to="/login">Đã có tài khoản? Đăng nhập</Link></p>
      </Card>
    </div>
  )
}
