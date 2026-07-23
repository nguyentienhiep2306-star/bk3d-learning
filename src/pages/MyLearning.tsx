import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, PageHeader, ProgressBar } from '../components/ui'
import { percent } from '../lib/utils'
import { getCourseProgress, getMyEnrollments } from '../services/courses'
import type { Course } from '../types/database'

type LearningItem = { course: Course; completed: number; total: number }

export function MyLearning() {
  const [items, setItems] = useState<LearningItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const enrollments = await getMyEnrollments()
      const rows = await Promise.all(
        enrollments.map(async (item) => {
          const progress = await getCourseProgress(item.course_id)
          return { course: item.courses, completed: progress.filter((row) => row.completed).length, total: progress.length }
        }),
      )
      setItems(rows)
    }
    load().catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div>
      <PageHeader title="Khóa học của tôi" eyebrow="Dashboard học viên" />
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const value = percent(item.completed, item.total)
          return (
            <Card key={item.course.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{item.course.title}</h2>
                  <p className="mt-1 text-sm text-[#607589]">{item.completed}/{item.total} bài hoàn thành</p>
                </div>
                <strong>{value}%</strong>
              </div>
              <div className="mt-4"><ProgressBar value={value} /></div>
              <Link to={`/courses/${item.course.id}`}><Button className="mt-5">Tiếp tục học</Button></Link>
            </Card>
          )
        })}
      </div>
      {!items.length && !error ? <Alert>Bạn chưa được cấp quyền khóa học nào.</Alert> : null}
    </div>
  )
}
