import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function QuickActionCard({ to, icon: Icon, title, description }: QuickActionProps) {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-4 p-4 bg-card border border-border rounded-xl",
        "shadow-card hover:shadow-premium transition-all duration-200",
        "hover:border-primary/30 group"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
        <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </NavLink>
  );
}
