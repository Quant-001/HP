import { useState } from 'react'
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react'
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks'
import { Button, Card, LoadingSpinner, EmptyState, Modal, Input, Textarea, ConfirmDialog } from '@/components/shared'
import { getErrorMessage } from '@/lib/utils'

export default function DepartmentsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useDepartments({})
  const createMut = useCreateDepartment()
  const updateMut = useUpdateDepartment()
  const deleteMut = useDeleteDepartment()

  const departments = (data as any)?.results ?? (data as any) ?? []
  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const openCreate = () => { setForm({ name: '', description: '' }); setEditId(null); setFormError(''); setModalOpen(true) }
  const openEdit = (d: any) => { setForm({ name: d.name, description: d.description }); setEditId(d.id); setFormError(''); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    try {
      if (editId) await updateMut.mutateAsync({ id: editId, data: form })
      else await createMut.mutateAsync(form)
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Departments</h2>
          <p className="text-sm text-slate-500 mt-0.5">{departments.length} departments</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Add Department</Button>
      </div>

      {isLoading ? <LoadingSpinner /> : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet"
          description="Create departments to organize your hospital."
          action={<Button icon={<Plus size={16} />} onClick={openCreate}>Add Department</Button>} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d: any) => (
            <Card key={d.id}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => openEdit(d)} />
                    <Button variant="ghost" size="sm" icon={<Trash2 size={14} />}
                      className="hover:text-red-500" onClick={() => setDeleteId(d.id)} />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{d.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{d.description || 'No description'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-400">{d.staff_count ?? 0} staff members</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Department' : 'Add Department'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}
          <Input label="Department Name" value={form.name} onChange={set('name')} required placeholder="Cardiology" />
          <Textarea label="Description" value={form.description} onChange={set('description')}
            placeholder="Brief description of the department..." rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending} className="flex-1">
              {editId ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Delete Department"
        message="Delete this department? Staff members will be unassigned."
        onConfirm={async () => { if (deleteId) { await deleteMut.mutateAsync(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)} loading={deleteMut.isPending} />
    </div>
  )
}
