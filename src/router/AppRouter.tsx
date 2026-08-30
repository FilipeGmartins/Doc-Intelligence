import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { ComingSoonPage } from '../pages/ComingSoon/ComingSoonPage'
import { UploadPage } from '../pages/Upload/UploadPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="review" element={<ComingSoonPage title="Conferência" description="A fila de documentos com baixa confiança será implementada em seguida." />} />
          <Route path="documents" element={<ComingSoonPage title="Documentos" description="A busca e a listagem completa serão conectadas ao serviço mockado." />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
