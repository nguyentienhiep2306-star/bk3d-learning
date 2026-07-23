 import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
 import { getSiteSettings } from '../../services/siteSettings'
 import type { HomepageContent } from '../../types/database'
 import {
   DEFAULT_HOMEPAGE,
   DEFAULT_PAGE_TITLE,
   DEFAULT_SITE_NAME,
   SiteSettingsContext,
   type SiteSettingsValue,
 } from './siteSettingsContext'
 
 export function SiteSettingsProvider({ children }: { children: ReactNode }) {
   const [siteName, setSiteName] = useState(DEFAULT_SITE_NAME)
   const [pageTitle, setPageTitle] = useState(DEFAULT_PAGE_TITLE)
   const [logoUrl, setLogoUrl] = useState<string | null>(null)
   const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
   const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(DEFAULT_HOMEPAGE)
   const [loading, setLoading] = useState(true)
 
   const hydrate = useCallback(async () => {
     setLoading(true)
     try {
       const settings = await getSiteSettings()
       if (settings) {
         setSiteName(settings.site_name)
         setPageTitle(settings.page_title)
         setLogoUrl(settings.logo_url)
         setFaviconUrl(settings.favicon_url)
 
         // Merge with defaults so missing keys don't break the page
         setHomepageContent({
           ...DEFAULT_HOMEPAGE,
           ...(settings.homepage_content as Partial<HomepageContent>),
         })
       }
     } catch {
       // Fallback to defaults already set
     } finally {
       setLoading(false)
     }
   }, [])
 
   useEffect(() => {
     void hydrate()
   }, [hydrate])
 
   // Sync page title to document
   useEffect(() => {
     document.title = pageTitle
   }, [pageTitle])
 
  const FALLBACK_FAVICON = '/favicon.svg'

  // Sync favicon
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!faviconUrl) {
       // Restore fallback so the default favicon reappears when admin clears it
       if (link) link.href = FALLBACK_FAVICON
      return
    }

    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    // Cache-bust via query param
    const cacheBust = `?v=${Date.now()}`
    link.href = `${faviconUrl}${cacheBust}`
  }, [faviconUrl])
 
   const value = useMemo<SiteSettingsValue>(
     () => ({
       siteName,
       pageTitle,
       logoUrl,
       faviconUrl,
       homepageContent,
       loading,
       refresh: hydrate,
     }),
     [siteName, pageTitle, logoUrl, faviconUrl, homepageContent, loading, hydrate],
   )
 
   return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
 }
