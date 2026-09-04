# Buy/Sell Panel Test UI

A small, dependency-light web UI that exercises the Katana Perps SDK's
`calculateBuySellPanelEstimate`.

It presents a trading buy/sell panel: an order-entry form, an interactive order
book, editable market parameters, a wallet, and positions — and renders the full
`BuySellPanelEstimate` live as you edit anything.

## Setup

This app lives inside the SDK repo (in `buy-sell-panel-test-ui/`) and consumes
the SDK from the parent directory (`..`). The setup script builds the SDK (so its
`dist/*.d.ts` exist for type-checking) and installs this app:

```bash
nvm use
npm run setup    # builds the parent SDK, then installs this app's dependencies
```

Requires Node 18+ (Vite 5); the SDK builds with Yarn 4 via corepack. An `.nvmrc`
pins `v20.12.2` to match the SDK — run `nvm use` first.

## Run

```bash
npm run dev      # open the printed http://localhost:5173 URL
```

Other scripts:

```bash
npm run build      # production bundle into dist/
npm run preview    # serve the production build
npm run typecheck  # tsc --noEmit
```

## How it consumes the SDK

The SDK ships CommonJS in `dist/` and uses internal `#*` subpath imports, so this
app instead imports the SDK's **TypeScript source** directly via a Vite alias
(`#*` → `../src/*`). That pulls in only the `orderbook` + `pipmath` code (not the
REST/WebSocket clients, ethers, axios, ws, or node crypto), keeping the browser
bundle small and browser-safe. `bignumber.js`
resolves from the SDK's own `node_modules` — so the SDK must be `yarn install`ed
(done by `npm run setup`), but a build of the SDK is not needed to *run* the app.

Type-checking (`npm run typecheck`) is the exception: tsconfig maps `#*` to the
SDK's built `dist/*.d.ts` (so `skipLibCheck` can silence the SDK's internal
source), which is why `npm run setup` also builds the SDK.

## Features

- **Order inputs** — every `BuySellPanelOrder` field: side (buy/sell),
  market/limit toggle + limit price, time-in-force (gtc/gtx/ioc/fok),
  reduce-only, and all three `BuySellPanelEstimateQuantity` modes (base qty,
  quote qty, available-collateral slider).
- **Interactive order book** — 3 bid + 3 ask levels by default, editable
  price/size, add/remove levels per side, depth bars, and an **"own"** checkbox
  per level that registers it as the wallet's resting order (to drive
  self-trades and held-funds). Crossable levels are outlined; self-traded ones
  are tagged.
- **Market params** — index price (100), IMF (0.03), MMF (0.01), optional IMR
  override, plus base/incremental position size, incremental IMF, maximum
  position size, market/limit execution-price limits, and the taker gas fee.
- **Positions** — an editable current-market position (size; index & margin
  derived from the market) and add/remove other-market positions (size, index
  price, IMR, maintenance margin fraction).
- **Derived wallet** — equity, held collateral, and margin ratio are computed
  from quote balance + positions + own orders so the wallet passed to the
  estimate is self-consistent; the derived values are shown.
- **Result** — the full `BuySellPanelEstimate` (decimals, all feasibility flags,
  and the raw pip object), plus the exact args sent to the SDK.
