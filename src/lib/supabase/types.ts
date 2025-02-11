export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      scoring_templates: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string | null
          pts: number | null
          drbs: number | null
          orbs: number | null
          asts: number | null
          stls: number | null
          blks: number | null
          tos: number | null
          fgm: number | null
          fga: number | null
          tpm: number | null
          tpa: number | null
          ftm: number | null
          fta: number | null
          dbl: number | null
          tpl: number | null
          qpl: number | null
          fls: number | null
          pt10: number | null
          rb10: number | null
          ast10: number | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string | null
          pts?: number | null
          drbs?: number | null
          orbs?: number | null
          asts?: number | null
          stls?: number | null
          blks?: number | null
          tos?: number | null
          fgm?: number | null
          fga?: number | null
          tpm?: number | null
          tpa?: number | null
          ftm?: number | null
          fta?: number | null
          dbl?: number | null
          tpl?: number | null
          qpl?: number | null
          fls?: number | null
          pt10?: number | null
          rb10?: number | null
          ast10?: number | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string | null
          pts?: number | null
          drbs?: number | null
          orbs?: number | null
          asts?: number | null
          stls?: number | null
          blks?: number | null
          tos?: number | null
          fgm?: number | null
          fga?: number | null
          tpm?: number | null
          tpa?: number | null
          ftm?: number | null
          fta?: number | null
          dbl?: number | null
          tpl?: number | null
          qpl?: number | null
          fls?: number | null
          pt10?: number | null
          rb10?: number | null
          ast10?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          email: string | null
          timezone: string | null
          email_notifications: boolean
          dark_mode: boolean
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          timezone?: string | null
          email_notifications?: boolean
          dark_mode?: boolean
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          timezone?: string | null
          email_notifications?: boolean
          dark_mode?: boolean
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
} 