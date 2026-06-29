import './style.css';

import { calculateBuySellPanelEstimate } from '#orderbook/buySellPanelEstimate';
import {
  calculateInitialMarginFractionWithOverride,
  convertToLeverageParametersBigInt,
} from '#orderbook/quantities';
import {
  absBigInt,
  decimalToPip,
  dividePips,
  maxBigInt,
  multiplyPips,
  pipToDecimal,
} from '#pipmath';
import { OrderSide, TimeInForce } from '#types/enums/request';

import type {
  BuySellPanelEstimate,
  BuySellPanelEstimateArgs,
  BuySellPanelOrder,
} from '#orderbook/buySellPanelEstimate';
import type { LeverageParameters } from '#orderbook/quantities';
import type { OrderBookLevelL2 } from '#types/orderBook';
import type { KatanaPerpsPosition } from '#types/rest/endpoints/index';

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

type Side = 'buy' | 'sell';
type QuantityMode = 'base' | 'quote' | 'slider';

interface BookLevel {
  id: number;
  side: Side;
  price: string;
  size: string;
  own: boolean;
}

interface OtherPosition {
  id: number;
  market: string;
  quantity: string;
  indexPrice: string;
  marginRequirement: string;
  maintenanceMarginFraction: string;
}

interface MarketState {
  symbol: string;
  indexPrice: string;
  initialMarginFraction: string;
  maintenanceMarginFraction: string;
  basePositionSize: string;
  incrementalPositionSize: string;
  incrementalInitialMarginFraction: string;
  maximumPositionSize: string;
  marketOrderExecutionPriceLimit: string;
  limitOrderExecutionPriceLimit: string;
}

interface State {
  market: MarketState;
  imfOverride: string; // '' = no override
  wallet: {
    quoteBalance: string;
    makerFeeRate: string;
    takerFeeRate: string;
    /** Held collateral for the wallet's standing orders in *other* markets */
    heldCollateralOtherMarkets: string;
  };
  takerTradeGasFee: string;
  currentPositionQuantity: string; // signed; index/IMR derived from the market
  otherPositions: OtherPosition[];
  levels: BookLevel[];
  order: {
    side: Side;
    isLimit: boolean;
    limitPrice: string;
    timeInForce: TimeInForce;
    reduceOnly: boolean;
    quantityMode: QuantityMode;
    baseQuantity: string;
    quoteQuantity: string;
    sliderPct: number; // 0..100
  };
}

let nextId = 1;
const id = (): number => nextId++;

function defaultState(): State {
  return {
    market: {
      symbol: 'ETH-USD',
      indexPrice: '100',
      initialMarginFraction: '0.02',
      maintenanceMarginFraction: '0.01',
      basePositionSize: '1000',
      incrementalPositionSize: '100',
      incrementalInitialMarginFraction: '0.01',
      maximumPositionSize: '10000',
      marketOrderExecutionPriceLimit: '0',
      limitOrderExecutionPriceLimit: '0',
    },
    imfOverride: '',
    // Fee rates and execution price limits are entered as percentages (see
    // `pctToFraction`); e.g. -0.02 = -0.02% = -0.0002 fraction.
    wallet: {
      quoteBalance: '100',
      makerFeeRate: '0.01',
      takerFeeRate: '0.04',
      heldCollateralOtherMarkets: '0',
    },
    takerTradeGasFee: '0',
    currentPositionQuantity: '0',
    otherPositions: [],
    levels: [
      { id: id(), side: 'sell', price: '103', size: '10', own: false },
      { id: id(), side: 'sell', price: '102', size: '10', own: false },
      { id: id(), side: 'sell', price: '101', size: '10', own: false },
      { id: id(), side: 'buy', price: '99', size: '10', own: false },
      { id: id(), side: 'buy', price: '98', size: '10', own: false },
      { id: id(), side: 'buy', price: '97', size: '10', own: false },
    ],
    order: {
      side: 'buy',
      isLimit: false,
      limitPrice: '101',
      timeInForce: TimeInForce.gtc,
      reduceOnly: false,
      quantityMode: 'base',
      baseQuantity: '5',
      quoteQuantity: '500',
      sliderPct: 50,
    },
  };
}

let state = defaultState();

/* ------------------------------------------------------------------ *
 * Number helpers (decimal strings <-> pips)
 * ------------------------------------------------------------------ */

function toPip(value: string): bigint {
  const t = (value ?? '').trim();
  if (t === '' || t === '-' || t === '.' || t === '-.') {
    return BigInt(0);
  }
  try {
    return decimalToPip(t);
  } catch {
    return BigInt(0);
  }
}

function fmt(pips: bigint): string {
  return pipToDecimal(pips)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');
}

/**
 * Converts a percentage input (e.g. "0.05" for 0.05%) to the fraction decimal
 * string the SDK consumes (e.g. "0.00050000" for 0.0005).
 */
function pctToFraction(percent: string): string {
  return pipToDecimal(toPip(percent) / BigInt(100));
}

/* ------------------------------------------------------------------ *
 * Estimate input assembly + wallet derivation
 * ------------------------------------------------------------------ */

