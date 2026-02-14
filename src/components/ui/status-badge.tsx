import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: "success" | "warning" | "destructive" | "info" | "neutral" | "pending";
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
}

const statusStyles = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
  pending: "bg-accent/10 text-accent border-accent/20",
};

export function StatusBadge({ status, children, className, icon: Icon }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

// Invoice specific status badge
export function InvoiceStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: StatusBadgeProps["status"]; label: string }> = {
    paid: { variant: "success", label: "Pagada" },
    pending: { variant: "warning", label: "Pendiente" },
    overdue: { variant: "destructive", label: "Vencida" },
    cancelled: { variant: "neutral", label: "Anulada" },
    draft: { variant: "info", label: "Borrador" },
  };

  const config = statusMap[status] || { variant: "neutral" as const, label: status };
  
  return <StatusBadge status={config.variant}>{config.label}</StatusBadge>;
}
