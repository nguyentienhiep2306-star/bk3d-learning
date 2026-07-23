import { supabase } from '../lib/supabase'
import { slugify } from '../lib/utils'
import { isValidYouTubeVideoId } from '../lib/youtube'
import type { Course, CourseTree, Lesson, LessonProgress } from '../types/database'

export async function listPublishedCourses() {
  const { data, error } = await supabase.from('courses').select('*').eq('status', 'published').order('created_at', { ascending: false })
  if (error) throw new Error('Khong tai duoc danh sach khoa hoc.')
  return data as Course[]
}

export async function listAdminCourses() {
  const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
  if (error) throw new Error('Khong tai duoc danh sach quan tri khoa hoc.')
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
  if (error) throw new Error('Khong tai duoc noi dung khoa hoc.')
  return data as CourseTree | null
}

export async function getLessonWithCourse(lessonId: string) {
  const { data: lesson, error } = await supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle()
  if (error) throw new Error('Khong tai duoc bai hoc.')
  if (!lesson) return null
  const course = await getCourseTree((lesson as Lesson).course_id)
  return { lesson: lesson as Lesson, course }
}

export async function getMyEnrollments() {
  const { data, error } = await supabase.from('enrollments').select('*, courses(*)').eq('status', 'active').order('enrolled_at', { ascending: false })
  if (error) throw new Error('Khong tai duoc khoa hoc cua toi.')
  return data as Array<{ course_id: string; courses: Course }>
}

export async function getCourseProgress(courseId: string) {
  const { data, error } = await supabase.from('lesson_progress').select('*').eq('course_id', courseId)
  if (error) throw new Error('Khong tai duoc tien do hoc.')
  return data as LessonProgress[]
}

export async function markLessonProgress(lesson: Lesson, completed: boolean, lastPositionSeconds = 0) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Ban can dang nhap.')
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
  if (error) throw new Error('Khong luu duoc tien do.')
}

// ============ COURSE CRUD ============

export async function saveCourse(input: Partial<Course> & { title: string }) {
  const payload = {
    title: input.title.trim(),
    slug: input.slug || slugify(input.title),
    description: input.description?.trim() || null,
    thumbnail_url: input.thumbnail_url?.trim() || null,
    status: input.status || 'draft',
  }
  if (input.id) {
    const { data, error } = await supabase.from('courses').update(payload).eq('id', input.id).select('*').single()
    if (error) throw new Error('Khong cap nhat duoc khoa hoc.')
    return data as Course
  }
  const { data, error } = await supabase.from('courses').insert(payload).select('*').single()
  if (error) throw new Error('Khong tao duoc khoa hoc.')
  return data as Course
}

// ============ SECTION CRUD ============

export async function addSection(courseId: string, title: string, position: number) {
  const { data, error } = await supabase.from('course_sections').insert({ course_id: courseId, title, position }).select('*').single()
  if (error) throw new Error('Khong tao duoc chuong.')
  return data
}

export async function updateSection(sectionId: string, title: string) {
  const { error } = await supabase.from('course_sections').update({ title: title.trim() }).eq('id', sectionId)
  if (error) throw new Error('Khong cap nhat duoc chuong.')
}

export async function deleteSection(sectionId: string) {
  const { error } = await supabase.from('course_sections').delete().eq('id', sectionId)
  if (error) throw new Error('Khong xoa duoc chuong.')
}

export async function getNextSectionPosition(courseId: string): Promise<number> {
  const { data, error } = await supabase
    .from('course_sections')
    .select('position')
    .eq('course_id', courseId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error('Khong lay duoc vi tri chuong.')
  return (data?.position ?? 0) + 1
}

// ============ LESSON CRUD ============

export async function addLesson(input: { course_id: string; section_id: string; title: string; youtube_video_id: string; position: number; description?: string }) {
  if (!isValidYouTubeVideoId(input.youtube_video_id)) throw new Error('YouTube Video ID khong hop le.')
  const { data, error } = await supabase.from('lessons').insert({
    course_id: input.course_id,
    section_id: input.section_id,
    title: input.title.trim(),
    youtube_video_id: input.youtube_video_id,
    position: input.position,
    description: input.description?.trim() || null,
  }).select('*').single()
  if (error) throw new Error('Khong tao duoc bai hoc.')
  return data
}

export async function updateLesson(lessonId: string, payload: { title?: string; youtube_video_id?: string | null; description?: string | null }) {
  const updateData: Record<string, unknown> = {}
  if (payload.title !== undefined) updateData.title = payload.title.trim()
  if (payload.youtube_video_id !== undefined) {
    if (payload.youtube_video_id && !isValidYouTubeVideoId(payload.youtube_video_id)) {
      throw new Error('YouTube Video ID khong hop le.')
    }
    updateData.youtube_video_id = payload.youtube_video_id
  }
  if (payload.description !== undefined) updateData.description = payload.description?.trim() || null
  const { error } = await supabase.from('lessons').update(updateData).eq('id', lessonId)
  if (error) throw new Error('Khong cap nhat duoc bai hoc.')
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
  if (error) throw new Error('Khong xoa duoc bai hoc.')
}

export async function getNextLessonPosition(sectionId: string): Promise<number> {
  const { data, error } = await supabase
    .from('lessons')
    .select('position')
    .eq('section_id', sectionId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error('Khong lay duoc vi tri bai hoc.')
  return (data?.position ?? 0) + 1
}
