import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon, label, collapsed, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        "text-sidebar-foreground/70 hover:text-sidebar-foreground",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-gold"
          : "hover:bg-sidebar-accent"
      )}
    >
      <span className={cn("flex-shrink-0", isActive && "text-sidebar-primary-foreground")}>
        {icon}
      </span>
      {!collapsed && (
        <span className="text-sm truncate">{label}</span>
      )}
    </NavLink>
  );
}

const navItems = [
  { to: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
  { to: "/facturas", icon: <FileText className="w-5 h-5" />, label: "Facturas" },
  { to: "/clientes", icon: <Users className="w-5 h-5" />, label: "Clientes" },
  { to: "/productos", icon: <Package className="w-5 h-5" />, label: "Productos" },
  { to: "/reportes", icon: <BarChart3 className="w-5 h-5" />, label: "Reportes" },
  { to: "/configuracion", icon: <Settings className="w-5 h-5" />, label: "Configuración" },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function AppSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: AppSidebarProps) {
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
          // Desktop
          "hidden lg:flex lg:sticky lg:top-0",
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onNavClick={closeMobile}
          showCollapse
        />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar flex flex-col border-r border-sidebar-border transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMobile}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <SidebarContent
          collapsed={false}
          setCollapsed={setCollapsed}
          onNavClick={closeMobile}
          showCollapse={false}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  collapsed,
  setCollapsed,
  onNavClick,
  showCollapse,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNavClick: () => void;
  showCollapse: boolean;
}) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onNavClick(); // Cierra el sidebar móvil si está abierto
  };

  return (
    <>
      {/* Logo Header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed ? "justify-center" : ""
      )}>
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-gold">
          <Crown className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sidebar-foreground text-sm">M&D Hijos del Rey</span>
            <span className="text-xs text-sidebar-foreground/60">Facturación Electrónica</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {showCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              !collapsed && "justify-start gap-3 px-3"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Colapsar</span>
              </>
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full justify-center text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
            !collapsed && "justify-start gap-3 px-3"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
        </Button>
      </div>
    </>
  );
}
