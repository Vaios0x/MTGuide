import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
        <Outlet />
      </div>
    </div>
  )
} 