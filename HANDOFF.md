# HANDOFF — Plexotech Tracker (Panel-GG-DCU)

> Documento de traspaso para la siguiente instancia de Claude Code. Contiene **todo** el contexto del desarrollo realizado el 2026-06-18: qué se construyó, cómo, dónde, qué falta y cómo continuar. Léelo completo antes de tocar código.

---

## 0. Resumen ejecutivo / estado actual

App de **tracking de RRHH para PlexoTech**: quién trabaja en qué cliente/proyecto, carga de trabajo semanal y reportería para el Gerente General. Dos roles: `admin` (escribe) y `viewer` (solo lectura).

**Estado: build completo, verificado end-to-end, pusheado a GitHub y DESPLEGADO en Vercel.** Live: https://panel-gg-dcu.vercel.app

| Área | Estado |
|------|--------|
| Esquema Supabase + RLS + seed | ✅ Aplicado (5 migraciones) |
| Auth (admin/viewer) + usuarios | ✅ Creados y probados |
| Frontend Next.js 15 (todos los módulos) | ✅ Build verde, 25 rutas |
| Endpoint Fase 2 (`/api/ingest`) | ✅ Probado (upsert OK, 401/404 OK) |
| Verificación en navegador (login→dashboard→personas) | ✅ OK con data real |
| Git local (commit inicial) | ✅ 76 archivos |
| Push a GitHub | ✅ `Elcarrascou/Panel-GG-DCU` (privado) |
| Deploy Vercel | ✅ `panel-gg-dcu.vercel.app` (CLI, prod, GitHub conectado) |

---

## 1. Contexto de negocio

- **PlexoTech**: empresa tech chilena (~45 personas), servicios a aseguradoras (Consorcio, MetLife, BUPA, Clínica Las Condes, Zurich, HELP) + áreas internas (Administración, Transversal, Gerencia).
- **Problema**: no hay forma sistemática de responder en tiempo real en qué está cada persona, qué hizo la semana pasada, quién está ocioso, cuántos proyectos activos por cliente.
- **Usuarios fase 1**: Admin (Daniel/PMO, alimenta el sistema) + Gerente General (visor). El resto no accede.
- Documento de requisitos original: `C:\Users\dacar\OneDrive\Desktop\plexotech-tracker-context.md` (v3.0).

---

## 2. Infraestructura (IDs reales)

| Recurso | Valor |
|---------|-------|
| Working dir | `C:\Proyecto desarrollos antigravity\GG Tracker` |
| Supabase project | `Panel-GG-DCU`, ref **`lbcfxivyallqcxnifpmd`**, region us-west-2, Postgres 17 |
| Supabase URL | `https://lbcfxivyallqcxnifpmd.supabase.co` |
| Supabase org | `yxmaahcntfispzynhhca` |
| Anon/publishable key | `sb_publishable_y0g4cBKJHf65jvTJD5qmCw_ws-LAGxb` |
| GitHub repo | `https://github.com/Elcarrascou/Panel-GG-DCU` (privado, branch `main`) |
| Deploy | Vercel (pendiente) |

### MCPs disponibles
- **Supabase MCP**: funciona (apply_migration, execute_sql, list_tables, get_advisors, etc.). Úsalo para cambios de DB.
- **GitHub MCP**: ⚠️ **credenciales muertas** ("Bad credentials"). NO usar. Para git, usar el credential manager local de Windows (ver §12).
- **Vercel MCP**: solo da instrucciones, **no despliega** por sí mismo. `deploy_to_vercel` retorna texto, no ejecuta.
- **Notion MCP**: disponible (flujo futuro Fase 2).
- **Claude_Preview MCP**: usado para verificar en navegador (`.claude/launch.json` config "panel" → `npm start` puerto 3000).

---

## 3. Stack técnico

