import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, ArrowRight, BarChart3, Bed, Building2, CalendarCheck,
  CheckCircle2, ClipboardList, FlaskConical, Menu, Pill, ShieldCheck,
  UsersRound,
} from 'lucide-react'

const heroImage = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1800&q=85'

const modules = [
  { icon: UsersRound, title: 'Patient Records', desc: 'Profiles, history, allergies, emergency contacts, and visits in one organized record.' },
  { icon: CalendarCheck, title: 'Appointments', desc: 'Book consultations, route patients by department, and keep front desk queues moving.' },
  { icon: ClipboardList, title: 'Medical Records', desc: 'Doctors can capture diagnosis, treatment notes, prescriptions, and follow-up dates.' },
  { icon: Pill, title: 'Pharmacy', desc: 'Track medicines, prices, expiry dates, low-stock alerts, and dispensing workflows.' },
  { icon: FlaskConical, title: 'Laboratory', desc: 'Manage test requests, result entry, report status, and lab technician work.' },
  { icon: BarChart3, title: 'Billing Insights', desc: 'Invoices, paid balances, outstanding amounts, and monthly revenue at a glance.' },
]

const workflows = [
  { label: 'Register', value: 'New patient' },
  { label: 'Schedule', value: 'Doctor visit' },
  { label: 'Record', value: 'Diagnosis' },
  { label: 'Bill', value: 'Invoice' },
]

const plans = [
  { id: 'trial', name: 'Trial', monthlyPrice: 0, features: ['2 departments', '25 beds', '3 doctors', 'Core front desk'] },
  { id: 'basic', name: 'Basic', monthlyPrice: 49, features: ['5 departments', '50 beds', '5 doctors', 'Medical records'] },
  { id: 'advanced', name: 'Advanced', monthlyPrice: 149, features: ['15 departments', '200 beds', '20 doctors', 'Lab and pharmacy roles'], highlight: true },
  { id: 'enterprise', name: 'Enterprise', monthlyPrice: 399, features: ['Unlimited capacity', 'Payroll ready', 'Audit workflows', 'Advanced reports'] },
]

const billingTerms = [
  { months: 1, label: 'Monthly', suffix: '/mo' },
  { months: 3, label: '3 months', suffix: '/3 mo' },
  { months: 12, label: '12 months', suffix: '/12 mo' },
  { months: 24, label: '24 months', suffix: '/24 mo' },
]

const trustStats = [
  { value: '24/7', label: 'Operational access' },
  { value: '7', label: 'Role workspaces' },
  { value: '100%', label: 'Hospital data isolation' },
]

export default function LandingPage() {
  const [billingMonths, setBillingMonths] = useState(1)
  const selectedTerm = billingTerms.find(term => term.months === billingMonths) ?? billingTerms[0]
  const formatPrice = (monthlyPrice: number) => monthlyPrice === 0 ? '$0' : `$${monthlyPrice * billingMonths}`

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="absolute left-0 right-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <Activity size={22} />
            </span>
            <span className="text-xl font-bold">Hospora</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-white/85 md:flex">
            <a href="#modules" className="hover:text-white">Modules</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex">
              Sign In
            </Link>
            <Link to="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-100">
              Start Trial
            </Link>
            <button className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section
          className="relative min-h-[88vh] overflow-hidden bg-slate-950"
          style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-900/20" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

          <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl items-center px-5 pb-24 pt-28 sm:px-6">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-200/20">
                <ShieldCheck size={14} /> Hospital Management Software
              </span>
              <h1 className="mt-6 text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                Hospora
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-100">
                A complete operating system for hospitals: patients, appointments, staff, billing, pharmacy, lab, and owner oversight in one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-700">
                  Create Hospital <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/10">
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-16 px-5 sm:px-6">
          <div className="relative z-10 mx-auto grid max-w-6xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 md:grid-cols-4">
            {workflows.map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-1 text-base font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="modules" className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Core Modules</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Run daily hospital work from one screen</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Hospora keeps clinical, administrative, and financial teams aligned without switching between disconnected tools.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <article key={module.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-blue-700">
                  <module.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-950">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="bg-slate-950 px-5 py-20 text-white sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">For Every Role</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Owner control with focused staff workspaces</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Web owners can review hospitals. Hospital admins can manage operations. Doctors, receptionists, pharmacists, and lab technicians see the tools that matter to their shift.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {trustStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-2xl font-extrabold">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
                    <Building2 size={20} />
                  </span>
                  <div>
                    <p className="font-bold">City General Hospital</p>
                    <p className="text-xs text-slate-300">Advanced plan</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">active</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Patients', '1,248', UsersRound],
                  ['Appointments Today', '42', CalendarCheck],
                  ['Available Beds', '118', Bed],
                  ['Monthly Revenue', '$86k', BarChart3],
                ].map(([label, value, Icon]) => (
                  <div key={label as string} className="rounded-xl bg-white p-4 text-slate-900">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">{label as string}</p>
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <p className="mt-3 text-2xl font-extrabold">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Plans</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Start small, grow by hospital capacity</h2>
            <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:grid-cols-4">
              {billingTerms.map(term => (
                <button
                  key={term.months}
                  type="button"
                  onClick={() => setBillingMonths(term.months)}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${billingMonths === term.months ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-xl border p-6 ${plan.highlight ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100' : 'border-slate-200 bg-white'}`}
              >
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-extrabold">{formatPrice(plan.monthlyPrice)}</span>
                  <span className={plan.highlight ? 'pb-1 text-blue-100' : 'pb-1 text-slate-500'}>{plan.id === 'trial' ? '/mo' : selectedTerm.suffix}</span>
                </div>
                <p className={`mt-2 text-xs font-semibold ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                  {plan.id === 'trial'
                    ? 'Free for 1 month trial access'
                    : billingMonths === 1
                      ? 'Monthly billing'
                      : `$${plan.monthlyPrice}/mo billed every ${billingMonths} months`}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className={plan.highlight ? 'text-blue-100' : 'text-emerald-600'} />
                      <span className={plan.highlight ? 'text-blue-50' : 'text-slate-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-bold ${plan.highlight ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                >
                  Choose Plan
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) 2026 Hospora. Hospital Management Software.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-slate-900">Sign In</Link>
            <Link to="/register" className="hover:text-slate-900">Start Trial</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
