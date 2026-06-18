import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

export interface SessionUser {
  id: string;
  email: string | null;
  nombre: string | null;
  role: AppRole;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, nombre")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? null,
    nombre: profile?.nombre ?? null,
    role: (profile?.role as AppRole) ?? "viewer",
  };
}

export async function isAdmin(): Promise<boolean> {
  const u = await getCurrentUser();
  return u?.role === "admin";
}

export class NotAuthorizedError extends Error {
  constructor() {
    super("No autorizado: se requiere rol admin.");
    this.name = "NotAuthorizedError";
  }
}

export async function assertAdmin(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u || u.role !== "admin") throw new NotAuthorizedError();
  return u;
}
