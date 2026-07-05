import { useState } from 'react'
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react'
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useDepartments } from '@/hooks'
import { Button, Card, Table, LoadingSpinner, EmptyState, Modal, Input, Select, SearchInput, ConfirmDialog } from '@/components/shared'
import { formatDate, roleConfig, getErrorMessage, initials } from '@/lib/utils'

const ROLE_OPTIONS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'lab_technician', label: 'Lab Technician' },
  { value: 'pharmacist', label: 'Pharmacist' },
]

const emptyForm = { name: '', email: '', phone: '', role: 'doctor', specialization: '', department: '', password: '' }

export default function StaffPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')

  const params: any = {}
  if (search) params.search = search
  if (roleFilter) params.role = roleFilter

  const { data, isLoading } = useStaff(params)
  const { data: deptData } = useDepartments({})
  const createMut = useCreateStaff()
  const updateMut = useUpdateStaff()
  const deleteMut = useDeleteStaff()

  const staff = (data as any)?.results ?? (data as any) ?? []
  const departments = (deptData as any)?.results ?? (deptData as any) ?? []
  const deptOptions = departments.map((d: any) => ({ value: d.id, label: d.name }))

  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setFormError(''); setModalOpen(true) }
  const openEdit = (s: any) => {
    setForm({ name: s.name, email: s.email, phone: s.phone, role: s.role,
      specialization: s.specialization || '', department: s.department || '', password: '' })
    setEditId(s.id); setFormError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    try {
      const payload: any = { ...form }
      if (editId && !payload.password) delete payload.password
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
          <h2 className="text-xl font-bold text-slate-900">Staff Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {staff.length} team members. Create doctors, receptionists, lab technicians, and pharmacists.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Add Staff</Button>
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {isLoading ? <LoadingSpinner /> : staff.length === 0 ? (
          <EmptyState icon={UserCheck} title="No staff found"
            description="Add your first team member."
            action={<Button icon={<Plus size={16} />} onClick={openCreate}>Add Staff</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>{['Name', 'Role', 'Department', 'Specialization', 'Phone', 'Status', 'Joined', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {staff.map((s: any) => {
                const rc = roleConfig[s.role as keyof typeof roleConfig]
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                          {initials(s.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={rc?.className}>{rc?.label}</span></td>
                    <td>{s.hospital_detail?.name ? (departments.find((d: any) => d.id === s.department)?.name || '—') : '—'}</td>
                    <td className="text-slate-600">{s.specialization || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-slate-400">{formatDate(s.created_at)}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => openEdit(s)} />
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} />}
                          className="hover:text-red-500" onClick={() => setDeleteId(s.id)} />
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
        title={editId ? 'Edit Staff Member' : 'Add Staff Member'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Full Name" value={form.name} onChange={set('name')} required placeholder="Dr. Jane Smith" />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={set('email')} required
              placeholder="staff@hospital.com" disabled={!!editId} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+1 555 0000" />
            <Select label="Role" value={form.role} onChange={set('role')} options={ROLE_OPTIONS} required />
            <Select label="Department" value={String(form.department)} onChange={set('department')} options={deptOptions} />
            <div className="col-span-2">
              <Input label="Specialization" value={form.specialization} onChange={set('specialization')}
                placeholder="Cardiology, Orthopedics, etc." />
            </div>
            <div className="col-span-2">
              <Input label={editId ? 'New Password (leave blank to keep)' : 'Password'} type="password"
                value={form.password} onChange={set('password')} required={!editId} minLength={6}
                placeholder="Min. 6 characters" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending} className="flex-1">
              {editId ? 'Save Changes' : 'Add Staff'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Remove Staff Member"
        message="Remove this staff member? They will lose access immediately."
        onConfirm={async () => { if (deleteId) { await deleteMut.mutateAsync(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)} loading={deleteMut.isPending} />
    </div>
  )
}