- **Next.js 15.5.19** (App Router) + **React 19.1.0** + **TypeScript 5**
- **Tailwind CSS v4** (config CSS-based vía `@theme` en `globals.css`, NO `tailwind.config.js`)
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`)
- Node 25, npm 11 en el entorno.
- Scaffolding: `create-next-app` con `--ts --tailwind --app --eslint --src-dir --import-alias "@/*"`.

> **Nota**: el nombre del directorio "GG Tracker" tiene espacio+mayúsculas → `create-next-app .` falla. Se scaffoldeó en subdir `panel-gg-dcu` y se movió el contenido (`mv` con `dotglob`).

---

## 4. Auth y credenciales

Supabase Auth (email/password). Tabla `public.profiles` mapea `auth.users.id` → `role` (`admin`|`viewer`). Trigger `on_auth_user_created` crea profile (role `viewer` por defecto) al insertar en `auth.users`.

**Usuarios creados** (vía SQL directo en `auth.users` + `auth.identities`, password bcrypt con `extensions.crypt`):

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| admin | `dacarrascu@gmail.com` | `Plexo2026!` |
| viewer | `visor@plexotech.cl` | `Visor2026!` |

> ⚠️ Cambiar passwords tras primer login (Supabase Studio → Authentication → Users). Para crear más usuarios: créalos en Auth y ajusta `public.profiles.role`.

Helper de rol: `public.is_admin()` (SECURITY DEFINER) — usado en RLS y en el código (`src/lib/auth.ts`).

---

## 5. Modelo de datos (Supabase, schema `public`)

### Enums
- `tipo_contrato`: `interno` | `cliente`
- `cliente_tipo`: `externo` | `interno`
- `cliente_estado`: `activo` | `inactivo`
- `proyecto_estado`: `activo` | `pausado` | `cerrado`
- `rol_equipo`: `jefe` | `senior` | `semi_senior` | `junior` | `colaborador`
- `tipo_trabajo`: `mantencion` | `desarrollo` | `testing` | `levantamiento` | `soporte` | `administrativo` | `capacitacion`
- `carga_trabajo`: `sobrecargado` | `mucho_trabajo` | `normal` | `poco_trabajo` | `ocioso`
- `app_role`: `admin` | `viewer`

### Tablas
- **`personas`**: id, nombre, apellido, segundo_apellido?, rut(unique), cargo?, tipo_contrato, activo, timestamps.
- **`clientes`**: id, nombre(unique), tipo(`cliente_tipo`), estado, descripcion?, timestamps. *(El campo `tipo` distingue cliente externo vs área interna — no estaba en el doc original §5 pero sí en el seed §7; se agregó.)* **+ Contexto estratégico (migración 06, M5):** `contexto_actual`, `ultimos_eventos`, `proximos_pasos`, `proyectos_futuros`, `contactos_cliente`, `notas_estrategicas` — todos `text` nullable, texto libre.
- **`proyectos`**: id, nombre, cliente_id(FK→clientes, restrict), estado, descripcion?, fecha_inicio?, fecha_fin?, timestamps.
- **`equipos`**: id, nombre, cliente_id(FK), proyecto_id?(FK, set null), timestamps.
- **`asignaciones`**: id, persona_id(FK), cliente_id?(FK), proyecto_id?(FK), equipo_id?(FK), rol_equipo, fecha_inicio, **fecha_fin? (NULL = activa)**, timestamps. **Soft delete: nunca borrar, cerrar con fecha_fin.**
- **`registros_semanales`**: id, persona_id(FK), semana(date, lunes ISO), resumen?, tipo_trabajo?, carga_trabajo?, hitos?, timestamps. **Unique (persona_id, semana).**
- **`profiles`**: id(FK→auth.users), email, nombre, role(app_role), created_at.
- **`app_settings`**: key(PK), value. Guarda `ingest_secret`. **RLS habilitado SIN policies** → inaccesible por API; solo funciones SECURITY DEFINER lo leen (intencional).
- **`alertas_gestion`** (M6): id, titulo, descripcion?, `tipo`(critica|importante|seguimiento, CHECK), `estado`(pendiente|en_gestion|resuelta, CHECK, default pendiente), `categoria`?(personas|proyectos|clientes|contratos|operacional, CHECK), cliente_id?/proyecto_id?/persona_id? (FK con `ON DELETE SET NULL`), fecha_limite?, timestamps. RLS: SELECT a `authenticated`, escritura solo `is_admin()`. Trigger updated_at. **No son enums Postgres sino `text` con CHECK** (a diferencia del resto del modelo).
- **`hitos`** (M7, Adición v4): id, `proyecto_id`(FK→proyectos, **ON DELETE CASCADE**), titulo, descripcion?, fecha_planificada(date, NOT NULL), fecha_real?(date, NULL = no cumplido), `estado`(pendiente|cumplido|atrasado|cancelado, **text+CHECK**, default pendiente), timestamps. RLS por-comando estilo `alertas_gestion` (SELECT `true`, INSERT/UPDATE/DELETE `is_admin()`). Trigger `set_hitos_updated_at`. Índices en proyecto_id y fecha_planificada. **`atrasado` no se persiste**: se deriva en lectura (`deriveHitoEstado` en types.ts) cuando fecha_planificada < hoy y no hay fecha_real; el form solo escribe pendiente/cumplido/cancelado.

### RLS (resumen)
- Tablas de datos (personas, clientes, proyectos, equipos, asignaciones, registros_semanales): `SELECT` a cualquier `authenticated` (`using true`); `INSERT/UPDATE/DELETE` solo si `public.is_admin()`.
- `profiles`: usuario lee el suyo o admin lee todo; admin escribe.
- Triggers `updated_at` en todas las tablas de datos (`public.set_updated_at`).
- Índices: FKs + `idx_asig_activa` parcial (`where fecha_fin is null`) + semana/persona en registros.

### Seed
- 42 personas (nómina del doc §7), 9 clientes/áreas, 42 asignaciones activas iniciales (cada persona → su área/cliente actual, rol `colaborador`, gerentes `jefe`).
- Mapeo área→cliente y tipo_contrato (interno para Administración/Transversal/Gerencia) hecho en migración 03.

### Migraciones aplicadas (en orden)
1. `01_schema_enums_tables_rls`
2. `02_seed_clientes`
3. `03_seed_personas_asignaciones`
4. `04_ingest_fase2` (tabla app_settings + RPC `ingest_registro_semanal`)
5. `05_security_hardening` (search_path en set_updated_at; revoke EXECUTE en funciones definer)
6. `06_clientes_contexto_estrategico` (6 columnas text de contexto estratégico en `clientes`) — M5
7. `07_alertas_gestion` (tabla `alertas_gestion` + RLS + trigger updated_at + índices) — M6
8. `08_hitos` (tabla `hitos` + RLS por-comando + trigger updated_at + índices) — M7 (Adición v4)

> Para ver migraciones: `mcp__supabase__list_migrations`. Para nuevas DDL: `apply_migration`. Para queries: `execute_sql`.

---

## 6. Estructura del proyecto

```
src/
  middleware.ts                      # refresca sesión + guard rutas (excluye /login y /api/ingest)
  app/
    layout.tsx                       # root, fuente Inter (next/font), metadata
    globals.css                      # DESIGN SYSTEM: tokens de marca en @theme (Tailwind v4)
    login/page.tsx                   # login (client, supabase browser client)
    (app)/                           # grupo autenticado (sidebar + topbar); layout valida sesión
      layout.tsx                     # AppShell + getCurrentUser() → redirect /login si no hay
      page.tsx                       # DASHBOARD global (KPIs, CargaBar, Donut, alertas)
      personas/page.tsx              # lista (PersonasTable client, filtros)
      personas/nueva/page.tsx
      personas/[id]/page.tsx         # ficha (asignaciones, registro semana, historial)
      personas/[id]/editar/page.tsx
      clientes/{page,nuevo,[id],[id]/editar}    # [id] = ficha con Zona A operacional + Zona B contexto estratégico (M5)
    clientes/presentacion/page.tsx     # M5: modo presentación FUERA del grupo (app) → sin sidebar/topbar, fullscreen onyx
      proyectos/{page,nuevo,[id],[id]/editar}
      equipos/{page,nuevo,[id],[id]/editar}
      registros/page.tsx             # vista semanal (cobertura, form GET por semana)
      registros/nuevo/page.tsx       # crear/editar registro (precarga si existe)
      reportes/page.tsx              # 4 reportes imprimibles (PrintButton)
    api/ingest/route.ts              # FASE 2: POST ingest (secret-gated)
  components/
    ui/        Card, Badge(+DotBadge), Badges(estado/rol/tipo), CargaBadge, Button(+ButtonLink),
               StatCard, Avatar, PageHeader, EmptyState, Form(Field/TextInput/Select/Textarea/FormGrid),
               Table(THead/TH/TBody/TR/TD), PrintButton(client)
    charts/    CargaBar (barra apilada + leyenda), Donut (SVG)
    layout/    Logo, Sidebar(client, usePathname), Topbar, LogoutButton(client)
    personas/  PersonasTable(client, filtros), PersonaForm
    clientes/  ClienteForm (+ sección contexto estratégico M5),
               ContextoEstrategico (server, Zona B de la ficha, íconos SVG),
               PresentacionView (client, slideshow + window.print, M5)
    proyectos/ ProyectoForm
    equipos/   EquipoForm, EquipoMiembroForm
    asignaciones/ AsignacionForm
    registros/ RegistroForm
  lib/
    supabase/client.ts               # createBrowserClient
    supabase/server.ts               # createServerClient (cookies async, Next 15)
    supabase/middleware.ts           # updateSession (refresh + redirects)
    auth.ts                          # getCurrentUser, isAdmin, assertAdmin, NotAuthorizedError
    types.ts                         # tipos + label maps + CARGA_COLOR/ORDEN
    format.ts                        # nombreCompleto, iniciales, lunesDeLaSemana, rangoSemana, fechaCorta
    data.ts                          # TODAS las queries de lectura (server)
    actions.ts                       # TODAS las Server Actions (mutaciones, admin-gated)
