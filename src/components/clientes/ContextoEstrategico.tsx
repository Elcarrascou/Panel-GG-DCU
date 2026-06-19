import type { SVGProps } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Cliente } from "@/lib/types";

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

function ContextoIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}
function EventosIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function PasosIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}
function FuturosIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
    </svg>
  );
}
function ContactosIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}
function NotasIcon(p: IconProps) {
  return (
    <svg {...S(p)}>
      <path d="M4 22V4a1 1 0 0 1 1-1h14l-3 4 3 4H5" />
    </svg>
  );
}

interface Seccion {
  key: keyof Cliente;
  titulo: string;
  Icon: (p: IconProps) => React.ReactElement;
}

const SECCIONES: Seccion[] = [
  { key: "contexto_actual", titulo: "Contexto actual", Icon: ContextoIcon },
  { key: "ultimos_eventos", titulo: "Últimos eventos relevantes", Icon: EventosIcon },
  { key: "proximos_pasos", titulo: "Próximos pasos", Icon: PasosIcon },
  { key: "proyectos_futuros", titulo: "Proyectos futuros / propuestas", Icon: FuturosIcon },
  { key: "contactos_cliente", titulo: "Contactos del cliente", Icon: ContactosIcon },
  { key: "notas_estrategicas", titulo: "Notas estratégicas", Icon: NotasIcon },
];

export function ContextoEstrategico({ cliente }: { cliente: Cliente }) {
  const conContenido = SECCIONES.filter(
    (s) => typeof cliente[s.key] === "string" && (cliente[s.key] as string).trim(),
  );
  if (conContenido.length === 0) return null;

  return (
    <Card className="mt-6 bg-background">
      <CardHeader
        title="Contexto estratégico"
        subtitle="Visión ejecutiva del cliente"
        action={<Badge tone="green">PMO</Badge>}
      />
      <CardBody className="space-y-5">
        {conContenido.map(({ key, titulo, Icon }) => (
          <section key={key}>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="text-green-ink">
                <Icon />
              </span>
              {titulo}
            </h4>
            <p className="mt-1.5 whitespace-pre-wrap pl-7 text-sm leading-relaxed text-muted">
              {cliente[key] as string}
            </p>
          </section>
        ))}
      </CardBody>
    </Card>
  );
}
