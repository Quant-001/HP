import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { LoadingSpinner } from '@/components/shared'

// Pages
import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import DashboardPage from '@/pages/Dashboard'
import HospitalDetailPage from '@/pages/HospitalDetail'
import PatientsPage from '@/pages/Patients'
import PatientDetailPage from '@/pages/PatientDetail'
import AppointmentsPage from '@/pages/Appointments'
import StaffPage from '@/pages/Staff'
import DepartmentsPage from '@/pages/Departments'
import MedicalRecordsPage from '@/pages/MedicalRecords'
import BillingPage from '@/pages/Billing'
import PharmacyPage from '@/pages/Pharmacy'
import LabPage from '@/pages/Lab'
import SettingsPage from '@/pages/Settings'
import QueuePage from '@/pages/Queue'
import type { Role } from '@/types'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user?.role || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
      <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />

      {/* Protected */}
      <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hospitals/:id" element={<RequireRole roles={['super_admin']}><HospitalDetailPage /></RequireRole>} />
        <Route path="/patients" element={<RequireRole roles={['hospital_admin', 'doctor', 'receptionist']}><PatientsPage /></RequireRole>} />
        <Route path="/patients/:id" element={<RequireRole roles={['hospital_admin', 'doctor', 'receptionist']}><PatientDetailPage /></RequireRole>} />
        <Route path="/appointments" element={<RequireRole roles={['hospital_admin', 'doctor', 'receptionist']}><AppointmentsPage /></RequireRole>} />
        <Route path="/queue" element={<RequireRole roles={['hospital_admin', 'receptionist']}><QueuePage /></RequireRole>} />
        <Route path="/staff" element={<RequireRole roles={['hospital_admin', 'super_admin']}><StaffPage /></RequireRole>} />
        <Route path="/departments" element={<RequireRole roles={['hospital_admin', 'super_admin']}><DepartmentsPage /></RequireRole>} />
        <Route path="/medical-records" element={<RequireRole roles={['hospital_admin', 'doctor']}><MedicalRecordsPage /></RequireRole>} />
        <Route path="/billing" element={<RequireRole roles={['hospital_admin', 'receptionist']}><BillingPage /></RequireRole>} />
        <Route path="/pharmacy" element={<RequireRole roles={['hospital_admin', 'pharmacist']}><PharmacyPage /></RequireRole>} />
        <Route path="/lab" element={<RequireRole roles={['hospital_admin', 'doctor', 'lab_technician']}><LabPage /></RequireRole>} />
        <Route path="/settings" element={<RequireRole roles={['hospital_admin']}><SettingsPage /></RequireRole>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
