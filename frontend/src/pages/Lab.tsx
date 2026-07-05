import { useState } from 'react'
import { Plus, FlaskConical } from 'lucide-react'
import { useLabTests, useCreateLabTest, useUpdateLabTest, usePatients, useStaff } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { Button, Card, Table, LoadingSpinner, EmptyState, Modal, Input, Select, Textarea, SearchInput } from '@/components/shared'
import { formatDate, formatCurrency, labStatusConfig, getErrorMessage } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const emptyForm = { patient: '', test_name: '', test_code: '', category: '', cost: '0', notes: '', status: 'pending' }

export default function LabPage() {
  const { hospital } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')

  const params: any = { search }
  if (statusFilter) params.status = statusFilter

  const { data, isLoading } = useLabTests(params)
  const { data: patientsData } = usePatients({})
  const createMut = useCreateLabTest()
  const updateMut = useUpdateLabTest()

  const tests = (data as any)?.results ?? (data as any) ?? []
  const patients = (patientsData as any)?.results ?? (patientsData as any) ?? []
  const patientOptions = patients.map((p: any) => ({ value: p.id, label: `${p.name} (${p.patient_id})` }))

  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setFormError(''); setModalOpen(true) }
  const openEdit = (t: any) => {
    setForm({ patient: t.patient, test_name: t.test_name, test_code: t.test_code,
      category: t.category, cost: String(t.cost), notes: t.notes, status: t.status })
    setEditId(t.id); setFormError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = { ...form, cost: Number(form.cost) }
    try {
      if (editId) await updateMut.mutateAsync({ id: editId, data: payload })
      else await createMut.mutateAsync(payload)
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  if (!hospital?.has_lab) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
            <FlaskConical size={28} className="text-purple-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lab Module Locked</h2>
          <p className="text-slate-500 mb-6 max-w-md">The laboratory module is available on the Advanced and Enterprise plans.</p>
          <Button>Upgrade Plan</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Laboratory</h2>
          <p className="text-sm text-slate-500 mt-0.5">{tests.length} tests</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Order Test</Button>
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search tests or patients..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {isLoading ? <LoadingSpinner /> : tests.length === 0 ? (
          <EmptyState icon={FlaskConical} title="No lab tests found"
            action={<Button icon={<Plus size={16} />} onClick={openCreate}>Order Test</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>{['Patient', 'Test Name', 'Code', 'Category', 'Cost', 'Status', 'Ordered', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {tests.map((t: any) => {
                const sc = labStatusConfig[t.status as keyof typeof labStatusConfig]
                return (
                  <tr key={t.id}>
                    <td className="font-medium text-slate-900">{t.patient_name}</td>
                    <td className="text-slate-700">{t.test_name}</td>
                    <td><span className="font-mono text-xs text-slate-500">{t.test_code || '—'}</span></td>
                    <td className="text-slate-600">{t.category || '—'}</td>
                    <td className="font-medium">{formatCurrency(t.cost)}</td>
                    <td><span className={sc?.className}>{sc?.label}</span></td>
                    <td className="text-slate-400">{formatDate(t.created_at)}</td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>Update</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editId ? 'Update Lab Test' : 'Order Lab Test'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}
          <Select label="Patient" value={String(form.patient)} onChange={set('patient')} options={patientOptions} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Test Name" value={form.test_name} onChange={set('test_name')} required placeholder="Complete Blood Count" />
            <Input label="Test Code" value={form.test_code} onChange={set('test_code')} placeholder="CBC-001" />
            <Input label="Category" value={form.category} onChange={set('category')} placeholder="Hematology" />
            <Input label="Cost ($)" type="number" step="0.01" value={form.cost} onChange={set('cost')} min={0} />
            <Select label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
          </div>
          <Textarea label="Notes / Results" value={form.notes} onChange={set('notes')} placeholder="Enter test notes or results..." />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending} className="flex-1">
              {editId ? 'Update Test' : 'Order Test'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
