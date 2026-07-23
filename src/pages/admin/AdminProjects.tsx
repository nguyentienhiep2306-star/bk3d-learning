import { ArrowUp, ArrowDown, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui'
import { uploadBrandingAsset, getStoragePathFromUrl, deleteBrandingAsset } from '../../services/siteSettings'
import { listAdminProjects, createProject, updateProject, deleteProject, reorderProjects, getNextProjectSortOrder, type HomepageProject } from '../../services/homepageProjects'

export function AdminProjects() {
  const [projects, setProjects] = useState<HomepageProject[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', short_description: '', image_url: '', image_alt: '', category: '', project_url: '', is_published: true, sort_order: 0 })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    try { setProjects(await listAdminProjects()) } catch {}
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  function resetForm() {
    setForm({ title: '', short_description: '', image_url: '', image_alt: '', category: '', project_url: '', is_published: true, sort_order: 0 })
    setImageFile(null); setImagePreview(null); setEditingId(null); setIsNew(false); setConfirmDelete(null)
  }

  async function startNew() {
    resetForm()
    const order = await getNextProjectSortOrder().catch(() => 1)
    setForm(f => ({ ...f, sort_order: order }))
    setIsNew(true)
  }

  function startEdit(p: HomepageProject) {
    resetForm(); setIsNew(false)
    setEditingId(p.id!)
    setForm({ title: p.title, short_description: p.short_description || '', image_url: p.image_url, image_alt: p.image_alt || '', category: p.category || '', project_url: p.project_url || '', is_published: p.is_published, sort_order: p.sort_order })
    setImagePreview(p.image_url)
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) { setMessage({ text: 'Dinh dang anh khong ho tro.', tone: 'error' }); return }
    if (f.size > 5 * 1024 * 1024) { setMessage({ text: 'Anh vuot qua 5 MB.', tone: 'error' }); return }
    setImageFile(f); setImagePreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    if (!form.title.trim() || (!isNew && !imagePreview) || (isNew && !imageFile)) {
      setMessage({ text: 'Vui long nhap tieu de va chon anh.', tone: 'error' }); return
    }
    setSaving(true); setMessage(null)
    try {
      let imageUrl = form.image_url
      if (imageFile) {
        imageUrl = await uploadBrandingAsset(imageFile, 'hero')
        const oldPath = form.image_url ? getStoragePathFromUrl(form.image_url) : null
        if (oldPath) void deleteBrandingAsset(oldPath)
      }
      const payload = { ...form, image_url: imageUrl, short_description: form.short_description || null, image_alt: form.image_alt || null, category: form.category || null, project_url: form.project_url || null }
      if (isNew) { await createProject(payload) }
      else if (editingId) { await updateProject(editingId, payload) }
      await load(); resetForm()
      setMessage({ text: isNew ? 'Da them du an.' : 'Da cap nhat du an.', tone: 'success' })
    } catch (err) { setMessage({ text: err instanceof Error ? err.message : 'Loi.', tone: 'error' }) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    try {
      const p = projects.find(pr => pr.id === id)
      await deleteProject(id)
      if (p?.image_url) { const path = getStoragePathFromUrl(p.image_url); if (path) void deleteBrandingAsset(path) }
      await load(); resetForm()
      setMessage({ text: 'Da xoa du an.', tone: 'success' })
    } catch (err) { setMessage({ text: err instanceof Error ? err.message : 'Loi.', tone: 'error' }) }
  }

  async function move(p: HomepageProject, dir: number) {
    const idx = projects.indexOf(p)
    if (idx + dir < 0 || idx + dir >= projects.length) return
    const list = [...projects]
    const swap = list[idx + dir]
    const newOrder = p.sort_order; const swapOrder = swap.sort_order
    await reorderProjects([{ id: p.id!, sort_order: swapOrder }, { id: swap.id!, sort_order: newOrder }])
    await load()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside>
        <PageHeader title="Du an" eyebrow="Admin" />
        <Button className="w-full mb-3" onClick={startNew}><Plus size={18} /> Them du an</Button>
        {loading ? <div className="flex justify-center py-6"><Loader2 className="animate-spin text-brand" size={20} /></div> : null}
        {projects.map(p => (
          <button key={p.id} className={'block w-full rounded-lg border p-3 text-left text-sm mb-2 ' + (editingId === p.id ? 'border-brand bg-brand-soft font-semibold' : 'border-border bg-white hover:bg-tech')}
            onClick={() => startEdit(p)}>
            {p.title} {!p.is_published ? <span className="text-xs">(an)</span> : null}
          </button>
        ))}
      </aside>
      <section>
        {message ? <div className="mb-4"><Alert tone={message.tone}>{message.text}</Alert></div> : null}
        {(isNew || editingId) ? (
          <Card>
            <h2 className="mb-4 text-lg font-bold">{isNew ? 'Them du an' : 'Sua du an'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Tieu de</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Mo ta ngan</label><Textarea value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} rows={2} /></div>
              <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Anh du an</label>
                <div className="flex items-start gap-4">
                  <div className="flex aspect-[3/2] h-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                    {imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <Upload size={20} className="text-gray-400" />}
                  </div>
                  <Button variant="secondary" type="button" onClick={() => fileRef.current?.click()}><Upload size={16} /> Chon anh</Button>
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImage} />
                <p className="text-xs mt-1">Khuyen nghi anh ngang 3:2.</p>
              </div>
              <div><label className="block text-sm font-semibold mb-1">Alt text</label><Input value={form.image_alt} onChange={e => setForm({ ...form, image_alt: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold mb-1">Nhom / Linh vuc</label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold mb-1">Link chi tiet</label><Input value={form.project_url} onChange={e => setForm({ ...form, project_url: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold mb-1">Trang thai</label>
                <Select value={form.is_published ? 'published' : 'hidden'} onChange={e => setForm({ ...form, is_published: e.target.value === 'published' })}>
                  <option value="published">Dang hien thi</option><option value="hidden">Tam an</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => void handleSave()} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} {saving ? 'Dang luu...' : 'Luu'}</Button>
              <Button variant="secondary" onClick={resetForm}>Huy</Button>
            </div>
          </Card>
        ) : <Card><p className="text-sm text-gray-500">Chon du an hoac tao moi.</p></Card>}

        {/* Arrow buttons for order */}
        {editingId && projects.length > 1 ? (
          <Card className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Thu tu hien thi</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => move(projects.find(p => p.id === editingId)!, -1)}><ArrowUp size={14} /> Len</Button>
              <Button variant="secondary" onClick={() => move(projects.find(p => p.id === editingId)!, 1)}><ArrowDown size={14} /> Xuong</Button>
            </div>
          </Card>
        ) : null}

        {/* Delete */}
        {editingId ? (
          <Card className="mt-4 border-brand-border">
            <h3 className="text-sm font-semibold text-brand">Nguy hiem</h3>
            <p className="text-sm mt-1">Xoa du an nay se khong the hoan tac.</p>
            {confirmDelete === editingId ? (
              <div className="mt-3 flex gap-2">
                <Button variant="danger" onClick={() => { void handleDelete(editingId!) }}><Trash2 size={14} /> Xac nhan xoa</Button>
                <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Huy</Button>
              </div>
            ) : (
              <Button variant="danger" className="mt-3" onClick={() => setConfirmDelete(editingId)}><Trash2 size={14} /> Xoa du an</Button>
            )}
          </Card>
        ) : null}
      </section>
    </div>
  )
}

