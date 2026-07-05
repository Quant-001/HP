import { useState } from 'react'
import { Plus, Calendar, Pencil, Trash2 } from 'lucide-react'
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment, usePatients, useStaff, useDepartments } from '@/hooks'
import { Button, Card, Table, LoadingSpinner, EmptyState, Modal, Input, Select, Textarea, SearchInput, ConfirmDialog } from '@/components/shared'
import { formatDate, formatTime, appointmentStatusConfig, getErrorMessage } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'lab_test', label: 'Lab Test' },
]
const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
]

const emptyForm = {
  patient: '', doctor: '', department: '', appointment_date: '',
  appointment_time: '', duration_minutes: '30', type: 'consultation',
  status: 'scheduled', reason: '', notes: '',
}

export default function AppointmentsPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')

  const params: any = {}
  if (search) params.search = search
  if (filterStatus) params.status = filterStatus

  const { data, isLoading } = useAppointments(params)
  const { data: patientsData } = usePatients({})
  const { data: staffData } = useStaff({ role: 'doctor' })
  const { data: deptData } = useDepartments({})
  const createMut = useCreateAppointment()
  const updateMut = useUpdateAppointment()
  const deleteMut = useDeleteAppointment()

  const appointments = (data as any)?.results ?? (data as any) ?? []
  const patients = (patientsData as any)?.results ?? (patientsData as any) ?? []
  const doctors = (staffData as any)?.results ?? (staffData as any) ?? []
  const departments = (deptData as any)?.results ?? (deptData as any) ?? []

  const patientOptions = patients.map((p: any) => ({ value: p.id, label: `${p.name} (${p.patient_id})` }))
  const doctorOptions = doctors.map((d: any) => ({ value: d.id, label: `Dr. ${d.name}` }))
  const deptOptions = departments.map((d: any) => ({ value: d.id, label: d.name }))

  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setFormError(''); setModalOpen(true) }
  const openEdit = (a: any) => {
    setForm({
      patient: a.patient, doctor: a.doctor || '', department: a.department || '',
      appointment_date: a.appointment_date, appointment_time: a.appointment_time?.slice(0, 5) || '',
      duration_minutes: String(a.duration_minutes), type: a.type,
      status: a.status, reason: a.reason, notes: a.notes,
    })
    setEditId(a.id); setFormError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = { ...form, duration_minutes: Number(form.duration_minutes) }
    try {
      if (editId) await updateMut.mutateAsync({ id: editId, data: payload })
      else await createMut.mutateAsync(payload)
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Appointments</h2>
          <p className="text-sm text-slate-500 mt-0.5">{(data as any)?.count ?? appointments.length} total appointments</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Book Appointment</Button>
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search patient or doctor..." />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {isLoading ? <LoadingSpinner /> : appointments.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments found"
            description="Book the first appointment for your patients."
            action={<Button icon={<Plus size={16} />} onClick={openCreate}>Book Appointment</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>{['Patient', 'Doctor', 'Department', 'Date & Time', 'Type', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {appointments.map((a: any) => {
                const sc = appointmentStatusConfig[a.status as keyof typeof appointmentStatusConfig]
                return (
                  <tr key={a.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900">{a.patient_name}</p>
                        <p className="text-xs text-slate-400">{a.patient_id_str}</p>
                      </div>
                    </td>
                    <td>{a.doctor_name || '—'}</td>
                    <td>{a.department_name || '—'}</td>
                    <td>
                      <div>
                        <p className="text-sm">{formatDate(a.appointment_date)}</p>
                        <p className="text-xs text-slate-400">{formatTime(a.appointment_time)}</p>
                      </div>
                    </td>
                    <td><span className="capitalize text-slate-600 text-xs">{a.type?.replace('_', ' ')}</span></td>
                    <td><span className={sc?.className}>{sc?.label}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => openEdit(a)} />
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} />}
                          className="hover:text-red-500" onClick={() => setDeleteId(a.id)} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Appointment' : 'Book Appointment'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Select label="Patient" value={String(form.patient)} onChange={set('patient')} options={patientOptions} required />
            </div>
            <Select label="Doctor" value={String(form.doctor)} onChange={set('doctor')} options={doctorOptions} />
            <Select label="Department" value={String(form.department)} onChange={set('department')} options={deptOptions} />
            <Input label="Date" type="date" value={form.appointment_date} onChange={set('appointment_date')} required />
            <Input label="Time" type="time" value={form.appointment_time} onChange={set('appointment_time')} required />
            <Select label="Type" value={form.type} onChange={set('type')} options={TYPE_OPTIONS} />
            <Select label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
            <Input label="Duration (minutes)" type="number" value={form.duration_minutes} onChange={set('duration_minutes')} min={5} />
            <div className="col-span-2">
              <Textarea label="Reason for Visit" value={form.reason} onChange={set('reason')} placeholder="Brief description..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending} className="flex-1">
              {editId ? 'Save Changes' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Cancel Appointment"
        message="Delete this appointment record permanently?"
        onConfirm={async () => { if (deleteId) { await deleteMut.mutateAsync(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)} loading={deleteMut.isPending} />
    </div>
  )
}
