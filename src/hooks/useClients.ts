import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Client {
    id: string;
    name: string;
    nit: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface ClientInput {
    name: string;
    nit: string;
    email: string;
    phone: string;
    address: string;
    city: string;
}

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar clientes (solo los no eliminados)
    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setClients(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error al cargar clientes:', err);
            setError(err.message);
            toast.error('Error al cargar clientes', {
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Crear cliente
    const createClient = async (clientData: ClientInput) => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([clientData])
                .select()
                .single();

            if (error) throw error;

            setClients((prev) => [data, ...prev]);
            toast.success('Cliente creado', {
                description: `${clientData.name} ha sido agregado correctamente`,
            });

            return { data, error: null };
        } catch (err: any) {
            console.error('Error al crear cliente:', err);

            // Mensaje específico para NIT duplicado
            if (err.code === '23505' && err.message.includes('nit')) {
                toast.error('NIT duplicado', {
                    description: 'Ya existe un cliente con este NIT',
                });
            } else {
                toast.error('Error al crear cliente', {
                    description: err.message,
                });
            }

            return { data: null, error: err };
        }
    };

    // Actualizar cliente
    const updateClient = async (id: string, clientData: Partial<ClientInput>) => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update(clientData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setClients((prev) =>
                prev.map((client) => (client.id === id ? data : client))
            );

            toast.success('Cliente actualizado', {
                description: 'Los cambios han sido guardados correctamente',
            });

            return { data, error: null };
        } catch (err: any) {
            console.error('Error al actualizar cliente:', err);
            toast.error('Error al actualizar cliente', {
                description: err.message,
            });
            return { data: null, error: err };
        }
    };

    // Eliminar cliente (soft delete)
    const deleteClient = async (id: string) => {
        try {
            const { error } = await supabase
                .from('clients')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setClients((prev) => prev.filter((client) => client.id !== id));

            toast.success('Cliente eliminado', {
                description: 'El cliente ha sido eliminado correctamente',
            });

            return { error: null };
        } catch (err: any) {
            console.error('Error al eliminar cliente:', err);
            toast.error('Error al eliminar cliente', {
                description: err.message,
            });
            return { error: err };
        }
    };

    // Cargar clientes al montar el componente
    useEffect(() => {
        fetchClients();
    }, []);

    return {
        clients,
        loading,
        error,
        fetchClients,
        createClient,
        updateClient,
        deleteClient,
    };
}