/** Builds a complete {@link KatanaPerpsPosition} from the fields the estimate reads. */
function makePosition(
  market: string,
  quantity: string,
  indexPrice: string,
  marginRequirement: string,
): KatanaPerpsPosition {
  return {
    market,
    quantity,
    indexPrice,
    marginRequirement,
    maximumQuantity: '0',
    entryPrice: '0',
    exitPrice: '0',
    markPrice: indexPrice,
    liquidationPrice: '0',
    value: '0',
    realizedPnL: '0',
    unrealizedPnL: '0',
    leverage: '0',
    totalFunding: '0',
    totalOpen: '0',
    totalClose: '0',
    adlQuintile: 0,
    openedByFillId: '',
    lastFillId: '',
    time: 0,
  };
}

function leverageParametersOf(m: MarketState): LeverageParameters {
  return {
    maximumPositionSize: m.maximumPositionSize,
    initialMarginFraction: m.initialMarginFraction,
    maintenanceMarginFraction: m.maintenanceMarginFraction,
    basePositionSize: m.basePositionSize,
    incrementalPositionSize: m.incrementalPositionSize,
    incrementalInitialMarginFraction: m.incrementalInitialMarginFraction,
  };
}

/**
 * Held collateral for the market's standing orders, given a signed position.
 * Mirrors the SDK's internal `calculateHeldCollateralForMarket` so the derived
 * wallet aggregate is consistent with what the estimate computes internally.
 */
function deriveHeldCollateral(
  ownOrders: { isBuy: boolean; price: bigint; openQuantity: bigint }[],
  positionQuantity: bigint,
  leverageParameters: ReturnType<typeof convertToLeverageParametersBigInt>,
  imfOverride: bigint | null,
): bigint {
  const marginForQty = (qty: bigint, price: bigint): bigint => {
    if (qty === BigInt(0)) {
      return BigInt(0);
    }
    const quote = multiplyPips(qty, price);
    const imf = calculateInitialMarginFractionWithOverride({
      baseQuantity: qty,
      initialMarginFractionOverride: imfOverride,
      leverageParameters,
    });
    return multiplyPips(quote, imf);
  };

  const positionIsLong = positionQuantity > BigInt(0);
  const reducing = ownOrders
    .filter((o) => o.isBuy === !positionIsLong && o.openQuantity > BigInt(0))
    .sort((a, b) => (a.isBuy ? Number(b.price - a.price) : Number(a.price - b.price)));
  const nonReducing = ownOrders.filter(
    (o) => o.isBuy === positionIsLong && o.openQuantity > BigInt(0),
  );

  let marginRequirement = BigInt(0);
  let remaining = absBigInt(positionQuantity);
  for (const o of reducing) {
    let open = o.openQuantity;
    if (remaining > BigInt(0)) {
      if (open > remaining) {
        open -= remaining;
        remaining = BigInt(0);
      } else {
        remaining -= open;
        open = BigInt(0);
      }
    }
    marginRequirement += marginForQty(open, o.price);
  }
  for (const o of nonReducing) {
    marginRequirement += marginForQty(o.openQuantity, o.price);
  }
  return marginRequirement;
}

interface DerivedWallet {
  equity: bigint;
  initialMarginRequirement: bigint;
  maintenanceMarginRequirement: bigint;
  heldCollateral: bigint;
  freeCollateral: bigint;
  availableCollateral: bigint;
  marginRatio: bigint;
  currentPositionMarginRequirement: bigint;
}

interface ComputeResult {
  args: BuySellPanelEstimateArgs;
  estimate: BuySellPanelEstimate;
  derived: DerivedWallet;
  error?: string;
}

function buildQuantity(): BuySellPanelOrder {
  const side = state.order.side === 'buy' ? OrderSide.buy : OrderSide.sell;
  const common = {
    side,
    timeInForce: state.order.timeInForce,
    reduceOnly: state.order.reduceOnly,
  };
  const limit = state.order.isLimit ? { limitPrice: toPip(state.order.limitPrice) } : {};
  if (state.order.quantityMode === 'base') {
    return { ...common, ...limit, baseQuantity: toPip(state.order.baseQuantity) };
  }
  if (state.order.quantityMode === 'quote') {
    return { ...common, ...limit, quoteQuantity: toPip(state.order.quoteQuantity) };
  }
  const ratio = decimalToPip((state.order.sliderPct / 100).toFixed(8));
  return { ...common, ...limit, availableCollateralRatio: ratio };
}

