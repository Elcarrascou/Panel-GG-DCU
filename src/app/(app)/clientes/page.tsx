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
          admin && <ButtonLink href="/clientes/nuevo">+ Nuevo cliente</ButtonLink>
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
                <Link
                  href={`/clientes/${c.id}`}
                  className="font-medium text-ink hover:underline"
                >
                  {c.nombre}
                </Link>
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
