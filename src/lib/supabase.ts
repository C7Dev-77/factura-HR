// Configuración de Supabase para Factura LVL
import { createClient } from '@supabase/supabase-js';

// 🔑 Variables de entorno (configuradas en .env local y en Vercel para producción)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validación de credenciales
if (!supabaseUrl || !supabaseAnonKey) {
    const isProduction = import.meta.env.PROD;
    const message = '⚠️ Credenciales de Supabase no configuradas. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.';

    if (isProduction) {
        // En producción, lanzar error para evitar que la app funcione sin credenciales
        throw new Error(message);
    } else {
        console.warn(message);
        console.warn('📖 Configura estas variables en el archivo .env en la raíz del proyecto.');
    }
}

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Tipos de datos para TypeScript
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    company_name: string;
                    nit: string;
                    phone: string;
                    address: string;
                    city: string;
                    resolution_number?: string;
                    resolution_date?: string;
                    prefix?: string;
                    start_range?: number;
                    end_range?: number;
                    current_number?: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
            };
            clients: {
                Row: {
                    id: string;
                    name: string;
                    nit: string;
                    email: string;
                    phone: string;
                    address: string;
                    city: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['clients']['Insert']>;
            };
            products: {
                Row: {
                    id: string;
                    code: string;
                    name: string;
                    description: string;
                    category: string;
                    price: number;
                    tax: number;
                    stock: number;
                    status: 'active' | 'inactive' | 'low_stock';
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['products']['Insert']>;
            };
            invoices: {
                Row: {
                    id: string;
                    number: string;
                    client_id: string;
                    date: string;
                    due_date: string;
                    status: 'paid' | 'pending' | 'overdue' | 'cancelled';
                    subtotal: number;
                    tax_amount: number;
                    total_amount: number;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
            };
            invoice_items: {
                Row: {
                    id: string;
                    invoice_id: string;
                    product_id: string | null;
                    description: string;
                    quantity: number;
                    unit_price: number;
                    tax: number;
                    total: number;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
            };
        };
    };
}
