# Plexotech Tracker — Panel GG (Panel-GG-DCU)

Sistema de tracking de recursos humanos de **PlexoTech**: asignaciones por cliente/proyecto, carga de trabajo semanal y reportería para Gerencia General.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (design system de marca en `src/app/globals.css`)
- **Supabase** (PostgreSQL + Auth + RLS) — proyecto `Panel-GG-DCU` (`lbcfxivyallqcxnifpmd`)
- Deploy objetivo: **Vercel**

## Roles

| Rol | Acceso |
|-----|--------|
| `admin` | Lectura + escritura completa (Daniel / PMO) |
| `viewer` | Solo lectura (Gerente General) |

RLS en Supabase: `viewer` solo puede leer; toda escritura exige `admin` (`public.is_admin()`).

### Credenciales iniciales (cambiar tras el primer login)

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| admin | `dacarrascu@gmail.com` | `Plexo2026!` |
| viewer | `visor@plexotech.cl` | `Visor2026!` |

> Para cambiar contraseñas: Supabase Studio → Authentication → Users. Para crear más usuarios, créalos en Auth y ajusta su rol en la tabla `public.profiles`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con la anon/publishable key real
npm run dev                  # http://localhost:3000
```

La base de datos ya está provisionada (esquema + seed de 42 personas y 9 clientes/áreas) vía migraciones aplicadas en Supabase.

## Modelo de datos (Supabase / `public`)

`personas`, `clientes`, `proyectos`, `equipos`, `asignaciones`, `registros_semanales`, más `profiles` (roles de auth) y `app_settings` (secreto de ingesta).

- Las **asignaciones nunca se borran** → se cierran con `fecha_fin` (soft delete).
- Una persona existe una sola vez y puede tener N asignaciones activas.
- `registros_semanales` tiene unique `(persona_id, semana)` (un registro por persona por semana, `semana` = lunes ISO).
- Enums: `tipo_trabajo`, `carga_trabajo`, `rol_equipo`, `proyecto_estado`, `cliente_estado`, `cliente_tipo`, `tipo_contrato`, `app_role`.

## Estructura

```
src/
  app/
    login/                 # login (Supabase Auth)
    (app)/                 # área autenticada (sidebar + topbar)
      page.tsx             # Dashboard global
      personas/  clientes/  proyectos/  equipos/  registros/  reportes/
    api/ingest/route.ts    # Fase 2 — ingesta vía IA
  components/              # ui, charts, layout, forms por entidad
  lib/
    supabase/              # clients (browser, server, middleware)
    data.ts                # queries de lectura
    actions.ts             # Server Actions (mutaciones, admin-gated)
    auth.ts  types.ts  format.ts
  middleware.ts            # refresco de sesión + guard de rutas
```

## Fase 2 — Ingesta vía IA (Notion → Claude → Supabase)

Endpoint público autenticado por secreto: `POST /api/ingest`.

```bash
curl -X POST https://<host>/api/ingest \
  -H "content-type: application/json" \
  -H "x-ingest-secret: $INGEST_SECRET" \
  -d '{
    "persona_rut": "18.730.509-8",
    "semana": "2026-06-15",
    "resumen": "Trabajó en módulo de liquidaciones, revisó PRs del equipo",
    "tipo_trabajo": "desarrollo",
    "carga_trabajo": "normal",
    "hitos": "Deploy del módulo de liquidaciones a producción"
  }'
```

- `semana` = lunes (YYYY-MM-DD). Hace **upsert** por `(persona_rut, semana)`.
- `tipo_trabajo` ∈ `mantencion|desarrollo|testing|levantamiento|soporte|administrativo|capacitacion`
- `carga_trabajo` ∈ `sobrecargado|mucho_trabajo|normal|poco_trabajo|ocioso`
- Respuestas: `200 {ok:true,id}` · `401 unauthorized` · `404 persona_not_found` · `400 missing_fields`.

El secreto vive en `app_settings.ingest_secret` (Supabase) y debe coincidir con `INGEST_SECRET` (env). La escritura usa un RPC `SECURITY DEFINER` — no requiere service-role key.

## Deploy en Vercel

1. Importar el repo en Vercel.
2. Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `INGEST_SECRET`.
3. `npm run build` (ya validado).

## Marca

Spring Green `#8EF67C` sobre Onyx `#2F2E2E` / blanco. Tipografía Inter. Tokens en `src/app/globals.css`.
