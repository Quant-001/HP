import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Phone, Mail, Heart, AlertTriangle, Calendar, FileText, Receipt } from 'lucide-react'
import { usePatient } from '@/hooks'
import { useAppointments } from '@/hooks'
import { useMedicalRecords } from '@/hooks'
import { useInvoices } from '@/hooks'
import { Card, CardHeader, CardContent, LoadingSpinner, Badge, Table } from '@/components/shared'
import { formatDate, formatCurrency, appointmentStatusConfig, invoiceStatusConfig } from '@/lib/utils'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const patientId = Number(id)

  const { data: patient, isLoading } = usePatient(patientId)
  const { data: appts } = useAppointments({ patient: patientId })
  const { data: records } = useMedicalRecords({ patient: patientId })
  const { data: invoices } = useInvoices({ patient: patientId })

  const p = patient as any
  const appointments = (appts as any)?.results ?? (appts as any) ?? []
  const medRecords = (records as any)?.results ?? (records as any) ?? []
  const invoiceList = (invoices as any)?.results ?? (invoices as any) ?? []

  if (isLoading) return <LoadingSpinner />
  if (!p) return <div className="page-container"><p className="text-slate-500">Patient not found.</p></div>

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/patients">
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={16} /> Back to Patients
          </button>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold shrink-0">
          {p.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
            <span className="font-mono text-blue-600 text-sm font-semibold bg-blue-50 px-2 py-0.5 rounded">{p.patient_id}</span>
            <span className={`badge ${p.status === 'active' ? 'badge-green' : p.status === 'discharged' ? 'badge-blue' : 'badge-red'} capitalize`}>{p.status}</span>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><User size={14} /> {p.age} years • {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</span>
            {p.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {p.phone}</span>}
            {p.email && <span className="flex items-center gap-1.5"><Mail size={14} /> {p.email}</span>}
            {p.blood_group && <span className="flex items-center gap-1.5"><Heart size={14} className="text-red-500" /> {p.blood_group}</span>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-800">Personal Details</h3></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Date of Birth" value={formatDate(p.date_of_birth)} />
              <InfoRow label="Address" value={p.address || '—'} />
              <InfoRow label="Emergency Contact" value={p.emergency_contact || '—'} />
              <InfoRow label="Emergency Phone" value={p.emergency_phone || '—'} />
              <InfoRow label="Registered" value={formatDate(p.created_at)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> Medical Alerts
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Allergies</p>
                <p className="text-slate-700">{p.allergies || 'None reported'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Chronic Conditions</p>
                <p className="text-slate-700">{p.chronic_conditions || 'None reported'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Appointments */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={16} /> Appointments ({appointments.length})
              </h3>
            </CardHeader>
            {appointments.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No appointments found</div>
            ) : (
              <Table>
                <thead>
                  <tr><th>Date</th><th>Doctor</th><th>Type</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((a: any) => (
                    <tr key={a.id}>
                      <td>{formatDate(a.appointment_date)}</td>
                      <td>{a.doctor_name}</td>
                      <td className="capitalize">{a.type?.replace('_', ' ')}</td>
                      <td>
                        <span className={appointmentStatusConfig[a.status as keyof typeof appointmentStatusConfig]?.className}>
                          {appointmentStatusConfig[a.status as keyof typeof appointmentStatusConfig]?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          {/* Medical Records */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={16} /> Medical Records ({medRecords.length})
              </h3>
            </CardHeader>
            {medRecords.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No medical records found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {medRecords.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">{r.diagnosis}</p>
                      <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-500">Dr. {r.doctor_name}</p>
                    {r.treatment && <p className="text-xs text-slate-600 mt-1">Treatment: {r.treatment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Receipt size={16} /> Invoices ({invoiceList.length})
              </h3>
            </CardHeader>
            {invoiceList.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No invoices found</div>
            ) : (
              <Table>
                <thead>
                  <tr><th>Invoice #</th><th>Total</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {invoiceList.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs text-blue-600">{inv.invoice_number}</td>
                      <td className="font-semibold">{formatCurrency(inv.total)}</td>
                      <td>
                        <span className={invoiceStatusConfig[inv.status as keyof typeof invoiceStatusConfig]?.className}>
                          {invoiceStatusConfig[inv.status as keyof typeof invoiceStatusConfig]?.label}
                        </span>
                      </td>
                      <td className="text-slate-400">{formatDate(inv.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-slate-700">{value}</p>
    </div>
  )
}
