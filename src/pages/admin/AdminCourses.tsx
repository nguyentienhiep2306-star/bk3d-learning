import { ChevronDown, ChevronRight, Edit3, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Alert, Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui'
import { parseYouTubeVideoId } from '../../lib/youtube'
import {
  addLesson,
  addSection,
  deleteLesson,
  deleteSection,
  getCourseTree,
  getNextLessonPosition,
  getNextSectionPosition,
  listAdminCourses,
  saveCourse,
  updateLesson,
  updateSection,
} from '../../services/courses'
import type { Course, CourseTree } from '../../types/database'

type Mode = 'create' | 'edit'
type Notification = { message: string; tone: 'success' | 'error' } | null

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courseTree, setCourseTree] = useState<CourseTree | null>(null)
  const [mode, setMode] = useState<Mode>('edit')
  const [form, setForm] = useState({ title: '', description: '', thumbnail_url: '', status: 'draft' as Course['status'] })
  const [saving, setSaving] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [message, setMessage] = useState<Notification>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState('')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [addingSection, setAddingSection] = useState(false)
  // Per-section lesson forms
  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; youtube: string }>>({})
  // Edit lesson
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editingLessonTitle, setEditingLessonTitle] = useState('')
  const [editingLessonYoutube, setEditingLessonYoutube] = useState('')
  // Delete confirmation
  const [confirmDeleteSection, setConfirmDeleteSection] = useState<string | null>(null)
  const [confirmDeleteLesson, setConfirmDeleteLesson] = useState<string | null>(null)

  // Load course list
  const loadCourses = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await listAdminCourses()
      setCourses(data)
    } catch {
      // keep existing list
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  // Load course tree when selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseTree(null)
      return
    }
    let cancelled = false
    async function load() {
       const tree = await getCourseTree(selectedCourseId!)
      if (!cancelled) setCourseTree(tree)
    }
    void load()
    return () => { cancelled = true }
  }, [selectedCourseId])

  // Select a course
  async function selectCourse(course: Course) {
    cancelEditing()
    setMode('edit')
    setSelectedCourseId(course.id)
    setForm({
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      status: course.status,
    })
    setExpandedSections(new Set())
    setMessage(null)
  }

  // Start create mode
  function startCreate() {
    cancelEditing()
    setSelectedCourseId(null)
    setCourseTree(null)
    setMode('create')
    setForm({ title: '', description: '', thumbnail_url: '', status: 'draft' })
    setExpandedSections(new Set())
    setMessage(null)
  }

  // Cancel all editing states
  function cancelEditing() {
    setEditingSectionId(null)
    setEditingSectionTitle('')
    setEditingLessonId(null)
    setEditingLessonTitle('')
    setEditingLessonYoutube('')
    setConfirmDeleteSection(null)
    setConfirmDeleteLesson(null)
    setNewSectionTitle('')
    setAddingSection(false)
    setLessonForms({})
  }

  // Save course (create or update)
  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) {
      setMessage({ message: 'Ten khoa hoc khong duoc de trong.', tone: 'error' })
      return
    }
    if (saving) return
    setSaving(true)
    setMessage(null)

    try {
      if (mode === 'create') {
        const created = await saveCourse({ title: form.title.trim(), description: form.description, thumbnail_url: form.thumbnail_url, status: form.status })
        await loadCourses()
        setMode('edit')
        setSelectedCourseId(created.id)
        setForm({
          title: created.title,
          description: created.description || '',
          thumbnail_url: created.thumbnail_url || '',
          status: created.status,
        })
        setMessage({ message: 'Da tao khoa hoc.', tone: 'success' })
      } else {
        if (!selectedCourseId) return
        await saveCourse({ id: selectedCourseId, title: form.title.trim(), description: form.description, thumbnail_url: form.thumbnail_url, status: form.status })
        await loadCourses()
        // Reload tree
        const tree = await getCourseTree(selectedCourseId)
        setCourseTree(tree)
        setMessage({ message: 'Da cap nhat khoa hoc.', tone: 'success' })
      }
    } catch (err) {
      setMessage({ message: err instanceof Error ? err.message : 'Khong the luu khoa hoc.', tone: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Toggle section expand
  function toggleSection(sectionId: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  // ========== SECTION OPERATIONS ==========

  async function handleAddSection() {
    if (!selectedCourseId || !newSectionTitle.trim()) return
    setAddingSection(true)
    try {
      const pos = await getNextSectionPosition(selectedCourseId)
      await addSection(selectedCourseId, newSectionTitle.trim(), pos)
      setNewSectionTitle('')
      const tree = await getCourseTree(selectedCourseId)
      setCourseTree(tree)
      setMessage({ message: 'Da Them muc.', tone: 'success' })
    } catch (err) {
      setMessage({ message: err instanceof Error ? err.message : 'Khong the Them muc.', tone: 'error' })
    } finally {
      setAddingSection(false)
    }
  }

  function startEditSection(sectionId: string, title: string) {
    setEditingSectionId(sectionId)
    setEditingSectionTitle(title)
  }

  async function handleUpdateSection() {
    if (!editingSectionId || !editingSectionTitle.trim()) return
    try {
      await updateSection(editingSectionId, editingSectionTitle.trim())
      setEditingSectionId(null)
      setEditingSectionTitle('')
      if (selectedCourseId) {
        const tree = await getCourseTree(selectedCourseId)
        setCourseTree(tree)
      }
      setMessage({ message: 'Da cap nhat muc.', tone: 'success' })
    } catch (err) {
      setMessage({ message: err instanceof Error ? err.message : 'Khong the cap nhat chuong.', tone: 'error' })
    }
  }

  function cancelEditSection() {
    setEditingSectionId(null)
    setEditingSectionTitle('')
  }

  async function handleDeleteSection(sectionId: string) {
    // Clean up any stale editing state for this section
    if (editingSectionId === sectionId) {
      setEditingSectionId(null)
      setEditingSectionTitle('')
    }
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.delete(sectionId)
      return next
    })
    if (confirmDeleteLesson && editingLessonId) {
      setEditingLessonId(null)
      setEditingLessonTitle('')
      setEditingLessonYoutube('')
    }
    try {
      await deleteSection(sectionId)
      setConfirmDeleteSection(null)
      if (selectedCourseId) {
        const tree = await getCourseTree(selectedCourseId)
        setCourseTree(tree)
      }
      setMessage({ message: 'Da Xoa muc.', tone: 'success' })
    } catch (err) {
      setMessage({ message: err instanceof Error ? err.message : 'Khong the Xoa muc.', tone: 'error' })
    }
  }

  // ========== LESSON OPERATIONS ==========

  function getLessonForm(sectionId: string) {
    return lessonForms[sectionId] ?? { title: '', youtube: '' }
  }

  function setLessonFormField(sectionId: string, field: 'title' | 'youtube', value: string) {
    setLessonForms(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] ?? { title: '', youtube: '' }), [field]: value },
    }))
  }

  async function handleAddLesson(sectionId: string) {
    const lf = getLessonForm(sectionId)
    if (!lf.title.trim() || !lf.youtube.trim()) return
    if (!selectedCourseId || !courseTree) return

    const videoId = parseYouTubeVideoId(lf.youtube)
    if (!videoId) {
      setMessage({ message: 'Link YouTube hoac Video ID khong hop le.', tone: 'error' })
      return
    }

    try {
      const pos = await getNextLessonPosition(sectionId)
      await addLesson({ course_id: selectedCourseId, section_id: sectionId, title: lf.title.trim(), youtube_video_id: videoId, position: pos })
      // Clear form for this section
      setLessonForms(prev => ({ ...prev, [sectionId]: { title: '', youtube: '' } }))
      const tree = await getCourseTree(selectedCourseId)
      setCourseTree(tree)
      setMessage({ message: 'Da them bai hoc.', tone: 'success' })
    } catch (err) {
      setMessage({ message: err instanceof Error ? err.message : 'Khong the them bai hoc.', tone: 'error' })
    }
  }

  function startEditLesson(lesson: { id: string; title: string; youtube_video_id: string | null }) {
    setEditingLessonId(lesson.id)
    setEditingLessonTitle(lesson.title)
    setEditingLessonYoutube(lesson.youtube_video_id ?? '')
  }

  async function handleUpdateLesson() {
    if (!editingLessonId || !editingLessonTitle.trim()) return
    const videoId = editingLessonYoutube.trim() ? parseYouTubeVideoId(editingLessonYoutube) : null
    if (editingLessonYoutube.trim() && !videoId) {
      setMessage({ message: 'Link YouTube hoac Video ID khong hop le.', tone: 'error' })
      return
    }
    try {
      await updateLesson(editingLessonId, {
        title: editingLessonTitle.trim(),
        youtube_video_id: videoId,
      })
      setEditingLessonId(null)
      setEditingLessonTitle('')
      setEditingLessonYoutube('')
      if (selectedCourseId) {
        const tree = await getCourseTree(selectedCourseId)
        setCourseTree(tree)
      }
      setMessage({ message: 'Da cap nhat bai hoc.', tone: 'success' })
    } catch (err) {
      setMessage({ message: err instanceof Error ? err.message : 'Khong the cap nhat bai hoc.', tone: 'error' })
    }
  }

  function cancelEditLesson() {
    setEditingLessonId(null)
    setEditingLessonTitle('')
    setEditingLessonYoutube('')
  }

  async function handleDeleteLesson(lessonId: string) {
    try {
      await deleteLesson(lessonId)
      setConfirmDeleteLesson(null)
      if (selectedCourseId) {
        const tree = await getCourseTree(selectedCourseId)
        setCourseTree(tree)
      }
      setMessage({ message: 'Da xoa bai hoc.', tone: 'success' })
    } catch (err) {
      setMessage({ message: err instanceof Error ? err.message : 'Khong the xoa bai hoc.', tone: 'error' })
    }
  }

  // ========== RENDER ==========

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Left column: course list */}
      <aside>
        <PageHeader title="Khoa hoc" eyebrow="Admin" />
        <div className="space-y-2">
          <Button className="w-full" onClick={startCreate}>
            <Plus size={18} /> Tao khoa moi
          </Button>
          {loadingList ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#0f6f64]" size={20} /></div>
          ) : (
            courses.map((course) => (
              <button
                key={course.id}
                className={`${
                  selectedCourseId === course.id
                    ? 'border-[#0f6f64] bg-[#e0f2ef] font-semibold text-[#0f6f64]'
                    : 'border-[#d9e2ea] bg-white text-[#172033] hover:bg-[#edf4f8]'
                }`}
                onClick={() => void selectCourse(course)}
              >
                {course.title}
                {course.status === 'draft' ? <span className="ml-2 text-xs text-[#607589]">(draft)</span> : null}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Right column: form + sections */}
      <section className="space-y-5">
        {message ? <Alert tone={message.tone}>{message.message}</Alert> : null}

        {/* Course form */}
        <Card>
          <form className="grid gap-4" onSubmit={handleSave}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#172033]">
                {mode === 'create' ? 'Tao khoa hoc moi' : 'Thong tin khoa hoc'}
              </h2>
              {mode === 'create' ? (
                <Button variant="ghost" type="button" onClick={startCreate}>
                  <X size={16} /> Huy
                </Button>
              ) : null}
            </div>
            <Input
              placeholder="Ten khoa hoc"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Mo ta"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <Input
              placeholder="Thumbnail URL"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            />
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Course['status'] })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
            <Button disabled={saving || !form.title.trim()}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {mode === 'create' ? 'Tao khoa hoc' : 'Luu thay doi'}
            </Button>
          </form>
        </Card>

        {/* Course sections & lessons */}
        {courseTree ? (
          <Card>
            <h2 className="mb-4 text-lg font-bold text-[#172033]">Noi dung khoa hoc</h2>

            {/* Add section form */}
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                placeholder="Ten muc moi, vi du: Chuong 1, Phan co ban..."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => void handleAddSection()}
                disabled={addingSection || !newSectionTitle.trim()}
              >
                {addingSection ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Them muc
              </Button>
            </div>

            {/* Section list */}
            {courseTree.course_sections.length === 0 ? (
              <p className="text-sm text-[#607589]">Chua co muc nao. Hay them muc moi.</p>
            ) : (
              <div className="space-y-3">
                {courseTree.course_sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id)
                  const lf = getLessonForm(section.id)
                  return (
                    <div key={section.id} className="rounded-md border border-[#d9e2ea]">
                      {/* Section header */}
                      <div className="flex items-center gap-2 px-4 py-3">
                        <button
                          type="button"
                          className="shrink-0 text-[#4d6378] hover:text-[#172033]"
                          onClick={() => toggleSection(section.id)}
                          aria-label={isExpanded ? 'Thu gon' : 'Mo rong'}
                        >
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>

                        {editingSectionId === section.id ? (
                          <div className="flex flex-1 items-center gap-2">
                            <Input
                              value={editingSectionTitle}
                              onChange={(e) => setEditingSectionTitle(e.target.value)}
                              className="min-h-9 text-sm"
                              autoFocus
                            />
                            <Button variant="primary" className="min-h-9 px-3 text-xs" onClick={() => void handleUpdateSection()}>
                              <Save size={14} /> Luu
                            </Button>
                            <Button variant="ghost" className="min-h-9 px-3 text-xs" onClick={cancelEditSection}>
                              <X size={14} /> Huy
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 text-sm font-semibold text-[#172033]">
                              <span className="text-[#607589]">{section.position}.</span> {section.title}
                            </span>
                            <span className="text-xs text-[#607589]">{section.lessons.length} bai</span>
                            <button
                              type="button"
                              className="shrink-0 rounded p-1 text-[#4d6378] hover:bg-[#edf4f8]"
                              onClick={(e) => { e.stopPropagation(); startEditSection(section.id, section.title); }}
                              aria-label="Sua muc"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              className="shrink-0 rounded p-1 text-[#b43232] hover:bg-[#fff1f1]"
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteSection(section.id); }}
                              aria-label="Xoa muc"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Expanded: lessons + add form */}
                      {isExpanded ? (
                        <div className="border-t border-[#d9e2ea] px-4 py-3 space-y-3">
                          {/* Confirm delete section */}
                          {confirmDeleteSection === section.id ? (
                            <Alert tone="error">
                              <div className="flex flex-col gap-2">
                                <p>Muc nay co {section.lessons.length} bai hoc. Ban chac chan muon xoa?</p>
                                <div className="flex gap-2">
                                  <Button variant="danger"  onClick={() => void handleDeleteSection(section.id)}>
                                    Xoa muc
                                  </Button>
                                  <Button variant="secondary"  onClick={() => setConfirmDeleteSection(null)}>
                                    Huy
                                  </Button>
                                </div>
                              </div>
                            </Alert>
                          ) : null}

                          {/* Lesson list */}
                          {section.lessons.length === 0 ? (
                            <p className="text-sm text-[#607589]">Chua co bai hoc.</p>
                          ) : (
                            <div className="space-y-2">
                              {section.lessons.map((lesson) => (
                                <div key={lesson.id} className="rounded border border-[#edf4f8] bg-[#f7f9fb] p-3">
                                  {editingLessonId === lesson.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={editingLessonTitle}
                                        onChange={(e) => setEditingLessonTitle(e.target.value)}
                                        placeholder="Ten bai hoc"
                                        className="min-h-9 text-sm"
                                        autoFocus
                                      />
                                      <Input
                                        value={editingLessonYoutube}
                                        onChange={(e) => setEditingLessonYoutube(e.target.value)}
                                        placeholder="YouTube Video ID hoac link"
                                        className="min-h-9 text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <Button className="min-h-9 px-3 text-xs" onClick={() => void handleUpdateLesson()}>
                                          <Save size={14} /> Luu
                                        </Button>
                                        <Button variant="ghost" className="min-h-9 px-3 text-xs" onClick={cancelEditLesson}>
                                          <X size={14} /> Huy
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="flex-1 text-sm text-[#172033]">
                                        <span className="text-[#607589]">{lesson.position}.</span> {lesson.title}
                                        {lesson.youtube_video_id ? (
                                          <span className="ml-2 text-xs text-[#4d6378]">Â· {lesson.youtube_video_id}</span>
                                        ) : null}
                                      </span>
                                      <button
                                        type="button"
                                        className="shrink-0 rounded p-1 text-[#4d6378] hover:bg-[#dbe6ed]"
                                        onClick={(e) => { e.stopPropagation(); startEditLesson(lesson); }}
                                        aria-label="Sua bai hoc"
                                      >
                                        <Edit3 size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        className="shrink-0 rounded p-1 text-[#b43232] hover:bg-[#fff1f1]"
                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteLesson(lesson.id); }}
                                        aria-label="Xoa bai hoc"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}

                                  {/* Confirm delete lesson */}
                                  {confirmDeleteLesson === lesson.id ? (
                                    <div className="mt-2">
                                      <Alert tone="error">
                                        <div className="flex flex-col gap-2">
                                          <p>Xoa bai &ldquo;{lesson.title}&rdquo;?</p>
                                          <div className="flex gap-2">
                                            <Button variant="danger"  onClick={() => void handleDeleteLesson(lesson.id)}>
                                              Xoa
                                            </Button>
                                            <Button variant="secondary"  onClick={() => setConfirmDeleteLesson(null)}>
                                              Huy
                                            </Button>
                                          </div>
                                        </div>
                                      </Alert>
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add lesson form (inside this section) */}
                          <div className="grid gap-2 border-t border-[#d9e2ea] pt-3">
                            <p className="text-xs font-semibold text-[#365066]">
                              Them bai hoc vao &ldquo;{section.title}&rdquo;
                            </p>
                            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                              <Input
                                placeholder="Ten bai hoc"
                                value={lf.title}
                                onChange={(e) => setLessonFormField(section.id, 'title', e.target.value)}
                                className="min-h-9 text-sm"
                              />
                              <Input
                                placeholder="Link YouTube hoac Video ID"
                                value={lf.youtube}
                                onChange={(e) => setLessonFormField(section.id, 'youtube', e.target.value)}
                                className="min-h-9 text-sm"
                              />
                              <Button
                                type="button"
                                className="min-h-9 text-sm"
                                onClick={() => void handleAddLesson(section.id)}
                                disabled={!lf.title.trim() || !lf.youtube.trim()}
                              >
                                <Plus size={16} /> Them bai
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        ) : mode === 'create' ? (
          <Card>
            <p className="text-sm text-[#607589]">Dien thong tin phia tren va tao khoa hoc de bat dau them muc va bai hoc.</p>
          </Card>
        ) : null}
      </section>
    </div>
  )
}


