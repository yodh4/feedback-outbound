export interface Feedback {
  id: string
  user_id: string
  title: string
  description: string
  category: string | null
  priority: string | null
  status: string
  created_at: string
}

export interface FeedbackInsert {
  user_id: string
  title: string
  description: string
}

export interface FeedbackUpdate {
  title?: string
  description?: string
  category?: string | null
  priority?: string | null
  status?: string
}

export interface Database {
  public: {
    Tables: {
      feedback: {
        Row: Feedback
        Insert: FeedbackInsert
        Update: FeedbackUpdate
      }
    }
  }
}
