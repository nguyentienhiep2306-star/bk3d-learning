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
 
 /**
  * Fetch the single site settings record.
  * Returns null if not found or on error (caller handles fallback).
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
  * Update text-only settings fields. Admin-only (enforced by RLS).
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
     console.error('Failed to update site settings:', error)
     throw new Error('Không thể lưu cài đặt. Vui lòng thử lại.')
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
   const ext = file.name.split('.').pop() ?? 'png'
   const uniqueName = `${folder}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`
   const filePath = `branding/${folder}/${uniqueName}`
 
   const { error } = await supabase.storage
     .from(BUCKET)
     .upload(filePath, file, {
       cacheControl: '3600',
       upsert: false,
       contentType: file.type,
     })
 
   if (error) {
     console.error('Upload failed:', error)
     throw new Error('Không thể tải file lên. Vui lòng thử lại.')
   }
 
   const { data: publicUrl } = supabase.storage
     .from(BUCKET)
     .getPublicUrl(filePath)
 
   return publicUrl.publicUrl
 }
 
 /**
  * Delete a branding asset file from storage.
  * Only deletes if the path starts with "branding/" to stay within the bucket.
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
     console.error('Delete failed:', error)
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
