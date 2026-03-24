import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-gray-600">Page not found</p>
      <Link to="/" className="text-blue-600 underline hover:text-blue-800">
        Go home
      </Link>
    </div>
  )
}
