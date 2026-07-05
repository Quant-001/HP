import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL) || '/api'
const AUTH_KEY = 'hospora_auth'

// ─── Token helpers ────────────────────────────────────────────────────────────

export const getAuthData = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch {
    return null
  }
}

export const setAuthData = (data: object) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export const clearAuthData = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const getAccessToken = (): string | null => {
  return getAuthData()?.access ?? null
}

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthData()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── API helpers ──────────────────────────────────────────────────────────────

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  api.get<T>(url, config).then((r) => r.data)

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.post<T>(url, data, config).then((r) => r.data)

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.put<T>(url, data, config).then((r) => r.data)

export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.patch<T>(url, data, config).then((r) => r.data)

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  api.delete<T>(url, config).then((r) => r.data)

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: unknown) => post('/auth/register/', data),
  login: (data: unknown) => post('/auth/login/', data),
  me: () => get('/auth/me/'),
  updateProfile: (data: unknown) => patch('/auth/profile/', data),
  refreshToken: (refresh: string) => post('/auth/token/refresh/', { refresh }),
}

// ─── Hospital API ─────────────────────────────────────────────────────────────

export const hospitalApi = {
  list: (params?: object) => get('/hospitals/', { params }),
  get: (id: number) => get(`/hospitals/${id}/`),
  update: (id: number, data: unknown) => put(`/hospitals/${id}/`, data),
  upgrade: (id: number, plan: string) => post(`/hospitals/${id}/upgrade/`, { plan }),
}

// ─── Patients API ─────────────────────────────────────────────────────────────

export const patientsApi = {
  list: (params?: object) => get('/patients/', { params }),
  get: (id: number) => get(`/patients/${id}/`),
  create: (data: unknown) => post('/patients/', data),
  update: (id: number, data: unknown) => patch(`/patients/${id}/`, data),
  delete: (id: number) => del(`/patients/${id}/`),
}

// ─── Appointments API ─────────────────────────────────────────────────────────

export const appointmentsApi = {
  list: (params?: object) => get('/appointments/', { params }),
  get: (id: number) => get(`/appointments/${id}/`),
  create: (data: unknown) => post('/appointments/', data),
  update: (id: number, data: unknown) => patch(`/appointments/${id}/`, data),
  delete: (id: number) => del(`/appointments/${id}/`),
}

// ─── Queue API ────────────────────────────────────────────────────────────────

export const queueApi = {
  list: (params?: object) => get('/queue/', { params }),
  create: (data: unknown) => post('/queue/', data),
  updateStatus: (id: number, action: string) => post('/queue/' + id + '/' + action + '/'),
  summary: (params?: object) => get('/queue/summary/', { params }),
}

// ─── Staff API ────────────────────────────────────────────────────────────────

export const staffApi = {
  list: (params?: object) => get('/staff/', { params }),
  get: (id: number) => get(`/staff/${id}/`),
  create: (data: unknown) => post('/staff/', data),
  update: (id: number, data: unknown) => patch(`/staff/${id}/`, data),
  delete: (id: number) => del(`/staff/${id}/`),
}

// ─── Departments API ──────────────────────────────────────────────────────────

export const departmentsApi = {
  list: (params?: object) => get('/departments/', { params }),
  get: (id: number) => get(`/departments/${id}/`),
  create: (data: unknown) => post('/departments/', data),
  update: (id: number, data: unknown) => patch(`/departments/${id}/`, data),
  delete: (id: number) => del(`/departments/${id}/`),
}

// ─── Medical Records API ──────────────────────────────────────────────────────

export const medicalRecordsApi = {
  list: (params?: object) => get('/medical-records/', { params }),
  get: (id: number) => get(`/medical-records/${id}/`),
  create: (data: unknown) => post('/medical-records/', data),
  update: (id: number, data: unknown) => patch(`/medical-records/${id}/`, data),
  delete: (id: number) => del(`/medical-records/${id}/`),
}

// ─── Billing API ──────────────────────────────────────────────────────────────

export const billingApi = {
  list: (params?: object) => get('/billing/', { params }),
  get: (id: number) => get(`/billing/${id}/`),
  create: (data: unknown) => post('/billing/', data),
  update: (id: number, data: unknown) => patch(`/billing/${id}/`, data),
  delete: (id: number) => del(`/billing/${id}/`),
  summary: () => get('/billing/summary/'),
}

// ─── Pharmacy API ─────────────────────────────────────────────────────────────

export const pharmacyApi = {
  list: (params?: object) => get('/pharmacy/', { params }),
  get: (id: number) => get(`/pharmacy/${id}/`),
  create: (data: unknown) => post('/pharmacy/', data),
  update: (id: number, data: unknown) => patch(`/pharmacy/${id}/`, data),
  delete: (id: number) => del(`/pharmacy/${id}/`),
}

// ─── Lab API ──────────────────────────────────────────────────────────────────

export const labApi = {
  list: (params?: object) => get('/lab/', { params }),
  get: (id: number) => get(`/lab/${id}/`),
  create: (data: unknown) => post('/lab/', data),
  update: (id: number, data: unknown) => patch(`/lab/${id}/`, data),
  delete: (id: number) => del(`/lab/${id}/`),
}

// ─── Dashboard API ────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () => get('/dashboard/stats/'),
  revenueTrends: () => get('/dashboard/revenue-trends/'),
  recentAppointments: () => get('/dashboard/recent-appointments/'),
  appointmentBreakdown: () => get('/dashboard/appointment-breakdown/'),
  patientGrowth: () => get('/dashboard/patient-growth/'),
}
