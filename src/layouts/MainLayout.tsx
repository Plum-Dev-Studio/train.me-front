import { Outlet } from 'react-router'
import { Sidebar } from '@/components/Sidebar'
import { TrainerDashboardProvider } from '@/contexts/TrainerDashboardProvider'

export function MainLayout() {
  return (
    <TrainerDashboardProvider>
      <div className="flex h-full bg-[var(--bg-page)]">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </TrainerDashboardProvider>
  )
}
