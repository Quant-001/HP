import {
  Building2, Calendar, DollarSign, FileWarning, ShieldCheck,
  TrendingUp, UserCheck, Users, ClipboardCheck, PackageCheck,
  FlaskConical, Pill, Receipt, AlertTriangle, FileText,
} from 'lucide-react'
import type { ElementType } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import {
  useDashboardStats, useHospitals, useRevenueTrends, useRecentAppointments,
  useAppointmentBreakdown, usePatientGrowth,
} from '@/hooks'
import { StatCard, Card, CardHeader, CardContent, LoadingSpinner, Badge } from '@/components/shared'
import { formatCurrency, formatDate, formatTime, appointmentStatusConfig } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import type { DashboardStats, Hospital, PaginatedResponse, Role } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#3b82f6', confirmed: '#8b5cf6', in_progress: '#f59e0b',
  completed: '#10b981', cancelled: '#ef4444', no_show: '#94a3b8',
}

function listFromResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  return ((data as PaginatedResponse<T> | undefined)?.results ?? [])
}

function limitValue(value: number | null | undefined) {
  return value == null ? 'Unlimited' : value
}

const roleFocus: Partial<Record<Role, { title: string; description: string; items: string[] }>> = {
  hospital_admin: {
    title: 'Hospital Owner Control',
    description: 'Controls staff creation, departments, appointments, billing, lab, pharmacy, inventory, reports, settings, and subscription.',
    items: ['Create staff', 'Departments', 'Billing', 'Subscription'],
  },
  doctor: {
    title: 'Doctor Workspace',
    description: 'Prioritizes appointments, patients, medical records, lab orders, and consultation work.',
    items: ['My appointments', 'Assigned patients', 'Prescriptions', 'Lab orders'],
  },
  receptionist: {
    title: 'Front Desk',
    description: 'Focused on appointment booking, patient check-in, OPD queue, registration, and payments.',
    items: ['Today schedule', 'Patient check-in', 'OPD queue', 'Billing'],
  },
  nurse: {
    title: 'Ward Care',
    description: 'Designed for bed assignment, vitals, medication rounds, care notes, and shift handover.',
    items: ['Assigned beds', 'Vitals', 'Medication tracking', 'Care notes'],
  },
  pharmacist: {
    title: 'Pharmacy Desk',
    description: 'Tracks inventory, prescriptions, low-stock alerts, purchase orders, and expiry management.',
    items: ['Inventory', 'Prescriptions', 'Drug checks', 'Purchase orders'],
  },
  lab_technician: {
    title: 'Lab Workbench',
    description: 'Tracks requisitions, samples, pending tests, result entry, and report generation.',
    items: ['Lab requisitions', 'Sample tracking', 'Pending tests', 'Reports'],
  },
}

type StatCardConfig = {
  title: string
  value: string | number
  icon: ElementType
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal'
  subtitle: string
}

