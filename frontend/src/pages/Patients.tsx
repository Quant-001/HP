import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, Users } from 'lucide-react'
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks'
import {
  Button, Card, Table, LoadingSpinner, EmptyState, SearchInput,
  Modal, Input, Select, Textarea, Badge, ConfirmDialog,
} from '@/components/shared'
import { formatDate, getErrorMessage } from '@/lib/utils'
import type { Patient } from '@/types'

const GENDER_OPTIONS = [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }]
const BLOOD_OPTIONS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ value: v, label: v }))
const STATUS_OPTIONS = [{ value: 'active', label: 'Active' }, { value: 'discharged', label: 'Discharged' }, { value: 'deceased', label: 'Deceased' }]

const emptyForm = {
  name: '', email: '', phone: '', date_of_birth: '', gender: 'M' as 'M' | 'F' | 'O',
  blood_group: '', address: '', emergency_contact: '', emergency_phone: '',
  allergies: '', chronic_conditions: '', status: 'active',
}

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')

  const { data, isLoading } = usePatients({ search })
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient()
  const deleteMutation = useDeletePatient()

  const patients: Patient[] = (data as any)?.results ?? (data as any) ?? []

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  const openCreate = () => { setForm({ ...emptyForm }); setEditPatient(null); setFormError(''); setModalOpen(true) }
  const openEdit = (p: Patient) => {
    setForm({ name: p.name, email: p.email, phone: p.phone, date_of_birth: p.date_of_birth,
      gender: p.gender, blood_group: p.blood_group || '', address: p.address,
      emergency_contact: p.emergency_contact, emergency_phone: p.emergency_phone,
      allergies: p.allergies, chronic_conditions: p.chronic_conditions, status: p.status })
    setEditPatient(p); setFormError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    try {
      if (editPatient) {
        await updateMutation.mutateAsync({ id: editPatient.id, data: form })
      } else {
        await createMutation.mutateAsync(form)
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const statusBadge = (s: string) => {
    const cls = s === 'active' ? 'badge-green' : s === 'discharged' ? 'badge-blue' : 'badge-red'
    return <span className={`badge ${cls} capitalize`}>{s}</span>
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patients</h2>
          <p className="text-sm text-slate-500 mt-0.5">{(data as any)?.count ?? patients.length} registered patients</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Add Patient</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search patients..." />
        </div>

        {isLoading ? <LoadingSpinner /> : patients.length === 0 ? (
          <EmptyState icon={Users} title="No patients found"
            description="Register your first patient to get started."
            action={<Button icon={<Plus size={16} />} onClick={openCreate}>Add Patient</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>
                {['Patient ID', 'Name', 'Age / Gender', 'Phone', 'Blood Group', 'Status', 'Registered', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td><span className="font-mono text-blue-600 text-xs font-semibold">{p.patient_id}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{p.age}y / {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
                  <td>{p.phone}</td>
                  <td>{p.blood_group ? <span className="badge badge-red">{p.blood_group}</span> : '—'}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td className="text-slate-400">{formatDate(p.created_at)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/patients/${p.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />} />
                      </Link>
                      <Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => openEdit(p)} />
                      <Button variant="ghost" size="sm" icon={<Trash2 size={14} />}
                        className="hover:text-red-500" onClick={() => setDeleteId(p.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editPatient ? 'Edit Patient' : 'Add New Patient'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Full Name" value={form.name} onChange={set('name')} required placeholder="John Doe" />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="patient@email.com" />
            <Input label="Phone" value={form.phone} onChange={set('phone')} required placeholder="+1 555 0000" />
            <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} required />
            <Select label="Gender" value={form.gender} onChange={set('gender') as any} options={GENDER_OPTIONS} required />
            <Select label="Blood Group" value={form.blood_group} onChange={set('blood_group') as any} options={BLOOD_OPTIONS} />
            <Select label="Status" value={form.status} onChange={set('status') as any} options={STATUS_OPTIONS} />
            <div className="col-span-2">
              <Textarea label="Address" value={form.address} onChange={set('address')} placeholder="Patient address" />
            </div>
            <Input label="Emergency Contact" value={form.emergency_contact} onChange={set('emergency_contact')} placeholder="Contact name" />
            <Input label="Emergency Phone" value={form.emergency_phone} onChange={set('emergency_phone')} placeholder="+1 555 0001" />
            <div className="col-span-2">
              <Textarea label="Allergies" value={form.allergies} onChange={set('allergies')} placeholder="List any known allergies..." />
            </div>
            <div className="col-span-2">
              <Textarea label="Chronic Conditions" value={form.chronic_conditions} onChange={set('chronic_conditions')} placeholder="Diabetes, Hypertension, etc." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">
              {editPatient ? 'Save Changes' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Patient"
        message="This will permanently delete the patient record. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
