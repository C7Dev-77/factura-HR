import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    product_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    tax: number;
    total: number;
    created_at: string;
}

export interface Invoice {
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
    deleted_at?: string | null;
    // Relaciones
    client?: {
        id: string;
        name: string;
        nit: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
    };
    invoice_items?: InvoiceItem[];
}

export interface InvoiceItemInput {
    product_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    tax: number;
}

export interface InvoiceInput {
    client_id: string;
    date: string;
    due_date: string;
    notes?: string;
    items: InvoiceItemInput[];
}

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Generar número de factura automático usando función de Supabase
    const generateInvoiceNumber = async (): Promise<string> => {
        try {
            const { data, error } = await supabase.rpc('generate_invoice_number');

            if (error) throw error;
            if (data) return data as string;
            throw new Error('No se recibió número de factura');
        } catch (err) {
            console.error('Error al generar número con RPC, usando fallback seguro:', err);

            // Fallback seguro: consultar la última factura y calcular el siguiente número
            try {
                const { data: lastInvoice } = await supabase
                    .from('invoices')
                    .select('number')
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (lastInvoice?.number) {
                    const match = lastInvoice.number.match(/-(\d+)$/);
                    if (match) {
                        const nextNum = parseInt(match[1], 10) + 1;
                        return `FE-${String(nextNum).padStart(3, '0')}`;
                    }
                }
                // Si no hay facturas previas, empezar desde 1
                return 'FE-001';
            } catch (fallbackErr) {
                console.error('Error en fallback de numeración:', fallbackErr);
                // Último recurso: FE-001 (primera factura)
                return 'FE-001';
            }
        }
    };

    // Cargar facturas con relaciones (solo las no eliminadas)
    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('invoices')
                .select(`
          *,
          client:clients!client_id (
            id,
            name,
            nit,
            email,
            phone,
            address,
            city
          ),
          invoice_items (
            id,
            product_id,
            description,
            quantity,
            unit_price,
            tax,
            total
          )
        `)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setInvoices(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error al cargar facturas:', err);
            setError(err.message);
            toast.error('Error al cargar facturas', {
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Crear factura
    const createInvoice = async (invoiceData: InvoiceInput) => {
        try {
            // Calcular totales
            let subtotal = 0;
            let tax_amount = 0;

            const itemsWithTotals = invoiceData.items.map((item) => {
                const itemSubtotal = item.quantity * item.unit_price;
                const itemTax = (itemSubtotal * item.tax) / 100;
                const itemTotal = itemSubtotal + itemTax;

                subtotal += itemSubtotal;
                tax_amount += itemTax;

                return {
                    ...item,
                    total: itemTotal,
                };
            });

            const total_amount = subtotal + tax_amount;

            // Generar número de factura usando la función de Supabase
            const number = await generateInvoiceNumber();

            // Insertar factura
            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert([
                    {
                        number,
                        client_id: invoiceData.client_id,
                        date: invoiceData.date,
                        due_date: invoiceData.due_date,
                        status: 'pending',
                        subtotal,
                        tax_amount,
                        total_amount,
                        notes: invoiceData.notes || null,
                    },
                ])
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // Insertar items
            const itemsToInsert = itemsWithTotals.map((item) => ({
                invoice_id: invoice.id,
                ...item,
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // Actualizar stock de productos
            for (const item of invoiceData.items) {
                if (item.product_id) {
                    await supabase.rpc('decrement_product_stock', {
                        p_product_id: item.product_id,
                        p_quantity: item.quantity,
                    });
                }
            }

            await fetchInvoices();

            toast.success('Factura creada', {
                description: `Factura ${number} creada correctamente`,
            });

            return { data: invoice, error: null };
        } catch (err: any) {
            console.error('Error al crear factura:', err);
            toast.error('Error al crear factura', {
                description: err.message,
            });
            return { data: null, error: err };
        }
    };

    // Actualizar estado de factura
    const updateInvoiceStatus = async (
        id: string,
        status: 'paid' | 'pending' | 'overdue' | 'cancelled'
    ) => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setInvoices((prev) =>
                prev.map((invoice) => (invoice.id === id ? { ...invoice, status } : invoice))
            );

            toast.success('Estado actualizado', {
                description: `La factura ahora está marcada como ${status}`,
            });

            return { data, error: null };
        } catch (err: any) {
            console.error('Error al actualizar estado:', err);
            toast.error('Error al actualizar estado', {
                description: err.message,
            });
            return { data: null, error: err };
        }
    };

    // Eliminar factura (soft delete)
    const deleteInvoice = async (id: string) => {
        try {
            const { error } = await supabase
                .from('invoices')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));

            toast.success('Factura eliminada', {
                description: 'La factura ha sido eliminada correctamente',
            });

            return { error: null };
        } catch (err: any) {
            console.error('Error al eliminar factura:', err);
            toast.error('Error al eliminar factura', {
                description: err.message,
            });
            return { error: err };
        }
    };

    // Cargar facturas al montar el componente
    useEffect(() => {
        fetchInvoices();
    }, []);

    return {
        invoices,
        loading,
        error,
        fetchInvoices,
        createInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        generateInvoiceNumber,
    };
}
