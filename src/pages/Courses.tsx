import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, PageHeader } from '../components/ui'
import { listPublishedCourses } from '../services/courses'
import type { Course } from '../types/database'

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    listPublishedCourses().then(setCourses).catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div>
      <PageHeader title="Danh sách khóa học" eyebrow="BK3D" />
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <div className="mb-4 aspect-video overflow-hidden rounded-md bg-[#dce8ed]">
              {course.thumbnail_url ? <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <h2 className="text-xl font-bold">{course.title}</h2>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-[#4d6378]">{course.description || 'Khóa học đang được cập nhật nội dung.'}</p>
            <Link to={`/courses/${course.id}`}><Button className="mt-5 w-full">Xem chi tiết</Button></Link>
          </Card>
        ))}
      </div>
      {!courses.length && !error ? <Alert>Chưa có khóa học published hoặc bạn chưa cấu hình Supabase.</Alert> : null}
    </div>
  )
}
