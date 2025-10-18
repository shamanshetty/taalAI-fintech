'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  ReceiptText,
  NotebookPen,
  LayoutList,
  LineChart,
  Save,
  FileWarning,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type TransactionType = 'income' | 'expense'

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: TransactionType
  hasReceipt: boolean
  note?: string
  tags?: string[]
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2025-10-15',
    description: 'Freelance Project Payment',
    category: 'Income',
    amount: 45000,
    type: 'income',
    hasReceipt: true,
    tags: ['client', 'upi'],
  },
  {
    id: '2',
    date: '2025-10-14',
    description: 'Grocery Shopping',
    category: 'Food',
    amount: 2500,
    type: 'expense',
    hasReceipt: false,
    note: 'Need receipt',
    tags: ['personal', 'cash'],
  },
  {
    id: '3',
    date: '2025-10-13',
    description: 'Netflix Subscription',
    category: 'Entertainment',
    amount: 649,
    type: 'expense',
    hasReceipt: true,
    tags: ['subscription'],
  },
  {
    id: '4',
    date: '2025-10-12',
    description: 'Client Consulting Fee',
    category: 'Income',
    amount: 30000,
    type: 'income',
    hasReceipt: true,
    tags: ['client', 'gst'],
  },
  {
    id: '5',
    date: '2025-10-11',
    description: 'Co-working Space Rent',
    category: 'Workspace',
    amount: 8500,
    type: 'expense',
    hasReceipt: true,
    tags: ['rent', 'recurring'],
  },
  {
    id: '6',
    date: '2025-10-10',
    description: 'Equipment Purchase',
    category: 'Gear',
    amount: 11800,
    type: 'expense',
    hasReceipt: false,
    note: 'Claim GST credit',
    tags: ['business'],
  },
  {
    id: '7',
    date: '2025-10-09',
    description: 'Online Course',
    category: 'Education',
    amount: 3500,
    type: 'expense',
    hasReceipt: true,
    tags: ['upskilling'],
  },
  {
    id: '8',
    date: '2025-10-08',
    description: 'Annual Insurance Premium',
    category: 'Protection',
    amount: 9000,
    type: 'expense',
    hasReceipt: true,
    tags: ['annual'],
  },
]

const SAVED_VIEWS = [
  { id: 'default', label: 'This Month' },
  { id: 'gst', label: 'GST Eligible' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'reimburse', label: 'Pending Receipts' },
]

const REVIEW_SUGGESTIONS = [
  {
    id: 's1',
    description: 'Equipment Purchase',
    amount: 11800,
    suggestion: 'Likely “Business Gear”',
    action: 'Confirm category',
  },
  {
    id: 's2',
    description: 'Grocery Shopping',
    amount: 2500,
    suggestion: 'Probably “Household”',
    action: 'Attach receipt',
  },
]

const COMPLIANCE_ALERTS = [
  {
    id: 'c1',
    title: 'GST invoice missing number',
    detail: 'Client Consulting Fee • ₹30,000 • Oct 12',
    action: 'Add invoice number',
  },
  {
    id: 'c2',
    title: 'Cash expense > ₹2,000',
    detail: 'Grocery Shopping • ₹2,500 • Oct 14',
    action: 'Record payment method',
  },
]

const UPCOMING_ITEMS = [
  {
    title: 'Workspace rent auto-debit',
    date: '01 Nov',
    amount: formatCurrency(8500),
    type: 'outflow',
  },
  {
    title: 'GST advance tax',
    date: '30 Nov',
    amount: formatCurrency(15000),
    type: 'outflow',
  },
  {
    title: 'Retainer from Swiggy',
    date: '05 Nov',
    amount: formatCurrency(22000),
    type: 'inflow',
  },
]

const FILTER_RANGES = ['This Week', 'This Month', 'Last Month', 'Quarter'] as const
type RangeFilter = (typeof FILTER_RANGES)[number]

const VIEW_MODES = ['list', 'timeline'] as const
type ViewMode = (typeof VIEW_MODES)[number]

