import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Button, Card, PageHeader, Select } from '../../components/ui'
import { grantEnrollment, listCoursesForEnrollments, listUsers, revokeEnrollment } from '../../services/admin'
import type { Course, Profile } from '../../types/database'

export function AdminEnrollments() {
  const [users, setUsers] = useState<Profile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [userId, setUserId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const [userRows, courseRows] = await Promise.all([listUsers(), listCoursesForEnrollments()])
      setUsers(userRows)
      setCourses(courseRows)
      setUserId(userRows[0]?.id || '')
      setCourseId(courseRows[0]?.id || '')
    }
    void load()
  }, [])

  async function onGrant(event: FormEvent) {
    event.preventDefault()
    await grantEnrollment(userId, courseId)
    setMessage('Đã cấp quyền học.')
  }

  async function onRevoke() {
    await revokeEnrollment(userId, courseId)
    setMessage('Đã thu hồi quyền học.')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Cấp quyền khóa học" eyebrow="Admin" />
      <Card>
        <form className="space-y-4" onSubmit={onGrant}>
          {message ? <Alert tone="success">{message}</Alert> : null}
          <Select value={userId} onChange={(event) => setUserId(event.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.email}</option>)}</Select>
          <Select value={courseId} onChange={(event) => setCourseId(event.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</Select>
          <div className="flex flex-wrap gap-3">
            <Button>Cấp quyền</Button>
            <Button type="button" variant="danger" onClick={() => void onRevoke()}>Thu hồi</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
