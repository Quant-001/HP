import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Bed, Building2, CheckCircle2, Mail, MapPin, Phone,
  ShieldCheck, Users, XCircle,
} from 'lucide-react'
import { useHospital } from '@/hooks'
import { Badge, Card, CardContent, CardHeader, LoadingSpinner, StatCard } from '@/components/shared'
import { formatDate, planConfig } from '@/lib/utils'
import type { Hospital, PlanLimits } from '@/types'

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const hospitalId = Number(id)
  const { data, isLoading } = useHospital(hospitalId)
  const hospital = data as Hospital | undefined

  if (isLoading) return <LoadingSpinner />

  if (!hospital) {
    return (
      <div className="page-container">
        <BackLink />
        <p className="text-sm text-slate-500">Hospital not found.</p>
      </div>
    )
  }

  const planInfo = planConfig[hospital.plan] || planConfig.trial

  return (
    <div className="page-container">
      <BackLink />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Building2 size={26} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{hospital.name}</h1>
                <Badge className={hospital.subscription_status === 'active' ? 'badge-green capitalize' : 'badge-yellow capitalize'}>
                  {hospital.subscription_status}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                {hospital.email && <span className="flex items-center gap-1.5"><Mail size={15} /> {hospital.email}</span>}
                {hospital.phone && <span className="flex items-center gap-1.5"><Phone size={15} /> {hospital.phone}</span>}
                {(hospital.city || hospital.country) && (
                  <span className="flex items-center gap-1.5"><MapPin size={15} /> {[hospital.city, hospital.country].filter(Boolean).join(', ')}</span>
                )}
              </div>
            </div>
          </div>
          <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${planInfo.color}`}>
            {planInfo.label} Plan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Users" value={hospital.staff_count ?? 0} icon={Users} color="purple" subtitle="Active staff accounts" />
        <StatCard title="Owners" value={hospital.owner_count ?? 0} icon={ShieldCheck} color="green" subtitle="Hospital admin accounts" />
        <StatCard title="Beds" value={hospital.total_beds ?? 0} icon={Bed} color="blue" subtitle="Configured capacity" />
        <StatCard title="Registered" value={formatDate(hospital.created_at)} icon={Building2} color="teal" subtitle="Account created" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900">Owner Details</h3></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Owner" value={hospital.owner_name || '-'} />
            <InfoRow label="Owner Email" value={hospital.owner_email || '-'} />
            <InfoRow label="Hospital Email" value={hospital.email || '-'} />
            <InfoRow label="Phone" value={hospital.phone || '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900">Location</h3></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Address" value={hospital.address || '-'} />
            <InfoRow label="City" value={hospital.city || '-'} />
            <InfoRow label="Country" value={hospital.country || '-'} />
            <InfoRow label="Last Updated" value={formatDate(hospital.updated_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900">Subscription</h3></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Plan" value={planInfo.label} />
            <InfoRow label="Price" value={planInfo.price} />
            <InfoRow label="Status" value={hospital.subscription_status} />
            <InfoRow label="Max Doctors" value={displayLimit(hospital.max_doctors)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900">Plan Usage</h3></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(hospital.subscription_usage || {}).map(([key, item]) => (
              <div key={key} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">{labelize(key)}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{item.used}/{displayLimit(item.limit)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900">Enabled Modules</h3></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {moduleRows(hospital).map((module) => (
              <div key={module.label} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <span className="text-sm font-medium text-slate-700">{module.label}</span>
                {module.enabled ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <XCircle size={18} className="text-slate-300" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/dashboard" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
      <ArrowLeft size={16} /> Back to Hospitals
    </Link>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="break-words text-slate-700">{value}</p>
    </div>
  )
}

function displayLimit(value: PlanLimits[keyof PlanLimits] | undefined) {
  return value == null ? 'Unlimited' : value
}

function labelize(value: string) {
  return value.replace(/_/g, ' ')
}

function moduleRows(hospital: Hospital) {
  return [
    { label: 'Pharmacy', enabled: hospital.has_pharmacy },
    { label: 'Laboratory', enabled: hospital.has_lab },
    { label: 'Multi Branch', enabled: hospital.has_multi_branch },
    { label: 'Bed Management', enabled: hospital.has_bed_management },
    { label: 'Inventory', enabled: hospital.has_inventory },
  ]
}