.env.local                          # NO commiteado (gitignored)
.env.example                        # plantilla
.claude/launch.json                 # config preview "panel" (npm start :3000)
README.md  HANDOFF.md
```

---

## 7. Patrones clave (respetarlos al continuar)

- **Lectura**: funciones en `src/lib/data.ts`. Hacen varias queries en paralelo (`Promise.all`) y arman objetos compuestos en JS (joins en memoria, ≤50 filas). No hay vistas SQL.
- **Escritura**: Server Actions en `src/lib/actions.ts`, todas con `"use server"`, llaman `assertAdmin()`, hacen la mutación con el server client (RLS aplica), `revalidatePath` y `redirect`. Helpers `str()`/`req()`/`fail()`.
- **Formularios**: server components con `<form action={serverAction}>` y inputs uncontrolled + hidden `id` (vacío = crear, con id = editar). Forms reutilizables por entidad. Solo `PersonasTable`, `Sidebar`, `LogoutButton`, `PrintButton`, `login` son client components.
- **Gating de UI**: páginas llaman `isAdmin()` y muestran/ocultan botones de escritura. Páginas `nuevo`/`editar` hacen `redirect` si no es admin. La seguridad real la da RLS.
- **Design system**: tokens en `globals.css` dentro de `@theme inline`. Utilidades: `bg-primary`(#8EF67C), `bg-onyx`, `text-ink`, `text-muted`, `border-border`, `bg-surface`, `bg-background`. Colores de carga = inline style con `CARGA_COLOR` (hex), no utilidades. Fuente vía `var(--font-inter)`.
- **Semana**: siempre el **lunes** en formato `YYYY-MM-DD` (`lunesDeLaSemana`/`semanaActual` en format.ts, en UTC).
- **Next 15**: `params` y `searchParams` son **Promises** (await). `cookies()` es async.

---

## 8. Endpoint Fase 2 — ingesta vía IA

`POST /api/ingest` (excluido del middleware de auth). Flujo objetivo: Notion → resumen → Claude → POST aquí → Supabase.

- Auth: header `x-ingest-secret` (o `body.secret`) debe igualar env `INGEST_SECRET`.
- Internamente llama RPC `public.ingest_registro_semanal(...)` (SECURITY DEFINER) con la **anon key**; el RPC revalida el secreto contra `app_settings.ingest_secret` y hace **upsert** por `(persona_rut, semana)`. **No requiere service-role key.**
- Payload:
```json
{
  "persona_rut": "18.730.509-8",
  "semana": "2026-06-15",
  "resumen": "texto libre",
  "tipo_trabajo": "desarrollo",
  "carga_trabajo": "normal",
  "hitos": "opcional"
}
```
- Respuestas: `200 {ok:true,id,persona_id}` · `401 unauthorized` · `404 persona_not_found` · `400 missing_fields/invalid_json`.
- Secreto actual: `INGEST_SECRET=plx_ingest_7f3a9c21b85e4d06a1f2` (en `.env.local` y en `app_settings`). Cambiarlo en ambos lados si se quiere uno propio.

---

## 9. Verificación realizada

- `npm run build` ✅ (25 rutas, sin errores; warning benigno de edge-runtime por supabase-js en middleware). Rutas nuevas: `/personas/[id]/mover/[asignacionId]` (M3) y `/clientes/presentacion` (M5).
- Servidor `npm start` + Claude_Preview: login con admin → Dashboard renderiza con data real (42 personas, donut por cliente correcto, 9 clientes). Lista de Personas: 42/42, badges, filtros OK.
- Ingest probado por curl: secreto correcto → `ok:true`; secreto malo → 401; RUT inexistente → 404.
- `get_advisors security` corrido; ítems corregibles arreglados en migración 05. Quedan (por diseño/config, no bloquean): `app_settings` sin policy (lock intencional), `ingest_registro_semanal` ejecutable por anon (secret-gated, intencional), y leaked-password protection desactivado (config de Auth, activar en dashboard).

---

## 10. Pendientes

**Bloqueante para producción:**
- [x] **Deploy en Vercel** — HECHO 2026-06-18 vía CLI (`npx vercel --prod`, CLI ya logueado como `dacarrascu-1349`). Proyecto `dacarrascu-1349s-projects/panel-gg-dcu`, conectado al repo GitHub (push a `main` redespliega). Live: https://panel-gg-dcu.vercel.app. Env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, INGEST_SECRET) seteadas solo en **Production** (agregar a Preview si se quieren previews de PR).

**Recomendados:**
- [ ] Cambiar passwords sembrados; activar leaked-password protection en Supabase Auth.
- [ ] Cambiar `INGEST_SECRET` por uno propio (sync env ↔ `app_settings.ingest_secret`).

**Mejoras implementadas (commit `52b2b83`, 2026-06-18 — verificadas en navegador y en producción):**
- [x] **M1 — Errores inline en formularios.** Los 7 forms son client components con `useActionState`; las Server Actions retornan `{ error, fieldErrors }` para errores esperados (RUT/nombre duplicado vía código PG `23505`, campos vacíos, `fecha_fin < fecha_inicio`) en vez de lanzar. Error de campo bajo el input (`text-sm text-red-500`), general bajo el botón. Primitivas: `Field` acepta `error`, nuevo `FormError` en `components/ui/Form.tsx`.
- [x] **M2 — Selects dependientes cliente → proyecto/equipo.** En `AsignacionForm`, `EquipoForm` y `MoverPersonaForm`: al elegir cliente se filtran proyectos activos (y equipos) de ese cliente con `useState`, reset al cambiar. Placeholders "Selecciona primero un cliente" / "Sin proyectos activos". *Implementado filtrando el array que ya entrega `getOpciones` (sin fetch al browser client): sin red, sin estados de carga, sin edge cases de auth.*
- [x] **M3 — "Mover persona" en un paso.** Botón "Mover" junto a cada asignación activa en la ficha + ruta `/personas/[id]/mover/[asignacionId]` con `MoverPersonaForm`. Server Action `moverPersona`: cierra la asignación actual (`fecha_fin = inicio_nuevo − 1 día`) y crea la nueva; si falla el insert reabre la anterior (compensación, sin cambiar esquema). Banner de confirmación dinámico ("Se cerrará … con X y se creará una nueva con Y").
- [x] **M4 — "Registrar semana" directo desde el dashboard.** Links "Registrar →" en la alerta "Pendientes de registro" del dashboard y banner en la ficha de persona → `/registros/nuevo?persona_id=[id]&semana=[lunes]`. La página precarga y **bloquea** persona y semana (intención explícita); `RegistroForm` admite `lockPersona`/`lockSemana`. La tabla `/registros` también usa `persona_id`.
- [x] **M5 — Contexto estratégico de clientes + modo presentación ejecutiva** (commit `cc9ef41`, 2026-06-19 — verificado en navegador y pusheado; Vercel redespliega). Daniel (Admin/PMO) escribe el contexto, el GG lo consume.
  - **DB:** migración `06` agrega 6 columnas `text` nullable a `clientes` (`contexto_actual`, `ultimos_eventos`, `proximos_pasos`, `proyectos_futuros`, `contactos_cliente`, `notas_estrategicas`). `get_advisors` sin nuevos hallazgos. Tipo `Cliente` y `guardarCliente` actualizados (las queries usan `select("*")`, sin cambios). `getClientesPresentacion()` nueva en `data.ts` (clientes activos + equipo asignado con carga).
  - **Ficha `/clientes/[id]`:** Zona A operacional intacta; nueva **Zona B "Contexto estratégico"** (`ContextoEstrategico.tsx`, server) que renderiza solo las secciones con contenido, `whitespace-pre-wrap`, íconos SVG stroke en verde, badge "PMO".
  - **Form `ClienteForm`:** sección "Contexto estratégico" con 6 `<textarea>` + placeholders, separada con `border-t`. Mantiene `useActionState` (M1).
  - **Listado `/clientes`:** badge "Acción pendiente" (punto `bg-primary-dark`) cuando el cliente tiene `proximos_pasos`. Botón **"▶ Presentar"** (ghost) visible para ambos roles.
  - **`/clientes/presentacion`** (`PresentacionView.tsx`, client): ruta **fuera del grupo `(app)`** → no hereda sidebar/topbar (fullscreen). Protegida por middleware + `getCurrentUser` (admin y viewer). Fondo onyx, acento Spring Green, slideshow (botones Anterior/Siguiente, puntos, flechas de teclado ←/→ y PageUp/Down), barra con Imprimir (`window.print`) y "Salir de presentación". Una `<article>` por cliente activo; en pantalla se muestra la activa, **en impresión se muestran todas** (`print:block` + `print:break-after-page`) con colores claros. Muestra contexto/eventos/pasos/proyectos + equipo; **oculta `contactos_cliente` y `notas_estrategicas`** (internos). Slides sin contenido estratégico muestran solo encabezado + equipo.
  - **Gotcha de routing:** colocar `presentacion` en `src/app/clientes/` (no en `src/app/(app)/clientes/`) es lo que la libra del layout con sidebar; el build no genera conflicto porque `presentacion` es un segmento estático único (no choca con `[id]`).
  - **Dato de prueba:** durante la verificación se rellenaron los 6 campos de **Consorcio** (`67715f2e-1a67-4fad-a015-af3ed7540f1d`) con texto de ejemplo realista — sigue en la DB de producción. Limpiar/editar desde la ficha si se quiere data en blanco.
- [x] **M6 — Alertas de decisiones críticas en dashboard + página `/alertas`** (2026-06-19 — verificado en navegador con data real, push pendiente al cierre de esta sesión). Daniel (Admin/PMO) alimenta las alertas tras sus reuniones; el GG las ve al entrar.
  - **DB:** migración `07` crea `alertas_gestion` (ver §5) + 13 alertas seed reales (7 críticas, 4 importantes, 2 seguimiento). Tipos `AlertaTipo/Estado/Categoria` + `AlertaGestion` (con joins embebidos `clientes/proyectos/personas`) y label maps en `types.ts`.
  - **`data.ts`:** `getAlertasActivas()` (pendiente+en_gestion, ordenadas crítica→fecha→antigüedad **en memoria** porque `tipo` es texto), `getTodasLasAlertas()`, `getProyectosCriticos()` (proyectos activos + criticidad derivada de alertas activas asociadas al proyecto o su cliente). Select embebido: `*, clientes(nombre), proyectos(nombre), personas(nombre, apellido)`.
  - **`actions.ts`:** `cambiarEstadoAlerta(fd)` (FormData, admin, valida estado) y `crearAlerta(prev, fd)` (M1 `useActionState`).
  - **Dashboard (`(app)/page.tsx`) — 3 zonas:** Zona 1 "Atención requerida" (alertas activas como cards, críticas primero, **lo primero que ve el GG**); Zona 2 KPIs (se agregó "Sin asignación"); Zona 3 "Estado de proyectos" (badge de criticidad data-driven). El helper local pasó a llamarse `ListaPendientes`.
  - **`/alertas`** (`(app)/alertas/page.tsx`, server): filtros por estado/tipo/categoría vía **searchParams (GET form, sin JS)**; admins ven `CrearAlertaForm` (client, colapsable) y los botones de acción. Resueltas no se borran — quedan con estado `resuelta` y se ven con filtro Estado=Resueltas.
  - **Componentes:** `components/alertas/AlertaCard.tsx` (server, reusable en dashboard y /alertas; botones-form llaman `cambiarEstadoAlerta`) y `CrearAlertaForm.tsx` (client).
  - **Nav:** ítem "Alertas" agregado a `nav.tsx` (lo consumen Sidebar y MobileNav).
- [x] **Carga de datos de negocio v1.0** (2026-06-19, vía Supabase MCP `execute_sql`). Se eliminó la data ficticia (42 asignaciones placeholder del seed + 1 registro de prueba; clientes/proyectos/equipos quedaron intactos o vacíos) y se cargaron datos reales: contexto estratégico de 7 clientes, +Colmena y +Plexotech Interno, 6 proyectos, 9 equipos, 36 asignaciones activas, 4 registros semanales (semana lunes `2026-06-15`). Correcciones: Carlos Mellior→Mellor, Roberto Celedón inactivo, +Valeria Selman. **Ahora la DB de producción tiene data real, no seed.** Quedan 14 personas activas sin asignación (incluye PMO, GG, áreas internas, Joel Astete y Genaro Coñolef como casos a resolver). Colmena no tiene equipo asignado aún (el script de carga no incluyó asignaciones para Colmena).
- [x] **M7 — Adiciones v4: Hitos por proyecto + Módulo de Reportes + Presentación semanal** (2026-06-25 — build verde 31 rutas, verificado en navegador con data real, `get_advisors` sin nuevos hallazgos; **commiteado y pusheado a `main`**, Vercel redespliega — ver git log).
  - **Adición 2 — Hitos:** migración `08` (tabla `hitos`, ver §5). `types.ts`: `Hito`, `HitoEstado`, `HITO_ESTADO_LABEL/TONE/COLOR`, `deriveHitoEstado(hito, hoy)`. `data.ts`: `getHitosProyecto` (con `estadoEfectivo`), `getHitosResumen` (Map proyecto→{total,cumplidos,atrasados,pendientes} para badges de la lista), `getHitosCriticos` (atrasados o que vencen ≤14 días, con proyecto+cliente). `actions.ts`: `guardarHito` (useActionState; coherencia: con fecha real ⇒ cumplido, 'cumplido' sin fecha real ⇒ pendiente) y `eliminarHito` (button-form). UI: `components/proyectos/HitosManager.tsx` (**client**, tabla con semáforo 🟢🟡🔴⚫ + crear/editar/eliminar inline solo admin, confirm en delete) integrado en `/proyectos/[id]` (sección "Hitos del proyecto", distinta de "Hitos recientes" que sigue leyendo el texto libre de los registros). `/proyectos` lista: badge `X/Y hitos` + badge rojo si hay atrasados.
  - **Adición 1 — Reportes:** `/reportes` reconvertida en **hub** (tarjetas: cliente/proyecto/colaborador con picker de entidades, + accesos directos a decisiones y semanal). El reporte agregado anterior se **preservó** movido a `/reportes/semanal`. Nuevos reportes imprimibles: `/reportes/cliente/[id]`, `/reportes/proyecto/[id]`, `/reportes/colaborador/[id]`, `/reportes/decisiones` — todos con `PrintButton` (`window.print`), `.print-full`, fecha de generación; reutilizan `getClienteDetalle`/`getProyectoDetalle`/`getPersonaDetalle`/`getHitosProyecto` + `getAlertasActivas` filtradas. (Sidebar/Topbar ya eran `no-print`.) Nota: usé la ruta `/reportes/colaborador/[id]` tal como pide el doc v4, aunque el resto de la app usa `/personas`.
  - **Adición 3 — Presentación semanal:** `data.ts` `getPresentacionSemanal()` (consolida resumen, slide por cliente —externos primero, interno al final—, hitos críticos, situaciones de colaboradores —sin asignación / carga baja=poco_trabajo|ocioso / decisiones de personas—, decisiones). `components/presentacion/PresentacionSemanalView.tsx` (**client**, slideshow onyx, teclas ←/→, dots, "Salir"→dashboard). Ruta `/presentacion/semanal` **fuera del grupo `(app)`** (fullscreen, sin sidebar), accesible a ambos roles. Botón destacado "▶ Ver presentación semanal" en el header del dashboard.
  - **Gotcha resuelto:** `/proyectos/[id]` ya tenía un `const hitos` local (hitos de texto libre de los registros); la variable nueva se llamó `hitosProyecto` para evitar el choque de identificador en el build.
- [x] **Actualización semanal 2026-06-25** (solo datos + 1 DDL menor, vía Supabase MCP; `get_advisors` sin nuevos hallazgos). Aplicada desde el doc `actualizacion-semanal-2026-06-25.md` (en Desktop, no en repo).
  - **DDL:** migración `09_proyectos_notas` agrega columna `notas text` nullable a `proyectos` (el doc semanal asumía que existía; no existía). ⚠️ **La app aún NO lee `proyectos.notas`** — el tipo `Proyecto`, `/proyectos/[id]` y los forms no la muestran. El contenido cargado esta semana en `notas` (5 proyectos: MetLife Fase 1, Zurich, Colmena, Portales, CLC) queda en DB pero invisible en UI hasta codearlo.
  - **Alertas:** 2 resueltas (Validar base productiva MetLife, Salida junio CLC primas) + 11 nuevas creadas. Genaro Coñolef → `en_gestion`. Conteo activo final: 5 críticas / 11 importantes / 6 seguimiento.
  - **Hitos:** "Ambiente de pruebas" (Zurich) y "Migración módulo de pólizas" (MetLife) → cumplidos 25-jun; nuevo hito "Base de datos productiva cargada" (MetLife Fase 1, cumplido).
  - **Proyecto nuevo:** "Gestión Financiera con Clientes" (cliente Plexotech Interno) + asignación Daniel Carrasco (jefe). **Genaro Coñolef** asignado a Colmena (colaborador) — sale de "sin asignación".
  - **Contexto estratégico** (clientes): actualizados Zurich, Colmena, CLC, MetLife, Consorcio.
  - **Gotchas del doc semanal** (corregidos al aplicar, NO en el doc fuente — el doc tiene nombres de columna/patrones obsoletos, igual que `prompt-extraccion-estado.md`): (a) `proyectos.notas` no existía → migración `09`; (b) `alertas_gestion.titulo` es NOT NULL y el doc omitía `titulo` en los 11 INSERT → se derivó título para cada una; (c) los UPDATE de "resolver alerta" y "Genaro en_gestion" matcheaban por `descripcion ILIKE` pero las frases viven en `titulo`/`persona_id` → 0 filas; se rematchearon por título/persona; (d) acento `'%Martínez%'` no matchea `Martinez` (DB sin tilde) → se quitó la tilde en los subqueries de persona; (e) las 2 asignaciones nuevas no seteaban `cliente_id` (los reportes joinean por ahí) → se setearon.
- [ ] **Surfacing de `proyectos.notas` en la UI** (tipo `Proyecto`, ficha `/proyectos/[id]`, forms) — la columna existe y tiene data pero no se muestra. Regenerar tipos TS tras este DDL.
- [ ] **Corregir los docs de extracción/actualización** (`prompt-extraccion-estado.md`, `actualizacion-semanal-*.md`) para que usen los nombres reales de columna (`tipo` no `prioridad`, `rol_equipo` no `carga_trabajo`, `fecha_fin` no `fecha_fin_estimada`, sin `clientes.activo`, match por `titulo`/`persona_id`, `Martinez` sin tilde, setear `cliente_id` en asignaciones).
- [ ] Exportar reportes a PDF/Excel real (hoy = `window.print()`).
- [ ] Generar tipos TS desde Supabase (`mcp__supabase__generate_typescript_types`) en vez de los tipos manuales en `types.ts`.
- [ ] Confirmar con el negocio: ¿más tipos de trabajo / roles de equipo? ¿login propio del GG?

---

## 11. Cómo desplegar en Vercel (manual, lo hace el usuario)

1. Entrar a **vercel.com/new** e importar el repo `Elcarrascou/Panel-GG-DCU`.
2. En **Environment Variables** agregar las 3 (deben existir **antes** del build porque las `NEXT_PUBLIC_*` se inyectan en el bundle):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://lbcfxivyallqcxnifpmd.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_y0g4cBKJHf65jvTJD5qmCw_ws-LAGxb`
   - `INGEST_SECRET` = `plx_ingest_7f3a9c21b85e4d06a1f2`