function compute(): ComputeResult {
  const m = state.market;
  const indexPrice = toPip(m.indexPrice);
  const leverageParameters = convertToLeverageParametersBigInt(leverageParametersOf(m));
  const imfOverride = state.imfOverride.trim() === '' ? null : toPip(state.imfOverride);

  // Current-market position: index price = market index; IMR derived.
  const currentQty = toPip(state.currentPositionQuantity);
  const currentNotional = multiplyPips(absBigInt(currentQty), indexPrice);
  const currentImf = calculateInitialMarginFractionWithOverride({
    baseQuantity: currentQty,
    initialMarginFractionOverride: imfOverride,
    leverageParameters,
  });
  const currentMR = multiplyPips(currentNotional, currentImf);
  const currentMMR = multiplyPips(currentNotional, toPip(m.maintenanceMarginFraction));

  // Aggregate over all positions (current market + other markets).
  const quoteBalance = toPip(state.wallet.quoteBalance);
  let positionsNotionalSigned = multiplyPips(currentQty, indexPrice);
  let totalInitialMR = currentMR;
  let totalMaintenanceMR = currentMMR;

  const positions: KatanaPerpsPosition[] = [];
  if (currentQty !== BigInt(0)) {
    positions.push(makePosition(m.symbol, fmt(currentQty), m.indexPrice, fmt(currentMR)));
  }
  for (const p of state.otherPositions) {
    const qty = toPip(p.quantity);
    const idx = toPip(p.indexPrice);
    const mr = toPip(p.marginRequirement);
    const mmf = toPip(p.maintenanceMarginFraction);
    positionsNotionalSigned += multiplyPips(qty, idx);
    totalInitialMR += mr;
    totalMaintenanceMR += multiplyPips(multiplyPips(absBigInt(qty), idx), mmf);
    positions.push(makePosition(p.market, p.quantity, p.indexPrice, p.marginRequirement));
  }

  const equity = quoteBalance + positionsNotionalSigned;

  // Held collateral from the wallet's own (flagged) standing orders.
  const ownOrders = state.levels
    .filter((l) => l.own)
    .map((l) => ({
      isBuy: l.side === 'buy',
      price: toPip(l.price),
      openQuantity: toPip(l.size),
    }));
  const heldThisMarket = deriveHeldCollateral(
    ownOrders,
    currentQty,
    leverageParameters,
    imfOverride,
  );
  // Total held collateral = this market's own standing orders (derived) + funds
  // held for the wallet's standing orders in other markets (entered directly).
  const heldCollateral =
    heldThisMarket + toPip(state.wallet.heldCollateralOtherMarkets);

  const freeCollateral = maxBigInt(equity - totalInitialMR, BigInt(0));
  const availableCollateral = maxBigInt(freeCollateral - heldCollateral, BigInt(0));
  const marginRatio = equity > BigInt(0) ? dividePips(totalMaintenanceMR, equity) : BigInt(0);

  const derived: DerivedWallet = {
    equity,
    initialMarginRequirement: totalInitialMR,
    maintenanceMarginRequirement: totalMaintenanceMR,
    heldCollateral,
    freeCollateral,
    availableCollateral,
    marginRatio,
    currentPositionMarginRequirement: currentMR,
  };

  const market: BuySellPanelEstimateArgs['market'] = {
    market: m.symbol,
    indexPrice: m.indexPrice,
    maximumPositionSize: m.maximumPositionSize,
    initialMarginFraction: m.initialMarginFraction,
    maintenanceMarginFraction: m.maintenanceMarginFraction,
    basePositionSize: m.basePositionSize,
    incrementalPositionSize: m.incrementalPositionSize,
    incrementalInitialMarginFraction: m.incrementalInitialMarginFraction,
    marketOrderExecutionPriceLimit: pctToFraction(m.marketOrderExecutionPriceLimit),
    limitOrderExecutionPriceLimit: pctToFraction(m.limitOrderExecutionPriceLimit),
  };

  const toLevel = (l: BookLevel): OrderBookLevelL2 => ({
    price: toPip(l.price),
    size: toPip(l.size),
    numOrders: 1,
    type: 'limit',
  });
  const asks = state.levels
    .filter((l) => l.side === 'sell')
    .map(toLevel)
    .sort((a, b) => (a.price < b.price ? -1 : a.price > b.price ? 1 : 0));
  const bids = state.levels
    .filter((l) => l.side === 'buy')
    .map(toLevel)
    .sort((a, b) => (a.price > b.price ? -1 : a.price < b.price ? 1 : 0));

  const walletsStandingOrders = state.levels
    .filter((l) => l.own)
    .map((l) => ({
      market: m.symbol,
      side: (l.side === 'buy' ? OrderSide.buy : OrderSide.sell) as OrderSide,
      price: l.price,
      originalQuantity: l.size,
      executedQuantity: '0',
      status: 'open' as const,
    }));

  const args: BuySellPanelEstimateArgs = {
    market,
    wallet: {
      equity: fmt(equity),
      heldCollateral: fmt(heldCollateral),
      quoteBalance: fmt(quoteBalance),
      marginRatio: fmt(marginRatio),
      makerFeeRate: pctToFraction(state.wallet.makerFeeRate),
      takerFeeRate: pctToFraction(state.wallet.takerFeeRate),
      positions,
    },
    orderBook: { asks, bids },
    walletsStandingOrders,
    walletInitialMarginFractionOverrides:
      imfOverride === null
        ? []
        : [
            {
              wallet: '0xtestui',
              market: m.symbol,
              initialMarginFractionOverride: state.imfOverride,
            },
          ],
    takerTradeGasFee: toPip(state.takerTradeGasFee),
    order: buildQuantity(),
  };

  try {
    return { args, estimate: calculateBuySellPanelEstimate(args), derived };
  } catch (err) {
    return {
      args,
      derived,
      estimate: {
        tradeBaseQuantity: BigInt(0),
        tradeQuoteQuantity: BigInt(0),
        makerBaseQuantity: BigInt(0),
        cost: BigInt(0),
        liquidationPrice: null,
        selfTradeEncountered: false,
        freeCollateralExceeded: false,
        availableCollateralExceeded: false,
        executionPriceLimitExceeded: false,
        maximumPositionSizeExceeded: false,
        postOnlyWouldCross: false,
        immediateOrCancelWouldNotExecute: false,
        fillOrKillWouldNotExecute: false,
        reduceOnlyWouldNotReducePosition: false,
        reduceOnlyNoOpenPosition: false,
        reduceOnlyOpenPositionSizeExceeded: false,
      },
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/* ------------------------------------------------------------------ *
 * Tiny DOM helpers
 * ------------------------------------------------------------------ */

type Child = Node | string | null | undefined | Child[];

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, unknown> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const elNode = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) {
      continue;
    }
    if (key === 'class') {
      elNode.className = String(value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      elNode.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === 'value') {
      (elNode as HTMLInputElement).value = String(value);
    } else if (key === 'checked' || key === 'disabled') {
      (elNode as HTMLInputElement)[key] = Boolean(value);
    } else {
      elNode.setAttribute(key, String(value));
    }
  }
  const append = (c: Child): void => {
    if (c === null || c === undefined) {
      return;
    }
    if (Array.isArray(c)) {
      c.forEach(append);
    } else {
      elNode.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
  };
  children.forEach(append);
  return elNode;
}

function textField(
  label: string,
  value: string,
  onInput: (v: string) => void,
  placeholder = '',
): HTMLElement {
  const input = h('input', {
    type: 'text',
    value,
    placeholder,
    oninput: (e: Event) => onInput((e.target as HTMLInputElement).value),
  });
  return h('div', { class: 'field' }, h('label', {}, label), input);
}

function segmented<T extends string>(
  options: { value: T; label: string; cls?: string }[],
  current: T,
  onChange: (v: T) => void,
  extraClass = '',
): HTMLElement {
  return h(
    'div',
    { class: `seg ${extraClass}` },
    options.map((o) =>
      h(
        'button',
        {
          type: 'button',
          class: `${o.value === current ? 'active' : ''} ${o.cls ?? ''}`,
          onclick: () => onChange(o.value),
        },
        o.label,
      ),
    ),
  );
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

const app = document.getElementById('app')!;

let resultsBody: HTMLElement;
let derivedBody: HTMLElement;
let bookBody: HTMLElement;
let positionsBody: HTMLElement;
let orderBody: HTMLElement;
let bookTable: HTMLElement;
let spreadRowEl: HTMLElement;
let bookError: HTMLElement;
const levelEls = new Map<number, HTMLElement>();

function rebuildAll(): void {
  app.innerHTML = '';
  levelEls.clear();

  // Column 1: order entry + results
  orderBody = h('div', {});
  const orderPanel = h('section', { class: 'panel' }, h('h2', {}, 'Order'), orderBody);
  resultsBody = h('div', {});
  const resultsPanel = h(
    'section',
    { class: 'panel' },
    h('h2', {}, 'Estimate result'),
    resultsBody,
  );
  const col1 = h('div', {}, orderPanel, resultsPanel);

  // Column 2: order book
  bookBody = h('div', { class: 'book' });
  const bookPanel = h(
    'section',
    { class: 'panel' },
    h('h2', {}, 'Order book'),
    h(
      'div',
      { class: 'panel-note' },
      'Editable price/size per level. "Own" marks the level as the wallet’s own resting order (drives self-trades & held funds). Crossable levels are outlined.',
    ),
    bookBody,
  );
  const col2 = h('div', {}, bookPanel);

  // Column 3: market + wallet + positions
  derivedBody = h('div', { class: 'derived' });
  positionsBody = h('div', {});
  const col3 = h(
    'div',
    {},
    marketPanel(),
    walletPanel(),
    h(
      'section',
      { class: 'panel' },
      h('h2', {}, 'Derived wallet (sent to estimate)'),
      derivedBody,
    ),
    h('section', { class: 'panel' }, h('h2', {}, 'Positions'), positionsBody),
  );

  app.append(col1, col2, col3);

  renderOrder();
  renderBook();
  renderPositions();
  recompute();
}

function marketPanel(): HTMLElement {
  const m = state.market;
  const f = (
    label: string,
    key: keyof MarketState,
    placeholder = '',
  ): HTMLElement =>
    textField(
      label,
      m[key],
      (v) => {
        m[key] = v;
        recompute();
      },
      placeholder,
    );
  return h(
    'section',
    { class: 'panel' },
    h('h2', {}, 'Market'),
    f('Symbol', 'symbol'),
    h(
      'div',
      { class: 'grid-2' },
      f('Index price', 'indexPrice'),
      textField('IMF override (optional)', state.imfOverride, (v) => {
        state.imfOverride = v;
        recompute();
      }, 'none'),
    ),
    h(
      'div',
      { class: 'grid-2' },
      f('Initial margin fraction (IMF)', 'initialMarginFraction'),
      f('Maintenance margin fraction (MMF)', 'maintenanceMarginFraction'),
    ),
    h(
      'div',
      { class: 'grid-2' },
      f('Base position size', 'basePositionSize'),
      f('Maximum position size', 'maximumPositionSize'),
    ),
    h(
      'div',
      { class: 'grid-2' },
      f('Incremental position size', 'incrementalPositionSize'),
      f('Incremental IMF', 'incrementalInitialMarginFraction'),
    ),
    h(
      'div',
      { class: 'grid-2' },
      f('Market exec. price limit (%)', 'marketOrderExecutionPriceLimit', '0 = off'),
      f('Limit exec. price limit (%)', 'limitOrderExecutionPriceLimit', '0 = off'),
    ),
  );
}

function walletPanel(): HTMLElement {
  const w = state.wallet;
  return h(
    'section',
    { class: 'panel' },
    h('h2', {}, 'Wallet'),
    h(
      'div',
      { class: 'panel-note' },
      'Equity, held collateral and margin ratio are derived from these inputs + positions.',
    ),
    h(
      'div',
      { class: 'grid-3' },
      textField('Maker fee rate (%)', w.makerFeeRate, (v) => {
        w.makerFeeRate = v;
        recompute();
      }),
      textField('Taker fee rate (%)', w.takerFeeRate, (v) => {
        w.takerFeeRate = v;
        recompute();
      }),
      textField('Taker gas fee (per fill, USD)', state.takerTradeGasFee, (v) => {
        state.takerTradeGasFee = v;
        recompute();
      }),
    ),
    textField('Quote balance', w.quoteBalance, (v) => {
      w.quoteBalance = v;
      recompute();
    }),
    textField(
      'Held collateral in other markets',
      w.heldCollateralOtherMarkets,
      (v) => {
        w.heldCollateralOtherMarkets = v;
        recompute();
      },
    ),
  );
}

function renderOrder(): void {
  const o = state.order;
  orderBody.innerHTML = '';

  const sideSeg = segmented<Side>(
    [
      { value: 'buy', label: 'Buy / Long', cls: 'buy' },
      { value: 'sell', label: 'Sell / Short', cls: 'sell' },
    ],
    o.side,
    (v) => {
      o.side = v;
      renderOrder();
      recompute();
    },
    'buysell',
  );

  const typeSeg = segmented(
    [
      { value: 'market', label: 'Market' },
      { value: 'limit', label: 'Limit' },
    ],
    o.isLimit ? 'limit' : 'market',
    (v) => {
      o.isLimit = v === 'limit';
      renderOrder();
      recompute();
    },
  );

  const limitField = o.isLimit
    ? textField('Limit price', o.limitPrice, (v) => {
        o.limitPrice = v;
        recompute();
      })
    : null;

  const tif = h(
    'div',
    { class: 'field' },
    h('label', {}, 'Time in force'),
    segmented<TimeInForce>(
      [
        { value: TimeInForce.gtc, label: 'GTC' },
        { value: TimeInForce.gtx, label: 'GTX' },
        { value: TimeInForce.ioc, label: 'IOC' },
        { value: TimeInForce.fok, label: 'FOK' },
      ],
      o.timeInForce,
      (v) => {
        o.timeInForce = v;
        renderOrder();
        recompute();
      },
    ),
  );

  const reduceOnly = h(
    'label',
    { class: 'checkbox' },
    h('input', {
      type: 'checkbox',
      checked: o.reduceOnly,
      onchange: (e: Event) => {
        o.reduceOnly = (e.target as HTMLInputElement).checked;
        recompute();
      },
    }),
    'Reduce only',
  );

  const modeSeg = segmented<QuantityMode>(
    [
      { value: 'base', label: 'Base qty' },
      { value: 'quote', label: 'Quote qty' },
      { value: 'slider', label: 'Slider' },
    ],
    o.quantityMode,
    (v) => {
      o.quantityMode = v;
      renderOrder();
      recompute();
    },
  );

  let quantityControl: HTMLElement;
  if (o.quantityMode === 'base') {
    quantityControl = textField('Quantity (base)', o.baseQuantity, (v) => {
      o.baseQuantity = v;
      recompute();
    });
  } else if (o.quantityMode === 'quote') {
    quantityControl = textField('Quantity (quote)', o.quoteQuantity, (v) => {
      o.quoteQuantity = v;
      recompute();
    });
  } else {
    const pct = h('span', { class: 'pct' }, `${o.sliderPct}%`);
    const range = h('input', {
      type: 'range',
      min: '0',
      max: '100',
      step: '1',
      value: String(o.sliderPct),
      oninput: (e: Event) => {
        o.sliderPct = Number((e.target as HTMLInputElement).value);
        pct.textContent = `${o.sliderPct}%`;
        recompute();
      },
    });
    quantityControl = h(
      'div',
      { class: 'field' },
      h('label', {}, 'Available collateral to consume'),
      h('div', { class: 'slider-row' }, range, pct),
    );
  }

  orderBody.append(
    sideSeg,
    h('div', { style: 'height:10px' }),
    typeSeg,
    h('div', { style: 'height:10px' }),
    limitField ?? document.createComment(''),
    tif,
    reduceOnly,
    h('div', { class: 'sectionTitle', style: 'margin-top:6px' }, 'Quantity'),
    modeSeg,
    h('div', { style: 'height:8px' }),
    quantityControl,
  );
}

function renderPositions(): void {
  positionsBody.innerHTML = '';

  positionsBody.append(
    h('div', { class: 'sectionTitle' }, `Current market position (${state.market.symbol})`),
    h(
      'div',
      { class: 'panel-note' },
      'Index price = market index; margin requirement is derived from IMF.',
    ),
    textField('Position quantity (signed)', state.currentPositionQuantity, (v) => {
      state.currentPositionQuantity = v;
      recompute();
    }),
  );

  positionsBody.append(
    h('div', { class: 'sectionTitle', style: 'margin-top:10px' }, 'Other-market positions'),
  );
  for (const p of state.otherPositions) {
    positionsBody.append(otherPositionRow(p));
  }
  positionsBody.append(
    h(
      'button',
      {
        type: 'button',
        class: 'add',
        onclick: () => {
          state.otherPositions.push({
            id: id(),
            market: 'BTC-USD',
            quantity: '1',
            indexPrice: '100',
            marginRequirement: '10',
            maintenanceMarginFraction: '0.01',
          });
          renderPositions();
          recompute();
        },
      },
      '+ add other-market position',
    ),
  );
}

function otherPositionRow(p: OtherPosition): HTMLElement {
  const bind =
    (key: keyof OtherPosition) =>
    (v: string): void => {
      (p[key] as string) = v;
      recompute();
    };
  return h(
    'div',
    { class: 'pos-row' },
    h(
      'div',
      { class: 'row-head' },
      textField('Market', p.market, bind('market')),
      h(
        'button',
        {
          type: 'button',
          class: 'danger',
          onclick: () => {
            state.otherPositions = state.otherPositions.filter((x) => x.id !== p.id);
            renderPositions();
            recompute();
          },
        },
        '✕',
      ),
    ),
    h(
      'div',
      { class: 'grid-2' },
      textField('Quantity (signed)', p.quantity, bind('quantity')),
      textField('Index price', p.indexPrice, bind('indexPrice')),
    ),
    h(
      'div',
      { class: 'grid-2' },
      textField('Margin requirement (IMR)', p.marginRequirement, bind('marginRequirement')),
      textField('Maintenance margin frac.', p.maintenanceMarginFraction, bind('maintenanceMarginFraction')),
    ),
  );
}

/** Levels sorted by price descending (highest first), the order shown in the book. */
function levelsByPriceDesc(side: Side): BookLevel[] {
  return state.levels
    .filter((l) => l.side === side)
    .sort((a, b) =>
      toPip(b.price) > toPip(a.price) ? 1 : toPip(b.price) < toPip(a.price) ? -1 : 0,
    );
}

function renderBook(): void {
  bookBody.innerHTML = '';
  levelEls.clear();

  const asks = levelsByPriceDesc('sell');
  const bids = levelsByPriceDesc('buy');

  const maxSize = state.levels.reduce((mx, l) => {
    const s = toPip(l.size);
    return s > mx ? s : mx;
  }, BigInt(1));

  const table = h('table', {});
  bookTable = table;
  table.append(
    h(
      'tr',
      {},
      h('th', { style: 'text-align:left' }, 'Price'),
      h('th', { style: 'text-align:left' }, 'Size'),
      h('th', {}, 'Own'),
      h('th', {}, ''),
    ),
  );

  // Asks: highest price first (top), best ask nearest the spread (bottom).
  for (const l of asks) {
    table.append(levelRow(l, maxSize));
  }

  const spreadRow = h('tr', {}, h('td', { colspan: '4', class: 'spread' }, ''));
  spreadRowEl = spreadRow;
  table.append(spreadRow);

  for (const l of bids) {
    table.append(levelRow(l, maxSize));
  }

  bookError = h('div', { class: 'book-error' });

  bookBody.append(
    h(
      'div',
      { style: 'display:flex; gap:8px; margin-bottom:8px' },
      h(
        'button',
        { type: 'button', class: 'add', onclick: () => addLevel('sell') },
        '+ ask',
      ),
      h(
        'button',
        { type: 'button', class: 'add', onclick: () => addLevel('buy') },
        '+ bid',
      ),
    ),
    table,
    bookError,
  );

  updateSpreadText();
}

/** Re-orders the level rows in place (preserving inputs/focus) by sorted price. */
function reorderBookRows(): void {
  if (!bookTable || !spreadRowEl) {
    return;
  }
  for (const l of levelsByPriceDesc('sell')) {
    const row = levelEls.get(l.id);
    if (row) {
      bookTable.insertBefore(row, spreadRowEl);
    }
  }
  let prev: Node = spreadRowEl;
  for (const l of levelsByPriceDesc('buy')) {
    const row = levelEls.get(l.id);
    if (row) {
      bookTable.insertBefore(row, prev.nextSibling);
      prev = row;
    }
  }
  updateSpreadText();
}

function updateSpreadText(): void {
  if (!spreadRowEl) {
    return;
  }
  const asks = levelsByPriceDesc('sell');
  const bids = levelsByPriceDesc('buy');
  const bestAsk = asks.length ? toPip(asks[asks.length - 1].price) : null;
  const bestBid = bids.length ? toPip(bids[0].price) : null;
  const cell = spreadRowEl.firstElementChild;
  if (cell) {
    cell.textContent =
      bestAsk !== null && bestBid !== null
        ? `spread ${fmt(bestAsk - bestBid)} · mid ${fmt((bestAsk + bestBid) / BigInt(2))} · index ${state.market.indexPrice}`
        : `index ${state.market.indexPrice}`;
  }
}

function levelRow(l: BookLevel, maxSize: bigint): HTMLElement {
  const depthPct = Number((toPip(l.size) * BigInt(100)) / (maxSize > BigInt(0) ? maxSize : BigInt(1)));
  const row = h(
    'tr',
    { class: `lvl ${l.side === 'sell' ? 'ask' : 'bid'}` },
    h('td', { class: 'price-cell lvl' },
      h('div', { class: 'depth', style: `width:${depthPct}%` }),
      h('input', {
        type: 'text',
        inputmode: 'decimal',
        value: l.price,
        oninput: (e: Event) => {
          l.price = (e.target as HTMLInputElement).value;
          recompute();
        },
        // Re-sort the book once the edit is committed (blur/enter), preserving
        // the input elements so focus is not disrupted.
        onchange: () => reorderBookRows(),
      }),
    ),
    h('td', { class: 'lvl' },
      h('input', {
        type: 'text',
        value: l.size,
        oninput: (e: Event) => {
          l.size = (e.target as HTMLInputElement).value;
          recompute();
        },
      }),
    ),
    h('td', { class: 'own-cell' },
      h('input', {
        type: 'checkbox',
        checked: l.own,
        onchange: (e: Event) => {
          l.own = (e.target as HTMLInputElement).checked;
          recompute();
        },
      }),
      h('span', { class: 'badge' }),
    ),
    h('td', {},
      h(
        'button',
        {
          type: 'button',
          class: 'danger',
          onclick: () => {
            state.levels = state.levels.filter((x) => x.id !== l.id);
            renderBook();
            recompute();
          },
        },
        '✕',
      ),
    ),
  );
  levelEls.set(l.id, row);
  return row;
}

function addLevel(side: Side): void {
  const sideLevels = state.levels.filter((l) => l.side === side).map((l) => toPip(l.price));
  let price: bigint;
  if (side === 'sell') {
    price = sideLevels.length ? sideLevels.reduce((a, b) => (a > b ? a : b)) + toPip('1') : toPip('101');
  } else {
    price = sideLevels.length ? sideLevels.reduce((a, b) => (a < b ? a : b)) - toPip('1') : toPip('99');
  }
  state.levels.push({ id: id(), side, price: fmt(price), size: '10', own: false });
  renderBook();
  recompute();
}

/* ------------------------------------------------------------------ *
 * Results
 * ------------------------------------------------------------------ */

function kv(k: string, v: string, cls = ''): HTMLElement {
  return h('div', { class: 'kv' }, h('span', { class: 'k' }, k), h('span', { class: `v ${cls}` }, v));
}

function recompute(): void {
  const { estimate, derived, error, args } = compute();

  // Book highlight + price ordering validation.
  const o = state.order;
  const makerSide: Side = o.side === 'buy' ? 'sell' : 'buy';
  const limit = toPip(o.limitPrice);

  // Every ask must stay above every bid (asks ascending, bids descending),
  // and prices must be positive.
  const askPrices = state.levels.filter((l) => l.side === 'sell').map((l) => toPip(l.price));
  const bidPrices = state.levels.filter((l) => l.side === 'buy').map((l) => toPip(l.price));
  const bestAsk = askPrices.length ? askPrices.reduce((a, b) => (b < a ? b : a)) : null;
  const bestBid = bidPrices.length ? bidPrices.reduce((a, b) => (b > a ? b : a)) : null;

  let anyInvalid = false;
  for (const l of state.levels) {
    const row = levelEls.get(l.id);
    if (!row) {
      continue;
    }
    const price = toPip(l.price);
    const crosses =
      l.side === makerSide &&
      (!o.isLimit ||
        (o.side === 'buy' ? limit >= price : limit <= price));
    row.classList.toggle('crossable', crosses);
    row.classList.toggle('selftrade', crosses && l.own);

    const invalid =
      price <= BigInt(0) ||
      (l.side === 'sell' && bestBid !== null && price <= bestBid) ||
      (l.side === 'buy' && bestAsk !== null && price >= bestAsk);
    anyInvalid = anyInvalid || invalid;
    const priceInput = row.querySelector('.price-cell input');
    if (priceInput instanceof HTMLInputElement) {
      priceInput.classList.toggle('invalid', invalid);
    }
  }
  if (bookError) {
    bookError.textContent = anyInvalid
      ? '⚠ Prices out of order: every ask must be above every bid, and prices must be greater than 0.'
      : '';
  }
  updateSpreadText();

  // Derived wallet panel
  derivedBody.innerHTML = '';
  derivedBody.append(
    kv('equity', fmt(derived.equity)),
    kv('initial margin requirement', fmt(derived.initialMarginRequirement)),
    kv('maintenance margin requirement', fmt(derived.maintenanceMarginRequirement)),
    kv('held collateral', fmt(derived.heldCollateral)),
    kv('free collateral', fmt(derived.freeCollateral)),
    kv('available collateral', fmt(derived.availableCollateral)),
    kv('margin ratio', fmt(derived.marginRatio)),
  );

  // Result panel
  resultsBody.innerHTML = '';

  if (error) {
    resultsBody.append(
      h('div', { class: 'flag on' }, `Error: ${error}`),
    );
  }

  const orderSummary =
    o.quantityMode === 'slider'
      ? `${o.side.toUpperCase()} ${o.isLimit ? `limit @ ${o.limitPrice}` : 'market'} · slider ${o.sliderPct}% → solved base ${fmt(estimate.tradeBaseQuantity + estimate.makerBaseQuantity)}`
      : `${o.side.toUpperCase()} ${o.isLimit ? `limit @ ${o.limitPrice}` : 'market'} · ${o.quantityMode} ${o.quantityMode === 'base' ? o.baseQuantity : o.quoteQuantity}`;
  resultsBody.append(h('div', { class: 'panel-note' }, orderSummary));

  const costCls = estimate.cost > BigInt(0) ? 'pos' : estimate.cost < BigInt(0) ? 'neg' : '';
  const grid = h('div', { class: 'result-grid' });
  grid.append(
    kv('tradeBaseQuantity', fmt(estimate.tradeBaseQuantity)),
    kv('tradeQuoteQuantity', fmt(estimate.tradeQuoteQuantity)),
    kv('makerBaseQuantity', fmt(estimate.makerBaseQuantity)),
    kv('cost (Δ available collateral)', fmt(estimate.cost), costCls),
    kv(
      'liquidationPrice',
      estimate.liquidationPrice === null ? '—' : fmt(estimate.liquidationPrice),
    ),
  );
  resultsBody.append(grid);

  const flags: { key: keyof BuySellPanelEstimate; info?: boolean }[] = [
    { key: 'selfTradeEncountered', info: true },
    { key: 'freeCollateralExceeded' },
    { key: 'availableCollateralExceeded' },
    { key: 'executionPriceLimitExceeded' },
    { key: 'maximumPositionSizeExceeded' },
    { key: 'postOnlyWouldCross' },
    { key: 'immediateOrCancelWouldNotExecute' },
    { key: 'fillOrKillWouldNotExecute' },
    { key: 'reduceOnlyWouldNotReducePosition' },
    { key: 'reduceOnlyNoOpenPosition' },
    { key: 'reduceOnlyOpenPositionSizeExceeded' },
  ];
  const flagsEl = h('div', { class: 'flags' });
  for (const f of flags) {
    const on = estimate[f.key] === true;
    flagsEl.append(
      h(
        'span',
        { class: `flag ${on ? 'on' : ''} ${on && f.info ? 'info' : ''}` },
        `${f.key}: ${on}`,
      ),
    );
  }
  resultsBody.append(flagsEl);

  // Full object (raw)
  const raw = {
    tradeBaseQuantity: estimate.tradeBaseQuantity.toString(),
    tradeQuoteQuantity: estimate.tradeQuoteQuantity.toString(),
    makerBaseQuantity: estimate.makerBaseQuantity.toString(),
    cost: estimate.cost.toString(),
    liquidationPrice:
      estimate.liquidationPrice === null ? null : estimate.liquidationPrice.toString(),
    selfTradeEncountered: estimate.selfTradeEncountered,
    freeCollateralExceeded: estimate.freeCollateralExceeded,
    availableCollateralExceeded: estimate.availableCollateralExceeded,
    executionPriceLimitExceeded: estimate.executionPriceLimitExceeded,
    maximumPositionSizeExceeded: estimate.maximumPositionSizeExceeded,
    postOnlyWouldCross: estimate.postOnlyWouldCross,
    immediateOrCancelWouldNotExecute: estimate.immediateOrCancelWouldNotExecute,
    fillOrKillWouldNotExecute: estimate.fillOrKillWouldNotExecute,
    reduceOnlyWouldNotReducePosition: estimate.reduceOnlyWouldNotReducePosition,
    reduceOnlyNoOpenPosition: estimate.reduceOnlyNoOpenPosition,
    reduceOnlyOpenPositionSizeExceeded: estimate.reduceOnlyOpenPositionSizeExceeded,
  };
  resultsBody.append(
    h(
      'details',
      { class: 'raw' },
      h('summary', {}, 'Full BuySellPanelEstimate object (raw pips)'),
      h('pre', {}, JSON.stringify(raw, null, 2)),
    ),
    h(
      'details',
      { class: 'raw' },
      h('summary', {}, 'Estimate args (what the SDK received)'),
      h('pre', {}, JSON.stringify(args, bigintReplacer, 2)),
    ),
  );
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

document.getElementById('reset')!.addEventListener('click', () => {
  state = defaultState();
  rebuildAll();
});

rebuildAll();