function getRoleStats(role: Role | undefined, s: DashboardStats | undefined, roleCounts: Partial<Record<Role, number>>, usage: DashboardStats['subscription_usage'] | undefined): StatCardConfig[] {
  if (role === 'doctor') {
    return [
      { title: 'My Patient Pool', value: s?.total_patients ?? 0, icon: Users, color: 'blue', subtitle: 'Assigned care access' },
      { title: "Today's Appointments", value: s?.today_appointments ?? 0, icon: Calendar, color: 'purple', subtitle: 'Consultations today' },
      { title: 'Medical Records', value: s?.total_patients ?? 0, icon: FileText, color: 'teal', subtitle: 'Patient histories' },
      { title: 'Lab Reports', value: s?.enabled_modules?.includes('laboratory') ? 'Enabled' : 'Locked', icon: FlaskConical, color: 'orange', subtitle: 'Review results' },
    ]
  }

  if (role === 'receptionist') {
    return [
      { title: 'Registered Patients', value: s?.total_patients ?? 0, icon: Users, color: 'blue', subtitle: 'Patient registration' },
      { title: 'Check-ins Today', value: s?.today_appointments ?? 0, icon: Calendar, color: 'purple', subtitle: 'Front desk flow' },
      { title: 'Pending Invoices', value: s?.pending_invoices ?? 0, icon: FileWarning, color: 'red', subtitle: 'Payment follow-up' },
      { title: 'Billing Today', value: formatCurrency(s?.monthly_revenue ?? 0), icon: Receipt, color: 'green', subtitle: 'Payment collection' },
    ]
  }

  if (role === 'lab_technician') {
    return [
      { title: 'Laboratory', value: s?.enabled_modules?.includes('laboratory') ? 'Enabled' : 'Locked', icon: FlaskConical, color: 'teal', subtitle: 'Test requests' },
      { title: 'Pending Tests', value: s?.today_appointments ?? 0, icon: ClipboardCheck, color: 'purple', subtitle: 'Needs processing' },
      { title: 'Sample Tracking', value: 'Active', icon: PackageCheck, color: 'orange', subtitle: 'Specimen workflow' },
      { title: 'Reports', value: 'Ready', icon: FileText, color: 'blue', subtitle: 'Result entry' },
    ]
  }

  if (role === 'pharmacist') {
    return [
      { title: 'Pharmacy', value: s?.enabled_modules?.includes('pharmacy') ? 'Enabled' : 'Locked', icon: Pill, color: 'teal', subtitle: 'Medicine desk' },
      { title: 'Low Stock', value: s?.low_stock_medicines ?? 0, icon: PackageCheck, color: 'orange', subtitle: 'Needs reorder' },
      { title: 'Prescriptions', value: s?.today_appointments ?? 0, icon: FileText, color: 'purple', subtitle: 'To review' },
      { title: 'Purchase Orders', value: 'Track', icon: Receipt, color: 'blue', subtitle: 'Supplier workflow' },
    ]
  }

  return [
    { title: 'Total Patients', value: s?.total_patients ?? 0, icon: Users, color: 'blue', subtitle: 'Registered patients' },
    { title: "Today's Appointments", value: s?.today_appointments ?? 0, icon: Calendar, color: 'purple', subtitle: 'Scheduled today' },
    { title: 'Monthly Revenue', value: formatCurrency(s?.monthly_revenue ?? 0), icon: DollarSign, color: 'green', subtitle: 'This month' },
    { title: 'Total Staff', value: s?.total_staff ?? 0, icon: UserCheck, color: 'orange', subtitle: 'Active employees' },
    { title: 'Departments', value: `${usage?.departments.used ?? s?.total_departments ?? 0}/${limitValue(usage?.departments.limit)}`, icon: Building2, color: usage?.departments.is_over_limit ? 'red' : 'blue', subtitle: 'Subscription capacity' },
    { title: 'Doctors', value: `${usage?.doctors.used ?? roleCounts.doctor ?? 0}/${limitValue(usage?.doctors.limit)}`, icon: ClipboardCheck, color: usage?.doctors.is_over_limit ? 'red' : 'purple', subtitle: 'Plan doctor seats' },
    { title: 'Outstanding', value: formatCurrency(s?.outstanding_amount ?? 0), icon: Receipt, color: 'orange', subtitle: `${s?.overdue_invoices ?? 0} overdue invoices` },
    { title: 'Inventory Alerts', value: s?.low_stock_medicines ?? 0, icon: AlertTriangle, color: 'red', subtitle: 'Low stock medicines' },
  ]
}

