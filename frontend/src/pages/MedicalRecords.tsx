import { useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { useMedicalRecords, useCreateMedicalRecord, usePatients, useStaff } from '@/hooks'
import { Button, Card, Table, LoadingSpinner, EmptyState, Modal, Select, Textarea, SearchInput } from '@/components/shared'
import { formatDate, getErrorMessage } from '@/lib/utils'

const emptyForm = { patient: '', doctor: '', diagnosis: '', symptoms: '', treatment: '', prescription: '', notes: '', follow_up_date: '' }

export default function MedicalRecordsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useMedicalRecords({ search })
  const { data: patientsData } = usePatients({})
  const { data: staffData } = useStaff({ role: 'doctor' })
  const createMut = useCreateMedicalRecord()

  const records = (data as any)?.results ?? (data as any) ?? []
  const patients = (patientsData as any)?.results ?? (patientsData as any) ?? []
  const doctors = (staffData as any)?.results ?? (staffData as any) ?? []

  const patientOptions = patients.map((p: any) => ({ value: p.id, label: `${p.name} (${p.patient_id})` }))
  const doctorOptions = doctors.map((d: any) => ({ value: d.id, label: `Dr. ${d.name}` }))

  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    try {
      await createMut.mutateAsync(form)
      setModalOpen(false)
      setForm({ ...emptyForm })
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Medical Records</h2>
          <p className="text-sm text-slate-500 mt-0.5">{records.length} records</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setForm({ ...emptyForm }); setFormError(''); setModalOpen(true) }}>
          New Record
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by patient or diagnosis..." />
        </div>

        {isLoading ? <LoadingSpinner /> : records.length === 0 ? (
          <EmptyState icon={FileText} title="No medical records"
            description="Create records after patient consultations."
            action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>New Record</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>{['Patient', 'Doctor', 'Diagnosis', 'Treatment', 'Follow-Up', 'Date'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id}>
                  <td>
                    <p className="font-medium text-slate-900">{r.patient_name}</p>
                  </td>
                  <td>Dr. {r.doctor_name}</td>
                  <td className="max-w-xs">
                    <p className="text-sm text-slate-700 truncate">{r.diagnosis}</p>
                  </td>
                  <td className="max-w-xs">
                    <p className="text-sm text-slate-600 truncate">{r.treatment || '—'}</p>
                  </td>
                  <td>{r.follow_up_date ? formatDate(r.follow_up_date) : '—'}</td>
                  <td className="text-slate-400">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Medical Record" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Patient" value={form.patient} onChange={set('patient')} options={patientOptions} required />
            <Select label="Doctor" value={form.doctor} onChange={set('doctor')} options={doctorOptions} />
            <div className="col-span-2">
              <Textarea label="Diagnosis *" value={form.diagnosis} onChange={set('diagnosis')} required
                placeholder="Primary diagnosis and findings..." rows={2} />
            </div>
            <div className="col-span-2">
              <Textarea label="Symptoms" value={form.symptoms} onChange={set('symptoms')}
                placeholder="Patient-reported symptoms..." rows={2} />
            </div>
            <div className="col-span-2">
              <Textarea label="Treatment Plan" value={form.treatment} onChange={set('treatment')}
                placeholder="Treatment prescribed..." rows={2} />
            </div>
            <div className="col-span-2">
              <Textarea label="Prescription" value={form.prescription} onChange={set('prescription')}
                placeholder="Medications and dosages..." rows={2} />
            </div>
            <div className="col-span-2">
              <Textarea label="Notes" value={form.notes} onChange={set('notes')} placeholder="Additional notes..." rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Follow-Up Date</label>
              <input type="date" value={form.follow_up_date} onChange={set('follow_up_date')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending} className="flex-1">Save Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
