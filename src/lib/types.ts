export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export interface CheckIn {
  id: string
  habit_id: string
  user_id: string
  checked_date: string // YYYY-MM-DD
  created_at: string
}

export interface HabitWithStats extends Habit {
  streak: number
  checkedToday: boolean
  totalCheckins: number
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Work {
  id: string
  user_id: string
  title: string
  description: string
  link: string
  tags: string[]
  created_at: string
}

export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  note: string
  currency: string // 'SGD' | 'MYR' | …
  occurred_at: string // YYYY-MM-DD
  created_at: string
}
