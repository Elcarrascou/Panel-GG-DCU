import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={user.role} />
      <div className="md:pl-60">
        <Topbar user={user} />
        <main className="mx-auto max-w-7xl px-5 py-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}
