import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute'

const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Public-only: redirect to home if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected: redirect to login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clientes" element={<PlaceholderPage />} />
            <Route path="planes" element={<PlaceholderPage />} />
            <Route path="ejercicios" element={<PlaceholderPage />} />
            <Route path="agenda" element={<PlaceholderPage />} />
            <Route path="suscripciones" element={<PlaceholderPage />} />
            <Route path="configuracion" element={<PlaceholderPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
