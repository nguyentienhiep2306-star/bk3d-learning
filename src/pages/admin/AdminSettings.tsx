import { ImageUp, Loader2, Save, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui'
import { useSiteSettings } from '../../features/siteSettings/siteSettingsContext'
import {
  deleteBrandingAsset,
  getSiteSettings,
  getStoragePathFromUrl,
  updateSiteSettings,
  uploadBrandingAsset,
  type SettingsUpdate,
} from '../../services/siteSettings'
import type { HomepageContent } from '../../types/database'

type FormState = {
  site_name: string
  page_title: string
  homepage_eyebrow: string
  homepage_title: string
  homepage_subtitle: string
}

type Notification = { message: string; tone: 'success' | 'error' } | null

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const ACCEPTED_FAVICON_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/x-icon']

const MAX_LOGO_SIZE = 5 * 1024 * 1024
const MAX_FAVICON_SIZE = 2 * 1024 * 1024

const INITIAL_FORM: FormState = {
  site_name: '',
  page_title: '',
  homepage_eyebrow: '',
  homepage_title: '',
  homepage_subtitle: '',
}

export function AdminSettings() {
  const { refresh } = useSiteSettings()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [originalForm, setOriginalForm] = useState<FormState>(INITIAL_FORM)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
  const [existingFaviconUrl, setExistingFaviconUrl] = useState<string | null>(null)
  // Hero image
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [existingHeroUrl, setExistingHeroUrl] = useState<string | null>(null)
  const [existingHeroAlt, setExistingHeroAlt] = useState('')
  const [existingHeroPosition, setExistingHeroPosition] = useState('center')
  const [heroAltText, setHeroAltText] = useState('')
  const [heroPosition, setHeroPosition] = useState('center')
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [notification, setNotification] = useState<Notification>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingData(true)
      const settings = await getSiteSettings()
      if (cancelled) return
      if (settings) {
        const hc = settings.homepage_content as HomepageContent | undefined
        const vals: FormState = {
          site_name: settings.site_name || '',
          page_title: settings.page_title || '',
          homepage_eyebrow: hc?.eyebrow ?? '',
          homepage_title: hc?.title ?? '',
          homepage_subtitle: hc?.subtitle ?? '',
        }
        setForm(vals)
        setOriginalForm(vals)
        setExistingLogoUrl(settings.logo_url)
        setExistingFaviconUrl(settings.favicon_url)
        setLogoPreview(settings.logo_url)
        setFaviconPreview(settings.favicon_url)
        setExistingHeroUrl(hc?.hero_image_url ?? null)
        setHeroPreview(hc?.hero_image_url ?? null)
        setExistingHeroAlt(hc?.hero_image_alt ?? '')
        setHeroAltText(hc?.hero_image_alt ?? '')
        setExistingHeroPosition(hc?.hero_image_position ?? 'center')
        setHeroPosition(hc?.hero_image_position ?? 'center')
      }
      setLoadingData(false)
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const hasChanges =
    JSON.stringify(form) !== JSON.stringify(originalForm) ||
    logoFile !== null ||
    faviconFile !== null ||
    heroFile !== null ||
    heroAltText !== existingHeroAlt ||
    heroPosition !== existingHeroPosition

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateFile(file: File, allowedTypes: string[], maxSize: number, label: string): string | null {
    if (!allowedTypes.includes(file.type) && file.type !== 'image/x-icon') {
      const types = ['PNG', 'JPEG', 'WebP', ...(allowedTypes.includes('image/x-icon') ? ['ICO'] : [])]
      return label + ' phải là file ảnh (' + types.join(', ') + ').'
    }
    if (file.size > maxSize) {
      const mb = Math.round(maxSize / (1024 * 1024))
      return label + ' không được vượt quá ' + mb + ' MB.'
    }
    return null
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateFile(file, ACCEPTED_IMAGE_TYPES, MAX_LOGO_SIZE, 'Logo')
    if (error) { setNotification({ message: error, tone: 'error' }); return }
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file))
  }

  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateFile(file, ACCEPTED_FAVICON_TYPES, MAX_FAVICON_SIZE, 'Favicon')
    if (error) { setNotification({ message: error, tone: 'error' }); return }
    setFaviconFile(file); setFaviconPreview(URL.createObjectURL(file))
  }

  function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateFile(file, ACCEPTED_IMAGE_TYPES, MAX_LOGO_SIZE, 'Ảnh Hero')
    if (error) { setNotification({ message: error, tone: 'error' }); return }
    setHeroFile(file); setHeroPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (saving) return
    setSaving(true); setNotification(null)
    const uploadedFiles: string[] = []
    let newLogoUrl = existingLogoUrl
    let newFaviconUrl = existingFaviconUrl
    let newHeroUrl = existingHeroUrl
    let oldLogoPath: string | null = null
    let oldFaviconPath: string | null = null
    let oldHeroPath: string | null = null

    try {
      if (!form.site_name.trim()) throw new Error('Tên thương hiệu không được để trống.')
      if (logoFile) { newLogoUrl = await uploadBrandingAsset(logoFile, 'logo'); uploadedFiles.push(getStoragePathFromUrl(newLogoUrl) ?? ''); oldLogoPath = existingLogoUrl ? getStoragePathFromUrl(existingLogoUrl) : null }
      if (faviconFile) { newFaviconUrl = await uploadBrandingAsset(faviconFile, 'favicon'); uploadedFiles.push(getStoragePathFromUrl(newFaviconUrl) ?? ''); oldFaviconPath = existingFaviconUrl ? getStoragePathFromUrl(existingFaviconUrl) : null }
      if (heroFile) { newHeroUrl = await uploadBrandingAsset(heroFile, 'hero'); uploadedFiles.push(getStoragePathFromUrl(newHeroUrl) ?? ''); oldHeroPath = existingHeroUrl ? getStoragePathFromUrl(existingHeroUrl) : null }

      const homepageContent: HomepageContent = {
        eyebrow: form.homepage_eyebrow,
        title: form.homepage_title,
        subtitle: form.homepage_subtitle,
        hero_image_url: newHeroUrl,
        hero_image_alt: heroAltText,
        hero_image_position: heroPosition,
      }

      const updates: SettingsUpdate = {
        site_name: form.site_name,
        page_title: form.page_title,
        homepage_content: homepageContent,
      }
      if (logoFile && newLogoUrl) updates.logo_url = newLogoUrl
      if (faviconFile && newFaviconUrl) updates.favicon_url = newFaviconUrl
      await updateSiteSettings(updates)

      if (oldLogoPath) void deleteBrandingAsset(oldLogoPath)
      if (oldFaviconPath) void deleteBrandingAsset(oldFaviconPath)
      if (oldHeroPath) void deleteBrandingAsset(oldHeroPath)

      setExistingLogoUrl(newLogoUrl); setExistingFaviconUrl(newFaviconUrl); setExistingHeroUrl(newHeroUrl)
      setLogoFile(null); setFaviconFile(null); setHeroFile(null)
      const newForm: FormState = { site_name: form.site_name, page_title: form.page_title, homepage_eyebrow: form.homepage_eyebrow, homepage_title: form.homepage_title, homepage_subtitle: form.homepage_subtitle }
      setForm(newForm); setOriginalForm(newForm); setExistingHeroAlt(heroAltText); setExistingHeroPosition(heroPosition)
      await refresh()
      setNotification({ message: 'Đã lưu cài đặt thành công.', tone: 'success' })
    } catch (err) {
      for (const p of uploadedFiles) { void deleteBrandingAsset(p) }
      const message = err instanceof Error ? err.message : 'Không thể lưu cài đặt.'
      setNotification({ message, tone: 'error' })
    } finally { setSaving(false) }
  }

  function resetForm() {
    setForm(originalForm); setLogoFile(null); setFaviconFile(null); setHeroFile(null)
    setLogoPreview(existingLogoUrl); setFaviconPreview(existingFaviconUrl); setHeroPreview(existingHeroUrl)
    setHeroAltText(existingHeroAlt); setHeroPosition(existingHeroPosition); setNotification(null)
  }

  if (loadingData) {
    return (<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div>)
  }

  return (
    <div>
      <PageHeader title="Cài đặt" eyebrow="Quản trị" />
      {notification ? (<div className="mb-6"><Alert tone={notification.tone}>{notification.message}</Alert></div>) : null}
      <div className="space-y-8">
        <Card>
          <h2 className="mb-5 text-lg font-bold text-[#111827]">Thương hiệu</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Tên thương hiệu</label>
              <Input value={form.site_name} onChange={(e) => updateField('site_name', e.target.value)} maxLength={100} placeholder="BK3D Learning" />
              <p className="mt-1 text-xs text-[#475569]">{form.site_name.length}/100 ký tự</p>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Page Title</label>
              <Input value={form.page_title} onChange={(e) => updateField('page_title', e.target.value)} maxLength={150} placeholder="BK3D Learning" />
              <p className="mt-1 text-xs text-[#475569]">{form.page_title.length}/150 ký tự</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Logo thương hiệu</label>
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                  {logoPreview ? (<img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />) : (<ImageUp size={28} className="text-[#475569]" />)}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" type="button" onClick={() => logoInputRef.current?.click()}><Upload size={16} /> Thay logo</Button>
                  {logoFile ? <span className="text-xs text-[#475569]">Đã chọn file mới</span> : null}
                </div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
              <p className="mt-1.5 text-xs text-[#475569]">PNG, JPEG, WebP. Tối đa 5 MB.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Logo favicon</label>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                  {faviconPreview ? (<img src={faviconPreview} alt="Favicon" className="max-h-full max-w-full object-contain" />) : (<ImageUp size={20} className="text-[#475569]" />)}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" type="button" onClick={() => faviconInputRef.current?.click()}><Upload size={16} /> Thay favicon</Button>
                  {faviconFile ? <span className="text-xs text-[#475569]">Đã chọn file mới</span> : null}
                </div>
              </div>
              <input ref={faviconInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/x-icon" className="hidden" onChange={handleFaviconChange} />
              <p className="mt-1.5 text-xs text-[#475569]">PNG, JPEG, WebP, ICO. Tối đa 2 MB.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-bold text-[#111827]">Nội dung trang chủ</h2>
          <div className="grid gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Nhãn nhỏ (eyebrow)</label>
              <Input value={form.homepage_eyebrow} onChange={(e) => updateField('homepage_eyebrow', e.target.value)} maxLength={80} />
              <p className="mt-1 text-xs text-[#475569]">{form.homepage_eyebrow.length}/80 ký tự</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Tiêu đề chính</label>
              <Textarea value={form.homepage_title} onChange={(e) => updateField('homepage_title', e.target.value)} maxLength={200} rows={2} />
              <p className="mt-1 text-xs text-[#475569]">{form.homepage_title.length}/200 ký tự</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Mô tả giới thiệu</label>
              <Textarea value={form.homepage_subtitle} onChange={(e) => updateField('homepage_subtitle', e.target.value)} maxLength={500} rows={3} />
              <p className="mt-1 text-xs text-[#475569]">{form.homepage_subtitle.length}/500 ký tự</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-bold text-[#111827]">Hình ảnh trang chủ</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Ảnh Hero</label>
              <div className="flex items-start gap-4">
                <div className="flex aspect-[4/3] h-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                  {heroPreview ? (<img src={heroPreview} alt="Hero preview" className="h-full w-full object-cover" />) : (<ImageUp size={28} className="text-[#475569]" />)}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" type="button" onClick={() => heroInputRef.current?.click()}><Upload size={16} /> Thay ảnh Hero</Button>
                  {heroFile ? <span className="text-xs text-[#475569]">Đã chọn ảnh mới</span> : null}
                </div>
              </div>
              <input ref={heroInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleHeroChange} />
              <p className="mt-1.5 text-xs text-[#475569]">PNG, JPEG, WebP. Tối đa 5 MB. Khuyến nghị ảnh ngang tỷ lệ 16:10 hoặc 4:3.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Mô tả ảnh (alt)</label>
              <Input value={heroAltText} onChange={(e) => setHeroAltText(e.target.value)} maxLength={200} placeholder="Học SolidWorks theo dự án thực tế" />
              <p className="mt-1 text-xs text-[#475569]">{heroAltText.length}/200 ký tự</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#475569]">Vị trí ảnh</label>
              <Select value={heroPosition} onChange={(e) => setHeroPosition(e.target.value)}>
                <option value="center">Căn giữa</option>
                <option value="top">Căn trên</option>
                <option value="bottom">Căn dưới</option>
                <option value="left">Căn trái</option>
                <option value="right">Căn phải</option>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void handleSave()} disabled={saving || !hasChanges}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
          <Button variant="secondary" onClick={resetForm} disabled={saving || !hasChanges}>Khôi phục</Button>
        </div>
      </div>
    </div>
  )
}