3. **Deploy**. Next.js se autodetecta, sin config extra.

Alternativa CLI: `npx vercel` (interactivo, pide login y linkeo) → luego setear las env vars.

---

## 12. Notas / gotchas para la próxima instancia

> ⚠️ **REGLA OBLIGATORIA DE CIERRE — siempre completar `git commit` + `git push`.** Ninguna sesión termina con trabajo verificado sin commitear/pushear. Una vez que el build está verde y el cambio quedó verificado, el **último paso de toda sesión es `git add -A && git commit && git push` a `main`** (Vercel redespliega solo). Actualizar HANDOFF.md y la memoria como parte del mismo commit. No dejar cambios colgando en el working tree.

- **GitHub MCP no sirve** (Bad credentials). Para git usar el **credential manager local** (`git config credential.helper` = `manager`, token del user `Elcarrascou`). Patrón usado (sin imprimir el token):
  - Crear repo: `git credential fill` → token → `curl` a `https://api.github.com/user/repos`.
  - Push: `git push` normal con `GIT_TERMINAL_PROMPT=0` (el manager provee credenciales no-interactivamente).
  - El repo ya existe y `origin` ya está configurado a `https://github.com/Elcarrascou/Panel-GG-DCU.git`. Para commitear cambios: `git add -A && git commit && git push`.
