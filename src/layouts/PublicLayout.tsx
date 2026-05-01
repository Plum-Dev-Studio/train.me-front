import { Outlet } from 'react-router'
import { PublicTopNav } from '@/components/public/PublicTopNav'

export function PublicLayout() {
  return (
    <div className="min-h-full bg-[var(--bg-page)]">
      <PublicTopNav />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
