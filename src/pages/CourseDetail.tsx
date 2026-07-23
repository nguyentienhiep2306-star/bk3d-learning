import { Lock, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Card, PageHeader } from '../components/ui'
import { useAuth } from '../features/auth/authContext'
import { formatDuration } from '../lib/utils'
import { getCourseTree } from '../services/courses'
import type { CourseTree } from '../types/database'

export function CourseDetail() {
  const { courseId = '' } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState<CourseTree | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getCourseTree(courseId).then(setCourse).catch((err: Error) => setError(err.message))
  }, [courseId])

  if (error) return <Alert tone="error">{error}</Alert>
  if (!course) return <Alert>Đang tải khóa học...</Alert>

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section>
        <PageHeader title={course.title} eyebrow={course.status} />
        <Card>
          <p className="text-[#4d6378]">{course.description || 'Chưa có mô tả.'}</p>
          {!user ? <Alert tone="info">Đăng nhập để xem các bài học đã được cấp quyền.</Alert> : null}
        </Card>
      </section>
      <aside className="space-y-3">
        {course.course_sections.map((section) => (
          <Card key={section.id}>
            <h2 className="font-bold">{section.title}</h2>
            <div className="mt-3 space-y-2">
              {section.lessons.map((lesson) => (
                <Link key={lesson.id} to={`/learn/${lesson.id}`} className="flex items-center justify-between rounded-md border border-[#d9e2ea] p-3 text-sm hover:bg-[#edf4f8]">
                  <span className="flex items-center gap-2"><PlayCircle size={18} /> {lesson.title}</span>
                  <span className="text-[#607589]">{lesson.is_preview ? 'Xem thử' : formatDuration(lesson.duration_seconds)}</span>
                </Link>
              ))}
              {!section.lessons.length ? <p className="text-sm text-[#607589]"><Lock size={16} className="inline" /> Chưa có bài học.</p> : null}
            </div>
          </Card>
        ))}
        <Link to="/my-learning"><Button className="w-full" variant="secondary">Khóa học của tôi</Button></Link>
      </aside>
    </div>
  )
}
