import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, FileText, Mail, MessageCircle, MoreVertical, Loader2, DollarSign, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewInvoiceDialog, type InvoiceFormData } from "@/components/dialogs/NewInvoiceDialog";
import { exportToCSV, formatCurrencyCOP, formatDateCO, downloadInvoicePDF } from "@/lib/export-utils";
import { toast } from "sonner";
import { useInvoices, type Invoice } from "@/hooks/useInvoices";
import { useSettings } from "@/hooks/useSettings";

export default function InvoicesPage() {
  const { invoices, loading, createInvoice, updateInvoiceStatus, deleteInvoice } = useInvoices();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.nit.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (data: any) => {
    // Transformar datos del diálogo al formato esperado por el hook
    const invoiceData = {
      client_id: data.client_id,
      date: data.date.toISOString(),
      due_date: new Date(new Date(data.date).setDate(new Date(data.date).getDate() + 30)).toISOString(), // Por defecto 30 días
      items: data.items.map((item: any) => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax: item.tax
      }))
    };

    const { error } = await createInvoice(invoiceData);

    if (!error) {
      setDialogOpen(false);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = filteredInvoices.map(inv => ({
      number: inv.number,
      client: inv.client?.name || 'Cliente Eliminado',
      nit: inv.client?.nit || 'N/A',
      date: new Date(inv.date).toLocaleDateString(),
      total: inv.total_amount,
      status: inv.status
    }));

    exportToCSV(
      dataToExport as unknown as Record<string, unknown>[],
      "facturas_md",
      [
        { key: "number", label: "Número" },
        { key: "client", label: "Cliente" },
        { key: "nit", label: "NIT" },
        { key: "date", label: "Fecha" },
        { key: "total", label: "Total" },
        { key: "status", label: "Estado" },
      ]
    );
    toast.success("Facturas exportadas a CSV");
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Error', {
          description: 'Debes estar autenticado para generar el PDF',
        });
        return;
      }

      // Obtener configuración fresca directamente de Supabase para asegurar datos actualizados
      const { data: settingsData, error: settingsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (settingsError) {
        console.error('Error al obtener configuración:', settingsError);
        toast.error('Error al obtener configuración', {
          description: 'No se pudo cargar la configuración de la empresa',
        });
        return;
      }

      console.log('Configuración cargada para PDF:', settingsData); // Para debug

      // Adaptar la factura al formato que espera la utilidad PDF
      const pdfData = {
        ...invoice,
        client: invoice.client?.name || 'Cliente Eliminado',
        nit: invoice.client?.nit || 'N/A',
        clientAddress: invoice.client?.address,
        clientPhone: invoice.client?.phone,
        clientCity: invoice.client?.city,
        clientEmail: invoice.client?.email,
        amount: invoice.total_amount,
        dueDate: invoice.due_date,
        items: invoice.invoice_items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          tax: item.tax
        })) || []
      };

      // @ts-ignore - Tipos ligeramente diferentes pero compatibles
      downloadInvoicePDF(pdfData, settingsData);
      toast.success(`Descargando factura ${invoice.number}`);
    } catch (error: any) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar PDF', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    }
  };

  const getStatusConfig = (status: Invoice["status"]) => {
    switch (status) {
      case "paid": return { label: "Pagada", variant: "success" as const };
      case "pending": return { label: "Pendiente", variant: "warning" as const };
      case "overdue": return { label: "Vencida", variant: "error" as const };
      case "cancelled": return { label: "Anulada", variant: "neutral" as const };
      default: return { label: status, variant: "default" as const };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestión de facturación y cobranza</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button variant="premium" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg",
              "text-foreground placeholder:text-muted-foreground text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            )}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {["all", "paid", "pending", "overdue", "cancelled"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "premium" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="capitalize whitespace-nowrap"
            >
              {status === "all" ? "Todas" : status === "paid" ? "Pagadas" : status === "pending" ? "Pendientes" : status === "overdue" ? "Vencidas" : "Anuladas"}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabla de Facturas */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-card/50 rounded-xl border border-dashed border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No hay facturas encontradas</h3>
          <p className="text-muted-foreground text-sm mt-1">Crea una nueva factura para empezar.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Factura</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Fecha</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  return (
                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">{invoice.number}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">FE electrónica</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{invoice.client?.name || 'Desconocido'}</span>
                          <span className="text-xs text-muted-foreground">{invoice.client?.nit || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                        {formatDateCO(invoice.date)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">
                        {formatCurrencyCOP(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={statusConfig.variant === 'error' ? 'destructive' : statusConfig.variant === 'default' ? 'neutral' : statusConfig.variant as any}>
                          {statusConfig.label}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Enviar por Correo
                            </DropdownMenuItem>

                            {invoice.status === 'pending' && (
                              <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'paid')} className="text-success">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Marcar Pagada
                              </DropdownMenuItem>
                            )}

                            {invoice.status !== 'cancelled' ? (
                              <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'cancelled')} className="text-destructive focus:text-destructive">
                                <FileText className="w-4 h-4 mr-2" />
                                Anular Factura
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => deleteInvoice(invoice.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diálogo de Nueva Factura - Necesitará actualización para usar clientes y productos reales */}
      <NewInvoiceDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleCreateInvoice} />
    </div>
  );
}
