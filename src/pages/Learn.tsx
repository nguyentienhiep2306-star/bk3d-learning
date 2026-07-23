import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Card, ProgressBar } from '../components/ui'
import { percent } from '../lib/utils'
import { getYouTubeEmbedUrl } from '../lib/youtube'
import { getCourseProgress, getLessonWithCourse, markLessonProgress } from '../services/courses'
import type { CourseTree, Lesson, LessonProgress } from '../types/database'

export function Learn() {
  const { lessonId = '' } = useParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<CourseTree | null>(null)
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const lessons = useMemo(() => course?.course_sections.flatMap((section) => section.lessons) ?? [], [course])
  const currentIndex = lessons.findIndex((item) => item.id === lessonId)
  const completed = progress.filter((item) => item.completed).length
  const completion = percent(completed, lessons.length)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    async function load() {
      const data = await getLessonWithCourse(lessonId)
      setLesson(data?.lesson ?? null)
      setCourse(data?.course ?? null)
      if (data?.lesson.course_id) setProgress(await getCourseProgress(data.lesson.course_id))
    }
    load().catch((err: Error) => setError(err.message))
  }, [lessonId])

  async function toggleCompleted() {
    if (!lesson) return
    const isCompleted = progress.some((row) => row.lesson_id === lesson.id && row.completed)
    await markLessonProgress(lesson, !isCompleted)
    setProgress(await getCourseProgress(lesson.course_id))
    setMessage(!isCompleted ? 'Đã đánh dấu hoàn thành.' : 'Đã bỏ đánh dấu hoàn thành.')
  }

  if (error) return <Alert tone="error">{error}</Alert>
  if (!lesson || !course) return <Alert>Đang tải bài học...</Alert>

  const isCompleted = progress.some((row) => row.lesson_id === lesson.id && row.completed)
  const previous = lessons[currentIndex - 1]
  const next = lessons[currentIndex + 1]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-5">
        <div className="overflow-hidden rounded-lg bg-black">
          <div className="aspect-video">
            {lesson.youtube_video_id ? (
              <iframe className="h-full w-full" src={getYouTubeEmbedUrl(lesson.youtube_video_id)} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <div className="grid h-full place-items-center text-white">Video chưa được cấu hình.</div>
            )}
          </div>
        </div>
        <Card>
          {message ? <Alert tone="success">{message}</Alert> : null}
          <h1 className="mt-3 text-2xl font-bold">{lesson.title}</h1>
          <p className="mt-3 text-[#4d6378]">{lesson.description || 'Bài học đang được cập nhật mô tả.'}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {previous ? <Link to={`/learn/${previous.id}`}><Button variant="secondary"><ChevronLeft size={18} /> Bài trước</Button></Link> : null}
            <Button onClick={() => void toggleCompleted()}><CheckCircle2 size={18} /> {isCompleted ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'}</Button>
            {next ? <Link to={`/learn/${next.id}`}><Button variant="secondary">Bài tiếp <ChevronRight size={18} /></Button></Link> : null}
          </div>
        </Card>
      </section>
      <aside className="space-y-4">
        <Card>
          <div className="flex justify-between text-sm font-semibold"><span>Tiến độ khóa học</span><span>{completion}%</span></div>
          <div className="mt-3"><ProgressBar value={completion} /></div>
          <p className="mt-2 text-sm text-[#607589]">{completed}/{lessons.length} bài hoàn thành</p>
        </Card>
        {course.course_sections.map((section) => (
          <Card key={section.id}>
            <h2 className="font-bold">{section.title}</h2>
            <div className="mt-3 space-y-2">
              {section.lessons.map((item) => (
                <Link key={item.id} to={`/learn/${item.id}`} className={`block rounded-md border p-3 text-sm ${item.id === lesson.id ? 'border-[#0f6f64] bg-[#e0f2ef]' : 'border-[#d9e2ea]'}`}>
                  {progress.some((row) => row.lesson_id === item.id && row.completed) ? '✓ ' : ''}{item.title}
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </aside>
    </div>
  )
}
