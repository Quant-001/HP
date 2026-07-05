import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Building2, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, ErrorMessage } from '@/components/shared'
import { getErrorMessage } from '@/lib/utils'

export default function RegisterPage() {
  const { register } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    hospital_name: '', hospital_email: '', hospital_phone: '',
    admin_name: '', admin_email: '', password: '', confirm_password: '',
  })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.hospital_name || !form.hospital_email) {
      setError('Please fill in all hospital details')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({
        hospital_name: form.hospital_name,
        hospital_email: form.hospital_email,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        password: form.password,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-2xl">Hospora</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Register your hospital</h1>
          <p className="text-slate-500 mt-1">Start your free trial — no credit card required</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(n => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${step >= n ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {n}
              </div>
              <span className={`text-xs font-medium ${step >= n ? 'text-blue-600' : 'text-slate-400'}`}>
                {n === 1 ? 'Hospital Info' : 'Admin Account'}
              </span>
              {n < 2 && <div className={`flex-1 h-0.5 ${step > n ? 'bg-blue-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <Building2 size={20} className="text-blue-600" />
                <span className="font-semibold">Hospital Information</span>
              </div>
              <Input label="Hospital Name" placeholder="City General Hospital" icon={<Building2 size={16} />}
                value={form.hospital_name} onChange={set('hospital_name')} required />
              <Input label="Hospital Email" type="email" placeholder="admin@hospital.com" icon={<Mail size={16} />}
                value={form.hospital_email} onChange={set('hospital_email')} required />
              <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000"
                value={form.hospital_phone} onChange={set('hospital_phone')} />
              <Button type="submit" size="lg" className="w-full">
                Continue →
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <User size={20} className="text-blue-600" />
                <span className="font-semibold">Admin Account</span>
              </div>
              <Input label="Your Full Name" placeholder="Dr. John Smith" icon={<User size={16} />}
                value={form.admin_name} onChange={set('admin_name')} required />
              <Input label="Your Email" type="email" placeholder="you@hospital.com" icon={<Mail size={16} />}
                value={form.admin_email} onChange={set('admin_email')} required />
              <Input label="Password" type="password" placeholder="Min. 6 characters" icon={<Lock size={16} />}
                value={form.password} onChange={set('password')} required minLength={6} />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" icon={<Lock size={16} />}
                value={form.confirm_password} onChange={set('confirm_password')} required />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  ← Back
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Create Account
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
