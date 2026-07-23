import { supabase } from '../lib/supabase'
import { slugify } from '../lib/utils'
import { isValidYouTubeVideoId } from '../lib/youtube'
import type { Course, CourseTree, Lesson, LessonProgress } from '../types/database'

export async function listPublishedCourses() {
  const { data, error } = await supabase.from('courses').select('*').eq('status', 'published').order('created_at', { ascending: false })
  if (error) throw new Error('Không tải được danh sách khóa học.')
  return data as Course[]
}

export async function listAdminCourses() {
  const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
  if (error) throw new Error('Không tải được danh sách quản trị khóa học.')
  return data as Course[]
}

export async function getCourseTree(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_sections(*, lessons(*))')
    .eq('id', courseId)
    .order('position', { referencedTable: 'course_sections', ascending: true })
    .order('position', { referencedTable: 'course_sections.lessons', ascending: true })
    .maybeSingle()
  if (error) throw new Error('Không tải được nội dung khóa học.')
  return data as CourseTree | null
}

export async function getLessonWithCourse(lessonId: string) {
  const { data: lesson, error } = await supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle()
  if (error) throw new Error('Không tải được bài học.')
  if (!lesson) return null
  const course = await getCourseTree((lesson as Lesson).course_id)
  return { lesson: lesson as Lesson, course }
}

export async function getMyEnrollments() {
  const { data, error } = await supabase.from('enrollments').select('*, courses(*)').eq('status', 'active').order('enrolled_at', { ascending: false })
  if (error) throw new Error('Không tải được khóa học của tôi.')
  return data as Array<{ course_id: string; courses: Course }>
}

export async function getCourseProgress(courseId: string) {
  const { data, error } = await supabase.from('lesson_progress').select('*').eq('course_id', courseId)
  if (error) throw new Error('Không tải được tiến độ học.')
  return data as LessonProgress[]
}

export async function markLessonProgress(lesson: Lesson, completed: boolean, lastPositionSeconds = 0) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Bạn cần đăng nhập.')
  const { error } = await supabase.from('lesson_progress').upsert(
    {
      user_id: userData.user.id,
      course_id: lesson.course_id,
      lesson_id: lesson.id,
      completed,
      last_position_seconds: lastPositionSeconds,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  )
  if (error) throw new Error('Không lưu được tiến độ.')
}

export async function saveCourse(input: Partial<Course> & { title: string }) {
  const payload = {
    title: input.title,
    slug: input.slug || slugify(input.title),
    description: input.description || null,
    thumbnail_url: input.thumbnail_url || null,
    status: input.status || 'draft',
  }
  if (input.id) {
    const { error } = await supabase.from('courses').update(payload).eq('id', input.id)
    if (error) throw new Error('Không cập nhật được khóa học.')
    return
  }
  const { error } = await supabase.from('courses').insert(payload)
  if (error) throw new Error('Không tạo được khóa học.')
}

export async function addSection(courseId: string, title: string, position: number) {
  const { error } = await supabase.from('course_sections').insert({ course_id: courseId, title, position })
  if (error) throw new Error('Không tạo được chương.')
}

export async function addLesson(input: { course_id: string; section_id: string; title: string; youtube_video_id: string; position: number; description?: string }) {
  if (!isValidYouTubeVideoId(input.youtube_video_id)) throw new Error('YouTube Video ID không hợp lệ.')
  const { error } = await supabase.from('lessons').insert(input)
  if (error) throw new Error('Không tạo được bài học.')
}
