import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Button, Card, PageHeader } from '../components/ui'
import { getQuiz, submitQuiz } from '../services/quizzes'
import type { QuizWithQuestions } from '../types/database'

export function Quiz() {
  const { quizId = '' } = useParams()
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number; total_questions: number; correct_answers: number; passed: boolean } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getQuiz(quizId).then(setQuiz).catch((err: Error) => setError(err.message))
  }, [quizId])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      setResult(await submitQuiz(quizId, answers))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không nộp được bài.')
    }
  }

  if (error) return <Alert tone="error">{error}</Alert>
  if (!quiz) return <Alert>Đang tải bài kiểm tra...</Alert>

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={quiz.title} eyebrow={`Điểm đạt: ${quiz.passing_score}%`} />
      {result ? <Alert tone={result.passed ? 'success' : 'error'}>Bạn đúng {result.correct_answers}/{result.total_questions}, điểm {result.score}%. {result.passed ? 'Đạt' : 'Chưa đạt'}.</Alert> : null}
      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        {quiz.quiz_questions.map((question, index) => (
          <Card key={question.id}>
            <h2 className="font-bold">Câu {index + 1}: {question.question_text}</h2>
            <div className="mt-3 space-y-2">
              {question.quiz_answers.map((answer) => (
                <label key={answer.id} className="flex min-h-11 items-center gap-3 rounded-md border border-[#d9e2ea] p-3">
                  <input type="radio" name={question.id} value={answer.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: answer.id }))} />
                  <span>{answer.answer_text}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
        <Button>Nộp bài</Button>
      </form>
    </div>
  )
}
