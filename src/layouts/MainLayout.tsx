import { Outlet } from 'react-router'
import { Sidebar } from '@/components/Sidebar'

export function MainLayout() {
  return (
    <div className="flex h-full bg-[var(--bg-page)]">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
