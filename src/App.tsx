import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Public-only: redirect to home if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected: redirect to login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<div />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
