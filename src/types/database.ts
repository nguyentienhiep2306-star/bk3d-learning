export type UserRole = 'admin' | 'student'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type EnrollmentStatus = 'active' | 'revoked' | 'completed'

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  status: CourseStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type CourseSection = {
  id: string
  course_id: string
  title: string
  position: number
  created_at: string
  updated_at: string
}

export type Lesson = {
  id: string
  section_id: string
  course_id: string
  title: string
  description: string | null
  youtube_video_id: string | null
  duration_seconds: number | null
  position: number
  is_preview: boolean
  created_at: string
  updated_at: string
}

export type LessonProgress = {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  completed: boolean
  last_position_seconds: number
  completed_at: string | null
  updated_at: string
}

export type Quiz = {
  id: string
  course_id: string
  lesson_id: string | null
  title: string
  passing_score: number
  created_at: string
  updated_at: string
}

export type QuizQuestion = {
  id: string
  quiz_id: string
  question_text: string
  position: number
  created_at: string
  updated_at: string
}

export type QuizAnswer = {
  id: string
  question_id: string
  answer_text: string
  position: number
}

export type CourseTree = Course & {
  course_sections: Array<CourseSection & { lessons: Lesson[] }>
}

export type QuizWithQuestions = Quiz & {
  quiz_questions: Array<QuizQuestion & { quiz_answers: QuizAnswer[] }>
}
