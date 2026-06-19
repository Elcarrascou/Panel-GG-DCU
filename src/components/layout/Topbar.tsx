import { LogoutButton } from "./LogoutButton";
import { MobileNav } from "./MobileNav";
import { Badge } from "@/components/ui/Badge";
import type { SessionUser } from "@/lib/auth";

export function Topbar({ user }: { user: SessionUser }) {
  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <MobileNav role={user.role} />
        <span className="text-base font-bold tracking-tight text-ink">
          Plexo<span className="text-[#6CD45A]">Tech</span>
        </span>
      </div>
      <div className="hidden text-sm text-muted md:block">
        Panel de Gestión · Tracking de recursos
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium leading-tight text-ink">
            {user.nombre ?? user.email}
          </p>
          <p className="text-[11px] leading-tight text-muted">{user.email}</p>
        </div>
        <Badge tone={user.role === "admin" ? "green" : "neutral"}>
          {user.role === "admin" ? "Admin" : "Visor"}
        </Badge>
        <LogoutButton />
      </div>
    </header>
  );
}
