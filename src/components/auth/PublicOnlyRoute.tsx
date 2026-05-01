import { Navigate, Outlet } from 'react-router'

export function PublicOnlyRoute() {
  const token = localStorage.getItem('auth_token')

  if (token) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
