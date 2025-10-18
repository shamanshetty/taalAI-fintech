'use client'

import { type KeyboardEvent, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Calculator,
  Calendar,
  CheckCircle2,
  Download,
  Info,
  Lightbulb,
  PiggyBank,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

type RegimeOption = 'new' | 'old' | 'hybrid'

interface IncomeRecord {
  month: string
  income: number
  taxable: number
}

interface DeductionCategory {
  id: string
  label: string
  cap: number
  description: string
  amount: number
}

interface AdvanceTaxMilestone {
  quarter: string
  dueDate: string
  targetPercent: number
  paidPercent: number
}

const MONTHLY_INCOME: IncomeRecord[] = [
  { month: 'Apr', income: 45000, taxable: 45000 },
  { month: 'May', income: 0, taxable: 0 },
  { month: 'Jun', income: 90000, taxable: 90000 },
  { month: 'Jul', income: 32000, taxable: 32000 },
  { month: 'Aug', income: 0, taxable: 0 },
  { month: 'Sep', income: 125000, taxable: 125000 },
  { month: 'Oct', income: 58000, taxable: 58000 },
  { month: 'Nov', income: 0, taxable: 0 },
  { month: 'Dec', income: 160000, taxable: 160000 },
]

const INITIAL_DEDUCTIONS: DeductionCategory[] = [
  {
    id: '80c',
    label: '80C investments',
    cap: 150000,
    description: 'ELSS, PPF, EPF, term insurance premiums',
    amount: 60000,
  },
  {
    id: '80d',
    label: '80D health cover',
    cap: 25000,
    description: 'Health insurance premium for self/family',
    amount: 18000,
  },
  {
    id: 'nps',
    label: 'NPS top-up',
    cap: 50000,
    description: 'Additional 80CCD(1B) contribution',
    amount: 12000,
  },
  {
    id: 'home',
    label: 'Home loan interest',
    cap: 200000,
    description: 'Self-occupied property interest benefit',
    amount: 145000,
  },
]

const ADVANCE_TAX_MILESTONES: AdvanceTaxMilestone[] = [
  { quarter: 'Q1 (Apr-Jun)', dueDate: '15 Jun', targetPercent: 15, paidPercent: 10 },
  { quarter: 'Q2 (Jul-Sep)', dueDate: '15 Sep', targetPercent: 45, paidPercent: 30 },
  { quarter: 'Q3 (Oct-Dec)', dueDate: '15 Dec', targetPercent: 75, paidPercent: 0 },
  { quarter: 'Q4 (Jan-Mar)', dueDate: '15 Mar', targetPercent: 100, paidPercent: 0 },
]

const totalIncomeYTD = MONTHLY_INCOME.reduce((sum, entry) => sum + entry.income, 0)
const activeMonths = MONTHLY_INCOME.filter((entry) => entry.income > 0).length
const averageActiveMonthIncome = activeMonths ? totalIncomeYTD / activeMonths : 0
const runRateAnnualIncome = averageActiveMonthIncome * 12

const calculateNewRegimeTax = (income: number) => {
  const slabRates = [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.1 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.2 },
  ]

  let remaining = income
  let accumulated = 0
  let total = 0

  for (const slab of slabRates) {
    const taxableInSlab = Math.max(0, Math.min(remaining, slab.limit - accumulated))
    total += taxableInSlab * slab.rate
    remaining -= taxableInSlab
    accumulated = slab.limit
  }

  if (remaining > 0) {
    total += remaining * 0.3
  }

  const cess = total * 0.04
  return Math.round(total + cess)
}

const calculateOldRegimeTax = (income: number, deductions: number) => {
  const taxableIncome = Math.max(0, income - Math.min(deductions, 250000))
  const slabRates = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.2 },
  ]
  let remaining = taxableIncome
  let accumulated = 0
  let total = 0

  for (const slab of slabRates) {
    const taxableInSlab = Math.max(0, Math.min(remaining, slab.limit - accumulated))
    total += taxableInSlab * slab.rate
    remaining -= taxableInSlab
    accumulated = slab.limit
  }

  if (remaining > 0) {
    total += remaining * 0.3
  }

  const cess = total * 0.04
  return Math.round(total + cess)
}

const getTaxByRegime = (regime: RegimeOption, income: number, deductions: number) => {
  switch (regime) {
    case 'old':
      return calculateOldRegimeTax(income, deductions)
    case 'hybrid':
      return Math.min(
        calculateNewRegimeTax(income),
        calculateOldRegimeTax(income, deductions + 50000) // assume additional Section 87A benefits/planned investments
      )
    default:
      return calculateNewRegimeTax(income)
  }
}

