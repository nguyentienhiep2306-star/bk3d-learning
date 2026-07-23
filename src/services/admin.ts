import { supabase } from '../lib/supabase'
import type { Course, Profile } from '../types/database'

export async function getAdminStats() {
  const [profiles, courses, enrollments] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])
  return {
    users: profiles.count ?? 0,
    courses: courses.count ?? 0,
    activeEnrollments: enrollments.count ?? 0,
  }
}

export async function listUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw new Error('Không tải được học viên.')
  return data as Profile[]
}

export async function listCoursesForEnrollments() {
  const { data, error } = await supabase.from('courses').select('*').order('title')
  if (error) throw new Error('Không tải được khóa học.')
  return data as Course[]
}

export async function grantEnrollment(userId: string, courseId: string) {
  const { error } = await supabase.from('enrollments').upsert({ user_id: userId, course_id: courseId, status: 'active' }, { onConflict: 'user_id,course_id' })
  if (error) throw new Error('Không cấp quyền được.')
}

export async function revokeEnrollment(userId: string, courseId: string) {
  const { error } = await supabase.from('enrollments').update({ status: 'revoked' }).eq('user_id', userId).eq('course_id', courseId)
  if (error) throw new Error('Không thu hồi quyền được.')
}
