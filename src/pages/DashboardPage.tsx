import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { RecentSalesTable } from "@/components/dashboard/RecentSalesTable";
import {
  DollarSign,
  FileText,
  Users,
  Package,
  Plus,
  Download,
  BarChart3,
  Settings,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useSupabaseConnection } from "@/hooks/useSupabaseConnection";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrencyCOP } from "@/lib/export-utils";

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

function QuickActionButton({ icon: Icon, title, description, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 bg-card border border-border rounded-xl text-left w-full",
        "shadow-card hover:shadow-premium transition-all duration-200",
        "hover:border-primary/30 group"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors flex-shrink-0">
        <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const supabaseStatus = useSupabaseConnection();

  // Custom hooks para obtener datos
  const { invoices, loading: loadingInvoices } = useInvoices();
  const { clients, loading: loadingClients } = useClients();
  const { products, loading: loadingProducts } = useProducts();

  // Calcular KPIs
  const totalRevenue = invoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const invoiceCount = invoices.filter(inv => inv.status !== 'cancelled').length;

  // Calcular ventas de este mes vs mes pasado (simulado por ahora, o calculado real si hay datos)
  const currentMonth = new Date().getMonth();
  const currentMonthRevenue = invoices
    .filter(inv => new Date(inv.date).getMonth() === currentMonth && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const loading = loadingInvoices || loadingClients || loadingProducts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Indicador de Estado de Supabase */}
      <div className={cn(
        "rounded-xl border p-4 flex items-center gap-3 transition-all",
        supabaseStatus.isConnected
          ? "bg-success/10 border-success/30"
          : supabaseStatus.hasCredentials
            ? "bg-warning/10 border-warning/30"
            : "bg-muted border-border"
      )}>
        <div className="flex-shrink-0">
          {supabaseStatus.isConnected ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : supabaseStatus.hasCredentials ? (
            <AlertCircle className="w-5 h-5 text-warning" />
          ) : (
            <XCircle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Estado de Supabase:</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{supabaseStatus.message}</p>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title text-xl sm:text-2xl">Dashboard</h1>
        <p className="page-description text-sm">
          Resumen general de tu mueblería
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <KPICard
          title="Ingresos Totales"
          value={formatCurrencyCOP(totalRevenue)}
          subtitle="Histórico acumulado"
          icon={DollarSign}
          iconClassName="bg-success/10 text-success group-hover:bg-success"
        />
        <KPICard
          title="Facturas Emitidas"
          value={invoiceCount.toString()}
          subtitle="Facturas válidas"
          icon={FileText}
          iconClassName="bg-info/10 text-info group-hover:bg-info"
        />
        <KPICard
          title="Clientes Activos"
          value={clients.length.toString()}
          subtitle="Total registrados"
          icon={Users}
          iconClassName="bg-accent/10 text-accent group-hover:bg-accent"
        />
        <KPICard
          title="Productos"
          value={products.length.toString()}
          subtitle="En catálogo"
          icon={Package}
          iconClassName="bg-primary/10 text-primary group-hover:bg-primary"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Accesos Directos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <QuickActionButton
            icon={Plus}
            title="Nueva Factura"
            description="Crear factura electrónica"
            onClick={() => navigate("/facturas")}
          />
          <QuickActionButton
            icon={BarChart3}
            title="Ver Reportes"
            description="Análisis y estadísticas"
            onClick={() => navigate("/reportes")}
          />
          <QuickActionButton
            icon={Download}
            title="Exportar PDF"
            description="Descargar facturas"
            onClick={() => navigate("/facturas")}
          />
          <QuickActionButton
            icon={Settings}
            title="Configuración"
            description="Ajustes del sistema"
            onClick={() => navigate("/configuracion")}
          />
        </div>
      </div>

      {/* Recent Sales Table */}
      <RecentSalesTable />
    </div>
  );
}
