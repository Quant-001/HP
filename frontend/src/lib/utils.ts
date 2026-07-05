import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AppointmentStatus, InvoiceStatus, LabTestStatus, Role } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

export const appointmentStatusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled:    { label: 'Scheduled',    className: 'badge badge-blue' },
  confirmed:    { label: 'Confirmed',    className: 'badge badge-purple' },
  in_progress:  { label: 'In Progress',  className: 'badge badge-yellow' },
  completed:    { label: 'Completed',    className: 'badge badge-green' },
  cancelled:    { label: 'Cancelled',    className: 'badge badge-red' },
  no_show:      { label: 'No Show',      className: 'badge badge-gray' },
}

export const invoiceStatusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'badge badge-gray' },
  pending:   { label: 'Pending',   className: 'badge badge-yellow' },
  paid:      { label: 'Paid',      className: 'badge badge-green' },
  partial:   { label: 'Partial',   className: 'badge badge-blue' },
  overdue:   { label: 'Overdue',   className: 'badge badge-red' },
  cancelled: { label: 'Cancelled', className: 'badge badge-gray' },
}

export const labStatusConfig: Record<LabTestStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'badge badge-yellow' },
  in_progress: { label: 'In Progress', className: 'badge badge-blue' },
  completed:   { label: 'Completed',   className: 'badge badge-green' },
  cancelled:   { label: 'Cancelled',   className: 'badge badge-red' },
}

export const roleConfig: Record<Role, { label: string; className: string }> = {
  super_admin:     { label: 'Super Admin',     className: 'badge badge-red' },
  hospital_admin:  { label: 'Admin',           className: 'badge badge-purple' },
  doctor:          { label: 'Doctor',          className: 'badge badge-blue' },
  receptionist:    { label: 'Receptionist',    className: 'badge badge-green' },
  nurse:           { label: 'Nurse',           className: 'badge badge-teal' },
  lab_technician:  { label: 'Lab Technician',  className: 'badge badge-yellow' },
  pharmacist:      { label: 'Pharmacist',      className: 'badge badge-gray' },
}

export const planConfig = {
  trial:      { label: 'Trial',      color: 'text-slate-600 bg-slate-100', price: '$0/mo' },
  basic:      { label: 'Basic',      color: 'text-blue-600 bg-blue-50', price: '$49/mo' },
  advanced:   { label: 'Advanced',   color: 'text-purple-600 bg-purple-50', price: '$149/mo' },
  enterprise: { label: 'Enterprise', color: 'text-amber-600 bg-amber-50', price: '$399/mo' },
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An error occurred'
  const err = error as any
  if (err.response?.data) {
    const data = err.response.data
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
      const val = data[firstKey]
      return `${firstKey}: ${Array.isArray(val) ? val[0] : val}`
    }
  }
  return err.message || 'An error occurred'
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
