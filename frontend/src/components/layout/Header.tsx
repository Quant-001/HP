import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/queue': 'OPD Queue',
  '/staff': 'Staff Management',
  '/departments': 'Departments',
  '/medical-records': 'Medical Records',
  '/billing': 'Billing & Invoices',
  '/pharmacy': 'Pharmacy',
  '/lab': 'Laboratory',
  '/settings': 'Settings',
}

export default function Header() {
  const { user } = useAuth()
  const location = useLocation()
  const title = location.pathname.startsWith('/hospitals/')
    ? 'Hospital Information'
    : user?.role === 'super_admin' && location.pathname === '/dashboard'
      ? 'Hospitals'
      : pageTitles[location.pathname] || 'Hospora'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-xl font-bold text-slate-900 flex-1">{title}</h1>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-64">
        <Search size={16} className="text-slate-400" />
        <input
          placeholder="Search..."
          className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
      </button>

      {/* User */}
      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>
    </header>
  )
}
