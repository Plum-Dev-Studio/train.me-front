import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { MainLayout } from '@/layouts/MainLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute'
import { TrainerRoleRoute } from '@/components/auth/TrainerRoleRoute'
import { UserRoleRoute } from '@/components/auth/UserRoleRoute'

const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const ClientsPage = lazy(() => import('@/pages/ClientsPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'))
const NutritionCatalogPage = lazy(() => import('@/pages/NutritionCatalogPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
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
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage'))
const TrainerPublicProfilePage = lazy(
  () => import('@/pages/TrainerPublicProfilePage'),
)
const TrainersSearchPage = lazy(() => import('@/pages/TrainersSearchPage'))
const UserDashboardPage = lazy(() => import('@/pages/UserDashboardPage'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<TrainersSearchPage />} />
          <Route path="/entrenadores" element={<TrainersSearchPage />} />
          <Route
            path="/entrenadores/:trainerId"
            element={<TrainerPublicProfilePage />}
          />
          <Route element={<UserRoleRoute />}>
            <Route path="/me" element={<UserDashboardPage />} />
          </Route>
        </Route>
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
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Trainer app: requires authentication + trainer role */}
        <Route element={<TrainerRoleRoute />}>
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="planes" element={<PlansPage />} />
            <Route path="ejercicios" element={<ExercisesPage />} />
            <Route path="nutricion" element={<NutritionCatalogPage />} />
            <Route path="agenda" element={<PlaceholderPage />} />
            <Route path="suscripciones" element={<SubscriptionsPage />} />
            <Route path="configuracion" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
