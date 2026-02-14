import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  Hash,
  Settings as SettingsIcon,
  Save,
  Upload,
  ChevronRight,
  Shield,
  Bell,
  FileText,
  CreditCard,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

// ... (resto de imports)

// ... (componente SettingsPage y otros componentes auxiliares)

function UsuariosSettings() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // En un escenario real, esto debería estar protegido o ser una Edge Function
      // Por ahora, listaremos los perfiles visibles
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsCard title="Gestión de Usuarios" description="Usuarios registrados en el sistema">
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <Button variant="premium" size="sm" className="gap-2" disabled>
            <Users className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rol</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        {/* Como no guardamos nombre en auth, usamos el email o company_name */}
                        <p className="font-medium text-foreground">{user.company_name || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.id === currentUser?.id ? 'Administrador' : 'Usuario'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Activo
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.id === currentUser?.id && (
                        <span className="text-xs text-muted-foreground italic">Tu usuario</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const sections: SettingsSection[] = [
  { id: "empresa", title: "Datos de la Empresa", description: "Información fiscal y comercial", icon: Building2 },
  { id: "usuarios", title: "Usuarios", description: "Gestión de usuarios y permisos", icon: Users },
  { id: "numeracion", title: "Numeración", description: "Resoluciones y rangos de facturación", icon: Hash },
  { id: "dian", title: "Integración DIAN", description: "Configuración de facturación electrónica", icon: Shield },
  { id: "notificaciones", title: "Notificaciones", description: "Alertas y correos automáticos", icon: Bell },
  { id: "plantillas", title: "Plantillas", description: "Diseño de facturas y documentos", icon: FileText },
  { id: "pagos", title: "Métodos de Pago", description: "Configuración de formas de pago", icon: CreditCard },
  { id: "sistema", title: "Sistema", description: "Preferencias generales", icon: SettingsIcon },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("empresa");

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administre la configuración del sistema de facturación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200",
                  "border-b border-border last:border-b-0",
                  activeSection === section.id
                    ? "bg-primary/5 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <section.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  activeSection === section.id ? "text-primary" : ""
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    activeSection === section.id && "text-foreground"
                  )}>{section.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform",
                  activeSection === section.id && "text-primary rotate-90"
                )} />
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeSection === "empresa" && <EmpresaSettings />}
          {activeSection === "usuarios" && <UsuariosSettings />}
          {activeSection === "numeracion" && <NumeracionSettings />}
          {activeSection === "dian" && <DianSettings />}
          {activeSection === "notificaciones" && <NotificacionesSettings />}
          {activeSection === "plantillas" && <PlantillasSettings />}
          {activeSection === "pagos" && <PagosSettings />}
          {activeSection === "sistema" && <SistemaSettings />}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false
}: {
  label: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2.5 bg-background border border-border rounded-lg",
          "text-foreground placeholder:text-muted-foreground text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-all duration-200",
          disabled && "opacity-50 cursor-not-allowed bg-muted"
        )}
      />
    </div>
  );
}

