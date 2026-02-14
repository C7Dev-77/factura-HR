import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Building2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NewClientDialog, type ClientFormData } from "@/components/dialogs/NewClientDialog";
import { exportToCSV } from "@/lib/export-utils";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, notation: "compact" }).format(amount);
}

export default function ClientsPage() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const { invoices, loading: loadingInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Calcular estadísticas por cliente basadas en facturas reales
  const clientStats = useMemo(() => {
    const stats: Record<string, { invoiceCount: number; totalRevenue: number }> = {};
    invoices
      .filter(inv => inv.status !== 'cancelled')
      .forEach(inv => {
        if (!stats[inv.client_id]) {
          stats[inv.client_id] = { invoiceCount: 0, totalRevenue: 0 };
        }
        stats[inv.client_id].invoiceCount += 1;
        stats[inv.client_id].totalRevenue += inv.total_amount;
      });
    return stats;
  }, [invoices]);
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nit.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateOrUpdateClient = async (data: ClientFormData) => {
    if (editingId) {
      const { error } = await updateClient(editingId, data);
      if (!error) {
        setDialogOpen(false);
        setEditingId(null);
      }
    } else {
      const { error } = await createClient(data);
      if (!error) {
        setDialogOpen(false);
      }
    }
  };

  const handleEdit = (client: any) => {
    setEditingId(client.id);
    setDialogOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      await deleteClient(id);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredClients as unknown as Record<string, unknown>[],
      "clientes_md",
      [
        { key: "name", label: "Nombre" },
        { key: "nit", label: "NIT" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Teléfono" },
        { key: "city", label: "Ciudad" },
      ]
    );
    toast.success("Clientes exportados a CSV");
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const clientToEdit = clients.find(c => c.id === editingId);
  const initialData: ClientFormData | undefined = clientToEdit ? {
    name: clientToEdit.name,
    nit: clientToEdit.nit,
    email: clientToEdit.email,
    phone: clientToEdit.phone,
    address: clientToEdit.address,
    city: clientToEdit.city
  } : undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestión de clientes y terceros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button variant="premium" className="gap-2" onClick={() => {
            setEditingId(null);
            setDialogOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, NIT o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg",
            "text-foreground placeholder:text-muted-foreground text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          )}
        />
      </div>

      {/* Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-card/50 rounded-xl border border-dashed border-border">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No hay clientes encontrados</h3>
          <p className="text-muted-foreground text-sm mt-1">Intenta con otra búsqueda o crea un nuevo cliente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-card border border-border rounded-xl shadow-card hover:shadow-premium transition-all duration-200 overflow-hidden group">
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-1 text-sm sm:text-base">{client.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{client.nit}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client.email || "Sin email"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{client.phone || "Sin teléfono"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client.address || "Sin dirección"}, {client.city || "Sin ciudad"}</span>
                  </div>
                </div>
                {/* Nota: Estos campos requieren relaciones complejas, los ocultamos temporalmente o mostramos 0 */}
                <div className="flex gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Facturas</p>
                    <p className="text-lg font-semibold text-foreground">{clientStats[client.id]?.invoiceCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ingresos</p>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(clientStats[client.id]?.totalRevenue || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="px-5 sm:px-6 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => handleEdit(client)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClient(client.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewClientDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
        onSave={handleCreateOrUpdateClient}
        initialData={initialData}
      />
    </div>
  );
}
