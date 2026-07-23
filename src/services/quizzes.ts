import { supabase } from '../lib/supabase'
import type { QuizWithQuestions } from '../types/database'

export async function getQuiz(quizId: string) {
  const { data, error } = await supabase.from('quizzes').select('*, quiz_questions(*, quiz_answers(id, question_id, answer_text, position))').eq('id', quizId).maybeSingle()
  if (error) throw new Error('Không tải được bài kiểm tra.')
  return data as QuizWithQuestions | null
}

export async function submitQuiz(quizId: string, answers: Record<string, string>) {
  const payload = Object.entries(answers).map(([question_id, selected_answer_id]) => ({ question_id, selected_answer_id }))
  const { data, error } = await supabase.rpc('submit_quiz_attempt', { p_quiz_id: quizId, p_answers: payload })
  if (error) throw new Error('Không nộp được bài kiểm tra.')
  return data as { attempt_id: string; score: number; total_questions: number; correct_answers: number; passed: boolean }
}
