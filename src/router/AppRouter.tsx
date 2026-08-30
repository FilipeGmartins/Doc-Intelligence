import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { ComingSoonPage } from '../pages/ComingSoon/ComingSoonPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<ComingSoonPage title="Enviar documentos" description="O fluxo de upload será implementado na próxima etapa." />} />
          <Route path="review" element={<ComingSoonPage title="Conferência" description="A fila de documentos com baixa confiança será implementada em seguida." />} />
          <Route path="documents" element={<ComingSoonPage title="Documentos" description="A busca e a listagem completa serão conectadas ao serviço mockado." />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