const getScenarioLabel = (regime: RegimeOption) => {
  if (regime === 'old') return 'Old regime'
  if (regime === 'hybrid') return 'Optimised mix'
  return 'New regime'
}

const getScenarioDescription = (regime: RegimeOption) => {
  if (regime === 'old') return 'Benefit from deductions and exemptions, useful when investments are high.'
  if (regime === 'hybrid') return 'Coach picks the better regime each quarter based on deductions progress.'
  return 'Simpler slabs, best when deductions are minimal.'
}

export default function TaxPage() {
  const [regime, setRegime] = useState<RegimeOption>('new')
  const [deductions, setDeductions] = useState<DeductionCategory[]>(INITIAL_DEDUCTIONS)

  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0)
  const totalDeductionCap = deductions.reduce((sum, item) => sum + item.cap, 0)
  const estimatedTax = useMemo(() => getTaxByRegime(regime, runRateAnnualIncome, totalDeductions), [regime, totalDeductions])
  const monthlyProvision = Math.round(estimatedTax / 12)
  const effectiveRate = runRateAnnualIncome > 0 ? (estimatedTax / runRateAnnualIncome) * 100 : 0

  const newRegimeTax = calculateNewRegimeTax(runRateAnnualIncome)
  const oldRegimeTax = calculateOldRegimeTax(runRateAnnualIncome, totalDeductions)

