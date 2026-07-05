import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authApi, hospitalApi } from '@/api/client'
import { useDepartments, useStaff } from '@/hooks'
import { Button, Card, CardHeader, CardContent, Input, Select, LoadingSpinner } from '@/components/shared'
import { getErrorMessage, planConfig } from '@/lib/utils'
import { CheckCircle2, Building2, User, Shield, AlertCircle } from 'lucide-react'

const PLANS = [
  { id: 'trial', name: 'Trial', price: '$0/mo', limits: { departments: 2, beds: 25, doctors: 3, staff: 10 }, features: ['2 departments', '25 beds', '3 doctors', 'Core front desk'] },
  { id: 'basic', name: 'Basic', price: '$49/mo', limits: { departments: 5, beds: 50, doctors: 5, staff: 25 }, features: ['5 departments', '50 beds', '5 doctors', 'Medical records'] },
  { id: 'advanced', name: 'Advanced', price: '$149/mo', limits: { departments: 15, beds: 200, doctors: 20, staff: 100 }, features: ['15 departments', '200 beds', '20 doctors', 'Nurse, Lab & Pharmacy'] },
  { id: 'enterprise', name: 'Enterprise', price: '$399/mo', limits: { departments: null, beds: null, doctors: null, staff: null }, features: ['Unlimited departments', 'Unlimited beds', 'Unlimited staff', 'Payroll, audit, vendors'] },
]

