'use client'

import { useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  Filter,
  Lightbulb,
  PieChart,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

type PeriodOption = 'month' | 'quarter' | 'year'
type ComparisonOption = 'previous' | 'budget' | 'target'

interface MonthRecord {
  month: string
  income: number
  expense: number
  savings: number
  budgetedExpense: number
  targetSavings: number
}

interface CategoryRecord {
  name: string
  value: number
  color: string
  planned: number
}

interface ScenarioRecord {
  title: string
  highlight: string
  detail: string
}

const MONTHLY_DATA: MonthRecord[] = [
  { month: 'Apr', income: 75000, expense: 45000, savings: 30000, budgetedExpense: 42000, targetSavings: 28000 },
  { month: 'May', income: 82000, expense: 48000, savings: 34000, budgetedExpense: 46000, targetSavings: 31000 },
  { month: 'Jun', income: 78000, expense: 52000, savings: 26000, budgetedExpense: 47000, targetSavings: 30000 },
  { month: 'Jul', income: 85000, expense: 47000, savings: 38000, budgetedExpense: 50000, targetSavings: 32000 },
  { month: 'Aug', income: 90000, expense: 51000, savings: 39000, budgetedExpense: 52000, targetSavings: 33000 },
  { month: 'Sep', income: 88000, expense: 49000, savings: 39000, budgetedExpense: 49500, targetSavings: 32000 },
  { month: 'Oct', income: 95000, expense: 53000, savings: 42000, budgetedExpense: 51000, targetSavings: 35000 },
]

const CATEGORY_DATA: CategoryRecord[] = [
  { name: 'Housing & Utilities', value: 22000, planned: 21000, color: '#16A34A' },
  { name: 'Food & Dining', value: 15000, planned: 14000, color: '#F59E0B' },
  { name: 'Transport', value: 8000, planned: 9000, color: '#3B82F6' },
  { name: 'Lifestyle', value: 5000, planned: 6000, color: '#8B5CF6' },
  { name: 'Shopping', value: 12000, planned: 11000, color: '#EF4444' },
  { name: 'Healthcare', value: 4000, planned: 5000, color: '#10B981' },
]

const SCENARIOS: ScenarioRecord[] = [
  {
    title: 'Surplus momentum',
    highlight: 'Rs11.5K ahead of plan',
    detail: 'Savings exceeded monthly target three months in a row. You can route the surplus to emergency fund to hit 6 months runway by March.',
  },
  {
    title: 'Transport overshoot',
    highlight: 'Rs1.1K above plan',
    detail: 'Fuel and cab costs are 14% higher than budget. Consider a shared commute on client days to stay within the quarterly cap.',
  },
  {
    title: 'Content spend dip',
    highlight: 'Rs4K under plan',
    detail: 'Marketing and education spends lag plan. Reallocate Rs5K surplus to the course wishlist before the early bird window ends.',
  },
]

const PERIOD_OPTIONS: Array<{ label: string; value: PeriodOption }> = [
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
]

const COMPARISON_OPTIONS: Array<{ label: string; value: ComparisonOption }> = [
  { label: 'vs last period', value: 'previous' },
  { label: 'vs budget', value: 'budget' },
  { label: 'vs goal', value: 'target' },
]

const computeRunRate = (records: MonthRecord[]) => {
  if (!records.length) {
    return { income: 0, expense: 0, savings: 0 }
  }
  const months = records.length
  const totalIncome = records.reduce((sum, item) => sum + item.income, 0)
  const totalExpense = records.reduce((sum, item) => sum + item.expense, 0)
  const totalSavings = records.reduce((sum, item) => sum + item.savings, 0)
  return {
    income: totalIncome / months,
    expense: totalExpense / months,
    savings: totalSavings / months,
  }
}

const computeVariance = (actual: number, planned: number) => {
  const difference = actual - planned
  const percent = planned === 0 ? 0 : (difference / planned) * 100
  return { difference, percent }
}

const formatVariance = (value: number) => {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}${formatCurrency(Math.abs(value))}`
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodOption>('month')
  const [comparison, setComparison] = useState<ComparisonOption>('previous')
  const [search, setSearch] = useState('')

  const filteredMonths = useMemo(() => {
    if (!search.trim()) {
      return MONTHLY_DATA
    }
    return MONTHLY_DATA.filter((record) => record.month.toLowerCase().includes(search.trim().toLowerCase()))
  }, [search])

  const totals = useMemo(() => {
    const income = filteredMonths.reduce((sum, record) => sum + record.income, 0)
    const expense = filteredMonths.reduce((sum, record) => sum + record.expense, 0)
    const savings = filteredMonths.reduce((sum, record) => sum + record.savings, 0)
    return { income, expense, savings }
  }, [filteredMonths])

  const runRate = computeRunRate(filteredMonths)

  const latest = filteredMonths[filteredMonths.length - 1]
  const previous = filteredMonths[filteredMonths.length - 2]

  const getMomentum = (key: keyof MonthRecord, label: string) => {
    if (!latest || !previous) {
      return { label, change: 0, direction: 'neutral' as const }
    }
    const change = latest[key] - previous[key]
    const direction = change === 0 ? ('neutral' as const) : change > 0 ? ('up' as const) : ('down' as const)
    return { label, change, direction }
  }

  const incomeMomentum = getMomentum('income', 'Income movement')
  const expenseMomentum = getMomentum('expense', 'Expense movement')
  const savingsMomentum = getMomentum('savings', 'Savings movement')

  const comparisonLabel = COMPARISON_OPTIONS.find((item) => item.value === comparison)?.label ?? ''

  const comparisonDelta = useMemo(() => {
    if (!latest) {
      return { income: 0, expense: 0, savings: 0 }
    }
    if (comparison === 'previous') {
      if (!previous) {
        return { income: 0, expense: 0, savings: 0 }
      }
      return {
        income: latest.income - previous.income,
        expense: latest.expense - previous.expense,
        savings: latest.savings - previous.savings,
      }
    }
    if (comparison === 'budget') {
      return {
        income: 0,
        expense: latest.expense - latest.budgetedExpense,
        savings: latest.savings - latest.targetSavings,
      }
    }
    return {
      income: 0,
      expense: latest.expense - latest.budgetedExpense,
      savings: latest.savings - latest.targetSavings,
    }
  }, [comparison, latest, previous])

  const categoryTotals = CATEGORY_DATA.reduce(
    (acc, category) => {
      acc.actual += category.value
      acc.planned += category.planned
      return acc
    },
    { actual: 0, planned: 0 }
  )

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 lg:ml-[280px]">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reports</p>
            <h1 className="text-4xl md:text-5xl font-bold font-grotesk">
              <span className="text-gradient-green-gold">Your financial pulse</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Compare income, spending, and savings against your plan. Spot anomalies, keep run-rate healthy, and know exactly what needs attention.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  period === option.value
                    ? 'border-theme-green bg-theme-green/15 text-theme-green'
                    : 'border-white/10 text-muted-foreground hover:border-theme-green/40 hover:text-theme-green'
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-muted-foreground hover:border-theme-green/40 hover:text-theme-green"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-muted-foreground hover:border-theme-green/40 hover:text-theme-green"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid gap-4 md:grid-cols-[2fr_1fr]"
        >
          <div className="neuro-card rounded-3xl p-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  <span>Run-rate summary</span>
                </div>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {formatCurrency(runRate.income)} income -- {formatCurrency(runRate.expense)} spend --{' '}
                  {formatCurrency(runRate.savings)} saved per month
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on {filteredMonths.length} months | {comparisonLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Search month</span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="e.g. Aug"
                  className="rounded-full border border-white/10 bg-background/60 px-3 py-1 text-xs focus:border-theme-green/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[incomeMomentum, expenseMomentum, savingsMomentum].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {item.direction === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-theme-green" />
                    ) : item.direction === 'down' ? (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {item.direction === 'neutral' ? 'No change' : `${item.direction === 'up' ? '+' : '-'}${formatCurrency(Math.abs(item.change))}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Latest vs previous period</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Takeaway</span>
                <span className="rounded-full border border-theme-green/30 bg-theme-green/10 px-2 py-1 text-[11px] text-theme-green">
                  Rs{formatCurrency(Math.max(0, comparisonDelta.savings))}
                </span>
              </div>
              <p className="text-sm">
                Savings are {comparisonDelta.savings >= 0 ? 'above' : 'below'} the {comparisonLabel} baseline by{' '}
                {formatCurrency(Math.abs(comparisonDelta.savings))}. Rebalance discretionary spend to keep the runway target intact.
              </p>
            </div>
          </div>

          <div className="neuro-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Snapshot</span>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Income YTD</span>
                <span className="font-semibold text-theme-green">{formatCurrency(totals.income)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Expense YTD</span>
                <span className="font-semibold text-destructive">{formatCurrency(totals.expense)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Net savings YTD</span>
                <span className="font-semibold text-theme-gold">{formatCurrency(totals.savings)}</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/60 p-4 text-xs space-y-2">
              <p className="font-medium text-foreground">Coach nudge</p>
              <p className="text-muted-foreground">
                If income stays near {formatCurrency(runRate.income * 3)} for the next quarter, you can increase the debt prepayment budget by Rs8K without hurting liquidity.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 lg:grid-cols-[2fr_1fr]"
        >
          <div className="neuro-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Income vs expense</p>
                <h2 className="text-xl font-semibold">How the cash is moving</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground hover:border-theme-green/30 hover:text-theme-green"
              >
                View details
              </button>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={filteredMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" stroke="#999999" />
                <YAxis stroke="#999999" tickFormatter={(value) => formatCurrency(value)} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#16A34A" fill="#16A34A20" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="#EF444420" name="Expense" />
                <Line type="monotone" dataKey="savings" stroke="#F59E0B" strokeWidth={2} name="Savings" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="neuro-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Variance vs plan</p>
                <h2 className="text-lg font-semibold">Category spotlight</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                Over by {formatCurrency(Math.max(0, categoryTotals.actual - categoryTotals.planned))}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={CATEGORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" stroke="#999999" hide />
                <YAxis stroke="#999999" tickFormatter={(value) => formatCurrency(value)} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} name="Actual" />
                <Bar dataKey="planned" fill="#D4D4D8" radius={[6, 6, 0, 0]} name="Planned" />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {CATEGORY_DATA.map((category) => {
                const variance = computeVariance(category.value, category.planned)
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{category.name}</span>
                    <span className={variance.difference > 0 ? 'text-destructive' : 'text-theme-green'}>
                      {formatVariance(variance.difference)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"
        >
          <div className="neuro-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Savings trajectory</p>
                <h2 className="text-xl font-semibold">Where the runway is heading</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                Latest balance {formatCurrency(MONTHLY_DATA[MONTHLY_DATA.length - 1].savings)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" stroke="#999999" />
                <YAxis stroke="#999999" tickFormatter={(value) => formatCurrency(value)} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="savings" stroke="#16A34A" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="targetSavings" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
            <div className="rounded-xl border border-white/10 bg-background/60 p-4 text-xs text-muted-foreground space-y-2">
              <p>
                You are {formatCurrency(Math.max(0, comparisonDelta.savings))} ahead of savings target. Consider increasing the investment SIP by
                Rs5K for the next quarter to lock in the surplus.
              </p>
            </div>
          </div>

          <div className="neuro-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Target className="w-3 h-3" />
              <span>Spotlight</span>
            </div>
            <h2 className="text-lg font-semibold">What changed this month</h2>
            <div className="space-y-3">
              {SCENARIOS.map((scenario) => (
                <div key={scenario.title} className="rounded-2xl border border-white/10 bg-background/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{scenario.title}</p>
                    <span className="text-xs text-theme-gold">{scenario.highlight}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{scenario.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="neuro-card rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-theme-gold" />
            <h2 className="text-xl font-semibold">Suggestions to keep the rhythm</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-2">
              <p className="font-medium text-foreground">Income follow-ups</p>
              <p className="text-xs text-muted-foreground">
                Two invoices worth {formatCurrency(46000)} are 10 days past due. Trigger the polite reminder template to keep the cycle tight.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-2">
              <p className="font-medium text-foreground">Expense guardrail</p>
              <p className="text-xs text-muted-foreground">
                Lifestyle expenses are 6% above run-rate. Set a Rs2K cap on discretionary transfers till next payday.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-2">
              <p className="font-medium text-foreground">Savings autopilot</p>
              <p className="text-xs text-muted-foreground">
                Increase the automatic sweep to investments from Rs15K to Rs18K for the next 3 cycles to lock the surplus early.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
