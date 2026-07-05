import { useState } from 'react'
import { Plus, Pill, AlertTriangle } from 'lucide-react'
import { useMedicines, useCreateMedicine, useUpdateMedicine, useDeleteMedicine } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { Button, Card, Table, LoadingSpinner, EmptyState, Modal, Input, Select, Textarea, SearchInput, ConfirmDialog } from '@/components/shared'
import { formatDate, formatCurrency, getErrorMessage } from '@/lib/utils'

const CATEGORY_OPTIONS = [
  { value: 'tablet', label: 'Tablet' }, { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup' }, { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream/Ointment' }, { value: 'drops', label: 'Drops' },
  { value: 'other', label: 'Other' },
]

const emptyForm = { name: '', generic_name: '', category: 'tablet', manufacturer: '', stock: '0', min_stock: '10', unit_price: '0', expiry_date: '', description: '' }

export default function PharmacyPage() {
  const { hospital } = useAuth()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useMedicines({ search })
  const createMut = useCreateMedicine()
  const updateMut = useUpdateMedicine()
  const deleteMut = useDeleteMedicine()

  const medicines = (data as any)?.results ?? (data as any) ?? []
  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setFormError(''); setModalOpen(true) }
  const openEdit = (m: any) => {
    setForm({ name: m.name, generic_name: m.generic_name, category: m.category, manufacturer: m.manufacturer,
      stock: String(m.stock), min_stock: String(m.min_stock), unit_price: String(m.unit_price),
      expiry_date: m.expiry_date || '', description: m.description })
    setEditId(m.id); setFormError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = { ...form, stock: Number(form.stock), min_stock: Number(form.min_stock), unit_price: Number(form.unit_price) }
    try {
      if (editId) await updateMut.mutateAsync({ id: editId, data: payload })
      else await createMut.mutateAsync(payload)
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  if (!hospital?.has_pharmacy) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Pill size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Pharmacy Module Locked</h2>
          <p className="text-slate-500 mb-6 max-w-md">The pharmacy module is available on the Advanced and Enterprise plans. Upgrade your plan to unlock pharmacy management.</p>
          <Button>Upgrade Plan</Button>
        </div>
      </div>
    )
  }

  const lowStockCount = medicines.filter((m: any) => m.is_low_stock).length

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pharmacy</h2>
          <p className="text-sm text-slate-500 mt-0.5">{medicines.length} medicines in inventory</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Add Medicine</Button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{lowStockCount} medicine{lowStockCount > 1 ? 's' : ''}</strong> at or below minimum stock level.
          </p>
        </div>
      )}

      <Card>
        <div className="p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search medicines..." />
        </div>

        {isLoading ? <LoadingSpinner /> : medicines.length === 0 ? (
          <EmptyState icon={Pill} title="No medicines in inventory"
            description="Add medicines to track your pharmacy inventory."
            action={<Button icon={<Plus size={16} />} onClick={openCreate}>Add Medicine</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>{['Name', 'Category', 'Manufacturer', 'Stock', 'Min Stock', 'Unit Price', 'Expiry', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {medicines.map((m: any) => (
                <tr key={m.id}>
                  <td>
                    <p className="font-medium text-slate-900">{m.name}</p>
                    {m.generic_name && <p className="text-xs text-slate-400">{m.generic_name}</p>}
                  </td>
                  <td className="capitalize">{m.category}</td>
                  <td>{m.manufacturer || '—'}</td>
                  <td>
                    <span className={m.is_low_stock ? 'text-red-600 font-semibold' : 'text-slate-700'}>{m.stock}</span>
                  </td>
                  <td className="text-slate-500">{m.min_stock}</td>
                  <td className="font-medium">{formatCurrency(m.unit_price)}</td>
                  <td className="text-slate-500">{formatDate(m.expiry_date)}</td>
                  <td>
                    {m.is_low_stock
                      ? <span className="badge badge-red">Low Stock</span>
                      : <span className="badge badge-green">In Stock</span>}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="hover:text-red-500" onClick={() => setDeleteId(m.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Medicine' : 'Add Medicine'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Medicine Name" value={form.name} onChange={set('name')} required placeholder="Paracetamol 500mg" />
            </div>
            <Input label="Generic Name" value={form.generic_name} onChange={set('generic_name')} placeholder="Acetaminophen" />
            <Select label="Category" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
            <Input label="Manufacturer" value={form.manufacturer} onChange={set('manufacturer')} placeholder="PharmaCo Ltd." />
            <Input label="Unit Price ($)" type="number" step="0.01" value={form.unit_price} onChange={set('unit_price')} min={0} required />
            <Input label="Current Stock" type="number" value={form.stock} onChange={set('stock')} min={0} required />
            <Input label="Minimum Stock Alert" type="number" value={form.min_stock} onChange={set('min_stock')} min={0} />
            <div className="col-span-2">
              <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={set('expiry_date')} />
            </div>
            <div className="col-span-2">
              <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="Usage and dosage information..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending} className="flex-1">
              {editId ? 'Save Changes' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Remove Medicine"
        message="Remove this medicine from the inventory permanently?"
        onConfirm={async () => { if (deleteId) { await deleteMut.mutateAsync(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)} loading={deleteMut.isPending} />
    </div>
  )
}