- **API de GitHub es estricta con JSON**: mandar `-H "Content-Type: application/json"` y body **solo ASCII** (un em-dash `—` causó "Problems parsing JSON").
- **CRLF**: Git avisa LF→CRLF en Windows (benigno).
- **Tailwind v4**: no hay `tailwind.config.js`. Tokens en `@theme inline` dentro de `globals.css`. Colores arbitrarios con `bg-[#xxxxxx]`.
- **Puerto 3000**: el preview ("panel") corre `npm start` ahí. Si está ocupado, liberar antes (`taskkill //PID <pid> //F`) o usar otro puerto.
- **Shell**: entorno Windows; el Bash tool es Git Bash (POSIX). PowerShell también disponible. Rutas con espacios → comillas.
- **Supabase**: usar siempre `apply_migration` para DDL (queda registrada), `execute_sql` para datos/consultas. Correr `get_advisors` tras cambios de esquema.

---

## 13. Orden sugerido para continuar

1. Confirmar/ejecutar deploy en Vercel (§11).
2. Endurecer Auth (passwords + leaked-password protection).
3. Tomar mejoras de §10 según prioridad del usuario.
4. Cuando se active Fase 2 real: conectar Notion → Claude → `POST /api/ingest`.

---

## 14. Flujo de trabajo semanal (operación)

