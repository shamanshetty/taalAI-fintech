export type IncomeSourceType = 'monthly' | 'freelance' | 'gig' | 'other'
export type FrequencyType = 'one-time' | 'weekly' | 'monthly' | 'quarterly'
export type TransactionType = 'income' | 'expense'

export interface User {
  id: string
  email: string
  full_name?: string
  onboarding_complete?: boolean
  created_at: string
  updated_at: string
}

export interface IncomeSource {
  id: string
  user_id: string
  source_name: string
  source_type: IncomeSourceType
  amount: number
  frequency: FrequencyType
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category: string
  amount: number
  description?: string
  date: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  deadline?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  description?: string
  date: string
  created_at: string
}

export interface FinancialPulse {
  score: number
  trend: 'up' | 'down' | 'stable'
  volatility: number
  savingsRate: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
}

export interface WhatIfScenario {
  purchaseAmount: number
  purchaseDescription: string
  impact: {
    savingsReduction: number
    goalDelay: number
    affordabilityScore: number
  }
}
