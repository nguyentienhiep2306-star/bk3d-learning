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
export const DEFAULT_PAGE_TITLE = 'BK3D Learning - Đào tạo thiết kế cơ khí và SolidWorks thực chiến'
export const DEFAULT_HOMEPAGE: HomepageContent = {
  eyebrow: 'Đào tạo kỹ thuật và thiết kế cơ khí thực chiến',
  title: 'Làm chủ SolidWorks – Tự tin hoàn thiện đồ án và sẵn sàng cho công việc thực tế',
  subtitle: 'Lộ trình học chuyên sâu dành cho sinh viên và kỹ sư cơ khí. Học theo dự án, mô phỏng đúng quy trình doanh nghiệp và theo dõi tiến độ ngay trên BK3D Learning.',
  hero_image_url: null,
  hero_image_alt: 'Học SolidWorks theo dự án thực tế',
  hero_image_position: 'center',
}
 
 export const SiteSettingsContext = createContext<SiteSettingsValue | null>(null)
 
 export function useSiteSettings() {
   const context = useContext(SiteSettingsContext)
   if (!context) throw new Error('useSiteSettings must be used inside SiteSettingsProvider')
   return context
 }
