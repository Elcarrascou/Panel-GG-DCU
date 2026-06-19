import Link from "next/link";
import { getClientes } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { ClienteEstadoBadge } from "@/components/ui/Badges";
import { Badge } from "@/components/ui/Badge";
import { CLIENTE_TIPO_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const [clientes, admin] = await Promise.all([getClientes(), isAdmin()]);

  return (
    <div>
      <PageHeader
        title="Clientes y áreas"
        subtitle="Clientes externos y áreas internas"
        action={
          <div className="flex items-center gap-2">
            <ButtonLink href="/clientes/presentacion" variant="ghost">
              ▶ Presentar
            </ButtonLink>
            {admin && (
              <ButtonLink href="/clientes/nuevo">+ Nuevo cliente</ButtonLink>
            )}
          </div>
        }
      />
      <Table>
        <THead>
          <TR>
            <TH>Nombre</TH>
            <TH>Tipo</TH>
            <TH>Estado</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {clientes.map((c) => (
            <TR key={c.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {c.nombre}
                  </Link>
                  {c.proximos_pasos?.trim() && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-primary/25 px-2 py-0.5 text-[11px] font-medium text-green-ink"
                      title="Tiene próximos pasos definidos"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-dark" />
                      Acción pendiente
                    </span>
                  )}
                </div>
              </TD>
              <TD>
                <Badge tone={c.tipo === "interno" ? "dark" : "outline"}>
                  {CLIENTE_TIPO_LABEL[c.tipo]}
                </Badge>
              </TD>
              <TD>
                <ClienteEstadoBadge estado={c.estado} />
              </TD>
              <TD className="text-right">
                <Link
                  href={`/clientes/${c.id}`}
                  className="text-xs font-medium text-green-ink hover:underline"
                >
                  Ver →
                </Link>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