function OwnerDashboard() {
  const navigate = useNavigate()
  const { data: hospitalsData, isLoading: hospitalsLoading } = useHospitals()
  const hospitals = listFromResponse<Hospital>(hospitalsData)
  const ownerUsers = hospitals.reduce((total, h) => total + (h.owner_count ?? 0), 0)
  const activeHospitals = hospitals.filter(h => h.subscription_status === 'active').length
  const totalStaff = hospitals.reduce((total, h) => total + (h.staff_count ?? 0), 0)

  if (hospitalsLoading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered Hospitals" value={hospitals.length} icon={Building2} color="blue"
          subtitle="Hospitals on this web app" />
        <StatCard title="Hospital Owners" value={ownerUsers} icon={ShieldCheck} color="green"
          subtitle="Owner/admin accounts" />
        <StatCard title="Active Hospitals" value={activeHospitals} icon={TrendingUp} color="teal"
          subtitle="Paid or active subscriptions" />
        <StatCard title="Total Web Users" value={totalStaff} icon={Users} color="purple"
          subtitle="All active users" />
      </div>

      <Card>
        <CardHeader>
          <div>
            <h3 className="font-semibold text-slate-900">Registered Hospitals & Owners</h3>
            <p className="text-sm text-slate-500 mt-1">Hospital account details visible to the web owner.</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Owner</th>
                  <th>Owner Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Users</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-500 py-8">No hospitals registered yet.</td>
                  </tr>
                ) : hospitals.map((hospital) => (
                  <tr
                    key={hospital.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/hospitals/${hospital.id}`)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/hospitals/${hospital.id}`)
                      }
                    }}
                    aria-label={`Open ${hospital.name} information`}
                  >
                    <td>
                      <div>
                        <p className="font-medium text-blue-700 hover:text-blue-800">{hospital.name}</p>
                        <p className="text-xs text-slate-500">{hospital.email}</p>
                      </div>
                    </td>
                    <td>{hospital.owner_name || '-'}</td>
                    <td>{hospital.owner_email || '-'}</td>
                    <td>
                      <Badge className="badge-blue capitalize">{hospital.plan}</Badge>
                    </td>
                    <td>
                      <Badge className={hospital.subscription_status === 'active' ? 'badge-green' : 'badge-yellow'}>
                        {hospital.subscription_status}
                      </Badge>
                    </td>
                    <td>{hospital.staff_count ?? 0}</td>
                    <td>{formatDate(hospital.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HospitalDashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: revenue } = useRevenueTrends()
  const { data: recentAppts } = useRecentAppointments()
  const { data: breakdown } = useAppointmentBreakdown()
  const { data: patientGrowth } = usePatientGrowth()

  if (statsLoading) return <LoadingSpinner />

  const s = stats as DashboardStats | undefined
  const revData = (revenue as any[]) || []
  const appts = (recentAppts as any[]) || []
  const breakdownData = (breakdown as any[]) || []
  const growthData = (patientGrowth as any[]) || []
  const focus = roleFocus[user?.role as Role] ?? roleFocus.hospital_admin
  const usage = s?.subscription_usage
  const roleCounts = s?.staff_by_role ?? {}
  const roleStats = getRoleStats(user?.role as Role | undefined, s, roleCounts, usage)
  const canSeeRevenue = user?.role === 'hospital_admin' || user?.role === 'receptionist'
  const canSeePatientGrowth = user?.role === 'hospital_admin' || user?.role === 'receptionist' || user?.role === 'doctor'

  return (
    <div className="page-container">
      {focus && (
        <Card>
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{user?.role?.replace('_', ' ')}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{focus.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">{focus.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {focus.items.map(item => (
                  <span key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roleStats.map(card => (
          <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon}
            color={card.color} subtitle={card.subtitle} />
        ))}
      </div>

      {user?.role === 'hospital_admin' && (
        <div className="stat-card flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Current Plan</p>
            <p className="text-xl font-bold text-slate-900 capitalize">{s?.hospital_plan ?? 'Trial'}</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-slate-900">{canSeeRevenue ? 'Revenue & Appointments' : 'Appointment Activity'} (Last 7 Days)</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => canSeeRevenue ? `$${v}` : v} />
                {canSeeRevenue && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} />}
                <Tooltip formatter={(v: any, name: string) => [name === 'revenue' ? formatCurrency(v) : v, name === 'revenue' ? 'Revenue' : 'Appointments']} />
                <Area yAxisId="left" type="monotone" dataKey={canSeeRevenue ? 'revenue' : 'appointments'} stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
                {canSeeRevenue && <Line yAxisId="right" type="monotone" dataKey="appointments" stroke="#8b5cf6" strokeWidth={2} dot={false} />}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Breakdown Pie */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Appointment Status</h3>
          </CardHeader>
          <CardContent>
            {breakdownData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={breakdownData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {breakdownData.map((entry: any) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, name: string) => [v, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {breakdownData.map((entry: any) => (
                    <div key={entry.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[entry.status] }} />
                        <span className="text-slate-600 capitalize">{entry.status.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Growth & Recent Appointments */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Patient Growth */}
        {canSeePatientGrowth && <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Patient Growth (6 Months)</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={growthData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>}

        {/* Recent Appointments */}
        <Card className={canSeePatientGrowth ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Recent Appointments</h3>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {appts.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No appointments yet</div>
            ) : appts.slice(0, 6).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                  {a.patient_name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{a.patient_name}</p>
                  <p className="text-xs text-slate-500 truncate">{a.doctor_name} • {formatDate(a.date)} {formatTime(a.time)}</p>
                </div>
                <span className={appointmentStatusConfig[a.status as keyof typeof appointmentStatusConfig]?.className || 'badge badge-gray'}>
                  {appointmentStatusConfig[a.status as keyof typeof appointmentStatusConfig]?.label || a.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'super_admin') {
    return <OwnerDashboard />
  }

  return <HospitalDashboard />
}
