import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  FileText,
  Mail,
  MoreVertical,
  Loader2,
  DollarSign,
  Trash2,
  Edit,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NewInvoiceDialog,
  type InvoiceFormData,
} from "@/components/dialogs/NewInvoiceDialog";
import { EditInvoiceDialog } from "@/components/dialogs/EditInvoiceDialog";
import { AIInvoiceAssistant } from "@/components/dialogs/AIInvoiceAssistant";
import {
  exportToCSV,
  formatCurrencyCOP,
  formatDateCO,
  downloadInvoicePDF,
} from "@/lib/export-utils";
import { toast } from "sonner";
import { useInvoices, type Invoice } from "@/hooks/useInvoices";
import { useSettings } from "@/hooks/useSettings";

export default function InvoicesPage() {
  const {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  } = useInvoices();
  const { settings } = useSettings();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Diálogos
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.nit.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Crear factura (manual) ────────────────────────────────────────────────
  const handleCreateInvoice = async (data: any) => {
    const invoiceData = {
      client_id: data.client_id,
      date: data.date.toISOString(),
      due_date: new Date(
        new Date(data.date).setDate(new Date(data.date).getDate() + 30)
      ).toISOString(),
      items: data.items.map((item: any) => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax: item.tax,
      })),
    };

    const { error } = await createInvoice(invoiceData);
    if (!error) setNewDialogOpen(false);
  };

  // ── Crear factura desde IA ────────────────────────────────────────────────
  const handleAICreateInvoice = async (data: {
    client_id: string;
    date: Date;
    items: {
      product_id: string | null;
      description: string;
      quantity: number;
      unit_price: number;
      tax: number;
    }[];
    notes?: string;
  }) => {
    const invoiceData = {
      client_id: data.client_id,
      date: data.date.toISOString(),
      due_date: new Date(
        new Date(data.date).setDate(new Date(data.date).getDate() + 30)
      ).toISOString(),
      notes: data.notes,
      items: data.items,
    };
    const { error } = await createInvoice(invoiceData);
    if (error) throw error;
  };

  // ── Editar factura ────────────────────────────────────────────────────────
  const handleOpenEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditDialogOpen(true);
  };

  const handleUpdateInvoice = async (
    id: string,
    data: {
      client_id: string;
      date: string;
      due_date: string;
      notes?: string;
      items: {
        product_id: string | null;
        description: string;
        quantity: number;
        unit_price: number;
        tax: number;
      }[];
    }
  ) => {
    return await updateInvoice(id, {
      ...data,
      date: new Date(data.date).toISOString(),
      due_date: new Date(data.due_date).toISOString(),
    });
  };

  // ── Exportar CSV ──────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const dataToExport = filteredInvoices.map((inv) => ({
      number: inv.number,
      client: inv.client?.name || "Cliente Eliminado",
      nit: inv.client?.nit || "N/A",
      date: new Date(inv.date).toLocaleDateString(),
      total: inv.total_amount,
      status: inv.status,
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

  // ── Descargar PDF ─────────────────────────────────────────────────────────
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes estar autenticado para generar el PDF");
        return;
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (settingsError) {
        toast.error("Error al obtener configuración");
        return;
      }

      const pdfData = {
        ...invoice,
        client: invoice.client?.name || "Cliente Eliminado",
        nit: invoice.client?.nit || "N/A",
        clientAddress: invoice.client?.address,
        clientPhone: invoice.client?.phone,
        clientCity: invoice.client?.city,
        clientEmail: invoice.client?.email,
        amount: invoice.total_amount,
        dueDate: invoice.due_date,
        items:
          invoice.invoice_items?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            tax: item.tax,
          })) || [],
      };

      // @ts-ignore
      downloadInvoicePDF(pdfData, settingsData);
      toast.success(`Descargando factura ${invoice.number}`);
    } catch (error: any) {
      toast.error("Error al generar PDF", { description: error.message });
    }
  };

  const getStatusConfig = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return { label: "Pagada", variant: "success" as const };
      case "pending":
        return { label: "Pendiente", variant: "warning" as const };
      case "overdue":
        return { label: "Vencida", variant: "error" as const };
      case "cancelled":
        return { label: "Anulada", variant: "neutral" as const };
      default:
        return { label: status, variant: "default" as const };
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
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Facturas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gestión de facturación y cobranza
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>

          <Button
            variant="outline"
            className="gap-2 border-violet-500/40 hover:border-violet-500 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400"
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Asistente IA</span>
          </Button>

          <Button
            variant="premium"
            className="gap-2"
            onClick={() => setNewDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────────── */}
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
              className="capitalize whitespace-nowrap text-xs sm:text-sm"
              size="sm"
            >
              {status === "all"
                ? "Todas"
                : status === "paid"
                  ? "Pagadas"
                  : status === "pending"
                    ? "Pendientes"
                    : status === "overdue"
                      ? "Vencidas"
                      : "Anuladas"}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Lista de facturas ─────────────────────────────────────────────── */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-card/50 rounded-xl border border-dashed border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            No hay facturas encontradas
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Crea una nueva factura para empezar.
          </p>
        </div>
      ) : (
        <>
          {/* ── Vista Móvil: tarjetas ────────────────────────────────── */}
          <div className="space-y-3 md:hidden">
            {filteredInvoices.map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status);
              return (
                <div
                  key={invoice.id}
                  className="bg-card border border-border rounded-xl p-4 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {invoice.number}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {invoice.client?.name || "Desconocido"}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {formatDateCO(invoice.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge
                        status={
                          statusConfig.variant === "error"
                            ? "destructive"
                            : statusConfig.variant === "default"
                              ? "neutral"
                              : (statusConfig.variant as any)
                        }
                      >
                        {statusConfig.label}
                      </StatusBadge>
                      <span className="font-bold text-sm text-foreground">
                        {formatCurrencyCOP(invoice.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones en móvil */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs h-8"
                      onClick={() => handleDownloadPDF(invoice)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </Button>
                    {invoice.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-8"
                        onClick={() => handleOpenEdit(invoice)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    )}
                    {invoice.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-8 text-success border-success/30 hover:bg-success/10"
                        onClick={() =>
                          updateInvoiceStatus(invoice.id, "paid")
                        }
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Pagada
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invoice.status !== "cancelled" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              updateInvoiceStatus(invoice.id, "cancelled")
                            }
                            className="text-destructive focus:text-destructive"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Anular
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => deleteInvoice(invoice.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Vista Desktop: tabla ─────────────────────────────────── */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Factura
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.map((invoice) => {
                    const statusConfig = getStatusConfig(invoice.status);
                    return (
                      <tr
                        key={invoice.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-semibold text-foreground block">
                                {invoice.number}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                FE electrónica
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {invoice.client?.name || "Desconocido"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {invoice.client?.nit || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDateCO(invoice.date)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-foreground">
                          {formatCurrencyCOP(invoice.total_amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge
                            status={
                              statusConfig.variant === "error"
                                ? "destructive"
                                : statusConfig.variant === "default"
                                  ? "neutral"
                                  : (statusConfig.variant as any)
                            }
                          >
                            {statusConfig.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(invoice)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(invoice)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar por Correo
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {invoice.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenEdit(invoice)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Factura
                                </DropdownMenuItem>
                              )}

                              {invoice.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateInvoiceStatus(invoice.id, "paid")
                                  }
                                  className="text-success"
                                >
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Marcar Pagada
                                </DropdownMenuItem>
                              )}

                              {invoice.status !== "cancelled" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateInvoiceStatus(
                                      invoice.id,
                                      "cancelled"
                                    )
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Anular Factura
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => deleteInvoice(invoice.id)}
                                  className="text-destructive focus:text-destructive"
                                >
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
        </>
      )}

      {/* ── Diálogos ─────────────────────────────────────────────────────── */}
      <NewInvoiceDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        onSave={handleCreateInvoice}
      />

      <EditInvoiceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        invoice={editingInvoice}
        onSave={handleUpdateInvoice}
      />

      <AIInvoiceAssistant
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onCreateInvoice={handleAICreateInvoice}
      />
    </div>
  );
}
