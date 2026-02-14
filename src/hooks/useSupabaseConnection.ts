// Hook personalizado para verificar la conexión con Supabase
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SupabaseStatus {
    isConnected: boolean;
    hasCredentials: boolean;
    error: string | null;
    message: string;
}

export function useSupabaseConnection(): SupabaseStatus {
    const [status, setStatus] = useState<SupabaseStatus>({
        isConnected: false,
        hasCredentials: false,
        error: null,
        message: 'Verificando conexión...',
    });

    useEffect(() => {
        async function checkConnection() {
            try {
                // Verificar si las credenciales están configuradas
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

                if (!supabaseUrl || !supabaseKey) {
                    setStatus({
                        isConnected: false,
                        hasCredentials: false,
                        error: 'Credenciales no configuradas',
                        message: '⚠️ Por favor configura las variables de entorno en el archivo .env',
                    });
                    return;
                }

                // Intentar hacer una consulta simple para verificar la conexión
                const { data, error } = await supabase
                    .from('clients')
                    .select('count')
                    .limit(1);

                if (error) {
                    setStatus({
                        isConnected: false,
                        hasCredentials: true,
                        error: error.message,
                        message: `❌ Error de conexión: ${error.message}`,
                    });
                    return;
                }

                setStatus({
                    isConnected: true,
                    hasCredentials: true,
                    error: null,
                    message: '✅ Conectado a Supabase correctamente',
                });
            } catch (err) {
                setStatus({
                    isConnected: false,
                    hasCredentials: true,
                    error: err instanceof Error ? err.message : 'Error desconocido',
                    message: '❌ Error inesperado al conectar',
                });
            }
        }

        checkConnection();
    }, []);

    return status;
}