function EmpresaSettings() {
  const { settings, loading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    company_name: "",
    nit: "",
    phone: "",
    address: "",
    city: "",
    email: "",
    logo_url: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || "",
        nit: settings.nit || "",
        phone: settings.phone || "",
        address: settings.address || "",
        city: settings.city || "",
        email: settings.email || "",
        logo_url: settings.logo_url || ""
      });
    }
  }, [settings]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo es muy grande', { description: 'Máximo 2MB' });
      return;
    }

    // Validar tipo
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Formato no válido', { description: 'Solo PNG, JPG o WebP' });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const fileExt = file.name.split('.').pop();
      const filePath = `logos/${user.id}/logo.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      // Guardar URL en el perfil
      const logoUrl = `${publicUrl}?t=${Date.now()}`; // Cache busting
      await updateSettings({ logo_url: logoUrl });
      setFormData(prev => ({ ...prev, logo_url: logoUrl }));

      toast.success('Logo actualizado', { description: 'El logo se mostrará en tus facturas' });
    } catch (err: any) {
      console.error('Error al subir logo:', err);
      toast.error('Error al subir logo', { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateSettings(formData);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <SettingsCard title="Información de la Empresa" description="Datos fiscales y comerciales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Razón Social"
            value={formData.company_name}
            onChange={(e) => handleChange("company_name", e.target.value)}
          />
          <InputField
            label="NIT"
            value={formData.nit}
            onChange={(e) => handleChange("nit", e.target.value)}
          />
          <InputField label="Nombre Comercial" value={formData.company_name} disabled />
          <InputField label="Régimen Tributario" value="Responsable de IVA" disabled />
          <InputField label="Actividad Económica" value="4754 - Comercio de muebles y accesorios" disabled />
          <InputField label="Código CIIU" value="4754" disabled />
        </div>
      </SettingsCard>

      <SettingsCard title="Dirección y Contacto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Dirección"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <InputField
            label="Ciudad"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <InputField
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <InputField
            label="Email (aparece en facturas)"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="empresa@example.com"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Logo de la Empresa" description="Este logo aparecerá en las facturas generadas">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Building2 className="w-10 h-10 text-primary/50" />
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="logo-upload">
              <Button variant="outline" className="gap-2" disabled={uploading} asChild>
                <span>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? 'Subiendo...' : 'Subir Logo'}
                </span>
              </Button>
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">PNG, JPG o WebP. Máximo 2MB. Recomendado: 200x200px</p>
            {formData.logo_url && (
              <p className="text-xs text-success flex items-center gap-1">
                ✓ Logo configurado
              </p>
            )}
          </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button variant="premium" className="gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}



function NumeracionSettings() {
  const { settings, loading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    resolution_number: "",
    resolution_date: "",
    prefix: "",
    start_range: 0,
    end_range: 0,
    current_number: 0
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        resolution_number: settings.resolution_number || "",
        resolution_date: settings.resolution_date || "",
        prefix: settings.prefix || "",
        start_range: settings.start_range || 1,
        end_range: settings.end_range || 10000,
        current_number: settings.current_number || 1
      });
    }
  }, [settings]);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(formData);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <SettingsCard title="Resolución de Facturación" description="Configuración de la resolución DIAN">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Número de Resolución"
            value={formData.resolution_number}
            onChange={(e) => handleChange("resolution_number", e.target.value)}
          />
          <InputField
            label="Fecha de Resolución"
            type="date"
            value={formData.resolution_date}
            onChange={(e) => handleChange("resolution_date", e.target.value)}
          />
          <InputField
            label="Prefijo"
            value={formData.prefix}
            onChange={(e) => handleChange("prefix", e.target.value)}
          />
          <InputField
            label="Rango Inicial"
            type="number"
            value={formData.start_range}
            onChange={(e) => handleChange("start_range", parseInt(e.target.value) || 0)}
          />
          <InputField
            label="Rango Final"
            type="number"
            value={formData.end_range}
            onChange={(e) => handleChange("end_range", parseInt(e.target.value) || 0)}
          />
          <InputField label="Fecha de Vencimiento" value="2026-01-15" type="date" disabled />
        </div>
      </SettingsCard>

      <SettingsCard title="Consecutivo Actual">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Última factura emitida</p>
            <p className="text-2xl font-bold text-foreground">
              {formData.prefix}-{String(formData.current_number).padStart(6, '0')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Facturas restantes</p>
            <p className="text-2xl font-bold text-success">
              {formData.end_range - formData.current_number}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <InputField
            label="Ajustar Consecutivo Manualmente"
            type="number"
            value={formData.current_number}
            onChange={(e) => handleChange("current_number", parseInt(e.target.value) || 0)}
          />
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button variant="premium" className="gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}

function DianSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Integración DIAN" description="Configuración de facturación electrónica">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-success" />
              <div>
                <p className="font-medium text-foreground">Conexión Activa</p>
                <p className="text-sm text-muted-foreground">Facturación electrónica habilitada</p>
              </div>
            </div>
            <span className="badge-success">Conectado</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Ambiente" value="Producción" />
            <InputField label="Tipo de Operación" value="Estándar" />
            <InputField label="Set de Pruebas" value="Completado" />
            <InputField label="Última Sincronización" value="30/01/2026 10:45" />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Certificado Digital">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Certificado P12</p>
            <p className="text-sm text-muted-foreground">Válido hasta: 15/06/2026</p>
          </div>
          <Button variant="outline">Actualizar</Button>
        </div>
      </SettingsCard>
    </div>
  );
}

function NotificacionesSettings() {
  return (
    <SettingsCard title="Configuración de Notificaciones">
      <div className="space-y-6">
        {[
          { label: "Enviar factura por email automáticamente", enabled: true },
          { label: "Notificar cuando una factura vence", enabled: true },
          { label: "Recordatorio de pago a clientes", enabled: false },
          { label: "Resumen diario de facturación", enabled: true },
          { label: "Alertas de errores DIAN", enabled: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <span className="text-foreground">{item.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

function PlantillasSettings() {
  return (
    <SettingsCard title="Plantillas de Documentos" description="Personalice el diseño de sus facturas">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Factura Estándar", "Factura Simplificada", "Nota Crédito", "Nota Débito"].map((template) => (
          <div key={template} className="p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer">
            <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">{template}</p>
            <p className="text-xs text-muted-foreground">Plantilla DIAN</p>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

function PagosSettings() {
  return (
    <SettingsCard title="Métodos de Pago" description="Configure las formas de pago aceptadas">
      <div className="space-y-4">
        {[
          { name: "Transferencia Bancaria", enabled: true },
          { name: "Efectivo", enabled: true },
          { name: "Tarjeta de Crédito", enabled: false },
          { name: "PSE", enabled: true },
          { name: "Cheque", enabled: false },
        ].map((method) => (
          <div key={method.name} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{method.name}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

function SistemaSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Preferencias del Sistema">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zona Horaria</label>
            <select className={cn(
              "w-full px-4 py-2.5 bg-background border border-border rounded-lg",
              "text-foreground text-sm cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}>
              <option>America/Bogota (UTC-5)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Formato de Fecha</label>
            <select className={cn(
              "w-full px-4 py-2.5 bg-background border border-border rounded-lg",
              "text-foreground text-sm cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}>
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Moneda</label>
            <select className={cn(
              "w-full px-4 py-2.5 bg-background border border-border rounded-lg",
              "text-foreground text-sm cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}>
              <option>COP - Peso Colombiano</option>
              <option>USD - Dólar Americano</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Idioma</label>
            <select className={cn(
              "w-full px-4 py-2.5 bg-background border border-border rounded-lg",
              "text-foreground text-sm cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}>
              <option>Español (Colombia)</option>
              <option>English (US)</option>
            </select>
          </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button variant="premium" className="gap-2">
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
