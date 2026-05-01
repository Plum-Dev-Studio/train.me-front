import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute'

const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const ClientsPage = lazy(() => import('@/pages/ClientsPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const PaymentResultFailurePage = lazy(
  () => import('@/pages/PaymentResultFailurePage'),
)
const PaymentResultPendingPage = lazy(
  () => import('@/pages/PaymentResultPendingPage'),
)
const PaymentResultSuccessPage = lazy(
  () => import('@/pages/PaymentResultSuccessPage'),
)
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'))
const PlansPage = lazy(() => import('@/pages/PlansPage'))
const TrainerPublicProfilePage = lazy(
  () => import('@/pages/TrainerPublicProfilePage'),
)
const TrainersSearchPage = lazy(() => import('@/pages/TrainersSearchPage'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<TrainersSearchPage />} />
        <Route path="/entrenadores" element={<TrainersSearchPage />} />
        <Route
          path="/entrenadores/:trainerId"
          element={<TrainerPublicProfilePage />}
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/payments/result/success"
          element={<PaymentResultSuccessPage />}
        />
        <Route
          path="/payments/result/failure"
          element={<PaymentResultFailurePage />}
        />
        <Route
          path="/payments/result/pending"
          element={<PaymentResultPendingPage />}
        />

        {/* Public-only: redirect to home if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected: redirect to login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="planes" element={<PlansPage />} />
            <Route path="ejercicios" element={<ExercisesPage />} />
            <Route path="agenda" element={<PlaceholderPage />} />
            <Route path="suscripciones" element={<PlaceholderPage />} />
            <Route path="configuracion" element={<PlaceholderPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
