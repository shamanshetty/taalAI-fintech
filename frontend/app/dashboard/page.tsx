'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ReceiptText,
  Wallet,
  PiggyBank,
  Mail,
  FileSpreadsheet,
  Target,
  CheckCircle2,
  Calendar,
  ClipboardCheck,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'
import { HeartbeatPulse } from '@/components/dashboard/HeartbeatPulse'
import { formatCurrency } from '@/lib/utils'
import { useUserStore } from '@/store/useUserStore'

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Hello')
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)
  const user = useUserStore((state) => state.user)
  const needsOnboarding = Boolean(user && !user.onboarding_complete === false)

  // Mock user data
  const userName =
    user?.full_name && user.full_name.trim().length > 0
      ? user.full_name.trim().split(' ')[0]
      : user?.email
      ? user.email.split('@')[0]
      : 'there'

  // Get time-based greeting
  useEffect(() => {
    setHasHydrated(true)
    const now = new Date()
    const hour = now.getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    setCurrentTime(now)
  }, [])

  // Mock financial data
  const [incomeData] = useState([
    { month: 'Jan', income: 50000, expense: 30000 },
    { month: 'Feb', income: 45000, expense: 28000 },
    { month: 'Mar', income: 55000, expense: 32000 },
    { month: 'Apr', income: 52000, expense: 31000 },
    { month: 'May', income: 48000, expense: 29000 },
    { month: 'Jun', income: 58000, expense: 33000 },
  ])

  // Monthly savings progress
  const currentMonth = incomeData[incomeData.length - 1]
  const monthlySavings = currentMonth.income - currentMonth.expense
  const savingsGoal = 30000
  const savingsProgress = Math.min((monthlySavings / savingsGoal) * 100, 100)

  const previousMonth = incomeData[incomeData.length - 2] ?? currentMonth
  const previousSavings = previousMonth.income - previousMonth.expense
  const savingsChange = monthlySavings - previousSavings

  const averageIncome =
    incomeData.reduce((sum, item) => sum + item.income, 0) / incomeData.length
  const expenseSeries = incomeData.map((item) => item.expense)
  const averageExpense =
    expenseSeries.reduce((sum, value) => sum + value, 0) / expenseSeries.length

  const incomeVariance =
    incomeData.reduce((sum, item) => sum + Math.pow(item.income - averageIncome, 2), 0) /
    incomeData.length
  const incomeVolatility = Math.sqrt(incomeVariance)
  const volatilityPercent = Math.round(
    Math.min(100, Math.max(0, (incomeVolatility / (averageIncome || 1)) * 100))
  )
  const savingsRate = Math.round(
    Math.min(100, Math.max(0, ((averageIncome - averageExpense) / (averageIncome || 1)) * 100))
  )

  const currentBalance = 214500
  const mtdIncome = currentMonth.income
  const mtdExpenses = currentMonth.expense
  const taxReserve = 42000
  const invoicesDue = 2
  const cashRunway = Math.max(0, currentBalance / (averageExpense || 1))

  const heroStats = [
    {
      label: 'Cash on Hand',
      value: formatCurrency(currentBalance),
      helper: `Runway ${cashRunway.toFixed(1)} mo`,
      change: `${savingsChange >= 0 ? '+' : '-'}${formatCurrency(Math.abs(savingsChange))}`,
      positive: savingsChange >= 0,
      icon: Wallet,
    },
    {
      label: 'Month-to-date Income',
      value: formatCurrency(mtdIncome),
      helper: `Spend ${formatCurrency(mtdExpenses)}`,
      change: `Invoices due: ${invoicesDue}`,
      positive: true,
      icon: TrendingUp,
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate}%`,
      helper: 'Goal >= 30%',
      change: savingsRate >= 30 ? 'On track' : 'Needs boost',
      positive: savingsRate >= 30,
      icon: PiggyBank,
    },
    {
      label: 'Tax Set Aside',
      value: formatCurrency(taxReserve),
      helper: 'Next due: Oct 31',
      change: '(done) Ready',
      positive: true,
      icon: FileSpreadsheet,
    },
  ]

  const pulseMetrics = [
    {
      label: 'Avg Monthly Income',
      value: formatCurrency(Math.round(averageIncome)),
      helper: `${savingsChange >= 0 ? '+' : '-'}${formatCurrency(Math.abs(savingsChange))} vs last`,
      positive: savingsChange >= 0,
    },
    {
      label: 'Avg Monthly Expense',
      value: formatCurrency(Math.round(averageExpense)),
      helper: `Net ${formatCurrency(Math.round(averageIncome - averageExpense))}`,
      positive: averageIncome >= averageExpense,
    },
    {
      label: 'Income Volatility',
      value: `${volatilityPercent}%`,
      helper: 'Lower is steadier',
      positive: volatilityPercent < 25,
    },
    {
      label: 'Cash Runway',
      value: `${cashRunway.toFixed(1)} mo`,
      helper: 'Based on avg spend',
      positive: cashRunway >= 3,
    },
  ]

  const goalSnapshots = [
    {
      name: 'Emergency Buffer',
      target: 200000,
      current: 142000,
      due: 'Dec 2024',
      icon: ShieldCheck,
    },
    {
      name: 'New Studio Setup',
      target: 120000,
      current: 45000,
      due: 'Mar 2025',
      icon: Sparkles,
    },
    {
      name: 'Tax Savings',
      target: 75000,
      current: taxReserve,
      due: 'Mar 2025',
      icon: FileSpreadsheet,
    },
  ]

  const actionItems = [
    {
      title: 'Reconcile 3 cash transactions',
      category: 'Bookkeeping',
      urgency: 'Today',
      icon: ReceiptText,
    },
    {
      title: 'Update GST invoice for VFX project',
      category: 'Compliance',
      urgency: 'Due tomorrow',
      icon: ClipboardCheck,
    },
    {
      title: 'Transfer Rs8,000 to emergency fund',
      category: 'Savings',
      urgency: 'Scheduled',
      icon: PiggyBank,
    },
  ]

  const upcomingEvents = [
    {
      title: 'Invoice #142 (Zomato) expected',
      amount: formatCurrency(28000),
      date: '20 Oct',
      type: 'inflow',
    },
    {
      title: 'GST advance tax payment',
      amount: formatCurrency(15000),
      date: '31 Oct',
      type: 'outflow',
    },
    {
      title: 'Workspace rent auto-debit',
      amount: formatCurrency(18000),
      date: '01 Nov',
      type: 'outflow',
    },
  ]

  const emergencyStatus = {
    coverageMonths: 2.7,
    targetMonths: 3,
    nextTopUp: 8000,
  }

  const coachHighlight = {
    headline: 'Great job keeping expenses steady (bell)',
    message:
      'Your income volatility dropped below 20%. Use this momentum to top up the emergency buffer this week.',
    action: 'Ask for a savings plan',
  }

  // Micro habits data
  const [habits, setHabits] = useState([
    { id: 1, name: "Log today's expenses", icon: ReceiptText, completed: true, streak: 9 },
    { id: 2, name: 'Review wallet balance', icon: Wallet, completed: true, streak: 11 },
    { id: 3, name: 'Set aside savings', icon: PiggyBank, completed: false, streak: 18 },
    { id: 4, name: 'Follow up on invoices', icon: Mail, completed: true, streak: 6 },
    { id: 5, name: 'Update tax tracker', icon: FileSpreadsheet, completed: false, streak: 4 },
    { id: 6, name: 'Check goal progress', icon: Target, completed: false, streak: 13 },
  ])

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h =>
      h.id === id ? { ...h, completed: !h.completed } : h
    ))
  }

  const completedToday = habits.filter(h => h.completed).length
  const totalHabits = habits.length
  const habitProgress = (completedToday / totalHabits) * 100

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 lg:ml-[280px]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Floating Greeting Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-grotesk">
                <span className="text-gradient-green-gold">{greeting}, {userName}!</span>
              </h1>
              <p className="text-muted-foreground mt-2" suppressHydrationWarning>
                {hasHydrated && currentTime
                  ? new Intl.DateTimeFormat('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    }).format(currentTime)
                  : '-'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Hero Row */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {heroStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="neuro-card rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-theme-green" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.helper}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        stat.positive ? 'text-theme-green' : 'text-destructive'
                      }`}
                    >
                      {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            {needsOnboarding && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="neuro-card rounded-3xl p-6 border border-theme-green/30 bg-theme-green/10"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-theme-green">Complete your profile</p>
                    <p className="text-xs text-muted-foreground max-w-xl">Answer a few quick questions so TaalAI can personalise tax nudges, cash-flow alerts, and goal plans.</p>
                  </div>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 rounded-full border border-theme-green/40 bg-theme-green/20 px-4 py-2 text-xs font-semibold text-theme-green hover:border-theme-green/60 hover:bg-theme-green/30 transition-colors"
                  >
                    Finish setup
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
            {/* Heartbeat Pulse Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <HeartbeatPulse data={incomeData} />
            </motion.div>

            {/* Financial Pulse Metrics */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="neuro-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Financial Pulse</h3>
                  <p className="text-sm text-muted-foreground">A quick scan of your money rhythm</p>
                </div>
                <span className="text-xs text-muted-foreground">Updated just now</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pulseMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/5 bg-background/40 p-4 flex flex-col gap-2"
                  >
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    <span className="text-xl font-semibold">{metric.value}</span>
                    <span
                      className={`text-xs ${
                        metric.positive ? 'text-theme-green' : 'text-muted-foreground'
                      }`}
                    >
                      {metric.helper}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Monthly Savings */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="neuro-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Monthly Savings</h3>
                  <p className="text-sm text-muted-foreground">Goal: {formatCurrency(savingsGoal)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-grotesk text-gradient-turquoise">
                    {formatCurrency(monthlySavings)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {savingsProgress.toFixed(0)}% achieved
                  </div>
                </div>
              </div>
              <div className="progress-neuro">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${savingsProgress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mt-4">
                <div className="p-3 rounded-xl bg-background/40 border border-white/5">
                  <p className="text-muted-foreground">Income</p>
                  <p className="font-semibold">{formatCurrency(currentMonth.income)}</p>
                </div>
                <div className="p-3 rounded-xl bg-background/40 border border-white/5">
                  <p className="text-muted-foreground">Expenses</p>
                  <p className="font-semibold">{formatCurrency(currentMonth.expense)}</p>
                </div>
                <div className="p-3 rounded-xl bg-background/40 border border-white/5">
                  <p className="text-muted-foreground">Goal Pace</p>
                  <p className="font-semibold">
                    {savingsProgress >= 100 ? 'Goal reached' : `${formatCurrency(savingsGoal - monthlySavings)} left`}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {savingsProgress >= 100 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-theme-green" />
                    <span className="text-theme-green font-medium">Goal achieved! (celebrate)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-theme-gold" />
                    <span className="text-muted-foreground">
                      {formatCurrency(savingsGoal - monthlySavings)} more to reach your goal
                    </span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Goals Snapshot */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="neuro-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Goals Snapshot</h3>
                  <p className="text-sm text-muted-foreground">The goals closest to completion</p>
                </div>
                <button className="text-xs text-muted-foreground hover:text-foreground transition">
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {goalSnapshots.map((goal) => {
                  const progress = Math.min(100, Math.round((goal.current / goal.target) * 100))
                  const Icon = goal.icon
                  return (
                    <div key={goal.name} className="rounded-2xl border border-white/5 bg-background/40 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-theme-green" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">Goal {formatCurrency(goal.target)}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{progress}%</span>
                          <span className="text-muted-foreground">{goal.due}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-theme-green"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Saved {formatCurrency(goal.current)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Action Inbox */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="neuro-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Action Inbox</h3>
                  <p className="text-sm text-muted-foreground">Clear these to stay on pace</p>
                </div>
                <ClipboardCheck className="w-5 h-5 text-theme-green" />
              </div>
              <div className="space-y-3">
                {actionItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/5 bg-background/40 p-3 flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-theme-green" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.urgency}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Upcoming Timeline */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="neuro-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Next 2 Weeks</h3>
                  <p className="text-sm text-muted-foreground">Cash-ins & obligations coming up</p>
                </div>
                <Calendar className="w-5 h-5 text-theme-green" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.title} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-theme-green mt-2" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-xs text-muted-foreground">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {event.type === 'inflow' ? (
                          <TrendingUp className="w-3 h-3 text-theme-green" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )}
                        <span>{event.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Emergency Buffer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="neuro-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Emergency Buffer</h3>
                  <p className="text-sm text-muted-foreground">
                    Coverage target: {emergencyStatus.targetMonths} months
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-theme-green" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="font-semibold">
                    {emergencyStatus.coverageMonths.toFixed(1)} / {emergencyStatus.targetMonths} months
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-theme-green"
                    style={{
                      width: `${Math.min(
                        100,
                        (emergencyStatus.coverageMonths / emergencyStatus.targetMonths) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Transfer {formatCurrency(emergencyStatus.nextTopUp)} this week to reach the target by December.
                </div>
              </div>
            </motion.div>

            {/* Coach Highlight */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="neuro-card rounded-3xl p-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-theme-green" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-semibold">{coachHighlight.headline}</p>
                    <p className="text-sm text-muted-foreground mt-1">{coachHighlight.message}</p>
                  </div>
                  <button className="inline-flex items-center gap-2 text-xs font-medium text-theme-green hover:underline transition">
                    {coachHighlight.action}
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Daily Money Habits */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="neuro-card rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Daily Money Habits</h3>
              <p className="text-sm text-muted-foreground">
                Keep momentum with small financial check-ins
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-grotesk text-gradient-purple">
                {completedToday}/{totalHabits}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="font-medium">{habitProgress.toFixed(0)}%</span>
            </div>
            <div className="progress-neuro">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${habitProgress}%` }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{
                  background: 'linear-gradient(90deg, #9D4EDD 0%, #C77DFF 100%)',
                }}
              />
            </div>
          </div>

          {/* Habits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {habits.map((habit, index) => {
              const Icon = habit.icon

              return (
                <motion.button
                  key={habit.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleHabit(habit.id)}
                  className={`
                    neuro-card-hover rounded-2xl p-4 text-left transition-all
                    ${habit.completed
                      ? 'border-white/10 bg-white/5'
                      : 'border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                      ${habit.completed
                        ? 'bg-white/10 text-theme-green'
                        : 'bg-muted/20 text-muted-foreground'
                      }
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${habit.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {habit.name}
                        </h4>
                        {habit.completed && (
                          <CheckCircle2 className="w-4 h-4 text-theme-green" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          (fire) {habit.streak} day streak
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Motivational Message */}
          {habitProgress === 100 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-theme-green" />
                <div>
                  <h4 className="font-semibold text-theme-green">Perfect Day!</h4>
                  <p className="text-sm text-muted-foreground">
                    You've completed all your habits today. Keep it up!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
