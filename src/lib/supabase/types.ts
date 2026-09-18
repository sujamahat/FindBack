import type { ItemCategory, ItemStatus, ReturnMethod } from "@/lib/constants";

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          owner_id: string;
          public_token: string;
          recovery_code: string;
          name: string;
          category: ItemCategory;
          description: string | null;
          return_instructions: string | null;
          photo_url: string | null;
          status: ItemStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          public_token: string;
          recovery_code: string;
          name: string;
          category: ItemCategory;
          description?: string | null;
          return_instructions?: string | null;
          photo_url?: string | null;
          status?: ItemStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["items"]["Insert"]>;
        Relationships: [];
      };
      found_reports: {
        Row: {
          id: string;
          item_id: string;
          location_text: string | null;
          return_method: ReturnMethod;
          custom_return_place: string | null;
          message: string | null;
          photo_url: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          location_text?: string | null;
          return_method: ReturnMethod;
          custom_return_place?: string | null;
          message?: string | null;
          photo_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["found_reports"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "found_reports_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      item_status_events: {
        Row: {
          id: string;
          item_id: string;
          event_type: "lost" | "returned";
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          event_type: "lost" | "returned";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["item_status_events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "item_status_events_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
