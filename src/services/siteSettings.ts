import { supabase } from '../lib/supabase'
import type { HomepageContent, SiteSettings } from '../types/database'

const BUCKET = 'branding-assets'
const TABLE = 'site_settings'
const SETTINGS_ID = 'default'

export type SettingsUpdate = {
  site_name?: string
  page_title?: string
  logo_url?: string | null
  favicon_url?: string | null
  homepage_content?: HomepageContent
}

function classifyStorageError(err: unknown): string {
  const error = err as Record<string, unknown> | null
  if (!error || typeof error !== 'object') {
    return 'Không thể tải file lên. Vui lòng thử lại.'
  }

  const message = String(error.message ?? '')
  const status = Number(error.statusCode ?? error.status ?? 0)
  const code = String(error.error ?? error.code ?? '')

  console.log('[uploadBrandingAsset]', {
    stage: 'upload',
    status,
    code,
    message: message.slice(0, 250),
  })

  if (status === 404 || message.includes('bucket') || message.includes('not found') || code === 'not_found') {
    return 'Kho lưu trữ chưa được cấu hình.'
  }
  if (status === 401 || status === 403 || message.includes('permission') || message.includes('policy') || code === 'unauthorized' || code === 'permission_denied') {
    return 'Bạn không có quyền tải ảnh lên.'
  }
  if (status === 409 || message.includes('already exists') || code === 'duplicate') {
    return 'Tên file đã tồn tại. Vui lòng thử lại.'
  }
  if (status === 413 || message.includes('too large') || message.includes('exceeds') || message.includes('size limit')) {
    return 'File vượt quá dung lượng cho phép.'
  }
  if (status === 400 || status === 414) {
    return 'Định dạng ảnh không được hỗ trợ.'
  }

  return 'Không thể tải file lên. Vui lòng thử lại.'
}

function classifyDbError(err: unknown): string {
  const error = err as Record<string, unknown> | null
  const message = String(error?.message ?? '')
  const code = String(error?.code ?? '')

  console.log('[updateSiteSettings]', {
    stage: 'database',
    code,
    message: message.slice(0, 250),
  })

  if (code === '42501' || message.includes('permission denied') || message.includes('policy')) {
    return 'Bạn không có quyền thay đổi cài đặt.'
  }

  return 'Đã tải ảnh lên nhưng không cập nhật được cài đặt.'
}

/**
 * Fetch the single site settings record.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', SETTINGS_ID)
    .maybeSingle()

  if (error) {
    console.error('Failed to load site settings:', error)
    return null
  }
  return data as SiteSettings | null
}

/**
 * Update site settings. Admin-only (enforced by RLS).
 */
export async function updateSiteSettings(
  updates: SettingsUpdate,
): Promise<SiteSettings> {
  const payload: Record<string, unknown> = { ...updates }
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', SETTINGS_ID)
    .select('*')
    .single()

  if (error) {
    throw new Error(classifyDbError(error))
  }
  return data as SiteSettings
}

/**
 * Upload an image file to the branding-assets bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadBrandingAsset(
  file: File,
  folder: 'logo' | 'favicon',
): Promise<string> {
  // Check session before upload
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    throw new Error('Bạn không có quyền tải ảnh lên.')
  }

  const ext = file.name.split('.').pop() ?? 'png'
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'png'
  const uniqueName = `${folder}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${safeExt}`
  const filePath = `branding/${folder}/${uniqueName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(classifyStorageError(error))
  }

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  console.log('[uploadBrandingAsset] upload OK', {
    stage: 'success',
    folder,
    filePath,
  })

  return publicUrl.publicUrl
}

/**
 * Delete a branding asset file from storage.
 */
export async function deleteBrandingAsset(filePath: string): Promise<void> {
  if (!filePath.startsWith('branding/')) {
    console.warn('Skipping delete – path outside branding folder:', filePath)
    return
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath])

  if (error) {
    console.log('[deleteBrandingAsset] delete failed', {
      stage: 'delete',
      filePath,
      message: String(error.message ?? '').slice(0, 200),
    })
  }
}

/**
 * Extract the storage path from a full public URL.
 */
export function getStoragePathFromUrl(publicUrl: string): string | null {
  const idx = publicUrl.indexOf('/branding/')
  if (idx === -1) return null
  return publicUrl.slice(idx + 1)
}