El sistema se alimenta semanalmente, igual que los registros:

1. Daniel Carrasco (Admin/PMO) se reúne con los colaboradores / jefes de equipo.
2. Actualiza los **registros semanales** en el sistema (carga, resumen, hitos por persona).
3. Crea o actualiza **alertas de gestión** según lo conversado (decisiones pendientes, bloqueantes, reuniones). Resuelve las que ya se cerraron (no se borran: pasan a estado `resuelta`).
4. El **Gerente General** entra al dashboard y ve, en orden: las decisiones que requieren acción (Zona 1), los KPIs operacionales (Zona 2) y el estado de los proyectos (Zona 3).

El GG solo lee; el Admin crea/edita/resuelve. La seguridad real la da RLS (`is_admin()`).

---

**Último cambio: 2026-06-25.**
Actualización semanal 2026-06-25 (solo datos + migración `09_proyectos_notas`): 2 alertas resueltas + 11 nuevas, 3 hitos cumplidos, proyecto "Gestión Financiera con Clientes", Genaro Coñolef asignado a Colmena, contexto de 5 clientes. Pendiente: surfacing de `proyectos.notas` en UI. Previas: M7 (Adiciones v4: Hitos + Reportes + Presentación semanal, migración `08_hitos`), `57943c4` M6 + carga de datos v1.0, `cc9ef41` M5, `52b2b83` M1/M2/M3/M4.
