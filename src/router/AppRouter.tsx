import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { UploadPage } from '../pages/Upload/UploadPage'
import { ReviewQueuePage } from '../pages/ReviewQueue/ReviewQueuePage'
import { DocumentDetailsPage } from '../pages/DocumentDetails/DocumentDetailsPage'
import { DocumentsPage } from '../pages/Documents/DocumentsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="review" element={<ReviewQueuePage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:id" element={<DocumentDetailsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
