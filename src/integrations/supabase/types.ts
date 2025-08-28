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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          employee_id: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          employee_id: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          employee_id?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_instances: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          fired_at: string
          id: string
          message: string
          metadata: Json | null
          metric_value: number
          resolved_at: string | null
          rule_id: string | null
          severity: string
          status: string
          threshold_value: number
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          fired_at?: string
          id?: string
          message: string
          metadata?: Json | null
          metric_value: number
          resolved_at?: string | null
          rule_id?: string | null
          severity: string
          status?: string
          threshold_value: number
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          fired_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          metric_value?: number
          resolved_at?: string | null
          rule_id?: string | null
          severity?: string
          status?: string
          threshold_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "alert_instances_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          conditions: Json | null
          cooldown_minutes: number | null
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          metric_name: string
          notification_channels: Json | null
          rule_name: string
          severity: string
          threshold_operator: string
          threshold_value: number
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          cooldown_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metric_name: string
          notification_channels?: Json | null
          rule_name: string
          severity: string
          threshold_operator: string
          threshold_value: number
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          cooldown_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metric_name?: string
          notification_channels?: Json | null
          rule_name?: string
          severity?: string
          threshold_operator?: string
          threshold_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          ip_address: unknown | null
          tenant_id: string
          user_agent: string | null
          user_session: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          tenant_id: string
          user_agent?: string | null
          user_session?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          tenant_id?: string
          user_agent?: string | null
          user_session?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          description: string | null
          employee_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          key_preview: string
          last_used_at: string | null
          permissions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          key_preview: string
          last_used_at?: string | null
          permissions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          key_preview?: string
          last_used_at?: string | null
          permissions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auto_provisioning: {
        Row: {
          completed_at: string | null
          created_at: string
          currency: string
          error_message: string | null
          id: string
          restaurant_name: string
          restaurant_slug: string
          status: string
          tenant_id: string | null
          timezone: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          restaurant_name: string
          restaurant_slug: string
          status?: string
          tenant_id?: string | null
          timezone?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          restaurant_name?: string
          restaurant_slug?: string
          status?: string
          tenant_id?: string | null
          timezone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_provisioning_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_holds: {
        Row: {
          booking_time: string
          created_at: string
          duration_minutes: number
          expires_at: string
          id: string
          party_size: number
          session_id: string
          table_id: string | null
          tenant_id: string
        }
        Insert: {
          booking_time: string
          created_at?: string
          duration_minutes?: number
          expires_at: string
          id?: string
          party_size: number
          session_id: string
          table_id?: string | null
          tenant_id: string
        }
        Update: {
          booking_time?: string
          created_at?: string
          duration_minutes?: number
          expires_at?: string
          id?: string
          party_size?: number
          session_id?: string
          table_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_holds_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_holds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_time: string
          created_at: string
          deposit_amount: number | null
          deposit_paid: boolean
          deposit_required: boolean
          duration_minutes: number
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          party_size: number
          special_requests: string | null
          status: string
          table_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          booking_time: string
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean
          deposit_required?: boolean
          duration_minutes?: number
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          party_size: number
          special_requests?: string | null
          status?: string
          table_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          booking_time?: string
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean
          deposit_required?: boolean
          duration_minutes?: number
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          party_size?: number
          special_requests?: string | null
          status?: string
          table_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string
          metric_value: number
          period_end: string
          period_start: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit: string
          metric_value: number
          period_end: string
          period_start: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cuisine_types: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      database_metrics: {
        Row: {
          active_connections: number | null
          connection_pool_size: number | null
          created_at: string
          id: string
          index_name: string | null
          metadata: Json | null
          metric_name: string
          metric_value: number
          query_fingerprint: string | null
          recorded_at: string
          table_name: string | null
          waiting_connections: number | null
        }
        Insert: {
          active_connections?: number | null
          connection_pool_size?: number | null
          created_at?: string
          id?: string
          index_name?: string | null
          metadata?: Json | null
          metric_name: string
          metric_value: number
          query_fingerprint?: string | null
          recorded_at?: string
          table_name?: string | null
          waiting_connections?: number | null
        }
        Update: {
          active_connections?: number | null
          connection_pool_size?: number | null
          created_at?: string
          id?: string
          index_name?: string | null
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          query_fingerprint?: string | null
          recorded_at?: string
          table_name?: string | null
          waiting_connections?: number | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          parent_department_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          parent_department_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          parent_department_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_results: {
        Row: {
          created_at: string
          diagnostic_type: string
          error_message: string | null
          executed_at: string
          executed_by: string | null
          execution_time_ms: number | null
          id: string
          recommendations: string[] | null
          result_data: Json
          service_name: string | null
          status: string
          test_name: string
        }
        Insert: {
          created_at?: string
          diagnostic_type: string
          error_message?: string | null
          executed_at?: string
          executed_by?: string | null
          execution_time_ms?: number | null
          id?: string
          recommendations?: string[] | null
          result_data: Json
          service_name?: string | null
          status: string
          test_name: string
        }
        Update: {
          created_at?: string
          diagnostic_type?: string
          error_message?: string | null
          executed_at?: string
          executed_by?: string | null
          execution_time_ms?: number | null
          id?: string
          recommendations?: string[] | null
          result_data?: Json
          service_name?: string | null
          status?: string
          test_name?: string
        }
        Relationships: []
      }
      dns_records: {
        Row: {
          cloudflare_record_id: string | null
          created_at: string
          domain_id: string
          id: string
          managed: boolean | null
          name: string
          priority: number | null
          record_type: string
          status: string | null
          tenant_id: string
          ttl: number | null
          updated_at: string
          value: string
        }
        Insert: {
          cloudflare_record_id?: string | null
          created_at?: string
          domain_id: string
          id?: string
          managed?: boolean | null
          name: string
          priority?: number | null
          record_type: string
          status?: string | null
          tenant_id: string
          ttl?: number | null
          updated_at?: string
          value: string
        }
        Update: {
          cloudflare_record_id?: string | null
          created_at?: string
          domain_id?: string
          id?: string
          managed?: boolean | null
          name?: string
          priority?: number | null
          record_type?: string
          status?: string | null
          tenant_id?: string
          ttl?: number | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "dns_records_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      dns_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          records: Json
          template_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          records?: Json
          template_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          records?: Json
          template_type?: string
        }
        Relationships: []
      }
      domain_analytics: {
        Row: {
          avg_response_time_ms: number | null
          bandwidth_bytes: number | null
          cache_hit_rate: number | null
          countries: Json | null
          created_at: string
          date: string
          domain_id: string
          error_rate: number | null
          id: string
          requests_count: number | null
          tenant_id: string
          top_pages: Json | null
          unique_visitors: number | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          bandwidth_bytes?: number | null
          cache_hit_rate?: number | null
          countries?: Json | null
          created_at?: string
          date: string
          domain_id: string
          error_rate?: number | null
          id?: string
          requests_count?: number | null
          tenant_id: string
          top_pages?: Json | null
          unique_visitors?: number | null
        }
        Update: {
          avg_response_time_ms?: number | null
          bandwidth_bytes?: number | null
          cache_hit_rate?: number | null
          countries?: Json | null
          created_at?: string
          date?: string
          domain_id?: string
          error_rate?: number | null
          id?: string
          requests_count?: number | null
          tenant_id?: string
          top_pages?: Json | null
          unique_visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_analytics_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_events: {
        Row: {
          created_at: string
          domain_id: string
          event_data: Json
          event_type: string
          id: string
          tenant_id: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          domain_id: string
          event_data?: Json
          event_type: string
          id?: string
          tenant_id: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          domain_id?: string
          event_data?: Json
          event_type?: string
          id?: string
          tenant_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_events_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_health_checks: {
        Row: {
          check_data: Json | null
          check_type: string
          created_at: string
          domain_id: string
          error_message: string | null
          id: string
          response_time_ms: number | null
          ssl_days_remaining: number | null
          status: string
          tenant_id: string
        }
        Insert: {
          check_data?: Json | null
          check_type: string
          created_at?: string
          domain_id: string
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          ssl_days_remaining?: number | null
          status: string
          tenant_id: string
        }
        Update: {
          check_data?: Json | null
          check_type?: string
          created_at?: string
          domain_id?: string
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          ssl_days_remaining?: number | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_health_checks_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          cloudflare_hostname_id: string | null
          cloudflare_zone_id: string | null
          created_at: string
          dns_records: Json | null
          domain: string
          domain_type: Database["public"]["Enums"]["domain_type"]
          id: string
          is_primary: boolean | null
          metadata: Json | null
          redirect_to: string | null
          ssl_cert_id: string | null
          ssl_expires_at: string | null
          ssl_status: Database["public"]["Enums"]["ssl_status"]
          status: Database["public"]["Enums"]["domain_status"]
          tenant_id: string
          updated_at: string
          verification_record: string | null
          verification_status: string | null
        }
        Insert: {
          cloudflare_hostname_id?: string | null
          cloudflare_zone_id?: string | null
          created_at?: string
          dns_records?: Json | null
          domain: string
          domain_type?: Database["public"]["Enums"]["domain_type"]
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          redirect_to?: string | null
          ssl_cert_id?: string | null
          ssl_expires_at?: string | null
          ssl_status?: Database["public"]["Enums"]["ssl_status"]
          status?: Database["public"]["Enums"]["domain_status"]
          tenant_id: string
          updated_at?: string
          verification_record?: string | null
          verification_status?: string | null
        }
        Update: {
          cloudflare_hostname_id?: string | null
          cloudflare_zone_id?: string | null
          created_at?: string
          dns_records?: Json | null
          domain?: string
          domain_type?: Database["public"]["Enums"]["domain_type"]
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          redirect_to?: string | null
          ssl_cert_id?: string | null
          ssl_expires_at?: string | null
          ssl_status?: Database["public"]["Enums"]["ssl_status"]
          status?: Database["public"]["Enums"]["domain_status"]
          tenant_id?: string
          updated_at?: string
          verification_record?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      employee_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          department_id: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          role: Database["public"]["Enums"]["employee_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by: string
          role: Database["public"]["Enums"]["employee_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["employee_role"]
        }
        Relationships: [
          {
            foreignKeyName: "employee_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          department_id: string | null
          employee_id: string
          hire_date: string | null
          id: string
          last_activity: string | null
          last_login: string | null
          manager_id: string | null
          metadata: Json
          permissions: Json
          role: Database["public"]["Enums"]["employee_role"]
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          employee_id: string
          hire_date?: string | null
          id?: string
          last_activity?: string | null
          last_login?: string | null
          manager_id?: string | null
          metadata?: Json
          permissions?: Json
          role?: Database["public"]["Enums"]["employee_role"]
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          employee_id?: string
          hire_date?: string | null
          id?: string
          last_activity?: string | null
          last_login?: string | null
          manager_id?: string | null
          metadata?: Json
          permissions?: Json
          role?: Database["public"]["Enums"]["employee_role"]
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          endpoint: string | null
          error_type: string
          id: string
          ip_address: unknown | null
          message: string
          metadata: Json | null
          method: string | null
          occurred_at: string
          request_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          response_time_ms: number | null
          severity: string
          stack_trace: string | null
          status_code: number | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          error_type: string
          id?: string
          ip_address?: unknown | null
          message: string
          metadata?: Json | null
          method?: string | null
          occurred_at?: string
          request_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_time_ms?: number | null
          severity: string
          stack_trace?: string | null
          status_code?: number | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          error_type?: string
          id?: string
          ip_address?: unknown | null
          message?: string
          metadata?: Json | null
          method?: string | null
          occurred_at?: string
          request_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_time_ms?: number | null
          severity?: string
          stack_trace?: string | null
          status_code?: number | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_outbox: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          max_retries: number
          payload: Json
          processed_at: string | null
          retry_count: number
          scheduled_at: string
          status: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          max_retries?: number
          payload: Json
          processed_at?: string | null
          retry_count?: number
          scheduled_at?: string
          status?: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          max_retries?: number
          payload?: Json
          processed_at?: string | null
          retry_count?: number
          scheduled_at?: string
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_outbox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_updates: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          incident_id: string | null
          message: string
          new_status: string | null
          old_status: string | null
          public_facing: boolean | null
          update_type: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          message: string
          new_status?: string | null
          old_status?: string | null
          public_facing?: boolean | null
          update_type: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          message?: string
          new_status?: string | null
          old_status?: string | null
          public_facing?: boolean | null
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          acknowledged_at: string | null
          affected_services: string[] | null
          assignee_id: string | null
          created_at: string
          description: string | null
          detected_at: string
          id: string
          impact: string
          incident_number: string
          reporter_id: string | null
          resolution: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          affected_services?: string[] | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          impact: string
          incident_number: string
          reporter_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          affected_services?: string[] | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          impact?: string
          incident_number?: string
          reporter_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_windows: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          affected_services: string[]
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          impact_level: string
          maintenance_type: string
          notification_sent: boolean | null
          scheduled_end: string
          scheduled_start: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          affected_services: string[]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_level: string
          maintenance_type: string
          notification_sent?: boolean | null
          scheduled_end: string
          scheduled_start: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          affected_services?: string[]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_level?: string
          maintenance_type?: string
          notification_sent?: boolean | null
          scheduled_end?: string
          scheduled_start?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      party_size_configs: {
        Row: {
          allow_large_parties: boolean
          created_at: string
          default_party_size: number
          id: string
          large_party_threshold: number
          max_party_size: number
          min_party_size: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allow_large_parties?: boolean
          created_at?: string
          default_party_size?: number
          id?: string
          large_party_threshold?: number
          max_party_size?: number
          min_party_size?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allow_large_parties?: boolean
          created_at?: string
          default_party_size?: number
          id?: string
          large_party_threshold?: number
          max_party_size?: number
          min_party_size?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_trends: {
        Row: {
          aggregation_period: string
          avg_value: number | null
          count_value: number | null
          created_at: string
          id: string
          max_value: number | null
          metadata: Json | null
          metric_category: string
          metric_name: string
          min_value: number | null
          percentile_50: number | null
          percentile_95: number | null
          percentile_99: number | null
          period_end: string
          period_start: string
          sum_value: number | null
        }
        Insert: {
          aggregation_period: string
          avg_value?: number | null
          count_value?: number | null
          created_at?: string
          id?: string
          max_value?: number | null
          metadata?: Json | null
          metric_category: string
          metric_name: string
          min_value?: number | null
          percentile_50?: number | null
          percentile_95?: number | null
          percentile_99?: number | null
          period_end: string
          period_start: string
          sum_value?: number | null
        }
        Update: {
          aggregation_period?: string
          avg_value?: number | null
          count_value?: number | null
          created_at?: string
          id?: string
          max_value?: number | null
          metadata?: Json | null
          metric_category?: string
          metric_name?: string
          min_value?: number | null
          percentile_50?: number | null
          percentile_95?: number | null
          percentile_99?: number | null
          period_end?: string
          period_start?: string
          sum_value?: number | null
        }
        Relationships: []
      }
      pos_configurations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          integration_id: string
          is_sensitive: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          integration_id: string
          is_sensitive?: boolean
          setting_key: string
          setting_type?: string
          setting_value?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          integration_id?: string
          is_sensitive?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_configurations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "pos_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_data: Json
          event_source: string
          event_type: string
          external_id: string | null
          id: string
          integration_id: string
          max_retries: number
          processed: boolean
          processed_at: string | null
          retry_count: number
          scheduled_retry_at: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_data?: Json
          event_source: string
          event_type: string
          external_id?: string | null
          id?: string
          integration_id: string
          max_retries?: number
          processed?: boolean
          processed_at?: string | null
          retry_count?: number
          scheduled_retry_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_data?: Json
          event_source?: string
          event_type?: string
          external_id?: string | null
          id?: string
          integration_id?: string
          max_retries?: number
          processed?: boolean
          processed_at?: string | null
          retry_count?: number
          scheduled_retry_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "pos_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_health_checks: {
        Row: {
          check_data: Json
          check_type: string
          created_at: string
          error_message: string | null
          id: string
          integration_id: string
          response_time_ms: number | null
          status: string
          status_code: number | null
          tenant_id: string
        }
        Insert: {
          check_data?: Json
          check_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id: string
          response_time_ms?: number | null
          status: string
          status_code?: number | null
          tenant_id: string
        }
        Update: {
          check_data?: Json
          check_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id?: string
          response_time_ms?: number | null
          status?: string
          status_code?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_health_checks_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "pos_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_integrations: {
        Row: {
          configuration: Json
          created_at: string
          credentials: Json
          error_message: string | null
          health_status: string
          id: string
          integration_name: string
          last_health_check: string | null
          last_sync_at: string | null
          metadata: Json
          provider_id: string
          status: string
          tenant_id: string
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string
          credentials?: Json
          error_message?: string | null
          health_status?: string
          id?: string
          integration_name: string
          last_health_check?: string | null
          last_sync_at?: string | null
          metadata?: Json
          provider_id: string
          status?: string
          tenant_id: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string
          credentials?: Json
          error_message?: string | null
          health_status?: string
          id?: string
          integration_name?: string
          last_health_check?: string | null
          last_sync_at?: string | null
          metadata?: Json
          provider_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_integrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "pos_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_menu_items: {
        Row: {
          allergens: Json
          available: boolean
          category: string | null
          created_at: string
          currency: string
          description: string | null
          external_id: string
          id: string
          image_url: string | null
          integration_id: string
          last_synced_at: string
          metadata: Json
          modifiers: Json
          name: string
          nutrition_info: Json
          price: number | null
          sync_status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allergens?: Json
          available?: boolean
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id: string
          id?: string
          image_url?: string | null
          integration_id: string
          last_synced_at?: string
          metadata?: Json
          modifiers?: Json
          name: string
          nutrition_info?: Json
          price?: number | null
          sync_status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allergens?: Json
          available?: boolean
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string
          id?: string
          image_url?: string | null
          integration_id?: string
          last_synced_at?: string
          metadata?: Json
          modifiers?: Json
          name?: string
          nutrition_info?: Json
          price?: number | null
          sync_status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_menu_items_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "pos_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_providers: {
        Row: {
          api_documentation_url: string | null
          configuration_schema: Json
          created_at: string
          description: string | null
          event_types: Json
          id: string
          logo_url: string | null
          menu_sync_enabled: boolean
          name: string
          slug: string
          status: string
          updated_at: string
          webhook_enabled: boolean
        }
        Insert: {
          api_documentation_url?: string | null
          configuration_schema?: Json
          created_at?: string
          description?: string | null
          event_types?: Json
          id?: string
          logo_url?: string | null
          menu_sync_enabled?: boolean
          name: string
          slug: string
          status?: string
          updated_at?: string
          webhook_enabled?: boolean
        }
        Update: {
          api_documentation_url?: string | null
          configuration_schema?: Json
          created_at?: string
          description?: string | null
          event_types?: Json
          id?: string
          logo_url?: string | null
          menu_sync_enabled?: boolean
          name?: string
          slug?: string
          status?: string
          updated_at?: string
          webhook_enabled?: boolean
        }
        Relationships: []
      }
      pos_webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          headers: Json
          id: string
          integration_id: string
          method: string
          payload: Json
          processing_time_ms: number | null
          response_body: string | null
          response_status: number | null
          tenant_id: string
          verified: boolean
          webhook_url: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          headers?: Json
          id?: string
          integration_id: string
          method?: string
          payload?: Json
          processing_time_ms?: number | null
          response_body?: string | null
          response_status?: number | null
          tenant_id: string
          verified?: boolean
          webhook_url: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          headers?: Json
          id?: string
          integration_id?: string
          method?: string
          payload?: Json
          processing_time_ms?: number | null
          response_body?: string | null
          response_status?: number | null
          tenant_id?: string
          verified?: boolean
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_webhook_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "pos_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_popular: boolean
          max_bookings_per_month: number | null
          max_staff_accounts: number | null
          max_tables: number | null
          monthly_price: number
          name: string
          slug: string
          stripe_price_id: string | null
          stripe_yearly_price_id: string | null
          updated_at: string
          yearly_price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_bookings_per_month?: number | null
          max_staff_accounts?: number | null
          max_tables?: number | null
          monthly_price: number
          name: string
          slug: string
          stripe_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
          yearly_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_bookings_per_month?: number | null
          max_staff_accounts?: number | null
          max_tables?: number | null
          monthly_price?: number
          name?: string
          slug?: string
          stripe_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
          yearly_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      provisioning_runs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          idempotency_key: string
          request_data: Json
          result_data: Json | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key: string
          request_data: Json
          result_data?: Json | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string
          request_data?: Json
          result_data?: Json | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provisioning_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      provisioning_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          run_id: string
          started_at: string | null
          status: string
          step_data: Json | null
          step_name: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          run_id: string
          started_at?: string | null
          status?: string
          step_data?: Json | null
          step_name: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          run_id?: string
          started_at?: string | null
          status?: string
          step_data?: Json | null
          step_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "provisioning_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "provisioning_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
          metadata: Json | null
          rate_limit_key: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
          metadata?: Json | null
          rate_limit_key: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
          metadata?: Json | null
          rate_limit_key?: string
        }
        Relationships: []
      }
      request_traces: {
        Row: {
          created_at: string
          duration_ms: number | null
          end_time: string | null
          http_method: string | null
          http_status_code: number | null
          http_url: string | null
          id: string
          logs: Json | null
          operation_name: string
          parent_span_id: string | null
          service_name: string
          span_id: string
          start_time: string
          status: string
          tags: Json | null
          tenant_id: string | null
          trace_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          http_method?: string | null
          http_status_code?: number | null
          http_url?: string | null
          id?: string
          logs?: Json | null
          operation_name: string
          parent_span_id?: string | null
          service_name: string
          span_id: string
          start_time: string
          status: string
          tags?: Json | null
          tenant_id?: string | null
          trace_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          http_method?: string | null
          http_status_code?: number | null
          http_url?: string | null
          id?: string
          logs?: Json | null
          operation_name?: string
          parent_span_id?: string | null
          service_name?: string
          span_id?: string
          start_time?: string
          status?: string
          tags?: Json | null
          tenant_id?: string | null
          trace_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      resource_usage: {
        Row: {
          created_at: string
          current_value: number
          hostname: string | null
          id: string
          max_value: number | null
          metadata: Json | null
          recorded_at: string
          resource_type: string
          service_name: string
          threshold_critical: number | null
          threshold_warning: number | null
          unit: string
        }
        Insert: {
          created_at?: string
          current_value: number
          hostname?: string | null
          id?: string
          max_value?: number | null
          metadata?: Json | null
          recorded_at?: string
          resource_type: string
          service_name: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          unit: string
        }
        Update: {
          created_at?: string
          current_value?: number
          hostname?: string | null
          id?: string
          max_value?: number | null
          metadata?: Json | null
          recorded_at?: string
          resource_type?: string
          service_name?: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          unit?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          active: boolean
          capacity: number
          created_at: string
          id: string
          name: string
          position_x: number | null
          position_y: number | null
          table_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          capacity: number
          created_at?: string
          id?: string
          name: string
          position_x?: number | null
          position_y?: number | null
          table_type?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          position_x?: number | null
          position_y?: number | null
          table_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          employee_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_health_status: {
        Row: {
          checked_at: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          response_time_ms: number | null
          service_id: string | null
          status: string
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_id?: string | null
          status: string
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_id?: string | null
          status?: string
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_health_status_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          critical: boolean | null
          description: string | null
          enabled: boolean | null
          environment: string
          expected_response_time_ms: number | null
          health_check_endpoint: string | null
          health_check_interval_seconds: number | null
          id: string
          metadata: Json | null
          service_name: string
          service_type: string
          service_url: string | null
          sla_uptime_target: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          critical?: boolean | null
          description?: string | null
          enabled?: boolean | null
          environment?: string
          expected_response_time_ms?: number | null
          health_check_endpoint?: string | null
          health_check_interval_seconds?: number | null
          id?: string
          metadata?: Json | null
          service_name: string
          service_type: string
          service_url?: string | null
          sla_uptime_target?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          critical?: boolean | null
          description?: string | null
          enabled?: boolean | null
          environment?: string
          expected_response_time_ms?: number | null
          health_check_endpoint?: string | null
          health_check_interval_seconds?: number | null
          id?: string
          metadata?: Json | null
          service_name?: string
          service_type?: string
          service_url?: string | null
          sla_uptime_target?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sla_metrics: {
        Row: {
          avg_response_time_ms: number | null
          created_at: string
          downtime_minutes: number
          id: string
          incidents_count: number | null
          period_end: string
          period_start: string
          service_id: string | null
          sla_breach: boolean | null
          successful_checks: number
          total_checks: number
          uptime_percentage: number
        }
        Insert: {
          avg_response_time_ms?: number | null
          created_at?: string
          downtime_minutes?: number
          id?: string
          incidents_count?: number | null
          period_end: string
          period_start: string
          service_id?: string | null
          sla_breach?: boolean | null
          successful_checks?: number
          total_checks?: number
          uptime_percentage: number
        }
        Update: {
          avg_response_time_ms?: number | null
          created_at?: string
          downtime_minutes?: number
          id?: string
          incidents_count?: number | null
          period_end?: string
          period_start?: string
          service_id?: string | null
          sla_breach?: boolean | null
          successful_checks?: number
          total_checks?: number
          uptime_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "sla_metrics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      ssl_certificates: {
        Row: {
          auto_renew: boolean | null
          certificate_authority: string | null
          certificate_data: string | null
          chain_data: string | null
          created_at: string
          domain_id: string
          expires_at: string | null
          id: string
          issued_at: string | null
          last_renewal_attempt: string | null
          metadata: Json | null
          private_key_data: string | null
          renewal_error: string | null
          status: Database["public"]["Enums"]["ssl_status"]
          subject_alt_names: string[] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          certificate_authority?: string | null
          certificate_data?: string | null
          chain_data?: string | null
          created_at?: string
          domain_id: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          last_renewal_attempt?: string | null
          metadata?: Json | null
          private_key_data?: string | null
          renewal_error?: string | null
          status?: Database["public"]["Enums"]["ssl_status"]
          subject_alt_names?: string[] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          certificate_authority?: string | null
          certificate_data?: string | null
          chain_data?: string | null
          created_at?: string
          domain_id?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          last_renewal_attempt?: string | null
          metadata?: Json | null
          private_key_data?: string | null
          renewal_error?: string | null
          status?: Database["public"]["Enums"]["ssl_status"]
          subject_alt_names?: string[] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ssl_certificates_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_attachments: {
        Row: {
          content_type: string | null
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          message_id: string | null
          ticket_id: string
          uploaded_by: string | null
          uploaded_by_type: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          message_id?: string | null
          ticket_id: string
          uploaded_by?: string | null
          uploaded_by_type?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          message_id?: string | null
          ticket_id?: string
          uploaded_by?: string | null
          uploaded_by_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_ticket_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_categories: {
        Row: {
          auto_assign_team: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority_level: number | null
          updated_at: string
        }
        Insert: {
          auto_assign_team?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority_level?: number | null
          updated_at?: string
        }
        Update: {
          auto_assign_team?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority_level?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          message_type: string | null
          metadata: Json | null
          sender_email: string | null
          sender_id: string | null
          sender_name: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name: string
          sender_type: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          due_at: string | null
          escalated_at: string | null
          escalation_level: number | null
          first_response_at: string | null
          id: string
          metadata: Json | null
          priority: string
          resolved_at: string | null
          source: string | null
          status: string
          subject: string
          tags: Json | null
          tenant_id: string | null
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description: string
          due_at?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          source?: string | null
          status?: string
          subject: string
          tags?: Json | null
          tenant_id?: string | null
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          due_at?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          source?: string | null
          status?: string
          subject?: string
          tags?: Json | null
          tenant_id?: string | null
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "support_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_metrics: {
        Row: {
          created_at: string
          endpoint: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string
          metric_value: number
          recorded_at: string
          service_name: string
          severity: string
          status_code: number | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit: string
          metric_value: number
          recorded_at?: string
          service_name: string
          severity?: string
          status_code?: number | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string
          service_name?: string
          severity?: string
          status_code?: number | null
        }
        Relationships: []
      }
      tenant_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature_key: string
          id: string
          source: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_key: string
          id?: string
          source?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_key?: string
          id?: string
          source?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: Json | null
          cover_image_url: string | null
          created_at: string
          cuisine_type_id: string | null
          currency: string
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          status: string
          timezone: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type_id?: string | null
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type_id?: string | null
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_cuisine_type_id_fkey"
            columns: ["cuisine_type_id"]
            isOneToOne: false
            referencedRelation: "cuisine_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          location_data: Json | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      widget_configs: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          is_active: boolean
          tenant_id: string
          updated_at: string
          widget_type: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          tenant_id: string
          updated_at?: string
          widget_type?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          tenant_id?: string
          updated_at?: string
          widget_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_domain: {
        Args: {
          p_domain: string
          p_domain_type?: Database["public"]["Enums"]["domain_type"]
          p_tenant_id: string
        }
        Returns: string
      }
      aggregate_performance_trends: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_sla_metrics: {
        Args: {
          p_period_end: string
          p_period_start: string
          p_service_id: string
        }
        Returns: Json
      }
      check_alert_conditions: {
        Args: { p_metric_name: string; p_metric_value: number }
        Returns: undefined
      }
      check_service_health: {
        Args: { p_service_id: string }
        Returns: Json
      }
      check_ssl_expiration: {
        Args: Record<PropertyKey, never>
        Returns: {
          days_remaining: number
          domain_id: string
          domain_name: string
        }[]
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_health_incident: {
        Args: {
          p_health_status: string
          p_response_time: number
          p_service_id: string
        }
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_employee: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_tenant: {
        Args: { p_user_id: string }
        Returns: {
          provisioning_status: string
          tenant_id: string
          tenant_name: string
          tenant_slug: string
          tenant_status: string
        }[]
      }
      has_employee_role: {
        Args: { required_role: Database["public"]["Enums"]["employee_role"] }
        Returns: boolean
      }
      hash_api_key: {
        Args: { api_key: string }
        Returns: string
      }
      log_employee_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_employee_id?: string
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_severity?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      process_pos_event: {
        Args: {
          p_event_data: Json
          p_event_type: string
          p_external_id?: string
          p_integration_id: string
        }
        Returns: string
      }
      provision_tenant: {
        Args:
          | {
              p_address?: Json
              p_cuisine_type_id?: string
              p_currency?: string
              p_description?: string
              p_email?: string
              p_phone?: string
              p_restaurant_name: string
              p_restaurant_slug: string
              p_timezone?: string
              p_user_id: string
              p_website?: string
            }
          | {
              p_currency?: string
              p_restaurant_name: string
              p_restaurant_slug: string
              p_timezone?: string
              p_user_id: string
            }
        Returns: string
      }
      record_system_metric: {
        Args: {
          p_endpoint?: string
          p_metadata?: Json
          p_metric_name: string
          p_metric_unit: string
          p_metric_value: number
          p_service_name: string
          p_severity?: string
          p_status_code?: number
        }
        Returns: string
      }
      sync_pos_menu_item: {
        Args: {
          p_external_id: string
          p_integration_id: string
          p_item_data: Json
        }
        Returns: string
      }
      update_pos_integration_health: {
        Args: {
          p_error_message?: string
          p_integration_id: string
          p_status: string
        }
        Returns: undefined
      }
      update_ssl_certificate: {
        Args: {
          p_certificate_data: string
          p_domain_id: string
          p_expires_at: string
          p_status: Database["public"]["Enums"]["ssl_status"]
        }
        Returns: string
      }
      user_has_tenant_access: {
        Args: { target_tenant_id: string }
        Returns: boolean
      }
      validate_api_key_permissions: {
        Args: { p_key_hash: string; p_required_permission: string }
        Returns: boolean
      }
      verify_domain: {
        Args: { p_domain_id: string; p_verification_success: boolean }
        Returns: undefined
      }
    }
    Enums: {
      domain_status: "pending" | "active" | "error" | "expired" | "suspended"
      domain_type: "custom" | "subdomain" | "wildcard"
      employee_role: "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "OPS" | "VIEWER"
      employee_status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED"
      ssl_status: "pending" | "active" | "error" | "expired" | "renewing"
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
  public: {
    Enums: {
      domain_status: ["pending", "active", "error", "expired", "suspended"],
      domain_type: ["custom", "subdomain", "wildcard"],
      employee_role: ["SUPER_ADMIN", "ADMIN", "SUPPORT", "OPS", "VIEWER"],
      employee_status: ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"],
      ssl_status: ["pending", "active", "error", "expired", "renewing"],
    },
  },
} as const