function groupByDate(transactions: Transaction[]) {
  const map = new Map<string, Transaction[]>()
  transactions.forEach((tx) => {
    if (!map.has(tx.date)) {
      map.set(tx.date, [])
    }
    map.get(tx.date)!.push(tx)
  })
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => b.amount - a.amount),
    }))
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedRange, setSelectedRange] = useState<RangeFilter>('This Month')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [savedView, setSavedView] = useState('default')

  const transactions = MOCK_TRANSACTIONS
  const categories = useMemo(() => {
    const unique = new Set<string>()
    transactions.forEach((tx) => unique.add(tx.category))
    return ['all', ...Array.from(unique)]
  }, [transactions])

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalIncome - totalExpense
  const previousMonthExpense = 24500
  const burnRateChange = totalExpense - previousMonthExpense
  const unreviewedCount = transactions.filter((t) => !t.hasReceipt).length

  const categorySpending = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const timelineGroups = useMemo(() => groupByDate(filteredTransactions), [filteredTransactions])

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 lg:ml-[280px]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold font-grotesk mb-2">
            <span className="text-gradient-green-gold">Transactions</span>
          </h1>
          <p className="text-muted-foreground">Track every rupee with smart insights and actions</p>
        </motion.div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="neuro-card rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total Inflow</span>
              <ArrowUpRight className="w-4 h-4 text-theme-green" />
            </div>
            <p className="text-2xl font-semibold">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-muted-foreground">Retainers + freelance invoices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="neuro-card rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total Outflow</span>
              <ArrowDownRight className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-semibold text-destructive">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-muted-foreground">
              Burn rate {burnRateChange >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(burnRateChange))} vs last month
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="neuro-card rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Net Cash</span>
              <DollarSign className="w-4 h-4 text-theme-green" />
            </div>
            <p className={`text-2xl font-semibold ${netBalance >= 0 ? '' : 'text-destructive'}`}>
              {formatCurrency(netBalance)}
            </p>
            <p className="text-xs text-muted-foreground">
              {netBalance >= 0 ? 'Positive month so far' : 'Expenses outpaced income'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="neuro-card rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Needs Review</span>
              <ClipboardCheck className="w-4 h-4 text-theme-gold" />
            </div>
            <p className="text-2xl font-semibold">{unreviewedCount} items</p>
            <p className="text-xs text-muted-foreground">Attach receipts or confirm categories</p>
          </motion.div>
        </div>

        {/* Smart Suggestions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="neuro-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold">Review Suggestions</h2>
                <p className="text-sm text-muted-foreground">Quick wins to keep records clean</p>
              </div>
              <Lightbulb className="w-5 h-5 text-theme-gold" />
            </div>
            <div className="space-y-3">
              {REVIEW_SUGGESTIONS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-background/40 p-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <ReceiptText className="w-4 h-4 text-theme-green" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {item.description} • {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.suggestion}</p>
                  </div>
                  <button className="text-xs text-theme-green hover:underline transition">{item.action}</button>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="neuro-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold">Compliance Alerts</h2>
                <p className="text-sm text-muted-foreground">Fix these before filing</p>
              </div>
              <FileWarning className="w-5 h-5 text-destructive" />
            </div>
            <div className="space-y-3">
              {COMPLIANCE_ALERTS.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-white/5 bg-background/40 p-3">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.detail}</p>
                  <button className="mt-2 text-xs text-theme-green hover:underline transition">
                    {alert.action}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="neuro-card rounded-2xl p-4"
        >
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    selectedRange === range
                      ? 'border-theme-green text-theme-green'
                      : 'border-white/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search description, category, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-theme-green/50"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-background/50 border border-white/10 rounded-xl">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-transparent text-sm text-foreground focus:outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-background/50 border border-white/10 rounded-xl">
                  <Save className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={savedView}
                    onChange={(e) => setSavedView(e.target.value)}
                    className="bg-transparent text-sm text-foreground focus:outline-none"
                  >
                    {SAVED_VIEWS.map((view) => (
                      <option key={view.id} value={view.id}>
                        {view.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-background/50 border border-white/10 rounded-xl">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white/10 text-theme-green' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`p-1.5 rounded-lg ${viewMode === 'timeline' ? 'bg-white/10 text-theme-green' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <LineChart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="neuro-card rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Scheduled & Expected</h2>
              <p className="text-sm text-muted-foreground">Stay ahead of large inflows/outflows</p>
            </div>
            <Calendar className="w-5 h-5 text-theme-green" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {UPCOMING_ITEMS.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/5 bg-background/40 p-4">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                <p className={`text-sm font-medium mt-2 ${item.type === 'inflow' ? 'text-theme-green' : 'text-destructive'}`}>
                  {item.amount}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transactions */}
        {viewMode === 'list' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-3"
          >
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="neuro-card-hover rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${transaction.type === 'income'
                          ? 'bg-theme-green/20 text-theme-green'
                          : 'bg-destructive/20 text-destructive'
                        }
                      `}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-6 h-6" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">{transaction.description}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {transaction.category}
                        </span>
                        <span className="flex items-center gap-1">
                          {transaction.hasReceipt ? (
                            <CheckCircle2 className="w-3 h-3 text-theme-green" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                          )}
                          {transaction.hasReceipt ? 'Receipt attached' : 'Receipt missing'}
                        </span>
                        {transaction.tags?.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {transaction.note && (
                        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          <NotebookPen className="w-3 h-3" />
                          {transaction.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-theme-green' : 'text-destructive'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-4"
          >
            {timelineGroups.map((group) => (
              <div key={group.date} className="neuro-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {new Date(group.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  <span className="text-xs text-muted-foreground">{group.items.length} transactions</span>
                </div>
                <div className="space-y-3">
                  {group.items.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-2xl border border-white/5 bg-background/40 p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${transaction.type === 'income'
                              ? 'bg-theme-green/20 text-theme-green'
                              : 'bg-destructive/20 text-destructive'
                            }
                          `}
                        >
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-theme-green' : 'text-destructive'}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Insights footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="neuro-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-theme-green" />
            <div>
              <p className="text-sm font-semibold">Insight</p>
              <p className="text-sm text-muted-foreground">
                Top spending category this month is {topCategory ? `${topCategory[0]} (${formatCurrency(topCategory[1])})` : '—'}.
                Consider setting a cap or routing this to your budgeting rules.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
