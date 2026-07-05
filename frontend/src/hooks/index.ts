import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dashboardApi, hospitalApi, patientsApi, appointmentsApi, queueApi, staffApi,
  departmentsApi, medicalRecordsApi, billingApi, pharmacyApi, labApi,
} from '@/api/client'

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.stats })

export const useRevenueTrends = () =>
  useQuery({ queryKey: ['dashboard', 'revenue'], queryFn: dashboardApi.revenueTrends })

export const useRecentAppointments = () =>
  useQuery({ queryKey: ['dashboard', 'recent-appointments'], queryFn: dashboardApi.recentAppointments })

export const useAppointmentBreakdown = () =>
  useQuery({ queryKey: ['dashboard', 'breakdown'], queryFn: dashboardApi.appointmentBreakdown })

export const usePatientGrowth = () =>
  useQuery({ queryKey: ['dashboard', 'patient-growth'], queryFn: dashboardApi.patientGrowth })

export const useHospitals = (params?: object) =>
  useQuery({ queryKey: ['hospitals', params], queryFn: () => hospitalApi.list(params) })

export const useHospital = (id: number) =>
  useQuery({ queryKey: ['hospitals', id], queryFn: () => hospitalApi.get(id), enabled: !!id })

// ─── Patients ─────────────────────────────────────────────────────────────────

export const usePatients = (params?: object) =>
  useQuery({ queryKey: ['patients', params], queryFn: () => patientsApi.list(params) })

export const usePatient = (id: number) =>
  useQuery({ queryKey: ['patients', id], queryFn: () => patientsApi.get(id), enabled: !!id })

export const useCreatePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export const useUpdatePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => patientsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export const useDeletePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: patientsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export const useAppointments = (params?: object) =>
  useQuery({ queryKey: ['appointments', params], queryFn: () => appointmentsApi.list(params) })

export const useCreateAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useUpdateAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => appointmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export const useDeleteAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: appointmentsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export const useStaff = (params?: object) =>
  useQuery({ queryKey: ['staff', params], queryFn: () => staffApi.list(params) })

export const useCreateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export const useUpdateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => staffApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export const useDeleteStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: staffApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

// ─── Departments ──────────────────────────────────────────────────────────────

export const useDepartments = (params?: object) =>
  useQuery({ queryKey: ['departments', params], queryFn: () => departmentsApi.list(params) })

export const useCreateDepartment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export const useUpdateDepartment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => departmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export const useDeleteDepartment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: departmentsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })
}

// ─── Medical Records ──────────────────────────────────────────────────────────

export const useMedicalRecords = (params?: object) =>
  useQuery({ queryKey: ['medical-records', params], queryFn: () => medicalRecordsApi.list(params) })

export const useCreateMedicalRecord = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: medicalRecordsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medical-records'] }),
  })
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export const useInvoices = (params?: object) =>
  useQuery({ queryKey: ['billing', params], queryFn: () => billingApi.list(params) })

export const useBillingSummary = () =>
  useQuery({ queryKey: ['billing', 'summary'], queryFn: billingApi.summary })

export const useCreateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: billingApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billing'] }),
  })
}

export const useUpdateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => billingApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billing'] }),
  })
}

// ─── Pharmacy ─────────────────────────────────────────────────────────────────

export const useMedicines = (params?: object) =>
  useQuery({ queryKey: ['pharmacy', params], queryFn: () => pharmacyApi.list(params) })

export const useCreateMedicine = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pharmacyApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }),
  })
}

export const useUpdateMedicine = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => pharmacyApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }),
  })
}

export const useDeleteMedicine = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pharmacyApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }),
  })
}

// ─── Lab ──────────────────────────────────────────────────────────────────────

export const useLabTests = (params?: object) =>
  useQuery({ queryKey: ['lab', params], queryFn: () => labApi.list(params) })

export const useCreateLabTest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: labApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab'] }),
  })
}

export const useUpdateLabTest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => labApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab'] }),
  })
}

// ─── Queue ───────────────────────────────────────────────────────────────────

export const useQueueTickets = (params?: object) =>
  useQuery({ queryKey: ['queue', params], queryFn: () => queueApi.list(params) })

export const useQueueSummary = (params?: object) =>
  useQuery({ queryKey: ['queue', 'summary', params], queryFn: () => queueApi.summary(params) })

export const useCreateQueueTicket = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: queueApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue'] }),
  })
}

export const useUpdateQueueStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) => queueApi.updateStatus(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue'] }),
  })
}
