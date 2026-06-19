import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const S = (props: IconProps) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

// Íconos stroke estilo lucide — vocabulario consistente, currentColor.
function DashboardIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function AlertasIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function PersonasIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClientesIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
  );
}

function ProyectosIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <path d="M8 13h2v4H8zM14 10h2v7h-2z" />
    </svg>
  );
}

function EquiposIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <circle cx="12" cy="8" r="3" />
      <circle cx="5" cy="17" r="2.5" />
      <circle cx="19" cy="17" r="2.5" />
      <path d="M12 11v3M10 13l-3 2M14 13l3 2" />
    </svg>
  );
}

function RegistrosIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function ReporteriaIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" rx="0.5" />
      <rect x="12" y="8" width="3" height="10" rx="0.5" />
      <rect x="17" y="5" width="3" height="13" rx="0.5" />
    </svg>
  );
}

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<IconProps>;
  exact?: boolean;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon, exact: true },
  { href: "/alertas", label: "Alertas", Icon: AlertasIcon },
  { href: "/personas", label: "Personas", Icon: PersonasIcon },
  { href: "/clientes", label: "Clientes", Icon: ClientesIcon },
  { href: "/proyectos", label: "Proyectos", Icon: ProyectosIcon },
  { href: "/equipos", label: "Equipos", Icon: EquiposIcon },
  { href: "/registros", label: "Registros semanales", Icon: RegistrosIcon },
  { href: "/reportes", label: "Reportería", Icon: ReporteriaIcon },
];

export function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
