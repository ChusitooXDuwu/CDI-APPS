# CDI — Master Context para Claude Code

> Este archivo es el punto de partida para trabajar con Claude Code sobre todos los proyectos y apps de la comunidad CDI / Salto.
> Actualízalo conforme avances. Úsalo al inicio de cada sesión con: `claude --context CDI_MASTER_CONTEXT.md`

---

## ¿Qué es CDI?

CDI (Club de Inversionistas) es una comunidad de traders e inversionistas con plataforma propia (campus en Thinkific), contenido educativo, retos de inversión y una comunidad activa. El objetivo de este proyecto es construir herramientas digitales que:

- Faciliten el trabajo interno del equipo (traders, marketing, admins)
- Mejoren la experiencia de los usuarios en el campus
- Automaticen procesos repetitivos con agentes IA
- Centralicen información que hoy vive dispersa

---

## Stack base acordado

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (React) + Tailwind CSS |
| Deploy | Vercel |
| Datos de mercado | Alpha Vantage API |
| Datos de trades | Google Sheets (CSV export) |
| Campus | Thinkific (limitado, API disponible) |
| IA / Agentes | Claude API (Anthropic) |
| Fonts | Syne (display) + DM Sans (body) + JetBrains Mono |
| Tema | Dark — bg `#0A0A0B`, accent `#C8F135` |

---

## Apps y módulos — estado actual

### ✅ 1. CDI Trading Dashboard
**Estado:** Código generado, listo para deploy  
**Repo/carpeta:** `cdi-dashboard/`  
**URL Vercel:** (pendiente de deploy)

**Módulos incluidos:**
- Cierre de mercado: SP500 (SPY), Nasdaq (QQQ), Dow (DIA), Russell (IWM) + 8 ETFs sectoriales (XLK, XLF, XLE, XLV, XLI, XLC, XLY, XLRE)
- Score de trades: lee desde Google Sheet, calcula score promedio de ejecución / timing / riesgo
- Stats: score promedio, win rate, P&L acumulado

**Variables de entorno necesarias:**
```
ALPHA_VANTAGE_KEY=...
GOOGLE_SHEET_ID=...
```

**Formato esperado del Google Sheet:**
| Date | Ticker | Side | Entry | Exit | Ejecucion | Timing | Riesgo | Notes |
|------|--------|------|-------|------|-----------|--------|--------|-------|

**Pendiente / próximos módulos:**
- [ ] Zonas Gamma en chart (imán de precio, rechazo)
- [ ] Agente Paper de mercado / watchlist
- [ ] Scripts propios: contracción de volatilidad, BO con DC, zonas quant
- [ ] Alertas por email/Slack cuando sector cae > X%
- [ ] Clasificación de setups CDI + feedback comunidad

---

## Backlog completo de ideas (thread del equipo)

Organizadas por categoría y fuente. Prioridad no definida — ordenar según sprint.

---

### 🟣 Marketing — Agentes y automatización

| # | Idea | Fuente | Estado |
|---|------|--------|--------|
| M1 | Agente de monitorización de tendencias | Marisol | Backlog |
| M2 | Agente de análisis de tráfico | Marisol | Backlog |
| M3 | Agente de respuesta automática a comentarios | Marisol | Backlog |
| M4 | Agente de creación de contenido | Marisol | Backlog |
| M5 | Agente de reporte automatizado | Marisol | Backlog |
| M6 | Agente estratega de marketing | Marisol | Backlog |

---

### 🔵 Tech / Producto — Infraestructura CDI

| # | Idea | Fuente | Estado | Notas |
|---|------|--------|--------|-------|
| T1 | Tracking completo usuario: adquisición → venta (UTMs → fuente real) | Angela | Pendiente con HyenUk | Ya hay UTMs parciales |
| T2 | App CDI: web + campus integrados en un solo lugar | Angela | Backlog | |
| T3 | Notificaciones campus: nuevo curso, lección, recurso, avisos | Yess | Backlog | Depende de Thinkific API |

---

### 🟢 Trading — Herramientas de análisis

| # | Idea | Fuente | Estado | Notas |
|---|------|--------|--------|-------|
| TR1 | Dashboard mercado: ETF, sectores, SP500 — cierre diario en una hoja | Andrea | **En desarrollo** | Ver `cdi-dashboard/` |
| TR2 | Agente Paper de mercado | Andrea | Backlog | |
| TR3 | Clasificación de setups CDI + score automático por trade | Andrea | **Parcialmente hecho** | Score en dashboard v1 |
| TR4 | Scripts: contracción volatilidad, BO con DC, zonas quant, cambios estructura | Andrea | Backlog | |
| TR5 | Zonas Gamma en chart: imán de precio, rechazo | Andrea | Backlog | Siguiente módulo del dashboard |

