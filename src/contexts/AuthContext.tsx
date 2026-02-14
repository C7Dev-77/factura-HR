// Contexto de Autenticación con Supabase
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isRecovery: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, companyData?: CompanyData) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

interface CompanyData {
    companyName: string;
    nit: string;
    phone?: string;
    address?: string;
    city?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRecovery, setIsRecovery] = useState(false);

    useEffect(() => {
        // Verificar sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Escuchar cambios en la autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Detectar cuando el usuario viene de un enlace de recuperación
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovery(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error('Error al iniciar sesión', {
                    description: error.message === 'Invalid login credentials'
                        ? 'Correo o contraseña incorrectos'
                        : error.message,
                });
                return { error };
            }

            toast.success('¡Bienvenido!', {
                description: 'Has iniciado sesión correctamente',
            });

            return { error: null };
        } catch (error) {
            const authError = error as AuthError;
            toast.error('Error inesperado', {
                description: authError.message,
            });
            return { error: authError };
        }
    };

    const signUp = async (email: string, password: string, companyData?: CompanyData) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                toast.error('Error al registrarse', {
                    description: error.message,
                });
                return { error };
            }

            // Si se proporcionó información de la empresa, crear el perfil
            if (data.user && companyData) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: data.user.email!,
                        company_name: companyData.companyName,
                        nit: companyData.nit,
                        phone: companyData.phone || null,
                        address: companyData.address || null,
                        city: companyData.city || null,
                    });

                if (profileError) {
                    console.error('Error al crear perfil:', profileError);
                    toast.warning('Usuario creado', {
                        description: 'Pero hubo un problema al guardar la información de la empresa',
                    });
                }
            }

            toast.success('¡Cuenta creada!', {
                description: 'Ya puedes iniciar sesión con tus credenciales',
            });

            return { error: null };
        } catch (error) {
            const authError = error as AuthError;
            toast.error('Error inesperado', {
                description: authError.message,
            });
            return { error: authError };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            setIsRecovery(false);

            if (error) {
                toast.error('Error al cerrar sesión', {
                    description: error.message,
                });
                return;
            }

            toast.success('Sesión cerrada', {
                description: 'Hasta pronto',
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            toast.error('Error inesperado al cerrar sesión');
        }
    };

    const resetPasswordForEmail = async (email: string) => {
        try {
            const redirectUrl = `${window.location.origin}/actualizar-contrasena`;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) {
                toast.error('Error al enviar correo', {
                    description: error.message,
                });
                return { error };
            }

            toast.success('Correo enviado', {
                description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
            });
            return { error: null };
        } catch (error) {
            const authError = error as AuthError;
            toast.error('Error inesperado', {
                description: authError.message,
            });
            return { error: authError };
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                toast.error('Error al actualizar contraseña', {
                    description: error.message,
                });
                return { error };
            }

            setIsRecovery(false);
            toast.success('¡Contraseña actualizada!', {
                description: 'Tu nueva contraseña se guardó correctamente.',
            });
            return { error: null };
        } catch (error) {
            const authError = error as AuthError;
            toast.error('Error inesperado', {
                description: authError.message,
            });
            return { error: authError };
        }
    };

    const value = {
        user,
        session,
        loading,
        isRecovery,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}
