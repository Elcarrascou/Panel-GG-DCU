# Product

## Register

product

## Users

Dos roles, equipo chico, alta confianza:

- **Admin (PMO / Daniel)** — alimenta el sistema: personas, asignaciones, registros semanales. Está en una tarea de captura y mantención de datos; valora densidad, rapidez de formularios y atajos.
- **Gerente General (viewer)** — consume reportería para decidir: quién está ocioso, carga por cliente, proyectos activos. Está en una tarea de lectura/escaneo; valora claridad, jerarquía y que el dato salte a la vista.

Contexto de uso: escritorio en oficina mayormente, pero el GG puede abrir el panel desde el teléfono. ~45 personas trackeadas, ≤50 filas por vista.

## Product Purpose

Responder en tiempo real "¿en qué está cada persona / cliente / proyecto esta semana?" para PlexoTech (empresa de servicios a aseguradoras). Reemplaza el no-sistema actual (nadie sabe quién está ocioso ni cuántos proyectos activos hay por cliente). Éxito = el GG confía en el panel para tomar decisiones de dotación sin pedir un Excel.

## Brand Personality

Corporativo, limpio, confiable. Tres palabras: **claro, eficiente, sobrio**. No es una marca lúdica ni una landing — es una herramienta que debe desaparecer en la tarea. Acento Spring Green sobre Onyx como firma; el resto neutro. Voz directa en español de Chile.

## Anti-references

- No SaaS-cream con eyebrows tracked sobre cada sección.
- No dashboard "gamer" oscuro lleno de glow.
- No íconos inventados ni glyphs Unicode como afford­ancias (se ven amateur).
- No motion decorativo: nada que el usuario en flujo tenga que esperar.
- No cards anidadas ni KPIs con gradientes.

## Design Principles

1. **La herramienta desaparece en la tarea** — familiaridad ganada (Linear/Stripe/Notion), no sorpresa.
2. **El dato salta primero** — jerarquía y color sirven a la lectura, no a la decoración.
3. **Vocabulario consistente** — mismo botón, mismo control de formulario, mismo ícono en toda la app.
4. **Motion solo comunica estado** — feedback de press, entrada/salida, carga; nada más, y siempre <250ms con reduced-motion.
5. **Responsive estructural** — colapsar nav, tabla con scroll; no tipografía fluida.

## Accessibility & Inclusion

- WCAG AA: cuerpo ≥4.5:1, texto grande ≥3:1, placeholders incluidos.
- `prefers-reduced-motion`: degradar a crossfade/instantáneo, nunca movimiento.
- Foco visible en todo control (ya existe `:focus-visible` global).
- Hover gateado tras `(hover: hover)` para no disparar falsos en touch.
