import { ImageUp, Loader2, Save, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card, Input, PageHeader, Textarea } from '../../components/ui'
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
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [notification, setNotification] = useState<Notification>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

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
      }
      setLoadingData(false)
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const hasChanges =
    JSON.stringify(form) !== JSON.stringify(originalForm) ||
    logoFile !== null ||
    faviconFile !== null

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number,
    label: string,
  ): string | null {
    if (!allowedTypes.includes(file.type) && file.type !== 'image/x-icon') {
      const types = ['PNG', 'JPEG', 'WebP', ...(allowedTypes.includes('image/x-icon') ? ['ICO'] : [])]
       return `${label} phải là file ảnh (${types.join(', ')}).`
    }
    if (file.size > maxSize) {
      const mb = Math.round(maxSize / (1024 * 1024))
       return `${label} không được vượt quá ${mb} MB.`
    }
    return null
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateFile(file, ACCEPTED_IMAGE_TYPES, MAX_LOGO_SIZE, 'Logo')
    if (error) { setNotification({ message: error, tone: 'error' }); return }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateFile(file, ACCEPTED_FAVICON_TYPES, MAX_FAVICON_SIZE, 'Favicon')
    if (error) { setNotification({ message: error, tone: 'error' }); return }
    setFaviconFile(file)
    setFaviconPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    setNotification(null)

    let newLogoUrl = existingLogoUrl
    let newFaviconUrl = existingFaviconUrl
    let oldLogoPath: string | null = null
    let oldFaviconPath: string | null = null

    try {
      if (logoFile) {
        newLogoUrl = await uploadBrandingAsset(logoFile, 'logo')
        oldLogoPath = existingLogoUrl ? getStoragePathFromUrl(existingLogoUrl) : null
      }
      if (faviconFile) {
        newFaviconUrl = await uploadBrandingAsset(faviconFile, 'favicon')
        oldFaviconPath = existingFaviconUrl ? getStoragePathFromUrl(existingFaviconUrl) : null
      }

      const homepageContent: HomepageContent = {
        eyebrow: form.homepage_eyebrow,
        title: form.homepage_title,
        subtitle: form.homepage_subtitle,
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

      setExistingLogoUrl(newLogoUrl)
      setExistingFaviconUrl(newFaviconUrl)
      setLogoFile(null)
      setFaviconFile(null)
      const newForm: FormState = {
        site_name: form.site_name,
        page_title: form.page_title,
        homepage_eyebrow: form.homepage_eyebrow,
        homepage_title: form.homepage_title,
        homepage_subtitle: form.homepage_subtitle,
      }
      setForm(newForm)
      setOriginalForm(newForm)

      await refresh()
      setNotification({ message: 'Đã lưu cài đặt thành công.', tone: 'success' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu cài đặt. Vui lòng thử lại.'
      setNotification({ message, tone: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setForm(originalForm)
    setLogoFile(null)
    setFaviconFile(null)
    setLogoPreview(existingLogoUrl)
    setFaviconPreview(existingFaviconUrl)
    setNotification(null)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#0f6f64]" size={32} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Cài đặt" eyebrow="Quản trị" />

      {notification ? (
        <div className="mb-6">
          <Alert tone={notification.tone}>{notification.message}</Alert>
        </div>
      ) : null}

      <div className="space-y-8">
        <Card>
          <h2 className="mb-5 text-lg font-bold text-[#172033]">Thương hiệu</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-[#365066]">Tên thương hiệu</label>
              <Input
                value={form.site_name}
                onChange={(e) => updateField('site_name', e.target.value)}
                maxLength={100}
                placeholder="BK3D Learning"
              />
              <p className="mt-1 text-xs text-[#607589]">{form.site_name.length}/100 ký tự</p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-[#365066]">Page Title</label>
              <Input
                value={form.page_title}
                onChange={(e) => updateField('page_title', e.target.value)}
                maxLength={150}
                placeholder="BK3D Learning - Nền tảng đào tạo kỹ thuật"
              />
              <p className="mt-1 text-xs text-[#607589]">{form.page_title.length}/150 ký tự</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#365066]">Logo thương hiệu</label>
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#d9e2ea] bg-white">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <ImageUp size={28} className="text-[#b8cbd8]" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" type="button" onClick={() => logoInputRef.current?.click()}>
                    <Upload size={16} /> Thay logo
                  </Button>
                  {logoFile ? <span className="text-xs text-[#607589]">Đã chọn file mới</span> : null}
                </div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
              <p className="mt-1.5 text-xs text-[#607589]">PNG, JPEG, WebP. Tối đa 5 MB.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#365066]">Logo favicon</label>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#d9e2ea] bg-white">
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <ImageUp size={20} className="text-[#b8cbd8]" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" type="button" onClick={() => faviconInputRef.current?.click()}>
                    <Upload size={16} /> Thay favicon
                  </Button>
                  {faviconFile ? <span className="text-xs text-[#607589]">Đã chọn file mới</span> : null}
                </div>
              </div>
              <input ref={faviconInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/x-icon" className="hidden" onChange={handleFaviconChange} />
              <p className="mt-1.5 text-xs text-[#607589]">PNG, JPEG, WebP, ICO. Tối đa 2 MB.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-bold text-[#172033]">Nội dung trang chủ</h2>
          <div className="grid gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#365066]">Nhãn nhỏ (eyebrow)</label>
              <Input
                value={form.homepage_eyebrow}
                onChange={(e) => updateField('homepage_eyebrow', e.target.value)}
                maxLength={80}
                placeholder="Nền tảng đào tạo kỹ thuật"
              />
              <p className="mt-1 text-xs text-[#607589]">{form.homepage_eyebrow.length}/80 ký tự</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#365066]">Tiêu đề chính</label>
              <Textarea
                value={form.homepage_title}
                onChange={(e) => updateField('homepage_title', e.target.value)}
                maxLength={200}
                rows={2}
                placeholder="BK3D giúp học viên học đúng khóa, đúng tiến độ, đúng năng lực."
              />
              <p className="mt-1 text-xs text-[#607589]">{form.homepage_title.length}/200 ký tự</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#365066]">Mô tả giới thiệu</label>
              <Textarea
                value={form.homepage_subtitle}
                onChange={(e) => updateField('homepage_subtitle', e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Quản lý khóa học, bài giảng YouTube Unlisted, tiến độ học..."
              />
              <p className="mt-1 text-xs text-[#607589]">{form.homepage_subtitle.length}/500 ký tự</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void handleSave()} disabled={saving || !hasChanges}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
          <Button variant="secondary" onClick={resetForm} disabled={saving || !hasChanges}>
            Khôi phục
          </Button>
        </div>
      </div>
    </div>
  )
}
