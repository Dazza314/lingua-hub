export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      curated_grammar_points: {
        Row: {
          explanation: string
          id: string
          language: string
          title: string
        }
        Insert: {
          explanation: string
          id?: string
          language: string
          title: string
        }
        Update: {
          explanation?: string
          id?: string
          language?: string
          title?: string
        }
        Relationships: []
      }
      curated_vocab_items: {
        Row: {
          id: string
          language: string
          term: string
        }
        Insert: {
          id?: string
          language: string
          term: string
        }
        Update: {
          id?: string
          language?: string
          term?: string
        }
        Relationships: []
      }
      imported_vocab_items: {
        Row: {
          created_at: string
          id: string
          language: string
          source: Database["public"]["Enums"]["imported_vocab_source"]
          term: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          source: Database["public"]["Enums"]["imported_vocab_source"]
          term: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          source?: Database["public"]["Enums"]["imported_vocab_source"]
          term?: string
          user_id?: string
        }
        Relationships: []
      }
      set_grammar_points: {
        Row: {
          grammar_point_id: string
          set_id: string
        }
        Insert: {
          grammar_point_id: string
          set_id: string
        }
        Update: {
          grammar_point_id?: string
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "set_grammar_points_grammar_point_id_fkey"
            columns: ["grammar_point_id"]
            isOneToOne: false
            referencedRelation: "curated_grammar_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_grammar_points_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      set_vocab_items: {
        Row: {
          set_id: string
          vocab_item_id: string
        }
        Insert: {
          set_id: string
          vocab_item_id: string
        }
        Update: {
          set_id?: string
          vocab_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "set_vocab_items_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_vocab_items_vocab_item_id_fkey"
            columns: ["vocab_item_id"]
            isOneToOne: false
            referencedRelation: "curated_vocab_items"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          id: string
          language: string
          title: string
        }
        Insert: {
          id?: string
          language: string
          title: string
        }
        Update: {
          id?: string
          language?: string
          title?: string
        }
        Relationships: []
      }
      user_exercise_policy: {
        Row: {
          grammar_set_ids: string[]
          imported_vocab: boolean
          language: string
          user_id: string
          vocab_set_ids: string[]
        }
        Insert: {
          grammar_set_ids?: string[]
          imported_vocab?: boolean
          language: string
          user_id: string
          vocab_set_ids?: string[]
        }
        Update: {
          grammar_set_ids?: string[]
          imported_vocab?: boolean
          language?: string
          user_id?: string
          vocab_set_ids?: string[]
        }
        Relationships: []
      }
      user_selected_sets: {
        Row: {
          set_id: string
          user_id: string
        }
        Insert: {
          set_id: string
          user_id: string
        }
        Update: {
          set_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_selected_sets_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      imported_vocab_source: "anki"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      imported_vocab_source: ["anki"],
    },
  },
} as const
