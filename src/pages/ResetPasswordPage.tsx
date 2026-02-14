import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { resetPasswordForEmail } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        const { error } = await resetPasswordForEmail(email);

        if (!error) {
            setSent(true);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[hsl(35,30%,95%)]">
            <div className="w-full max-w-md space-y-6">
                {/* Back to login */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                </Link>

                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/50">
                    {!sent ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h2
                                    className="text-2xl font-bold text-foreground"
                                    style={{ fontFamily: "'Georgia', serif" }}
                                >
                                    Recuperar Contraseña
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className={cn(
                                            "w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-xl",
                                            "text-foreground placeholder:text-muted-foreground text-sm",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                                            "transition-all duration-200"
                                        )}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : (
                                        "Enviar Enlace de Recuperación"
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5">
                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2
                                className="text-xl font-bold text-foreground mb-2"
                                style={{ fontFamily: "'Georgia', serif" }}
                            >
                                ¡Correo Enviado!
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                Hemos enviado un enlace de recuperación a{" "}
                                <span className="font-medium text-foreground">{email}</span>.
                                <br />
                                Revisa tu bandeja de entrada y sigue las instrucciones.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => setSent(false)}
                                    variant="outline"
                                    className="w-full rounded-xl"
                                >
                                    Enviar de nuevo
                                </Button>
                                <Link to="/login">
                                    <Button variant="ghost" className="w-full rounded-xl">
                                        Volver al inicio de sesión
                                    </Button>
                                </Link>
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
