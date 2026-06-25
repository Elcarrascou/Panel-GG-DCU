import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPresentacionSemanal } from "@/lib/data";
import { PresentacionSemanalView } from "@/components/presentacion/PresentacionSemanalView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Estatus Semanal · Presentación",
};

export default async function PresentacionSemanalPage() {
  // Accesible para ambos roles autenticados (admin y viewer).
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getPresentacionSemanal();
  return <PresentacionSemanalView data={data} />;
}
