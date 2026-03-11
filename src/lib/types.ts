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
