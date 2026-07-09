// ─── Core Types ──────────────────────────────────────────────────────────────

export type Role =
  | 'super_admin'
  | 'hospital_admin'
  | 'doctor'
  | 'receptionist'
  | 'nurse'
  | 'lab_technician'
  | 'pharmacist'

export type Plan = 'trial' | 'basic' | 'advanced' | 'enterprise'
export type SubscriptionStatus = 'active' | 'suspended' | 'trial'

export interface Hospital {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  plan: Plan
  billing_cycle_months: 1 | 3 | 12 | 24
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  total_beds: number
  has_pharmacy: boolean
  has_lab: boolean
  has_multi_branch: boolean
  has_bed_management: boolean
  has_inventory: boolean
  max_doctors: number | null
  plan_config: PlanConfig
  plan_catalog: Record<Plan, PlanConfig>
  plan_limits: PlanLimits
  enabled_modules: string[]
  allowed_roles: Role[]
  subscription_usage: SubscriptionUsage
  owner_name?: string
  owner_email?: string
  owner_count?: number
  staff_count?: number
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  departments: number | null
  beds: number | null
  doctors: number | null
  staff: number | null
}

export interface PlanConfig {
  label: string
  price: string
  limits: PlanLimits
  roles: Role[]
  modules: string[]
}

export interface SubscriptionUsageItem {
  used: number
  limit: number | null
  is_over_limit: boolean
}

export type SubscriptionUsage = Record<keyof PlanLimits, SubscriptionUsageItem>

export interface User {
  id: number
  email: string
  name: string
  role: Role
  phone: string
  specialization: string
  department: number | null
  hospital: number | null
  hospital_detail: Hospital | null
  avatar: string | null
  is_active: boolean
  created_at: string
}

export interface Department {
  id: number
  hospital: number
  name: string
  description: string
  head_doctor: number | null
  staff_count: number
  created_at: string
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type Gender = 'M' | 'F' | 'O'
export type PatientStatus = 'active' | 'discharged' | 'deceased'

export interface Patient {
  id: number
  hospital: number
  patient_id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  gender: Gender
  blood_group: BloodGroup | ''
  address: string
  emergency_contact: string
  emergency_phone: string
  allergies: string
  chronic_conditions: string
  status: PatientStatus
  age: number
  registered_by: number | null
  created_at: string
  updated_at: string
}

export type AppointmentStatus =
  | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type AppointmentType =
  | 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'lab_test'

export interface Appointment {
  id: number
  hospital: number
  patient: number
  patient_name: string
  patient_id_str: string
  doctor: number | null
  doctor_name: string
  department: number | null
  department_name: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  type: AppointmentType
  status: AppointmentStatus
  reason: string
  notes: string
  created_at: string
}

export interface MedicalRecord {
  id: number
  hospital: number
  patient: number
  patient_name: string
  appointment: number | null
  doctor: number | null
  doctor_name: string
  diagnosis: string
  symptoms: string
  treatment: string
  prescription: string
  notes: string
  follow_up_date: string | null
  created_at: string
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled'

export interface InvoiceItem {
  name: string
  qty: number
  price: number
  total: number
}

export interface Invoice {
  id: number
  hospital: number
  patient: number
  patient_name: string
  appointment: number | null
  invoice_number: string
  status: InvoiceStatus
  items: InvoiceItem[]
  subtotal: number
  tax_percent: number
  tax_amount: number
  discount: number
  total: number
  paid_amount: number
  balance: number
  due_date: string | null
  notes: string
  created_at: string
}

export interface Medicine {
  id: number
  hospital: number
  name: string
  generic_name: string
  category: string
  manufacturer: string
  stock: number
  min_stock: number
  unit_price: number
  expiry_date: string | null
  description: string
  is_active: boolean
  is_low_stock: boolean
  created_at: string
}

export type LabTestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface LabTest {
  id: number
  hospital: number
  patient: number
  patient_name: string
  appointment: number | null
  ordered_by: number | null
  ordered_by_name: string
  processed_by: number | null
  test_name: string
  test_code: string
  category: string
  status: LabTestStatus
  result: string
  normal_range: string
  result_date: string | null
  cost: number
  notes: string
  created_at: string
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
  hospital?: { id: number; name: string; plan: Plan }
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total_patients: number
  today_appointments: number
  monthly_revenue: number
  total_staff: number
  staff_by_role: Partial<Record<Role, number>>
  total_departments: number
  pending_invoices: number
  overdue_invoices: number
  outstanding_amount: number
  available_beds: number
  total_beds: number
  hospital_plan: Plan
  plan_config: PlanConfig
  subscription_usage: SubscriptionUsage
  enabled_modules: string[]
  allowed_roles: Role[]
  low_stock_medicines: number
}

export interface RevenueTrend {
  date: string
  revenue: number
  appointments: number
}

export interface RecentAppointment {
  id: number
  patient_name: string
  patient_id: string
  doctor_name: string
  department: string
  date: string
  time: string
  status: AppointmentStatus
  type: AppointmentType
}

export interface AppointmentBreakdown {
  status: AppointmentStatus
  count: number
}

export interface PatientGrowth {
  month: string
  patients: number
}
