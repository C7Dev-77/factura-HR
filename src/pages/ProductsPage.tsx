import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Package, BarChart2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { NewProductDialog, type ProductFormData } from "@/components/dialogs/NewProductDialog";
import { exportToCSV, formatCurrencyCOP } from "@/lib/export-utils";
import { toast } from "sonner";
import { useProducts, type Product } from "@/hooks/useProducts";

// Importar categorías directamente del hook para mantener sincronización
import { PRODUCT_CATEGORIES } from "@/hooks/useProducts";

export default function ProductsPage() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return { variant: "success" as const, label: "Activo" };
      case "inactive":
        return { variant: "destructive" as const, label: "Inactivo" };
      case "low_stock":
        return { variant: "warning" as const, label: "Stock Bajo" };
      default:
        return { variant: "neutral" as const, label: status };
    }
  };

  const handleCreateOrUpdateProduct = async (data: ProductFormData) => {
    if (editingId) {
      const { error } = await updateProduct(editingId, data);
      if (!error) {
        setDialogOpen(false);
        setEditingId(null);
      }
    } else {
      const { error } = await createProduct({
        ...data,
        status: data.stock === 0 ? "inactive" : data.stock <= 5 ? "low_stock" : "active"
      });

      if (!error) {
        setDialogOpen(false);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      await deleteProduct(id);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredProducts as unknown as Record<string, unknown>[],
      "productos_md",
      [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        { key: "category", label: "Categoría" },
        { key: "price", label: "Precio" },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Estado" },
      ]
    );
    toast.success("Productos exportados a CSV");
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const productToEdit = products.find(p => p.id === editingId);
  const initialData: ProductFormData | undefined = productToEdit ? {
    code: productToEdit.code,
    name: productToEdit.name,
    description: productToEdit.description,
    category: productToEdit.category,
    price: productToEdit.price,
    tax: productToEdit.tax,
    stock: productToEdit.stock,
  } : undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Catálogo de productos y servicios</p>
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
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
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
          <Button
            variant={selectedCategory === "all" ? "premium" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          {PRODUCT_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "premium" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-card/50 rounded-xl border border-dashed border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No hay productos encontrados</h3>
          <p className="text-muted-foreground text-sm mt-1">Intenta con otra búsqueda o agrega un nuevo producto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredProducts.map((product) => {
            return (
              <div key={product.id} className="bg-card border border-border rounded-xl shadow-card hover:shadow-premium transition-all duration-200 overflow-hidden group">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1 text-sm sm:text-base">{product.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{product.code}</p>
                      </div>
                    </div>
                    {(() => {
                      const config = getStatusConfig(product.status);
                      return <StatusBadge status={config.variant}>{config.label}</StatusBadge>;
                    })()}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                    {product.description || "Sin descripción disponible."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Precio</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrencyCOP(product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Stock</p>
                      <div className="flex items-center justify-end gap-2">
                        <BarChart2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-lg font-bold text-foreground">{product.stock}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-3 bg-muted/30 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-background border border-border text-foreground/70">
                    {product.category}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => handleEdit(product)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
        onSave={handleCreateOrUpdateProduct}
        initialData={initialData}
      />
    </div>
  );
}
