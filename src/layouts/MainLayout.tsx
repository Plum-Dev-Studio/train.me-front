import { Outlet } from 'react-router'

export function MainLayout() {
  return (
    <div className="flex h-full bg-[var(--bg-page)]">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
