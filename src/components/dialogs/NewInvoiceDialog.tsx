import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileText, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyCOP } from "@/lib/export-utils";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useInvoices } from "@/hooks/useInvoices";
import { NewClientDialog, ClientFormData } from "@/components/dialogs/NewClientDialog";
import { NewProductDialog, ProductFormData } from "@/components/dialogs/NewProductDialog";

interface InvoiceItem {
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax: number;
}

export interface InvoiceFormData {
  client_id: string;
  date: Date;
  items: InvoiceItem[];
}

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (invoice: InvoiceFormData) => void;
}

const emptyItem: InvoiceItem = { product_id: null, description: "", quantity: 1, unit_price: 0, tax: 19 };

export function NewInvoiceDialog({ open, onOpenChange, onSave }: NewInvoiceDialogProps) {
  const { clients, createClient } = useClients();
  const { products, createProduct } = useProducts();
  const { generateInvoiceNumber } = useInvoices();

  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem]);
  const [nextNumber, setNextNumber] = useState("Cargando...");

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      generateInvoiceNumber().then(setNextNumber);
      setClientId("");
      setDate(new Date().toISOString().split('T')[0]);
      setItems([emptyItem]);
    }
  }, [open]);

  // Totales
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.tax / 100)), 0);
  const total = subtotal + totalTax;

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        product_id: product.id,
        description: product.name,
        quantity: 1,
        unit_price: product.price,
        tax: product.tax
      };
      setItems(newItems);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'unit_price' || field === 'tax') {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, emptyItem]);

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleCreateClient = async (data: ClientFormData) => {
    const { data: newClient, error } = await createClient(data);
    if (!error && newClient) {
      setClientDialogOpen(false);
      setClientId(newClient.id); // Seleccionar automáticamente
    }
  };

  const handleCreateProduct = async (data: ProductFormData) => {
    const { data: newProduct, error } = await createProduct({
      ...data,
      status: data.stock === 0 ? "inactive" : data.stock <= 5 ? "low_stock" : "active"
    });

    if (!error && newProduct) {
      setProductDialogOpen(false);
      // Opcional: Agregar automáticamente como ítem
      const emptyIndex = items.findIndex(i => !i.product_id);
      if (emptyIndex !== -1) {
        handleProductSelect(emptyIndex, newProduct.id);
      } else {
        // Si todos están llenos, añadir uno nuevo
        const newItems = [...items, {
          product_id: newProduct.id,
          description: newProduct.name,
          quantity: 1,
          unit_price: newProduct.price,
          tax: newProduct.tax
        }];
        setItems(newItems);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error("Selecciona un cliente");
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unit_price < 0)) {
      toast.error("Revisa los ítems de la factura");
      return;
    }

    onSave({
      client_id: clientId,
      date: new Date(date),
      items
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Nueva Factura de Venta
          </DialogTitle>
          <DialogDescription>
            Crea una nueva factura electrónica. Consecutivo actual: <span className="font-mono font-medium text-foreground">{nextNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Header Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <div className="flex gap-2">
                <select
                  className="w-full p-2 bg-background border border-input rounded-md"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.nit}
                    </option>
                  ))}
                </select>
                <Button type="button" size="icon" variant="outline" onClick={() => setClientDialogOpen(true)} title="Crear Cliente">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de Emisión</label>
              <input
                type="date"
                className="w-full p-2 bg-background border border-input rounded-md"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">Detalle de Productos/Servicios</h3>
                <Button type="button" size="sm" variant="ghost" className="text-primary text-xs h-6 px-2" onClick={() => setProductDialogOpen(true)}>
                  + Nuevo Producto
                </Button>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Ítem
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left w-[30%]">Producto</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-center w-[10%]">Cant.</th>
                    <th className="px-4 py-3 text-right w-[15%]">Valor Unit.</th>
                    <th className="px-4 py-3 text-center w-[10%]">IVA %</th>
                    <th className="px-4 py-3 text-right w-[15%]">Total</th>
                    <th className="px-2 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <select
                          className="w-full p-1 bg-transparent border-none focus:ring-0"
                          value={item.product_id || ""}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                        >
                          <option value="">- Seleccionar -</option>
                          {products
                            .filter(p => p.status === 'active' || p.status === 'low_stock')
                            .map(p => (
                              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                            ))
                          }
                          <option value="custom">Otro / Personalizado</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full p-1 bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Descripción del servicio..."
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          className="w-full p-1 text-center bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          className="w-full p-1 text-right bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-full p-1 text-center bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
                          value={item.tax}
                          onChange={(e) => updateItem(index, 'tax', e.target.value)}
                        />
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatCurrencyCOP((item.quantity * item.unit_price) * (1 + item.tax / 100))}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrencyCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos (IVA):</span>
                  <span>{formatCurrencyCOP(totalTax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total a Pagar:</span>
                  <span className="text-primary">{formatCurrencyCOP(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="premium">
              Crear Factura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <NewClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onSave={handleCreateClient}
      />

      <NewProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={handleCreateProduct}
      />
    </Dialog>
  );
}
