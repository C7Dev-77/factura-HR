import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { updatePassword, user, isRecovery } = useAuth();

    // Si no hay sesión de recuperación y no hay usuario, redirigir al login
    useEffect(() => {
        if (!user && !isRecovery) {
            // Dar un segundo para que Supabase procese el token del URL
            const timeout = setTimeout(() => {
                if (!user) {
                    navigate("/login");
                }
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [user, isRecovery, navigate]);

    const passwordsMatch = password === confirmPassword;
    const passwordValid = password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordsMatch) return;
        if (!passwordValid) return;

        setIsLoading(true);
        const { error } = await updatePassword(password);

        if (!error) {
            setSuccess(true);
            // Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[hsl(35,30%,95%)]">
            <div className="w-full max-w-md space-y-6">
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/50">
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                    <KeyRound className="w-7 h-7 text-primary" />
                                </div>
                                <h2
                                    className="text-2xl font-bold text-foreground"
                                    style={{ fontFamily: "'Georgia', serif" }}
                                >
                                    Nueva Contraseña
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className={cn(
                                                "w-full pl-11 pr-12 py-3 bg-muted/50 border rounded-xl",
                                                "text-foreground placeholder:text-muted-foreground text-sm",
                                                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                                                "transition-all duration-200",
                                                password && !passwordValid
                                                    ? "border-red-400"
                                                    : "border-border"
                                            )}
                                            required
                                            minLength={6}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {password && !passwordValid && (
                                        <p className="text-xs text-red-500">
                                            Debe tener al menos 6 caracteres
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite tu contraseña"
                                            className={cn(
                                                "w-full pl-11 pr-12 py-3 bg-muted/50 border rounded-xl",
                                                "text-foreground placeholder:text-muted-foreground text-sm",
                                                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                                                "transition-all duration-200",
                                                confirmPassword && !passwordsMatch
                                                    ? "border-red-400"
                                                    : "border-border"
                                            )}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {confirmPassword && !passwordsMatch && (
                                        <p className="text-xs text-red-500">
                                            Las contraseñas no coinciden
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm"
                                    disabled={isLoading || !passwordValid || !passwordsMatch}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        "Guardar Nueva Contraseña"
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 animate-bounce">
                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2
                                className="text-xl font-bold text-foreground mb-2"
                                style={{ fontFamily: "'Georgia', serif" }}
                            >
                                ¡Contraseña Actualizada!
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Tu contraseña se ha cambiado correctamente. Redirigiendo al
                                sistema...
                            </p>
                            <div className="flex justify-center">
                                <svg
                                    className="animate-spin h-5 w-5 text-primary"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    M&D Hijos del Rey — Sistema de Facturación Electrónica
                </p>
            </div>
        </div>
    );
}