export default function SettingsPage() {
  const { user, hospital, refreshUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', specialization: user?.specialization || '' })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')

  const { data: deptData, isLoading: departmentsLoading } = useDepartments({})
  const { data: staffData, isLoading: staffLoading } = useStaff({})

  const departments = useMemo(() => (deptData as any)?.results ?? (deptData as any) ?? [], [deptData])
  const staff = useMemo(() => (staffData as any)?.results ?? (staffData as any) ?? [], [staffData])
  const deptOptions = departments.map((d: any) => ({ value: String(d.id), label: d.name }))

  const selectedDepartmentName = departments.find((d: any) => String(d.id) === selectedDepartment)?.name
  const selectedDepartmentStaff = staff.filter((s: any) => String(s.department || '') === selectedDepartment)
  const departmentNeeds = {
    doctors: selectedDepartmentStaff.filter((s: any) => s.role === 'doctor').length,
    admins: selectedDepartmentStaff.filter((s: any) => s.role === 'hospital_admin').length,
  }

  const setP = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setProfileForm(p => ({ ...p, [f]: e.target.value }))
  const setPw = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setPwForm(p => ({ ...p, [f]: e.target.value }))

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setProfileMsg('')
    try {
      await authApi.updateProfile(profileForm)
      await refreshUser()
      setProfileMsg('Profile updated successfully!')
    } catch (err) {
      setProfileMsg(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const upgradePlan = async (plan: string) => {
    if (!hospital) return
    setUpgradeLoading(plan)
    try {
      await hospitalApi.upgrade(hospital.id, plan)
      await refreshUser()
    } catch (err) {
      console.error(err)
    } finally {
      setUpgradeLoading('')
    }
  }

  const currentPlan = hospital?.plan ?? 'trial'
  const planInfo = planConfig[currentPlan] || planConfig.trial
  const usage = hospital?.subscription_usage
  const displayLimit = (limit: number | null | undefined) => limit == null ? 'Unlimited' : limit

  return (
    <div className="page-container max-w-4xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900">Profile Settings</h3>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
            {profileMsg && (
              <div className={`text-sm p-3 rounded-lg ${profileMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {profileMsg}
              </div>
            )}
            <Input label="Full Name" value={profileForm.name} onChange={setP('name')} required />
            <Input label="Phone" value={profileForm.phone} onChange={setP('phone')} />
            <Input label="Specialization" value={profileForm.specialization} onChange={setP('specialization')} />
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <p className="text-slate-500">Email: <span className="font-medium text-slate-800">{user?.email}</span></p>
              <p className="text-slate-500 mt-1">Role: <span className="font-medium text-slate-800 capitalize">{user?.role?.replace('_', ' ')}</span></p>
            </div>
            <Button type="submit" loading={loading}>Save Profile</Button>
          </form>
        </CardContent>
      </Card>

      {/* Hospital Info */}
      {hospital && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              <h3 className="font-semibold text-slate-900">Hospital Information</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm max-w-lg">
              <div>
                <p className="text-slate-500 mb-0.5">Hospital Name</p>
                <p className="font-medium text-slate-900">{hospital.name}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Email</p>
                <p className="font-medium text-slate-900">{hospital.email}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Current Plan</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planInfo.color}`}>{planInfo.label}</span>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Status</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 capitalize">{hospital.subscription_status}</span>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Total Beds</p>
                <p className="font-medium text-slate-900">{hospital.total_beds}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Pharmacy</p>
                <p className="font-medium text-slate-900">{hospital.has_pharmacy ? '✅ Enabled' : '❌ Locked'}</p>
              </div>
            </div>
            {usage && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(usage).map(([key, value]: any) => (
                  <div key={key} className={`rounded-lg border px-3 py-2 ${value.is_over_limit ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                    <p className="text-xs font-medium capitalize text-slate-500">{key}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{value.used} / {displayLimit(value.limit)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Upgrade */}
      {(user?.role === 'hospital_admin' || user?.role === 'super_admin') && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-blue-600" />
              <h3 className="font-semibold text-slate-900">Subscription Plan</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-sm text-slate-500 mb-3">
                  Select a department to check department needs, and compare plans against total hospital capacity: departments, beds, doctors, staff, and enabled roles.
                </p>
                {departmentsLoading ? (
                  <LoadingSpinner className="py-4" />
                ) : (
                  <Select
                    label="Department"
                    value={selectedDepartment}
                    onChange={e => setSelectedDepartment(e.target.value)}
                    options={deptOptions}
                  />
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="text-slate-500">Selected Need</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedDepartment ? selectedDepartmentName : 'Choose department'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {staffLoading ? 'Loading staff...' : `${departmentNeeds.admins} admin / ${departmentNeeds.doctors} doctors`}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {PLANS.map(plan => {
                const isActive = currentPlan === plan.id
                const doctorsFit = !selectedDepartment || plan.limits.doctors === null || departmentNeeds.doctors <= plan.limits.doctors
                const adminsFit = !selectedDepartment || plan.limits.staff === null || departmentNeeds.admins <= plan.limits.staff
                const usageFits = !usage || Object.entries(usage).every(([key, value]: any) => {
                  const limit = plan.limits[key as keyof typeof plan.limits]
                  return limit === null || value.used <= limit
                })
                const planFitsDepartment = doctorsFit && adminsFit && usageFits
                return (
                  <div key={plan.id} className={`rounded-xl border-2 p-5 transition-all ${isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900">{plan.name}</h4>
                      {isActive && <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Current</span>}
                    </div>
                    <p className="text-xl font-bold text-slate-800 mb-4">{plan.price}</p>
                    {(selectedDepartment || usage) && (
                      <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${planFitsDepartment ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {planFitsDepartment ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {planFitsDepartment ? 'Fits current requirements' : 'Needs higher plan'}
                      </div>
                    )}
                    <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                      <span className="rounded bg-slate-50 px-2 py-1">Departments: {displayLimit(plan.limits.departments)}</span>
                      <span className="rounded bg-slate-50 px-2 py-1">Beds: {displayLimit(plan.limits.beds)}</span>
                      <span className="rounded bg-slate-50 px-2 py-1">Doctors: {displayLimit(plan.limits.doctors)}</span>
                      <span className="rounded bg-slate-50 px-2 py-1">Staff: {displayLimit(plan.limits.staff)}</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    {selectedDepartment && !planFitsDepartment && (
                      <p className="mb-4 text-xs text-red-600">
                        Fails for {departmentNeeds.admins} admin / {departmentNeeds.doctors} doctors in this department.
                      </p>
                    )}
                    <Button
                      variant={isActive ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full"
                      disabled={isActive}
                      loading={upgradeLoading === plan.id}
                      onClick={() => upgradePlan(plan.id)}
                    >
                      {isActive ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