const incomeWithProjection = useMemo(() => {
  const futureMonths = ['Jan', 'Feb', 'Mar']
  const average = averageActiveMonthIncome || 0
  const projected = futureMonths.map((month) => ({
    month,
    income: 0,
    projectedIncome: average,
  }))
  return [
    ...MONTHLY_INCOME.map((item) => ({
      month: item.month,
      income: item.income,
      projectedIncome: 0,
    })),
    ...projected,
  ]
}, [])

  const handleDeductionInput = (id: string, value: number) => {
    setDeductions((current) =>
      current.map((item) => (item.id === id ? { ...item, amount: Math.max(0, Math.min(item.cap, value)) } : item))
    )
  }

  const handleDeductionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 lg:ml-[280px]">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tax insights</p>
              <h1 className="text-4xl md:text-5xl font-bold font-grotesk">
                <span className="text-gradient-green-gold">Stay ahead of advance tax</span>
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                We monitor your uneven income, suggest the right regime every quarter, and tell you exactly how much to provision so tax day feels routine.
              </p>
            </div>
            <div className="neuro-card rounded-2xl p-4 text-sm text-muted-foreground max-w-xs">
              <p className="font-medium text-foreground">Irregular income tracker</p>
              <p className="mt-2">
                <span className="text-foreground font-semibold">{activeMonths}</span> active months out of{' '}
                {MONTHLY_INCOME.length}, average inflow {formatCurrency(averageActiveMonthIncome)} per active month.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <div className="neuro-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-theme-gold" />
              <span>Projected FY income</span>
            </div>
            <p className="mt-3 text-2xl font-bold">{formatCurrency(runRateAnnualIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on active month run-rate</p>
          </div>
          <div className="neuro-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PiggyBank className="w-4 h-4 text-theme-green" />
              <span>Provision this month</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-theme-green">{formatCurrency(monthlyProvision)}</p>
            <p className="text-xs text-muted-foreground mt-1">{getScenarioLabel(regime)} | Effective rate {effectiveRate.toFixed(1)}%</p>
          </div>
          <div className="neuro-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="w-4 h-4 text-theme-gold" />
              <span>New vs old regime</span>
            </div>
            <p className="mt-3 text-lg font-semibold">New: {formatCurrency(newRegimeTax)}</p>
            <p className="text-sm text-muted-foreground">Old: {formatCurrency(oldRegimeTax)}</p>
            <p className="text-xs text-theme-green mt-1">
              Savings {formatCurrency(Math.max(0, Math.min(oldRegimeTax, newRegimeTax) - estimatedTax))}
            </p>
          </div>
          <div className="neuro-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-theme-gold" />
              <span>Next advance tax</span>
            </div>
            <p className="mt-3 text-2xl font-bold">15 Dec</p>
            <p className="text-xs text-muted-foreground mt-1">Target 75% paid | You are at 30%</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="neuro-card rounded-3xl p-6 space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Scenario planner</span>
              </div>
              <h2 className="text-xl font-semibold mt-1">Pick a regime for this quarter</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">{getScenarioDescription(regime)}</p>
            </div>
            <div className="flex gap-2">
              {(['new', 'old', 'hybrid'] as RegimeOption[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRegime(option)}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    regime === option
                      ? 'border-theme-green bg-theme-green/15 text-theme-green'
                      : 'border-white/10 text-muted-foreground hover:border-theme-green/40 hover:text-theme-green'
                  }`}
                >
                  {getScenarioLabel(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Income rhythm</h3>
                <span className="text-xs text-muted-foreground">Irregular inflows vs projections</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={incomeWithProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="month" stroke="#999999" />
                  <YAxis stroke="#999999" tickFormatter={(value) => formatCurrency(value)} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" fill="#16A34A" radius={[6, 6, 0, 0]} name="Actual" />
                  <Bar dataKey="projectedIncome" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Projected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/50 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/60 border border-white/10">
                  <Lightbulb className="w-5 h-5 text-theme-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coach insight</p>
                  <p className="text-sm">
                    Your income clusters every third month. Automate a {formatCurrency(monthlyProvision)} transfer the same day
                    the invoice clears to avoid scrambling near due dates.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-theme-green/30 bg-theme-green/10 p-4 text-xs text-theme-green space-y-2">
                <p className="font-medium text-sm text-theme-green">Suggested autopilot</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Move {formatCurrency(monthlyProvision)} to tax wallet when receipts hit.</li>
                  <li>Set a quarterly reminder 5 days before advance-tax deadlines.</li>
                  <li>Review deductible spends monthly (rent, insurance, NPS).</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="neuro-card rounded-3xl p-6 space-y-6"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Calculator className="w-3 h-3" />
            <span>Deductions tracker</span>
          </div>
          <h2 className="text-xl font-semibold">Squeeze more value from deductions</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            You have {formatCurrency(Math.max(0, totalDeductionCap - totalDeductions))} deduction headroom left. Use the quick fill buttons to capture upcoming investments.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {deductions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Max {formatCurrency(item.cap)}</p>
                    <p className="text-sm font-semibold text-theme-gold">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-theme-gold to-theme-green"
                    style={{ width: `${Math.min(100, (item.amount / item.cap) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={item.cap}
                    value={item.amount}
                    onChange={(event) => handleDeductionInput(item.id, Number(event.target.value))}
                    onKeyDown={handleDeductionKeyDown}
                    className="w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-xs focus:border-theme-green/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeductionInput(item.id, item.cap)}
                    className="rounded-full border border-theme-green/40 px-3 py-2 text-[11px] text-theme-green hover:border-theme-green"
                  >
                    Max it
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="neuro-card rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Advance tax tracker</span>
          </div>
          <h2 className="text-xl font-semibold">Stay compliant with quarterly dues</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {ADVANCE_TAX_MILESTONES.map((milestone) => {
              const isCurrent = milestone.targetPercent === 75
              const statusTone =
                milestone.paidPercent >= milestone.targetPercent
                  ? 'text-theme-green'
                  : isCurrent
                    ? 'text-theme-gold'
                    : 'text-muted-foreground'
              return (
                <div
                  key={milestone.quarter}
                  className={`rounded-2xl border p-4 ${
                    isCurrent ? 'border-theme-gold/40 bg-theme-gold/5' : 'border-white/10 bg-background/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{milestone.quarter}</p>
                      <p className="text-xs text-muted-foreground">Due {milestone.dueDate}</p>
                    </div>
                    <span className={`text-xs font-medium ${statusTone}`}>
                      {milestone.paidPercent}% / {milestone.targetPercent}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${milestone.paidPercent >= milestone.targetPercent ? 'bg-theme-green' : 'bg-theme-gold'}`}
                      style={{ width: `${Math.min(100, (milestone.paidPercent / milestone.targetPercent) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {milestone.paidPercent >= milestone.targetPercent
                      ? 'This instalment is fully provisioned.'
                      : `Shortfall ${formatCurrency(
                          ((milestone.targetPercent - milestone.paidPercent) / 100) * estimatedTax
                        )}. Top up before ${milestone.dueDate}.`}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="neuro-card rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Download className="w-3 h-3" />
            <span>Compliance checklist</span>
          </div>
          <h2 className="text-xl font-semibold">This month's paperwork</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="w-4 h-4 text-theme-green" />
                Record invoices
              </div>
              <p className="text-xs text-muted-foreground">
                Upload invoices worth {formatCurrency(165000)} to stay audit-ready. Use the "Scan &amp; Save" shortcut on mobile.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="w-4 h-4 text-theme-gold" />
                Verify TDS credits
              </div>
              <p className="text-xs text-muted-foreground">
                2 clients have delayed TDS updates. Confirm Form 16A receipts before the Dec advance-tax run.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Download className="w-4 h-4 text-theme-green" />
                Download Form 26AS
              </div>
              <p className="text-xs text-muted-foreground">
                Latest refresh: 8 Sep. Download the updated statement after the next payout hits.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
