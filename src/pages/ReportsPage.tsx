import {
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/dashboard/KPICard";
import { useInvoices } from "@/hooks/useInvoices";
import { formatCurrencyCOP } from "@/lib/export-utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const { invoices, loading } = useInvoices();

  // Filtrar facturas válidas (no canceladas)
  const validInvoices = invoices.filter(inv => inv.status !== 'cancelled');

  // KPI 1: Ingresos Totales (Histórico)
  const totalRevenue = validInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  // KPI 2: Total Facturas
  const totalInvoices = validInvoices.length;

  // KPI 3: Promedio por Factura
  const averageTicket = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  // KPI 4: Cartera Pendiente (Facturas pendientes o vencidas)
  const pendingRevenue = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  // Chart 1: Ingresos Mensuales (Últimos 6 meses)
  const monthlyData = (() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();
    const result = [];

    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      const monthName = months[monthIndex];

      const revenue = validInvoices
        .filter(inv => {
          const invDate = new Date(inv.date);
          return invDate.getMonth() === monthIndex && invDate.getFullYear() === year;
        })
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      result.push({ month: monthName, ingresos: revenue });
    }
    return result;
  })();

  // Chart 2: Estado de Facturas
  const statusData = [
    { name: "Pagadas", value: invoices.filter(i => i.status === 'paid').length, color: "hsl(145, 40%, 40%)" },
    { name: "Pendientes", value: invoices.filter(i => i.status === 'pending').length, color: "hsl(38, 90%, 55%)" },
    { name: "Vencidas", value: invoices.filter(i => i.status === 'overdue').length, color: "hsl(0, 50%, 45%)" },
    { name: "Anuladas", value: invoices.filter(i => i.status === 'cancelled').length, color: "hsl(25, 15%, 45%)" },
  ].filter(item => item.value > 0);

  // Top Clients logic
  const topClients = (() => {
    const clientRevenue: Record<string, number> = {};

    validInvoices.forEach(inv => {
      const clientName = inv.client?.name || 'Cliente desconocido';
      clientRevenue[clientName] = (clientRevenue[clientName] || 0) + inv.total_amount;
    });

    const sortedClients = Object.entries(clientRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const total = Object.values(clientRevenue).reduce((a, b) => a + b, 0);

    return sortedClients.map(client => ({
      ...client,
      percentage: total > 0 ? Math.round((client.revenue / total) * 100) : 0
    }));
  })();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Análisis financiero y estadísticas del negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="premium" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard
          title="Ingresos Totales"
          value={formatCurrencyCOP(totalRevenue)}
          subtitle="Histórico acumulado"
          icon={DollarSign}
          iconClassName="bg-success/10 text-success"
        />
        <KPICard
          title="Facturas Emitidas"
          value={totalInvoices.toString()}
          subtitle="Total histórico"
          icon={FileText}
          iconClassName="bg-info/10 text-info"
        />
        <KPICard
          title="Promedio por Factura"
          value={formatCurrencyCOP(averageTicket)}
          icon={TrendingUp}
          iconClassName="bg-accent/10 text-accent"
        />
        <KPICard
          title="Cartera Pendiente"
          value={formatCurrencyCOP(pendingRevenue)}
          subtitle="Por cobrar"
          icon={TrendingDown}
          iconClassName="bg-warning/10 text-warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Ingresos Mensuales</h3>
              <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-6 h-80">
            {monthlyData.every(d => d.ingresos === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                <p>No hay datos suficientes para mostrar la gráfica</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                  <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
                  <YAxis stroke="hsl(25, 15%, 45%)" fontSize={12} tickFormatter={(v) => `$${v / 1000000}M`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(40, 30%, 99%)",
                      border: "1px solid hsl(35, 20%, 88%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrencyCOP(value)}
                  />
                  <Bar dataKey="ingresos" fill="hsl(25, 40%, 28%)" radius={[4, 4, 0, 0]} name="Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Invoice Status Pie Chart */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Estado de Facturas</h3>
              <p className="text-sm text-muted-foreground">Distribución actual</p>
            </div>
            <PieChart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-6 h-80">
            {totalInvoices === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <PieChart className="w-12 h-12 mb-2 opacity-20" />
                <p>No hay facturas registradas</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="70%">
                  <RechartsPie>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Principales Clientes</h3>
          <p className="text-sm text-muted-foreground">Por volumen de facturación</p>
        </div>
        <div className="p-6">
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No hay datos de clientes aún.
            </div>
          ) : (
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 sm:gap-4 justify-between mb-1">
                      <span className="font-medium text-foreground">{client.name}</span>
                      <span className="text-sm font-semibold text-foreground">{formatCurrencyCOP(client.revenue)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${client.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{client.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
