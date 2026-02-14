import { useEffect, useState } from "react";
import { FileText, DollarSign, Users } from "lucide-react";
import mdLogo from "@/assets/md-logo.png";

export function LoginLeftPanel() {
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [invoiceDirection, setInvoiceDirection] = useState(1);
  const [revenueDirection, setRevenueDirection] = useState(1);
  const [clientsDirection, setClientsDirection] = useState(1);

  // Animación de contadores infinitos (nunca paran)
  useEffect(() => {
    // Contador de Facturas: oscila entre 1150 y 1350
    const invoiceInterval = setInterval(() => {
      setInvoiceCount((prev) => {
        const next = prev + (13 * invoiceDirection);
        if (next >= 1350) {
          setInvoiceDirection(-1);
          return 1350;
        }
        if (next <= 1150) {
          setInvoiceDirection(1);
          return 1150;
        }
        return next;
      });
    }, 50);

    // Contador de Ingresos: oscila entre 42M y 48M
    const revenueInterval = setInterval(() => {
      setRevenue((prev) => {
        const next = prev + (400000 * revenueDirection);
        if (next >= 48000000) {
          setRevenueDirection(-1);
          return 48000000;
        }
        if (next <= 42000000) {
          setRevenueDirection(1);
          return 42000000;
        }
        return next;
      });
    }, 50);

    // Contador de Clientes: oscila entre 45 y 55
    const clientsInterval = setInterval(() => {
      setClientsCount((prev) => {
        const next = prev + (1 * clientsDirection);
        if (next >= 55) {
          setClientsDirection(-1);
          return 55;
        }
        if (next <= 45) {
          setClientsDirection(1);
          return 45;
        }
        return next;
      });
    }, 100);

    return () => {
      clearInterval(invoiceInterval);
      clearInterval(revenueInterval);
      clearInterval(clientsInterval);
    };
  }, [invoiceDirection, revenueDirection, clientsDirection]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  };

  return (
    <div
      className="hidden lg:flex lg:w-1/2 xl:w-[50%] relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, hsl(25, 35%, 22%) 0%, hsl(25, 40%, 16%) 50%, hsl(25, 30%, 12%) 100%)",
      }}
    >
      {/* Decorative golden circles */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="500" cy="100" r="250" stroke="hsl(38, 60%, 50%)" strokeWidth="1.5" fill="none" />
        <circle cx="500" cy="100" r="200" stroke="hsl(38, 60%, 50%)" strokeWidth="0.8" fill="none" />
        <circle cx="500" cy="100" r="150" stroke="hsl(38, 50%, 45%)" strokeWidth="0.5" fill="none" />
        <circle cx="100" cy="700" r="300" stroke="hsl(38, 60%, 50%)" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="700" r="250" stroke="hsl(38, 60%, 50%)" strokeWidth="0.8" fill="none" />
        <circle cx="100" cy="700" r="200" stroke="hsl(38, 50%, 45%)" strokeWidth="0.5" fill="none" />
        <circle cx="550" cy="500" r="180" stroke="hsl(38, 55%, 48%)" strokeWidth="1" fill="none" />
        <circle cx="550" cy="500" r="130" stroke="hsl(38, 55%, 48%)" strokeWidth="0.6" fill="none" />
        <circle cx="300" cy="200" r="80" stroke="hsl(38, 50%, 45%)" strokeWidth="0.5" fill="none" />
        <circle cx="200" cy="400" r="60" stroke="hsl(38, 50%, 45%)" strokeWidth="0.5" fill="none" />
      </svg>

      {/* Facturas flotantes animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-invoice opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          >
            <FileText className="w-8 h-8 xl:w-12 xl:h-12 text-primary" />
          </div>
        ))}
      </div>

      {/* Números flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["$", "45M", "128", "FE-001", "19%", "COP"].map((num, i) => (
          <div
            key={num}
            className="absolute animate-float-number opacity-20 text-primary font-mono font-bold"
            style={{
              left: `${10 + (i * 15)}%`,
              top: `${20 + (i * 12)}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${20 + Math.random() * 10}s`,
              fontSize: `${1.2 + Math.random() * 0.8}rem`,
            }}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 xl:p-16 space-y-8">
        {/* Logo con animación de pulso sutil */}
        <img
          src={mdLogo}
          alt="M&D Hijos del Rey"
          className="w-36 h-36 xl:w-44 xl:h-44 object-contain drop-shadow-2xl animate-pulse-slow"
        />

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl xl:text-2xl font-semibold text-primary-foreground tracking-wide">
            Sistema de Facturación
          </h2>
          <h2 className="text-xl xl:text-2xl font-semibold text-primary-foreground tracking-wide">
            Electrónica
          </h2>
        </div>

        {/* Estadísticas animadas */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary-foreground/70">Facturas</span>
            </div>
            <p className="text-xl font-bold text-primary-foreground tabular-nums">
              {invoiceCount.toLocaleString("es-CO")}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary-foreground/70">Ingresos</span>
            </div>
            <p className="text-xl font-bold text-primary-foreground tabular-nums">
              {formatCurrency(revenue)}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary-foreground/70">Clientes</span>
            </div>
            <p className="text-xl font-bold text-primary-foreground tabular-nums">
              {clientsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Estilos de animación personalizados */}
      <style>{`
        @keyframes float-invoice {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) translateX(20px) rotate(5deg);
          }
          50% {
            transform: translateY(-15px) translateX(-20px) rotate(-3deg);
          }
          75% {
            transform: translateY(-40px) translateX(10px) rotate(2deg);
          }
        }
        
        @keyframes float-number {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-50px) translateX(30px);
            opacity: 0.3;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
        
        .animate-float-invoice {
          animation: float-invoice linear infinite;
        }
        
        .animate-float-number {
          animation: float-number linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