---

### 🟡 Campus / Contenido — Organización y rutas

| # | Idea | Fuente | Estado | Notas |
|---|------|--------|--------|-------|
| C1 | Filtrar contenido por estilo de trading (Day, Swing, Trending) | Angela + Carlos | En progreso (Carlos) | Revisar avance con Carlos |
| C2 | Personalización de rutas de aprendizaje según el usuario | Angela | Backlog | |
| C3 | Recomendación automática de contenido | Angela | Backlog | Posible con Claude API |
| C4 | Agente campus: clasifica preguntas, evita duplicados, redirige a KB/videos/FAQs | Andrea | Backlog | Conectar a Thinkific |

---

### 🟠 Comunidad — Retos y registro

| # | Idea | Fuente | Estado | Notas |
|---|------|--------|--------|-------|
| CO1 | Challenge 1k: base centralizada, sin login externo, sin condicionales | Angela | Más avanzado de los retos | Ampliar info |
| CO2 | Reto deudas: seguimiento centralizado | Angela | Backlog | |
| CO3 | Reto Inversión Sistemática: registro sin fricciones | Angela | Backlog | |

---

### ⚪ IA / Agentes CDI — Base

| # | Idea | Fuente | Estado | Notas |
|---|------|--------|--------|-------|
| AI1 | Agente que responde preguntas en contexto CDI (eventos, info interna) | Wyo | **En progreso** | Punto de partida original |

---

## Convenciones del proyecto

### Estructura de carpetas (monorepo sugerido)
```
cdi-apps/
├── apps/
│   ├── trading-dashboard/     # ✅ Listo para deploy
│   ├── campus-agent/          # Próximo
│   ├── challenge-tracker/     # Próximo
│   └── marketing-agents/      # Backlog
├── packages/
│   ├── ui/                    # Componentes compartidos
│   └── lib/                   # Hooks, utils, fetchers
└── CDI_MASTER_CONTEXT.md      # Este archivo
```

### Reglas de código
- Componentes en `components/NombreComponente.jsx`
- API routes en `pages/api/nombre.js`
- Variables de entorno siempre en `.env.example` documentadas
- Nunca hardcodear keys — usar `process.env.*`
- Datos mock siempre disponibles como fallback si la API falla
- Cache en API routes con `Cache-Control: s-maxage=X`

### Diseño / UI
- Tema oscuro por defecto (`bg: #0A0A0B`)
- Accent verde lima (`#C8F135`)
- Tipografía: Syne (títulos), DM Sans (cuerpo), JetBrains Mono (números/código)
- Componentes base: cards con `border border-[#1E1E22]`, `rounded-xl`
- Colores de estado: verde `#4ADE80` (positivo), rojo `#F87171` (negativo), ámbar `#FCD34D` (warning)

---

## Cómo usar este archivo con Claude Code

### Al iniciar una sesión nueva:
```bash
# Opción 1 — pasar como contexto
claude --context CDI_MASTER_CONTEXT.md

# Opción 2 — dentro de Claude Code
> lee CDI_MASTER_CONTEXT.md y dime en qué estamos
```

### Prompts sugeridos para planear:
```
> Basándote en el contexto de CDI_MASTER_CONTEXT.md, arma un plan de desarrollo para el módulo TR5 (Zonas Gamma)

> Crea la estructura de carpetas y archivos para el Challenge Tracker (CO1) siguiendo las convenciones del proyecto

> Revisa el estado actual del trading dashboard y dime qué falta para el módulo de agente Paper de mercado (TR2)

> Propón cómo integrar el Agente CDI (AI1) con Thinkific para el módulo C4
```

### Para actualizar este archivo:
Cuando termines un módulo o cambien los planes, actualiza la tabla de estado:
- `Backlog` → `En progreso` → `En staging` → `✅ Productivo`

---

## Contactos / roles del equipo

| Persona | Rol | Áreas de interés en el proyecto |
|---------|-----|----------------------------------|
| Wyo Hann Chu | Dev / IA | Todo — coordinador del proyecto |
| Angela | Ops / Producto | T1, T2, C1-C4, CO1-CO3 |
| Andrea | Trading | TR1-TR5, C4 |
| Marisol | Marketing | M1-M6 |
| Yess | Comunidad | T3 |
| Carlos | Contenido Campus | C1 |
| HyenUk | Master / Fundador | T1 (pendiente definición) |

---

*Última actualización: abril 2025 — Wyo*
