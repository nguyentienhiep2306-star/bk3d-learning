import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Alert, Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui'
import { getYouTubeEmbedUrl, parseYouTubeVideoId } from '../../lib/youtube'
import { addLesson, addSection, getCourseTree, listAdminCourses, saveCourse } from '../../services/courses'
import type { Course, CourseTree } from '../../types/database'

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selected, setSelected] = useState<CourseTree | null>(null)
  const [form, setForm] = useState({ title: '', description: '', thumbnail_url: '', status: 'draft' as Course['status'] })
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const data = await listAdminCourses()
    setCourses(data)
    if (data[0] && !selected) {
      const first = await getCourseTree(data[0].id)
      setSelected(first)
      setForm({
        title: data[0].title,
        description: data[0].description || '',
        thumbnail_url: data[0].thumbnail_url || '',
        status: data[0].status,
      })
    }
  }, [selected])

  useEffect(() => {
    void load()
  }, [load])

  async function onSave(event: FormEvent) {
    event.preventDefault()
    await saveCourse({ id: selected?.id, ...form })
    setMessage('Đã lưu khóa học.')
    await load()
  }

  async function choose(course: Course) {
    setSelected(await getCourseTree(course.id))
    setForm({ title: course.title, description: course.description || '', thumbnail_url: course.thumbnail_url || '', status: course.status })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside>
        <PageHeader title="Khóa học" eyebrow="Admin" />
        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              setSelected(null)
              setForm({ title: '', description: '', thumbnail_url: '', status: 'draft' })
            }}
          >
            Tạo khóa mới
          </Button>
          {courses.map((course) => (
            <button key={course.id} className="block min-h-11 w-full rounded-md border border-[#d9e2ea] bg-white p-3 text-left text-sm" onClick={() => void choose(course)}>
              {course.title}
            </button>
          ))}
        </div>
      </aside>
      <section className="space-y-5">
        {message ? <Alert tone="success">{message}</Alert> : null}
        <Card>
          <form className="grid gap-4" onSubmit={onSave}>
            <Input placeholder="Tiêu đề khóa học" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <Textarea placeholder="Mô tả" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <Input placeholder="Thumbnail URL" value={form.thumbnail_url} onChange={(event) => setForm({ ...form, thumbnail_url: event.target.value })} />
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Course['status'] })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
            <Button>Lưu khóa học</Button>
          </form>
        </Card>
        {selected ? <CourseBuilder course={selected} onChanged={async () => setSelected(await getCourseTree(selected.id))} /> : null}
      </section>
    </div>
  )
}

function CourseBuilder({ course, onChanged }: { course: CourseTree; onChanged: () => Promise<void> }) {
  const [sectionTitle, setSectionTitle] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [videoError, setVideoError] = useState('')
  const firstSection = course.course_sections[0]
  const parsedVideoId = parseYouTubeVideoId(youtubeInput)

  async function createSection() {
    await addSection(course.id, sectionTitle, course.course_sections.length + 1)
    setSectionTitle('')
    await onChanged()
  }

  async function createLesson() {
    if (!firstSection) return
    const youtubeVideoId = parseYouTubeVideoId(youtubeInput)
    if (!youtubeVideoId) {
      setVideoError('Link YouTube hoặc Video ID không hợp lệ. Vui lòng dán link watch, youtu.be, embed hoặc Video ID 11 ký tự.')
      return
    }
    await addLesson({ course_id: course.id, section_id: firstSection.id, title: lessonTitle, youtube_video_id: youtubeVideoId, position: firstSection.lessons.length + 1 })
    setLessonTitle('')
    setYoutubeInput('')
    setVideoError('')
    await onChanged()
  }

  return (
    <Card>
      <h2 className="text-xl font-bold">Chương và bài học</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input placeholder="Tên chương mới" value={sectionTitle} onChange={(event) => setSectionTitle(event.target.value)} />
        <Button type="button" onClick={() => void createSection()} disabled={!sectionTitle}>
          Thêm chương
        </Button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_320px_auto]">
        <Input placeholder="Tên bài học" value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} />
        <label className="grid gap-1 text-sm font-semibold text-[#365066]">
          Link YouTube hoặc Video ID
          <Input
            placeholder="https://youtu.be/dQw4w9WgXcQ"
            value={youtubeInput}
            onChange={(event) => {
              setYoutubeInput(event.target.value)
              setVideoError('')
            }}
          />
          <span className="text-xs font-normal text-[#607589]">Tải video lên YouTube ở chế độ Không công khai, sau đó dán link vào đây.</span>
        </label>
        <Button type="button" onClick={() => void createLesson()} disabled={!lessonTitle || !youtubeInput || !firstSection}>
          Thêm bài
        </Button>
      </div>
      {videoError ? (
        <div className="mt-3">
          <Alert tone="error">{videoError}</Alert>
        </div>
      ) : null}
      {parsedVideoId ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-[#d9e2ea] bg-black">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={getYouTubeEmbedUrl(parsedVideoId)}
              title="Xem trước video bài học"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
      <div className="mt-5 space-y-4">
        {course.course_sections.map((section) => (
          <div key={section.id} className="rounded-md border border-[#d9e2ea] p-4">
            <strong>
              {section.position}. {section.title}
            </strong>
            <ul className="mt-2 space-y-1 text-sm text-[#4d6378]">
              {section.lessons.map((lesson) => (
                <li key={lesson.id}>
                  {lesson.position}. {lesson.title} · {lesson.youtube_video_id}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  )
}
