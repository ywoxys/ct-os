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
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'administrador-all' | 'administrador' | 'funcionario'
          setor: 'adimplencia' | 'homologacao' | 'vendas' | 'recepcao' | 'geral'
          login: string
          password: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'administrador-all' | 'administrador' | 'funcionario'
          setor: 'adimplencia' | 'homologacao' | 'vendas' | 'recepcao' | 'geral'
          login: string
          password: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'administrador-all' | 'administrador' | 'funcionario'
          setor?: 'adimplencia' | 'homologacao' | 'vendas' | 'recepcao' | 'geral'
          login?: string
          password?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          nome: string
          cpf: string
          telefone: string
          email: string | null
          endereco: string | null
          matricula: string | null
          telefones_adicionais: string[] | null
          observacoes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          nome: string
          cpf: string
          telefone: string
          email?: string | null
          endereco?: string | null
          matricula?: string | null
          telefones_adicionais?: string[] | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          nome?: string
          cpf?: string
          telefone?: string
          email?: string | null
          endereco?: string | null
          matricula?: string | null
          telefones_adicionais?: string[] | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
