import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
 import { SiteSettingsProvider } from './features/siteSettings/SiteSettingsProvider.tsx'
import { AppRoutes } from './routes/AppRoutes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
         <SiteSettingsProvider>
           <AppRoutes />
         </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
