import { Loader2, MessageSquare, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui'
import { listLeads, updateLead, deleteLead, type RegistrationLead, type LeadStatus } from '../../services/registrationLeads'

export function AdminLeads() {
  const [leads, setLeads] = useState<RegistrationLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LeadStatus | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<LeadStatus>('new')
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try { setLeads(await listLeads({ status: filter || undefined, search: search || undefined })) } catch {}
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  function select(lead: RegistrationLead) {
    setSelectedId(lead.id); setNote(lead.admin_note || ''); setStatus(lead.status as LeadStatus)
  }

  async function handleUpdate() {
    if (!selectedId) return
    try { await updateLead(selectedId, { status, admin_note: note }); setMessage({ text: 'Da cap nhat.', tone: 'success' }); void load() }
    catch (err) { setMessage({ text: err instanceof Error ? err.message : 'Loi.', tone: 'error' }) }
  }

  async function handleDelete(id: string) {
    try { await deleteLead(id); setConfirmDelete(null); setSelectedId(null); setMessage({ text: 'Da xoa.', tone: 'success' }); void load() }
    catch (err) { setMessage({ text: err instanceof Error ? err.message : 'Loi.', tone: 'error' }) }
  }

  const selected = leads.find(l => l.id === selectedId)

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside>
        <PageHeader title="Dang ky tu van" eyebrow="Admin" />
        <div className="flex gap-2 mb-3">
          <Input placeholder="Tim kiem..." value={search} onChange={e => setSearch(e.target.value)} />
          <Button onClick={() => void load()}><Search size={16} /></Button>
        </div>
        <Select value={filter} onChange={e => { setFilter(e.target.value as LeadStatus | ''); setTimeout(() => load(), 50) }}>
          <option value="">Tat ca</option><option value="new">Moi</option><option value="contacted">Da lien he</option><option value="qualified">Tiem nang</option><option value="converted">Chuyen doi</option><option value="closed">Dong</option>
        </Select>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand" size={24} /></div> : null}
        <div className="mt-3 space-y-1 max-h-[60vh] overflow-y-auto">
          {leads.map(l => (
            <button key={l.id} className={'block w-full rounded-lg border p-3 text-left text-sm ' + (selectedId === l.id ? 'border-brand bg-brand-soft font-semibold' : 'border-border bg-white')}
              onClick={() => select(l)}>
              <div className="font-semibold">{l.full_name}</div>
              <div className="text-xs">{l.phone} {l.email ? '· '+l.email : ''}</div>
              <span className="inline-block mt-1 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase bg-gray-100">{l.status}</span>
            </button>
          ))}
        </div>
      </aside>
      <section>
        {message ? <div className="mb-4"><Alert tone={message.tone}>{message.text}</Alert></div> : null}
        {selected ? (
          <Card>
            <h2 className="text-lg font-bold mb-4">{selected.full_name}</h2>
            <div className="grid gap-3 text-sm">
              <div><span className="font-semibold">DT:</span> {selected.phone}</div>
              {selected.email ? <div><span className="font-semibold">Email:</span> {selected.email}</div> : null}
              {selected.interest ? <div><span className="font-semibold">Quan tam:</span> {selected.interest}</div> : null}
              {selected.message ? <div><span className="font-semibold">Ghi chu:</span> {selected.message}</div> : null}
              <div><span className="font-semibold">Ngay:</span> {new Date(selected.created_at).toLocaleString('vi-VN')}</div>
            </div>
            <div className="mt-4 grid gap-3">
              <div><label className="block text-sm font-semibold mb-1">Trang thai</label>
                <Select value={status} onChange={e => setStatus(e.target.value as LeadStatus)}>
                  <option value="new">Moi</option><option value="contacted">Da lien he</option><option value="qualified">Tiem nang</option><option value="converted">Chuyen doi</option><option value="closed">Dong</option>
                </Select>
              </div>
              <div><label className="block text-sm font-semibold mb-1">Ghi chu noi bo</label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Ghi chu noi bo..." />
              </div>
              <Button onClick={() => void handleUpdate()}><MessageSquare size={16} /> Cap nhat</Button>
            </div>
            <div className="mt-4 border-t pt-4">
              {confirmDelete === selected.id ? (
                <div className="flex gap-2">
                  <Button variant="danger" onClick={() => void handleDelete(selected.id)}><Trash2 size={14} /> Xac nhan xoa</Button>
                  <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Huy</Button>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(selected.id)}><Trash2 size={14} /> Xoa</Button>
              )}
            </div>
          </Card>
        ) : <Card><p className="text-sm text-gray-500">Chon mot dang ky de xem.</p></Card>}
      </section>
    </div>
  )
}
