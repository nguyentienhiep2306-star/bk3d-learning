 import { createContext, useContext } from 'react'
 import type { HomepageContent } from '../../types/database'
 
 export type SiteSettingsValue = {
   siteName: string
   pageTitle: string
   logoUrl: string | null
   faviconUrl: string | null
   homepageContent: HomepageContent | null
   loading: boolean
   refresh: () => Promise<void>
 }
 
 export const DEFAULT_SITE_NAME = 'BK3D Learning'
 export const DEFAULT_PAGE_TITLE = 'BK3D Learning - Nền tảng đào tạo kỹ thuật'
 export const DEFAULT_HOMEPAGE: HomepageContent = {
   eyebrow: 'Nền tảng đào tạo kỹ thuật',
   title: 'BK3D giúp học viên học đúng khóa, đúng tiến độ, đúng năng lực.',
   subtitle:
     'Quản lý khóa học, bài giảng YouTube Unlisted, tiến độ học và bài kiểm tra trên một hệ thống React + Supabase sẵn sàng triển khai tại bk3d.io.vn.',
 }
 
 export const SiteSettingsContext = createContext<SiteSettingsValue | null>(null)
 
 export function useSiteSettings() {
   const context = useContext(SiteSettingsContext)
   if (!context) throw new Error('useSiteSettings must be used inside SiteSettingsProvider')
   return context
 }
