# CDI Trading Dashboard

Dashboard de análisis de mercado para el equipo de CDI (Club de Inversionistas).

## Stack

- **Next.js 14** + TypeScript
- **Tailwind CSS** — tema dark CDI (`#0A0A0B` bg, `#C8F135` accent)
- **lightweight-charts** — gráficos de velas japonesas (TradingView)
- **Yahoo Finance** (no oficial) — datos de mercado con ~15min delay, sin API key
- **Vercel** — deploy

---

## Módulos

### 1. Cierre de Mercado
Muestra precios y variación diaria de:
- **Índices:** SPY, QQQ, DIA, IWM
- **ETFs sectoriales:** XLK, XLF, XLE, XLV, XLI, XLC, XLY, XLRE

Cada card es clickeable y lleva al detalle del ticker.

### 2. Buscador de Tickers
Barra de búsqueda en el header. Escribe cualquier ticker (AAPL, NVDA, etc.) y presiona Enter.

### 3. Vista de Ticker — Estilo TradingView
- **Temporalidades:** 1D, 1W, 1M, 3M, 6M, 1Y, 5Y
- **Indicadores:** MA20 (azul), MA50 (rosa) — toggle on/off
- **Herramientas de dibujo:** línea horizontal con precio exacto
- **Info bar:** O/H/L/C + cambio % + volumen en el crosshair
- **Stats:** Volumen, Prev Close, 52W High/Low, Market Cap

### 4. Score de Trades
Tabla de trades con mock data. Calcula:
- Score promedio de ejecución / timing / riesgo
- Win Rate
- P&L acumulado

> En v2 se conectará a Google Sheets o Supabase para datos reales.

---

## Correr localmente

```bash
cd apps/trading-dashboard
npm install
npm run dev
# → http://localhost:3001
```

No se requiere ninguna API key para correr localmente.

---

## Variables de entorno

El dashboard funciona sin variables de entorno (Yahoo Finance no requiere key).

Si en el futuro se integra Alpha Vantage u otro proveedor, crear:

```
apps/trading-dashboard/.env.local
```

Ver `.env.example` para el formato.

---

## Deploy en Vercel

### Primera vez

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Desde la carpeta del app:
```bash
cd apps/trading-dashboard
vercel
```

Responde las preguntas:
- Set up and deploy? → `Y`
- Which scope? → tu cuenta
- Link to existing project? → `N` (primera vez)
- Project name → `cdi-trading-dashboard`
- Directory → `.`
- Override settings? → `N`

4. Deploy a producción:
```bash
vercel --prod
```

### Actualizaciones (después del primer deploy)

```bash
cd apps/trading-dashboard
vercel --prod
```

### Alternativa: GitHub + Vercel (recomendado para el equipo)

1. Sube el código a GitHub:
```bash
git add .
git commit -m "feat: trading dashboard"
git push
```

2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo `CDI-APPS`
3. Configura **Root Directory:** `apps/trading-dashboard`
4. Deploy

Con esta opción, **cada push a `main` redeploya automáticamente**.

---

## Estructura de archivos

```
apps/trading-dashboard/
├── app/
│   ├── api/
│   │   ├── market/route.ts          # Precios índices + ETFs (Yahoo Finance)
│   │   └── ticker/[symbol]/route.ts # Detalle + histórico por ticker
│   ├── ticker/[symbol]/
│   │   ├── page.tsx                 # Página de detalle
│   │   └── TickerDetail.tsx         # Componente con estado de temporalidad
│   ├── globals.css
│   ├── layout.tsx                   # Fuentes CDI (Syne + DM Sans)
│   └── page.tsx                     # Homepage
├── components/
│   ├── MarketCard.tsx               # Card de precio clickeable
│   ├── MarketSection.tsx            # Grid de índices + sectores
│   ├── SearchBar.tsx                # Buscador de tickers
│   ├── TradingChart.tsx             # Chart TradingView completo
│   └── TradesSection.tsx            # Tabla de trades + stats
├── lib/
│   └── mockTrades.ts                # Mock data de trades + cálculos
├── .env.example                     # Plantilla de variables de entorno
├── tailwind.config.js
└── vercel.json
```

---

## Próximos módulos (backlog)

- [ ] **TR2** — Agente Paper de mercado / watchlist
- [ ] **TR3 v2** — Conectar score de trades a Google Sheets / Supabase
- [ ] **TR4** — Scripts: contracción volatilidad, BO con DC, zonas quant
- [ ] **TR5** — Zonas Gamma en chart

---

*CDI Apps — Wyo Hann Chu · abril 2025*
