import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fase 2 — Ingesta de registros semanales vía IA.
 * Flujo: Notion (resumen) -> Claude -> POST a este endpoint -> Supabase.
 *
 * Autenticación: header `x-ingest-secret` (o body.secret) === env INGEST_SECRET.
 * El RPC `ingest_registro_semanal` (SECURITY DEFINER) revalida el secreto y
 * hace upsert por (persona_rut, semana).
 *
 * Payload:
 * {
 *   "persona_rut": "18.730.509-8",
 *   "semana": "2026-06-15",            // lunes de la semana (YYYY-MM-DD)
 *   "resumen": "Trabajó en ...",
 *   "tipo_trabajo": "desarrollo",      // enum tipo_trabajo (opcional)
 *   "carga_trabajo": "normal",         // enum carga_trabajo (opcional)
 *   "hitos": "Deploy a producción"      // opcional
 * }
 */

interface IngestBody {
  persona_rut?: string;
  semana?: string;
  resumen?: string | null;
  tipo_trabajo?: string | null;
  carga_trabajo?: string | null;
  hitos?: string | null;
  secret?: string;
}

export function GET() {
  return NextResponse.json({
    endpoint: "/api/ingest",
    method: "POST",
    auth: "header x-ingest-secret",
    payload: {
      persona_rut: "18.730.509-8",
      semana: "2026-06-15",
      resumen: "texto libre",
      tipo_trabajo:
        "mantencion|desarrollo|testing|levantamiento|soporte|administrativo|capacitacion",
      carga_trabajo:
        "sobrecargado|mucho_trabajo|normal|poco_trabajo|ocioso",
      hitos: "texto libre (opcional)",
    },
  });
}

export async function POST(req: NextRequest) {
  let body: IngestBody | null = null;
  try {
    body = (await req.json()) as IngestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const provided = req.headers.get("x-ingest-secret") ?? body.secret ?? "";
  const expected = process.env.INGEST_SECRET;
  if (!expected || provided !== expected) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  if (!body.persona_rut || !body.semana) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_fields",
        required: ["persona_rut", "semana"],
      },
      { status: 400 },
    );
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await sb.rpc("ingest_registro_semanal", {
    p_secret: expected,
    p_rut: body.persona_rut,
    p_semana: body.semana,
    p_resumen: body.resumen ?? null,
    p_tipo_trabajo: body.tipo_trabajo ?? null,
    p_carga_trabajo: body.carga_trabajo ?? null,
    p_hitos: body.hitos ?? null,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  const result = data as { ok: boolean; error?: string };
  if (!result?.ok) {
    const status =
      result?.error === "persona_not_found"
        ? 404
        : result?.error === "unauthorized"
          ? 401
          : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
