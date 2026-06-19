import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClientesPresentacion } from "@/lib/data";
import { PresentacionView } from "@/components/clientes/PresentacionView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Presentación ejecutiva · Clientes",
};

export default async function PresentacionClientesPage() {
  // Accesible para ambos roles autenticados (admin y viewer).
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clientes = await getClientesPresentacion();
  return <PresentacionView clientes={clientes} />;
}
