import { useState } from 'react'
import { Plus, Receipt, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { useInvoices, useCreateInvoice, useUpdateInvoice, useBillingSummary, usePatients } from '@/hooks'
import { Button, Card, Table, LoadingSpinner, EmptyState, Modal, Input, Select, StatCard, SearchInput, Textarea } from '@/components/shared'
import { formatDate, formatCurrency, invoiceStatusConfig, getErrorMessage } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function BillingPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editInv, setEditInv] = useState<any>(null)
  const [formError, setFormError] = useState('')
  const [items, setItems] = useState([{ name: '', qty: 1, price: 0, total: 0 }])
  const [form, setForm] = useState({ patient: '', status: 'pending', tax_percent: '0', discount: '0', notes: '', due_date: '', paid_amount: '0' })

  const params: any = {}
  if (search) params.search = search
  if (statusFilter) params.status = statusFilter

  const { data, isLoading } = useInvoices(params)
  const { data: summaryData } = useBillingSummary()
  const { data: patientsData } = usePatients({})
  const createMut = useCreateInvoice()
  const updateMut = useUpdateInvoice()

  const invoices = (data as any)?.results ?? (data as any) ?? []
  const summary = summaryData as any
  const patients = (patientsData as any)?.results ?? (patientsData as any) ?? []
  const patientOptions = patients.map((p: any) => ({ value: p.id, label: `${p.name} (${p.patient_id})` }))

  const setF = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const updateItem = (i: number, field: string, val: string | number) => {
    setItems(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: field === 'name' ? val : Number(val) }
      next[i].total = next[i].qty * next[i].price
      return next
    })
  }
  const addItem = () => setItems(p => [...p, { name: '', qty: 1, price: 0, total: 0 }])
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const taxAmt = subtotal * (Number(form.tax_percent) / 100)
  const total = subtotal + taxAmt - Number(form.discount)

  const openCreate = () => {
    setForm({ patient: '', status: 'pending', tax_percent: '0', discount: '0', notes: '', due_date: '', paid_amount: '0' })
    setItems([{ name: '', qty: 1, price: 0, total: 0 }])
    setEditInv(null); setFormError(''); setModalOpen(true)
  }

  const openEdit = (inv: any) => {
    setForm({ patient: inv.patient, status: inv.status, tax_percent: String(inv.tax_percent),
      discount: String(inv.discount), notes: inv.notes, due_date: inv.due_date || '', paid_amount: String(inv.paid_amount) })
    setItems(inv.items?.length ? inv.items : [{ name: '', qty: 1, price: 0, total: 0 }])
    setEditInv(inv); setFormError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = {
      ...form, items,
      subtotal, tax_amount: taxAmt, total,
      discount: Number(form.discount), paid_amount: Number(form.paid_amount),
      tax_percent: Number(form.tax_percent),
    }
    try {
      if (editInv) await updateMut.mutateAsync({ id: editInv.id, data: payload })
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
          <h2 className="text-xl font-bold text-slate-900">Billing & Invoices</h2>
          <p className="text-sm text-slate-500 mt-0.5">{invoices.length} invoices</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>New Invoice</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(summary?.total_revenue ?? 0)} icon={DollarSign} color="green" />
        <StatCard title="Pending" value={formatCurrency(summary?.total_pending ?? 0)} icon={Clock} color="orange" />
        <StatCard title="Total Invoices" value={summary?.total_invoices ?? 0} icon={Receipt} color="blue" />
        <StatCard title="Overdue" value={invoices.filter((i: any) => i.status === 'overdue').length} icon={AlertTriangle} color="red" />
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {isLoading ? <LoadingSpinner /> : invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices found"
            action={<Button icon={<Plus size={16} />} onClick={openCreate}>New Invoice</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>{['Invoice #', 'Patient', 'Total', 'Paid', 'Balance', 'Status', 'Due Date', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => {
                const sc = invoiceStatusConfig[inv.status as keyof typeof invoiceStatusConfig]
                return (
                  <tr key={inv.id}>
                    <td><span className="font-mono text-blue-600 text-xs font-semibold">{inv.invoice_number}</span></td>
                    <td className="font-medium text-slate-900">{inv.patient_name}</td>
                    <td className="font-semibold">{formatCurrency(inv.total)}</td>
                    <td className="text-emerald-600">{formatCurrency(inv.paid_amount)}</td>
                    <td className={Number(inv.balance) > 0 ? 'text-red-500 font-medium' : 'text-slate-400'}>
                      {formatCurrency(inv.balance)}
                    </td>
                    <td><span className={sc?.className}>{sc?.label}</span></td>
                    <td className="text-slate-500">{formatDate(inv.due_date)}</td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(inv)}>Edit</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editInv ? `Edit ${editInv.invoice_number}` : 'New Invoice'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>}

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Select label="Patient" value={String(form.patient)} onChange={setF('patient')} options={patientOptions} required />
            </div>
            <Select label="Status" value={form.status} onChange={setF('status')} options={STATUS_OPTIONS} />
          </div>

          {/* Line Items */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Line Items</label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)}
                    placeholder="Description" required
                    className="col-span-5 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" value={item.qty} min={1} onChange={e => updateItem(i, 'qty', e.target.value)}
                    className="col-span-2 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" value={item.price} min={0} step="0.01" onChange={e => updateItem(i, 'price', e.target.value)}
                    placeholder="Price"
                    className="col-span-2 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="col-span-2 text-sm font-medium text-slate-700 text-right">{formatCurrency(item.total)}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-red-400 hover:text-red-600 text-lg">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                + Add Item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
            <div className="flex items-center justify-between text-sm gap-4">
              <span className="text-slate-600">Tax (%)</span>
              <input type="number" value={form.tax_percent} min={0} max={100} onChange={setF('tax_percent')}
                className="w-20 text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right" />
            </div>
            <div className="flex items-center justify-between text-sm gap-4">
              <span className="text-slate-600">Discount ($)</span>
              <input type="number" value={form.discount} min={0} onChange={setF('discount')}
                className="w-24 text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right" />
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
            <div className="flex items-center justify-between text-sm gap-4">
              <span className="text-slate-600">Paid Amount ($)</span>
              <input type="number" value={form.paid_amount} min={0} onChange={setF('paid_amount')}
                className="w-24 text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={setF('due_date')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending} className="flex-1">
              {editInv ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
