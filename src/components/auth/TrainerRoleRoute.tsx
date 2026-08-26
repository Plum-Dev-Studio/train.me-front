import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router'
import { fetchCurrentUser } from '@/lib/users'

export function TrainerRoleRoute() {
  const token = localStorage.getItem('auth_token')

  const { data, isPending, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
  })

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-[var(--text-secondary)]">
        Verificando acceso...
      </div>
    )
  }

  if (isError) {
    localStorage.removeItem('auth_token')
    return <Navigate to="/login" replace />
  }

  if (data?.role !== 'trainer') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
