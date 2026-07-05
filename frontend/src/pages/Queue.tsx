import { useState } from 'react'
import { ListOrdered, Plus, PhoneCall, Play, CheckCircle2, UserX } from 'lucide-react'
import { useCreateQueueTicket, useDepartments, usePatients, useQueueSummary, useQueueTickets, useStaff, useUpdateQueueStatus } from '@/hooks'
import { Button, Card, EmptyState, Input, LoadingSpinner, Modal, SearchInput, Select, Table, Textarea } from '@/components/shared'
import { formatDate, getErrorMessage } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  waiting: 'Waiting',
  called: 'Called',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
]

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    waiting: 'bg-amber-50 text-amber-700',
    called: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-purple-50 text-purple-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-600',
    no_show: 'bg-red-50 text-red-700',
  }
  return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${map[status] || map.waiting}`
}

const emptyForm = {
  patient: '', doctor: '', department: '', appointment: '', queue_date: new Date().toISOString().slice(0, 10),
  priority: 'normal', visit_reason: '', notes: '',
}

export default function QueuePage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')

  const params: any = {}
  if (search) params.search = search
  if (status) params.status = status
  if (form.queue_date) params.queue_date = form.queue_date

  const { data, isLoading } = useQueueTickets(params)
  const { data: summary } = useQueueSummary({ queue_date: form.queue_date })
  const { data: patientsData } = usePatients({})
  const { data: staffData } = useStaff({ role: 'doctor' })
  const { data: deptData } = useDepartments({})
  const createMut = useCreateQueueTicket()
  const statusMut = useUpdateQueueStatus()

  const tickets = (data as any)?.results ?? (data as any) ?? []
  const patients = (patientsData as any)?.results ?? (patientsData as any) ?? []
  const doctors = (staffData as any)?.results ?? (staffData as any) ?? []
  const departments = (deptData as any)?.results ?? (deptData as any) ?? []

  const patientOptions = patients.map((p: any) => ({ value: p.id, label: `${p.name} (${p.patient_id})` }))
  const doctorOptions = doctors.map((d: any) => ({ value: d.id, label: `Dr. ${d.name}` }))
  const deptOptions = departments.map((d: any) => ({ value: d.id, label: d.name }))

  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const openCreate = () => { setForm({ ...emptyForm }); setFormError(''); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = {
      ...form,
      doctor: form.doctor || null,
      department: form.department || null,
      appointment: form.appointment || null,
    }
    try {
      await createMut.mutateAsync(payload)
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  const updateStatus = (id: number, action: string) => statusMut.mutate({ id, action })

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900">OPD Queue</h2>
          <p className="text-sm text-slate-500 mt-0.5">Token management for walk-ins and appointments</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Issue Token</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['Waiting', (summary as any)?.waiting ?? 0],
          ['Called', (summary as any)?.called ?? 0],
          ['In Progress', (summary as any)?.in_progress ?? 0],
          ['Completed', (summary as any)?.completed ?? 0],
          ['No Show', (summary as any)?.no_show ?? 0],
        ].map(([label, value]) => (
          <Card key={label as string} className="p-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search patient, token, doctor..." />
          </div>
          <Input type="date" value={form.queue_date} onChange={set('queue_date')} className="w-auto" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        {isLoading ? <LoadingSpinner /> : tickets.length === 0 ? (
          <EmptyState icon={ListOrdered} title="No queue tokens" description="Issue the first token for today." action={<Button icon={<Plus size={16} />} onClick={openCreate}>Issue Token</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>{['Token', 'Patient', 'Doctor', 'Department', 'Priority', 'Date', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {tickets.map((t: any) => (
                <tr key={t.id}>
                  <td><span className="text-lg font-bold text-blue-600">#{t.token_number}</span></td>
                  <td>
                    <p className="font-medium text-slate-900">{t.patient_name}</p>
                    <p className="text-xs text-slate-400">{t.patient_id_str}</p>
                  </td>
                  <td>{t.doctor_name || '-'}</td>
                  <td>{t.department_name || '-'}</td>
                  <td><span className="capitalize text-sm">{t.priority}</span></td>
                  <td>{formatDate(t.queue_date)}</td>
                  <td><span className={statusClass(t.status)}>{STATUS_LABELS[t.status] || t.status}</span></td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {t.status === 'waiting' && <Button variant="ghost" size="sm" icon={<PhoneCall size={14} />} onClick={() => updateStatus(t.id, 'call')} title="Call" />}
                      {['waiting', 'called'].includes(t.status) && <Button variant="ghost" size="sm" icon={<Play size={14} />} onClick={() => updateStatus(t.id, 'start')} title="Start" />}
                      {t.status !== 'completed' && <Button variant="ghost" size="sm" icon={<CheckCircle2 size={14} />} onClick={() => updateStatus(t.id, 'complete')} title="Complete" />}
                      {['waiting', 'called'].includes(t.status) && <Button variant="ghost" size="sm" icon={<UserX size={14} />} onClick={() => updateStatus(t.id, 'no_show')} title="No show" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Issue Queue Token" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Select label="Patient" value={String(form.patient)} onChange={set('patient')} options={patientOptions} required /></div>
            <Select label="Doctor" value={String(form.doctor)} onChange={set('doctor')} options={doctorOptions} />
            <Select label="Department" value={String(form.department)} onChange={set('department')} options={deptOptions} />
            <Input label="Queue Date" type="date" value={form.queue_date} onChange={set('queue_date')} required />
            <Select label="Priority" value={form.priority} onChange={set('priority')} options={PRIORITY_OPTIONS} />
            <div className="col-span-2"><Input label="Visit Reason" value={form.visit_reason} onChange={set('visit_reason')} placeholder="Fever, follow-up, emergency..." /></div>
            <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={set('notes')} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending} className="flex-1">Issue Token</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
