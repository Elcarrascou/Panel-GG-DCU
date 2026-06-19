"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { CargaBadge } from "@/components/ui/CargaBadge";
import { Badge } from "@/components/ui/Badge";
import {
  CARGA_LABEL,
  CARGA_ORDEN,
  type CargaTrabajo,
} from "@/lib/types";

export interface PersonaRow {
  id: string;
  nombre: string;
  iniciales: string;
  rut: string;
  cargo: string | null;
  activo: boolean;
  clientes: string[];
  carga: CargaTrabajo | null;
  cargaEsActual: boolean;
  sinAsignacion: boolean;
}

export function PersonasTable({
  rows,
  clientes,
}: {
  rows: PersonaRow[];
  clientes: string[];
}) {
  const [q, setQ] = useState("");
  const [cliente, setCliente] = useState("");
  const [carga, setCarga] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (soloActivos && !r.activo) return false;
      if (term && !r.nombre.toLowerCase().includes(term) && !r.rut.toLowerCase().includes(term))
        return false;
      if (cliente && !r.clientes.includes(cliente)) return false;
      if (carga && r.carga !== carga) return false;
      return true;
    });
  }, [rows, q, cliente, carga, soloActivos]);

  const inputCls =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          placeholder="Buscar por nombre o RUT…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${inputCls} min-w-56 flex-1`}
        />
        <select
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className={inputCls}
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={carga}
          onChange={(e) => setCarga(e.target.value)}
          className={inputCls}
        >
          <option value="">Toda carga</option>
          {CARGA_ORDEN.map((c) => (
            <option key={c} value={c}>
              {CARGA_LABEL[c]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={soloActivos}
            onChange={(e) => setSoloActivos(e.target.checked)}
            className="h-4 w-4 accent-primary-dark"
          />
          Solo activos
        </label>
      </div>

      <p className="mb-2 text-xs text-muted">
        {filtered.length} de {rows.length} personas
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-border bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3">Cliente / Área</th>
              <th className="px-4 py-3">Carga</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/personas/${r.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar iniciales={r.iniciales} />
                    <span>
                      <span className="block font-medium text-ink">
                        {r.nombre}
                        {!r.activo && (
                          <span className="ml-2 text-xs font-normal text-muted">
                            (inactivo)
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted">
                        {r.cargo ?? r.rut}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {r.sinAsignacion ? (
                    <Badge tone="amber">Sin asignar</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {r.clientes.map((c) => (
                        <Badge key={c} tone="outline">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <CargaBadge carga={r.carga} />
                    {r.carga && !r.cargaEsActual && (
                      <span className="text-[10px] text-muted">(prev.)</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/personas/${r.id}`}
                    className="text-xs font-medium text-green-ink hover:underline"
                  >
                    Ver ficha →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                  Sin resultados para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
