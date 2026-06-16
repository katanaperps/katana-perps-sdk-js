import {
  absBigInt,
  decimalToPip,
  dividePips,
  maxBigInt,
  minBigInt,
  multiplyPips,
  oneInPips,
} from '#pipmath';

import {
  calculateInitialMarginFractionWithOverride,
  convertToLeverageParametersBigInt,
} from '#orderbook/quantities';
import { OrderSide, TimeInForce } from '#types/enums/request';

import type { LeverageParameters } from '#orderbook/quantities';
import type { OrderBookLevelL2 } from '#types/orderBook';
import type {
  KatanaPerpsInitialMarginFractionOverride,
  KatanaPerpsMarket,
  KatanaPerpsOrder,
  KatanaPerpsWallet,
} from '#types/rest/endpoints/index';

/**
 * The taker (trade fee + gas fee) on a single fill is limited to 5% of the
 * fill's quote quantity.
 *
 * @see {@link https://github.com/idexio/idex-contracts-ikon} (contracts)
 */
const maximumTradeFeeFraction = decimalToPip('0.05');

/**
 * The quantity for a buy/sell panel estimate may be expressed in one of three
 * ways: in base asset terms, in quote asset terms, or as a fraction of the
 * wallet's available collateral to be consumed (the panel's slider; `1` (one
 * pip-fraction, i.e. {@link oneInPips}) consumes all available collateral).
 *
 * Exactly one of the three must be provided.
 */
export type BuySellPanelEstimateQuantity =
  | {
      baseQuantity: bigint;
      quoteQuantity?: undefined;
      availableCollateralRatio?: undefined;
    }
  | {
      baseQuantity?: undefined;
      quoteQuantity: bigint;
      availableCollateralRatio?: undefined;
    }
  | {
      baseQuantity?: undefined;
      quoteQuantity?: undefined;
      /** Fraction of available collateral to consume, in pips (`0` to {@link oneInPips}) */
      availableCollateralRatio: bigint;
    };

/**
 * The buy/sell panel's order inputs.
 *
 * - Omitting {@link BuySellPanelOrder.limitPrice limitPrice} produces a market
 *   order estimate; providing it produces a limit order estimate.
 * - {@link BuySellPanelOrder.timeInForce timeInForce} defaults to
 *   {@link TimeInForce.gtc gtc}.
 */
export type BuySellPanelOrder = {
  side: OrderSide;
  /** Present for limit orders only; in pips */
  limitPrice?: bigint;
  /** Defaults to {@link TimeInForce.gtc} */
  timeInForce?: TimeInForce;
  /** Defaults to `false` */
  reduceOnly?: boolean;
} & BuySellPanelEstimateQuantity;

export interface BuySellPanelEstimateArgs {
  market: Pick<
    KatanaPerpsMarket,
    | 'market'
    | 'indexPrice'
    | keyof LeverageParameters
    | 'maintenanceMarginFraction'
    | 'marketOrderExecutionPriceLimit'
    | 'limitOrderExecutionPriceLimit'
  >;
  /**
   * The wallet placing the order, as returned by the "Get Wallets" endpoint
   * (with positions included).
   */
  wallet: Pick<
    KatanaPerpsWallet,
    | 'equity'
    | 'heldCollateral'
    | 'quoteBalance'
    | 'marginRatio'
    | 'makerFeeRate'
    | 'takerFeeRate'
    | 'positions'
  >;
  /**
   * The order book of the order's market. {@link OrderBookLevelL2.size size}
   * values are expected to include the wallet's own standing orders. Asks are
   * expected to be sorted ascending (lowest price first) and bids descending
   * (highest price first); both are re-sorted defensively.
   */
  orderBook: { asks: OrderBookLevelL2[]; bids: OrderBookLevelL2[] };
  /**
   * All of the wallet's standing (open) orders. Orders in other markets are
   * ignored. Used to detect self-trades and to determine how the wallet's held
   * collateral changes as a result of the estimated order.
   */
  walletsStandingOrders?: Pick<
    KatanaPerpsOrder,
    | 'market'
    | 'side'
    | 'price'
    | 'originalQuantity'
    | 'executedQuantity'
    | 'status'
  >[];
  /**
   * The wallet's initial margin fraction overrides, as returned by the "Get
   * Initial Margin Fraction Override" endpoint. Only the entry for the order's
   * market is used.
   */
  walletInitialMarginFractionOverrides?: KatanaPerpsInitialMarginFractionOverride[];
  /**
   * The taker gas fee charged per matched maker order, in quote asset pips. Not
   * exposed by the public API; defaults to zero. The sum of the trade and gas
   * fee on any single fill is capped at 5% of the fill's quote quantity.
   */
  takerTradeGasFee?: bigint;
  order: BuySellPanelOrder;
}

export interface BuySellPanelEstimate {
  /** Base quantity of the portion of the order that crosses the spread (a trade) */
  tradeBaseQuantity: bigint;
  /** Quote quantity of the portion of the order that crosses the spread (a trade) */
  tradeQuoteQuantity: bigint;
  /** Base quantity of the portion of the order that would rest on the books */
  makerBaseQuantity: bigint;
  /**
   * The change in the wallet's available collateral, in quote asset pips. A
   * positive value is a cost (available collateral decreases); a negative value
   * indicates that available collateral increases (e.g. when closing a position
   * frees up collateral).
   */
  cost: bigint;
  /**
   * The index price at which the account would be liquidated after the
   * estimated order, in pips. `null` if the resulting position is zero (no
   * liquidation risk), `0n` if the account cannot be liquidated by an adverse
   * move (a positive liquidation price does not exist).
   */
  liquidationPrice: bigint | null;
  /** `true` if the estimate matched one of the wallet's own standing orders */
  selfTradeEncountered: boolean;
  /**
   * `true` if the crossing portion of the order would leave the wallet below
   * its margin requirement (the order would be rejected)
   */
  freeCollateralExceeded: boolean;
  /**
   * `true` if a non-crossing (resting) order's held collateral would exceed the
   * wallet's available collateral (the order would be rejected)
   */
  availableCollateralExceeded: boolean;
  /**
   * `true` if the order's price (limit orders) or a matched price (market
   * orders) lies outside the market's allowed execution price range
   */
  executionPriceLimitExceeded: boolean;
  /** `true` if the resulting position would exceed the maximum position size */
  maximumPositionSizeExceeded: boolean;
  /** `true` if a post-only ({@link TimeInForce.gtx gtx}) order would cross the spread (rejected) */
  postOnlyWouldCross: boolean;
  /** `true` if an immediate-or-cancel ({@link TimeInForce.ioc ioc}) order matched no liquidity (nothing would execute) */
  immediateOrCancelWouldNotExecute: boolean;
  /** `true` if a fill-or-kill ({@link TimeInForce.fok fok}) order could not be fully filled (rejected) */
  fillOrKillWouldNotExecute: boolean;
  /** `true` if a reduce-only order is on the same side as the open position (rejected) */
  reduceOnlyWouldNotReducePosition: boolean;
  /** `true` if a reduce-only order is placed with no open position (rejected) */
  reduceOnlyNoOpenPosition: boolean;
  /**
   * `true` if a reduce-only order's resting (maker) quantity would exceed the
   * remaining open position size (the order would not be fully reducing)
   */
  reduceOnlyOpenPositionSizeExceeded: boolean;
}

type StandingOrderBigInt = {
  isBuy: boolean;
  price: bigint;
  openQuantity: bigint;
};

type EstimateContext = {
  side: OrderSide;
  isBuy: boolean;
  isMarketOrder: boolean;
  limitPrice: bigint;
  timeInForce: TimeInForce;
  reduceOnly: boolean;
  indexPrice: bigint;
  leverageParameters: ReturnType<typeof convertToLeverageParametersBigInt>;
  maximumPositionSize: bigint;
  initialMarginFractionOverride: bigint | null;
  maintenanceMarginFraction: bigint;
  takerFeeRate: bigint;
  gasFeePerOrder: bigint;
  /** Maker-side order book levels, best price first */
  makerLevels: OrderBookLevelL2[];
  minimumExecutionPrice: bigint | null;
  maximumExecutionPrice: bigint | null;
  limitOrderPriceExceedsLimit: boolean;
  /** The wallet's standing orders in the order's market */
  marketStandingOrders: StandingOrderBigInt[];
  /** Current signed position quantity in the order's market */
  currentPositionQuantity: bigint;
  /** Account-level aggregates (all pips) */
  equity: bigint;
  quoteBalance: bigint;
  /** Sum of `marginRequirement` (initial) of the wallet's positions */
  initialMarginRequirement: bigint;
  /** Initial margin requirement of the current position in the order's market */
  currentInitialMarginRequirement: bigint;
  totalHeldCollateral: bigint;
  totalMaintenanceMarginRequirement: bigint;
  /** Sum of every position's notional value at index price (== equity - quoteBalance) */
  otherPositionsNotionalAtIndex: bigint;
};

function makeEmptyEstimate(): BuySellPanelEstimate {
  return {
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
  };
}

/**
 * @private
 */
function wasPositionReduced(before: bigint, after: bigint): boolean {
  return (
    after === BigInt(0) ||
    (before > BigInt(0) && after > BigInt(0) && after < before) ||
    (before < BigInt(0) && after < BigInt(0) && after > before)
  );
}

/**
 * @private
 * Margin requirement (held collateral) for a single open order quantity.
 */
function calculateMarginRequirementForOpenOrderQuantity(
  context: Pick<
    EstimateContext,
    'leverageParameters' | 'initialMarginFractionOverride'
  >,
  openBaseQuantity: bigint,
  limitPrice: bigint,
): bigint {
  if (openBaseQuantity === BigInt(0)) {
    return BigInt(0);
  }
  const orderOpenQuoteQuantity = multiplyPips(openBaseQuantity, limitPrice);
  return multiplyPips(
    orderOpenQuoteQuantity,
    calculateInitialMarginFractionWithOverride({
      baseQuantity: openBaseQuantity,
      initialMarginFractionOverride: context.initialMarginFractionOverride,
      leverageParameters: context.leverageParameters,
    }),
  );
}

/**
 * @private
 * Held collateral required for a set of standing orders in a single market,
 * given a signed position quantity. Orders that reduce the position do not
 * require margin, up to a combined quantity that equals the position size.
 */
function calculateHeldCollateralForMarket(
  context: Pick<
    EstimateContext,
    'leverageParameters' | 'initialMarginFractionOverride'
  >,
  orders: StandingOrderBigInt[],
  positionQuantity: bigint,
): bigint {
  let marginRequirement = BigInt(0);

  // The reducing side (sells for a long position, buys for a short position),
  // processed best price first, offsets against the position.
  const positionIsLong = positionQuantity > BigInt(0);
  const reducingOrders = orders
    .filter(
      (order) =>
        order.isBuy === !positionIsLong && order.openQuantity > BigInt(0),
    )
    .sort((a, b) =>
      // Sells: lowest price first; buys: highest price first
      a.isBuy ? Number(b.price - a.price) : Number(a.price - b.price),
    );
  const nonReducingOrders = orders.filter(
    (order) => order.isBuy === positionIsLong && order.openQuantity > BigInt(0),
  );

  let remainingPositionQuantity = absBigInt(positionQuantity);
  for (const order of reducingOrders) {
    let openBaseQuantity = order.openQuantity;
    if (remainingPositionQuantity > BigInt(0)) {
      if (openBaseQuantity > remainingPositionQuantity) {
        openBaseQuantity -= remainingPositionQuantity;
        remainingPositionQuantity = BigInt(0);
      } else {
        remainingPositionQuantity -= openBaseQuantity;
        openBaseQuantity = BigInt(0);
      }
    }
    marginRequirement += calculateMarginRequirementForOpenOrderQuantity(
      context,
      openBaseQuantity,
      order.price,
    );
  }
  for (const order of nonReducingOrders) {
    marginRequirement += calculateMarginRequirementForOpenOrderQuantity(
      context,
      order.openQuantity,
      order.price,
    );
  }
  return marginRequirement;
}

/**
 * @private
 * Solves for the index price at which the account's value equals its
 * maintenance margin requirement (the liquidation price), holding the index
 * prices of all other markets constant (cross-margin, account-wide).
 *
 * Returns `null` if the resulting position is zero, and `0n` if no positive
 * liquidation price exists (the account is not liquidatable by an adverse
 * move).
 */
function calculateLiquidationPrice(args: {
  newPositionQuantity: bigint;
  maintenanceMarginFraction: bigint;
  quoteBalanceAfter: bigint;
  otherPositionsNotionalAtIndex: bigint;
  otherPositionsMaintenanceMarginRequirement: bigint;
}): bigint | null {
  const {
    newPositionQuantity,
    maintenanceMarginFraction,
    quoteBalanceAfter,
    otherPositionsNotionalAtIndex,
    otherPositionsMaintenanceMarginRequirement,
  } = args;

  if (newPositionQuantity === BigInt(0)) {
    return null;
  }
  // accountValue(P) = MMR(P), solved for P (in pips):
  //   P = (otherMMR - otherNotional - quoteBalance) * oneInPips^2
  //       / (newQty * oneInPips - abs(newQty) * mmf)
  const numerator =
    (otherPositionsMaintenanceMarginRequirement -
      otherPositionsNotionalAtIndex -
      quoteBalanceAfter) *
    oneInPips *
    oneInPips;
  const denominator =
    newPositionQuantity * oneInPips -
    absBigInt(newPositionQuantity) * maintenanceMarginFraction;

  if (denominator === BigInt(0)) {
    return BigInt(0);
  }
  const liquidationPrice = numerator / denominator;
  return liquidationPrice > BigInt(0) ? liquidationPrice : BigInt(0);
}

type FillResult = {
  tradeBaseQuantity: bigint;
  tradeQuoteQuantity: bigint;
  /** Number of (real, non-self-trade) maker orders matched, for gas fees */
  makerOrdersMatched: bigint;
  takerTradeFee: bigint;
  takerGasFee: bigint;
  selfTradeBaseQuantity: bigint;
  selfTradeEncountered: boolean;
  executionPriceLimitExceeded: boolean;
  /** Maker-side standing orders after self-trade reductions */
  standingOrdersAfterSelfTrade: StandingOrderBigInt[];
  /** Unfilled base quantity remaining (open) after crossing */
  remainingBaseQuantity: bigint;
};

/**
 * @private
 * Walks the maker side of the book, accumulating the crossing (trade) portion
 * of the taker order, distinguishing the wallet's own resting liquidity
 * (self-trades) from other liquidity, and applying execution price limits and
 * taker fees.
 */
function matchTakerOrder(
  context: EstimateContext,
  quantity: { baseQuantity: bigint } | { quoteQuantity: bigint },
  reduceOnlyMaximumBaseQuantity: bigint | null,
  // When `false`, the order keeps matching through the book past the execution
  // price limit (the breach is still flagged on the result) rather than stopping
  // at it. Used when sizing the slider so it can consume the target collateral.
  enforceExecutionPriceLimit: boolean,
): FillResult {
  const isQuantityInQuote = 'quoteQuantity' in quantity;

  // Working copy of own maker-side resting liquidity, indexed by price.
  const standingOrdersCopy = context.marketStandingOrders.map((order) => ({
    ...order,
  }));
  const ownMakerOrdersByPrice = new Map<bigint, StandingOrderBigInt[]>();
  for (const order of standingOrdersCopy) {
    if (order.isBuy !== context.isBuy && order.openQuantity > BigInt(0)) {
      const list = ownMakerOrdersByPrice.get(order.price) ?? [];
      list.push(order);
      ownMakerOrdersByPrice.set(order.price, list);
    }
  }

  const result: FillResult = {
    tradeBaseQuantity: BigInt(0),
    tradeQuoteQuantity: BigInt(0),
    makerOrdersMatched: BigInt(0),
    takerTradeFee: BigInt(0),
    takerGasFee: BigInt(0),
    selfTradeBaseQuantity: BigInt(0),
    selfTradeEncountered: false,
    executionPriceLimitExceeded: false,
    standingOrdersAfterSelfTrade: standingOrdersCopy,
    remainingBaseQuantity: BigInt(0),
  };

  let remainingBase = isQuantityInQuote ? null : quantity.baseQuantity;
  let remainingQuote = isQuantityInQuote ? quantity.quoteQuantity : null;
  // Tracks reduce-only fill capacity (real, position-reducing fills only)
  let remainingReduceOnly = reduceOnlyMaximumBaseQuantity;

  for (const level of context.makerLevels) {
    // Stop once the taker order's quantity is fully consumed.
    const exhausted =
      remainingBase !== null ?
        remainingBase <= BigInt(0)
      : remainingQuote! <= BigInt(0);
    if (exhausted) {
      break;
    }

    // doOrdersMatch
    if (!context.isMarketOrder) {
      const crosses =
        context.isBuy ?
          context.limitPrice >= level.price
        : context.limitPrice <= level.price;
      if (!crosses) {
        break;
      }
    }

    // Determine how much of this level the taker consumes.
    let consumedBase: bigint;
    if (remainingBase !== null) {
      consumedBase = minBigInt(remainingBase, level.size);
    } else {
      const levelQuoteIfFull = multiplyPips(
        level.size,
        level.price,
        context.isMarketOrder && context.isBuy,
      );
      if (levelQuoteIfFull <= remainingQuote!) {
        consumedBase = level.size;
      } else {
        // Partial: reduce base proportionally to the quote budget
        consumedBase = (level.size * remainingQuote!) / levelQuoteIfFull;
      }
    }

    // Nothing more can be filled at this (best remaining) price — e.g. a
    // sub-pip quote remainder left by flooring. The order is complete, so worse
    // levels it never reaches must not trip the execution price limit.
    if (consumedBase <= BigInt(0)) {
      break;
    }

    // A trade occurs at this level's price, so apply the execution price limit.
    // When not enforcing (slider sizing), matching continues but the breach is
    // still recorded on the result.
    if (
      (context.minimumExecutionPrice !== null &&
        level.price < context.minimumExecutionPrice) ||
      (context.maximumExecutionPrice !== null &&
        level.price > context.maximumExecutionPrice)
    ) {
      result.executionPriceLimitExceeded = true;
      if (enforceExecutionPriceLimit) {
        break;
      }
    }

    // Split into self-trade (own liquidity) and real fill (other liquidity).
    const ownOrders = ownMakerOrdersByPrice.get(level.price) ?? [];
    let ownSizeAtLevel = BigInt(0);
    for (const order of ownOrders) {
      ownSizeAtLevel += order.openQuantity;
    }
    const selfPart = minBigInt(consumedBase, ownSizeAtLevel);
    let realPart = consumedBase - selfPart;

    // Reduce-only orders may only reduce the position; cap the real fill.
    if (remainingReduceOnly !== null && realPart > remainingReduceOnly) {
      realPart = maxBigInt(remainingReduceOnly, BigInt(0));
      // The self-trade portion is unaffected by reduce-only fill capacity, but
      // the order stops once its reduce-only capacity is consumed.
      consumedBase = selfPart + realPart;
    }

    if (selfPart > BigInt(0)) {
      result.selfTradeEncountered = true;
      result.selfTradeBaseQuantity += selfPart;
      // Reduce the wallet's own resting orders at this price.
      let toReduce = selfPart;
      for (const order of ownOrders) {
        if (toReduce <= BigInt(0)) {
          break;
        }
        const reduction = minBigInt(order.openQuantity, toReduce);
        order.openQuantity -= reduction;
        toReduce -= reduction;
      }
    }

    if (realPart > BigInt(0)) {
      const realQuote = multiplyPips(
        realPart,
        level.price,
        context.isMarketOrder && context.isBuy,
      );
      if (realQuote === BigInt(0)) {
        // Sub-pip quote quantity is invalid; the engine rejects such trades.
        break;
      }
      result.tradeBaseQuantity += realPart;
      result.tradeQuoteQuantity += realQuote;

      // Taker fees for this fill. The sum of the trade and gas fee is capped at
      // 5% of the fill's quote quantity, with priority given to the trade fee:
      // the trade fee is capped at 5%, and the gas fee may only consume whatever
      // of the 5% budget the trade fee leaves (zero once the trade fee hits 5%).
      const maxFee = multiplyPips(realQuote, maximumTradeFeeFraction);
      const tradeFee = minBigInt(
        multiplyPips(realQuote, context.takerFeeRate),
        maxFee,
      );
      const realSizeAtLevel = maxBigInt(level.size - ownSizeAtLevel, BigInt(0));
      const ordersAtLevel =
        realSizeAtLevel <= BigInt(0) ?
          BigInt(0)
        : maxBigInt(
            BigInt(1),
            (BigInt(level.numOrders) * realPart + realSizeAtLevel - BigInt(1)) /
              realSizeAtLevel,
          );
      const gasFee = minBigInt(
        context.gasFeePerOrder * ordersAtLevel,
        maxBigInt(maxFee - tradeFee, BigInt(0)),
      );
      result.makerOrdersMatched += ordersAtLevel;
      result.takerTradeFee += tradeFee;
      result.takerGasFee += gasFee;

      if (remainingReduceOnly !== null) {
        remainingReduceOnly -= realPart;
      }
    }

    // Consume the taker order's remaining budget (self-trades consume it too).
    if (remainingBase !== null) {
      remainingBase -= consumedBase;
    } else {
      remainingQuote! -= multiplyPips(
        consumedBase,
        level.price,
        context.isMarketOrder && context.isBuy,
      );
    }

    if (remainingReduceOnly !== null && remainingReduceOnly <= BigInt(0)) {
      break;
    }
  }

  result.remainingBaseQuantity =
    remainingBase !== null ? maxBigInt(remainingBase, BigInt(0)) : BigInt(0);

  return result;
}

/**
 * @private
 * Produces a complete estimate for a concrete base or quote quantity.
 */
function runEstimate(
  context: EstimateContext,
  quantity: { baseQuantity: bigint } | { quoteQuantity: bigint },
  // Whether the *input* quantity is zero. A zero-quantity order does nothing, so
  // none of the time-in-force feasibility flags apply to it. This is based on
  // the input (e.g. the slider ratio) rather than the resolved base quantity: a
  // non-zero slider on an order that cannot execute or rest resolves to a base
  // quantity of zero, yet its time-in-force flags should still be evaluated.
  isZeroQuantity: boolean = ('baseQuantity' in quantity ?
    quantity.baseQuantity
  : quantity.quoteQuantity) <= BigInt(0),
  // When `false`, matching continues past the execution price limit (still
  // flagged) instead of stopping at it. Used for slider sizing so the order can
  // be sized to consume the target collateral.
  enforceExecutionPriceLimit: boolean = true,
): BuySellPanelEstimate {
  const estimate = makeEmptyEstimate();

  // Reduce-only validity and fill capacity.
  let reduceOnlyMaximumBaseQuantity: bigint | null = null;
  if (context.reduceOnly) {
    const positionQuantity = context.currentPositionQuantity;
    if (positionQuantity === BigInt(0)) {
      estimate.reduceOnlyNoOpenPosition = true;
      return estimate;
    }
    const reduces =
      (context.isBuy && positionQuantity < BigInt(0)) ||
      (!context.isBuy && positionQuantity > BigInt(0));
    if (!reduces) {
      estimate.reduceOnlyWouldNotReducePosition = true;
      return estimate;
    }
    reduceOnlyMaximumBaseQuantity = absBigInt(positionQuantity);
  }

  // Post-only (gtx) orders may not cross the spread.
  const bestMakerPrice =
    context.makerLevels.length > 0 ? context.makerLevels[0].price : null;
  const crossesSpread =
    bestMakerPrice !== null &&
    (context.isMarketOrder ||
      (context.isBuy ?
        context.limitPrice >= bestMakerPrice
      : context.limitPrice <= bestMakerPrice));

  if (
    context.timeInForce === TimeInForce.gtx &&
    crossesSpread &&
    !isZeroQuantity
  ) {
    estimate.postOnlyWouldCross = true;
    return estimate;
  }

  // Limit orders are rejected if their price is outside the allowed range.
  if (context.limitOrderPriceExceedsLimit) {
    estimate.executionPriceLimitExceeded = true;
    return estimate;
  }

  const fill = matchTakerOrder(
    context,
    quantity,
    reduceOnlyMaximumBaseQuantity,
    enforceExecutionPriceLimit,
  );

  estimate.selfTradeEncountered = fill.selfTradeEncountered;
  estimate.executionPriceLimitExceeded = fill.executionPriceLimitExceeded;

  // Immediate-or-cancel: the unfilled remainder is canceled rather than rested,
  // so an order that matched no liquidity would not execute at all.
  estimate.immediateOrCancelWouldNotExecute =
    context.timeInForce === TimeInForce.ioc &&
    !isZeroQuantity &&
    fill.tradeBaseQuantity === BigInt(0);

  // Fill-or-kill: the order must be fully filled by crossing liquidity.
  if (context.timeInForce === TimeInForce.fok && !isZeroQuantity) {
    let fullyFillable: boolean;
    if ('baseQuantity' in quantity) {
      // Base quantities are matched exactly (no rounding), so the bounded fill
      // determines fillability directly.
      fullyFillable =
        fill.tradeBaseQuantity + fill.selfTradeBaseQuantity >=
        quantity.baseQuantity;
    } else {
      // Quote fills are floored to whole base pips, so the achievable quote is
      // the largest value not exceeding the requested quote and rarely equals it
      // exactly. Decide fillability from the *total* crossable quote liquidity
      // instead: re-match with an unbounded budget (every crossable level fills
      // in full, so no flooring occurs).
      const unboundedQuote = context.makerLevels.reduce(
        (sum, level) => sum + multiplyPips(level.size, level.price),
        BigInt(1),
      );
      const maxFill = matchTakerOrder(
        context,
        { quoteQuantity: unboundedQuote },
        reduceOnlyMaximumBaseQuantity,
        enforceExecutionPriceLimit,
      );
      fullyFillable =
        maxFill.tradeQuoteQuantity +
          multiplyPips(maxFill.selfTradeBaseQuantity, context.indexPrice) >=
        quantity.quoteQuantity;
    }
    if (!fullyFillable) {
      estimate.fillOrKillWouldNotExecute = true;
      return estimate;
    }
  }

  estimate.tradeBaseQuantity = fill.tradeBaseQuantity;
  estimate.tradeQuoteQuantity = fill.tradeQuoteQuantity;

  // Determine the resting (maker) portion. Reduce-only limit orders may rest on
  // the books (their reducing portion); whether the resting quantity is valid is
  // checked below via `reduceOnlyOpenPositionSizeExceeded`.
  const canRest =
    !context.isMarketOrder &&
    (context.timeInForce === TimeInForce.gtc ||
      context.timeInForce === TimeInForce.gtx);
  let makerBaseQuantity = BigInt(0);
  if (canRest) {
    if ('baseQuantity' in quantity) {
      makerBaseQuantity = fill.remainingBaseQuantity;
    } else {
      // Convert the remaining quote budget to base at the limit price.
      const remainingQuote = maxBigInt(
        quantity.quoteQuantity -
          fill.tradeQuoteQuantity -
          multiplyPips(fill.selfTradeBaseQuantity, context.limitPrice),
        BigInt(0),
      );
      makerBaseQuantity =
        context.limitPrice > BigInt(0) ?
          dividePips(remainingQuote, context.limitPrice)
        : BigInt(0);
    }
  }
  estimate.makerBaseQuantity = makerBaseQuantity;

  // A reduce-only order's resting (maker) quantity may not exceed the open
  // position size that remains after the reducing fills (it would otherwise no
  // longer be fully reducing). A zero remaining position with a resting quantity
  // (i.e. the position is closed) is likewise flagged.
  if (context.reduceOnly && makerBaseQuantity > BigInt(0)) {
    const remainingOpenPositionSize =
      absBigInt(context.currentPositionQuantity) - fill.tradeBaseQuantity;
    if (makerBaseQuantity > remainingOpenPositionSize) {
      estimate.reduceOnlyOpenPositionSizeExceeded = true;
    }
  }

  // Resulting position quantity in the order's market.
  const newPositionQuantity =
    context.isBuy ?
      context.currentPositionQuantity + fill.tradeBaseQuantity
    : context.currentPositionQuantity - fill.tradeBaseQuantity;

  // Quote balance after the trade.
  const totalFees = fill.takerTradeFee + fill.takerGasFee;
  const quoteBalanceAfter =
    context.isBuy ?
      context.quoteBalance - fill.tradeQuoteQuantity - totalFees
    : context.quoteBalance + fill.tradeQuoteQuantity - totalFees;

  // Account value (equity) after the trade, holding other markets constant.
  const equityAfter =
    quoteBalanceAfter +
    multiplyPips(newPositionQuantity, context.indexPrice) +
    (context.otherPositionsNotionalAtIndex -
      multiplyPips(context.currentPositionQuantity, context.indexPrice));

  // Initial margin requirement after the trade.
  const newPositionNotional = multiplyPips(
    absBigInt(newPositionQuantity),
    context.indexPrice,
  );
  const newPositionInitialMarginRequirement = multiplyPips(
    newPositionNotional,
    calculateInitialMarginFractionWithOverride({
      baseQuantity: newPositionQuantity,
      initialMarginFractionOverride: context.initialMarginFractionOverride,
      leverageParameters: context.leverageParameters,
    }),
  );
  const initialMarginRequirementAfter =
    context.initialMarginRequirement -
    context.currentInitialMarginRequirement +
    newPositionInitialMarginRequirement;

  // Maintenance margin requirement after the trade.
  const currentMaintenanceMarginRequirement = multiplyPips(
    multiplyPips(
      absBigInt(context.currentPositionQuantity),
      context.indexPrice,
    ),
    context.maintenanceMarginFraction,
  );
  const newPositionMaintenanceMarginRequirement = multiplyPips(
    newPositionNotional,
    context.maintenanceMarginFraction,
  );
  const otherPositionsMaintenanceMarginRequirement = maxBigInt(
    context.totalMaintenanceMarginRequirement -
      currentMaintenanceMarginRequirement,
    BigInt(0),
  );

  // Held collateral after the trade: only this market's orders are affected
  // (by the position change, the new resting order, and self-trade reductions).
  const heldBeforeForMarket = calculateHeldCollateralForMarket(
    context,
    context.marketStandingOrders,
    context.currentPositionQuantity,
  );
  const standingOrdersAfter = fill.standingOrdersAfterSelfTrade.slice();
  if (makerBaseQuantity > BigInt(0)) {
    standingOrdersAfter.push({
      isBuy: context.isBuy,
      price: context.limitPrice,
      openQuantity: makerBaseQuantity,
    });
  }
  const heldAfterForMarket = calculateHeldCollateralForMarket(
    context,
    standingOrdersAfter,
    newPositionQuantity,
  );
  const totalHeldCollateralAfter =
    context.totalHeldCollateral - heldBeforeForMarket + heldAfterForMarket;

  // Collateral measures (unclamped values are used for feasibility flags).
  const freeCollateralBefore = maxBigInt(
    context.equity - context.initialMarginRequirement,
    BigInt(0),
  );
  const availableCollateralBefore = maxBigInt(
    freeCollateralBefore - context.totalHeldCollateral,
    BigInt(0),
  );
  const freeCollateralAfterUnclamped =
    equityAfter - initialMarginRequirementAfter;
  const freeCollateralAfter = maxBigInt(
    freeCollateralAfterUnclamped,
    BigInt(0),
  );
  // Available collateral after the order is intentionally NOT clamped at zero:
  // `cost` is allowed to exceed the wallet's available collateral (e.g. an order
  // whose margin or held-collateral requirement is greater than the wallet can
  // cover), consistent with the feasibility flags, which also reflect unclamped
  // values.
  const availableCollateralAfter =
    freeCollateralAfterUnclamped - totalHeldCollateralAfter;

  estimate.cost = availableCollateralBefore - availableCollateralAfter;

  // Liquidation price (cross-margin, account-wide).
  estimate.liquidationPrice = calculateLiquidationPrice({
    newPositionQuantity,
    maintenanceMarginFraction: context.maintenanceMarginFraction,
    quoteBalanceAfter,
    otherPositionsNotionalAtIndex:
      context.otherPositionsNotionalAtIndex -
      multiplyPips(context.currentPositionQuantity, context.indexPrice),
    otherPositionsMaintenanceMarginRequirement,
  });

  // Feasibility flags.
  //
  // `freeCollateralExceeded` covers the crossing (trade) portion: the initial
  // margin requirement must be met after a trade that increases a position, and
  // the maintenance margin requirement after a trade that reduces it.
  if (crossesSpread && fill.tradeBaseQuantity > BigInt(0)) {
    const positionReduced = wasPositionReduced(
      context.currentPositionQuantity,
      newPositionQuantity,
    );
    estimate.freeCollateralExceeded =
      positionReduced ?
        equityAfter -
          (otherPositionsMaintenanceMarginRequirement +
            newPositionMaintenanceMarginRequirement) <
        BigInt(0)
      : freeCollateralAfterUnclamped < BigInt(0);
  }

  // `availableCollateralExceeded` covers any resting (maker) portion: its held
  // collateral may not exceed the wallet's available collateral. This applies
  // both to non-crossing orders and to the unfilled remainder of an order that
  // partially crossed the spread.
  if (makerBaseQuantity > BigInt(0)) {
    estimate.availableCollateralExceeded =
      freeCollateralAfter - totalHeldCollateralAfter < BigInt(0);
  }

  // Maximum position size. Check the order's requested quantity against the
  // room left by the current position (`maximumPositionSize` ∓ position).
  if (!context.reduceOnly) {
    const maxAdditionalLiquidity =
      context.isBuy ?
        context.maximumPositionSize - context.currentPositionQuantity
      : context.maximumPositionSize + context.currentPositionQuantity;

    // For quote-denominated orders the requested base quantity is not fixed; the
    // realized base (fills + resting + self-trade) is used as a proxy.
    const orderBaseQuantity =
      'baseQuantity' in quantity ?
        quantity.baseQuantity
      : fill.tradeBaseQuantity + fill.selfTradeBaseQuantity + makerBaseQuantity;

    if (context.isMarketOrder || crossesSpread) {
      // Market and crossing limit orders are checked against the order quantity
      // alone; the wallet's other standing orders may be canceled after the
      // incoming order is executed if the sum of all standing orders exceeds
      // the maximum position size.
      if (orderBaseQuantity > maxAdditionalLiquidity) {
        estimate.maximumPositionSizeExceeded = true;
      }
    } else {
      // A non-crossing (resting) limit order must fit alongside the wallet's
      // other same-side standing orders without collectively exceeding the
      // maximum position.
      let sameSideActiveQuantity = BigInt(0);
      for (const order of context.marketStandingOrders) {
        if (order.isBuy === context.isBuy) {
          sameSideActiveQuantity += order.openQuantity;
        }
      }
      if (sameSideActiveQuantity + orderBaseQuantity > maxAdditionalLiquidity) {
        estimate.maximumPositionSizeExceeded = true;
      }
    }
  }

  return estimate;
}

/**
 * @private
 * Resolves the slider input (a fraction of available collateral to consume)
 * into a base quantity, by searching for the largest base quantity whose
 * estimated cost does not exceed the target.
 */
function resolveBaseQuantityForCollateralRatio(
  context: EstimateContext,
  ratio: bigint,
): bigint {
  const freeCollateralBefore = maxBigInt(
    context.equity - context.initialMarginRequirement,
    BigInt(0),
  );
  const availableCollateralBefore = maxBigInt(
    freeCollateralBefore - context.totalHeldCollateral,
    BigInt(0),
  );
  const targetCost = multiplyPips(availableCollateralBefore, ratio);
  if (targetCost <= BigInt(0)) {
    return BigInt(0);
  }

  // Upper bound: all matchable liquidity, plus resting capacity for limit
  // orders that may add to the books. Liquidity beyond the execution price limit
  // is included: the slider matches through the book (the breach is flagged on
  // the result rather than capping the size).
  let matchableBase = BigInt(0);
  for (const level of context.makerLevels) {
    if (!context.isMarketOrder) {
      const crosses =
        context.isBuy ?
          context.limitPrice >= level.price
        : context.limitPrice <= level.price;
      if (!crosses) {
        break;
      }
    }
    matchableBase += level.size;
  }
  const canRest =
    !context.isMarketOrder &&
    (context.timeInForce === TimeInForce.gtc ||
      context.timeInForce === TimeInForce.gtx);
  const restingCapacity =
    canRest ?
      maxBigInt(
        context.maximumPositionSize +
          absBigInt(context.currentPositionQuantity),
        BigInt(0),
      )
    : BigInt(0);
  let high = matchableBase + restingCapacity;
  if (high <= BigInt(0)) {
    return BigInt(0);
  }

  // The slider seeks the largest quantity that (a) does not exceed the target
  // cost and (b) remains feasible (does not breach the wallet's collateral).
  //
  // The feasibility gate is essential, not merely a cost comparison: `cost` is
  // clamped at the available collateral (available-after cannot go below zero),
  // so at a 100% slider the target equals that ceiling and a cost-only check
  // (`cost <= target`) is satisfied by *every* larger quantity on the clamped
  // "plateau" — which made the search walk all the way to `high` (matching all
  // liquidity, or all liquidity up to the limit price). A quantity past the
  // boundary sets freeCollateral/availableCollateralExceeded, which excludes the
  // plateau and yields the largest quantity that drives available collateral to
  // ~zero while remaining acceptable.
  const isAcceptable = (baseQuantity: bigint): boolean => {
    // Size against the full book (do not cap at the execution price limit), so a
    // breach does not prevent the slider from consuming the target collateral.
    const e = runEstimate(context, { baseQuantity }, undefined, false);
    return (
      e.cost <= targetCost &&
      !e.freeCollateralExceeded &&
      !e.availableCollateralExceeded
    );
  };

  // If even the maximum quantity is acceptable (e.g. liquidity- or
  // position-size-limited so the target cost is never reached), return it.
  if (isAcceptable(high)) {
    return high;
  }

  let low = BigInt(0);
  for (let iteration = 0; iteration < 80; iteration += 1) {
    if (high - low <= BigInt(1)) {
      break;
    }
    const mid = (low + high) / BigInt(2);
    if (isAcceptable(mid)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}

function buildContext(args: BuySellPanelEstimateArgs): EstimateContext {
  const { market, wallet, order } = args;

  const { side } = order;
  const isBuy = side === OrderSide.buy;
  const isMarketOrder = typeof order.limitPrice === 'undefined';
  const limitPrice = order.limitPrice ?? BigInt(0);
  const timeInForce = order.timeInForce ?? TimeInForce.gtc;
  const reduceOnly = order.reduceOnly ?? false;

  const indexPrice = decimalToPip(market.indexPrice);
  const leverageParameters = convertToLeverageParametersBigInt(market);
  const maximumPositionSize = decimalToPip(market.maximumPositionSize);
  const maintenanceMarginFraction = decimalToPip(
    market.maintenanceMarginFraction,
  );

  const overrideDecimal = (
    args.walletInitialMarginFractionOverrides ?? []
  ).find(
    (imfo) => imfo.market === market.market,
  )?.initialMarginFractionOverride;
  const initialMarginFractionOverride =
    typeof overrideDecimal === 'string' ? decimalToPip(overrideDecimal) : null;

  // The wallet's effective taker fee rate already reflects the lowest of the
  // exchange, market, and wallet rates.
  const takerFeeRate = decimalToPip(wallet.takerFeeRate);
  const gasFeePerOrder = args.takerTradeGasFee ?? BigInt(0);

  // Maker-side order book levels, best price first.
  const makerLevels = (isBuy ? args.orderBook.asks : args.orderBook.bids)
    .filter((level) => level.size > BigInt(0))
    .slice()
    .sort((a, b) =>
      isBuy ? Number(a.price - b.price) : Number(b.price - a.price),
    );

  // Execution price limits. The best bid/ask are taken defensively (the input
  // book is not assumed to be sorted), ignoring empty levels.
  const positiveAsks = args.orderBook.asks.filter((l) => l.size > BigInt(0));
  const positiveBids = args.orderBook.bids.filter((l) => l.size > BigInt(0));
  const bestAsk =
    positiveAsks.length > 0 ?
      positiveAsks.reduce(
        (best, l) => (l.price < best ? l.price : best),
        positiveAsks[0].price,
      )
    : null;
  const bestBid =
    positiveBids.length > 0 ?
      positiveBids.reduce(
        (best, l) => (l.price > best ? l.price : best),
        positiveBids[0].price,
      )
    : null;
  const baselinePrice =
    bestAsk !== null && bestBid !== null ?
      (bestAsk + bestBid) / BigInt(2)
    : indexPrice;

  const marketOrderExecutionPriceLimit = decimalToPip(
    market.marketOrderExecutionPriceLimit,
  );
  let minimumExecutionPrice: bigint | null = null;
  let maximumExecutionPrice: bigint | null = null;
  if (
    isMarketOrder &&
    marketOrderExecutionPriceLimit > BigInt(0) &&
    baselinePrice > BigInt(0)
  ) {
    minimumExecutionPrice = multiplyPips(
      baselinePrice,
      oneInPips - marketOrderExecutionPriceLimit,
    );
    maximumExecutionPrice = dividePips(
      baselinePrice,
      oneInPips - marketOrderExecutionPriceLimit,
    );
  }

  const limitOrderExecutionPriceLimit = decimalToPip(
    market.limitOrderExecutionPriceLimit,
  );
  let limitOrderPriceExceedsLimit = false;
  if (
    !isMarketOrder &&
    limitOrderExecutionPriceLimit > BigInt(0) &&
    baselinePrice > BigInt(0)
  ) {
    const minimumLimitPrice = multiplyPips(
      baselinePrice,
      oneInPips - limitOrderExecutionPriceLimit,
    );
    const maximumLimitPrice = dividePips(
      baselinePrice,
      oneInPips - limitOrderExecutionPriceLimit,
    );
    limitOrderPriceExceedsLimit =
      limitPrice < minimumLimitPrice || limitPrice > maximumLimitPrice;
  }

  // The wallet's resting limit orders in the order's market. Untriggered stop
  // orders have the `active` status; they are excluded because they cannot be
  // matched or self-traded and do not require held collateral.
  const restingOrderStatuses = ['open', 'partiallyFilled'];
  const marketStandingOrders: StandingOrderBigInt[] = (
    args.walletsStandingOrders ?? []
  )
    .filter(
      (standingOrder) =>
        standingOrder.market === market.market &&
        typeof standingOrder.price !== 'undefined' &&
        restingOrderStatuses.includes(standingOrder.status),
    )
    .map((standingOrder) => ({
      isBuy: standingOrder.side === OrderSide.buy,
      // The filter above guarantees a defined price.
      price: decimalToPip(standingOrder.price ?? '0'),
      openQuantity:
        decimalToPip(standingOrder.originalQuantity) -
        decimalToPip(standingOrder.executedQuantity),
    }))
    .filter((standingOrder) => standingOrder.openQuantity > BigInt(0));

  // Position and account-level aggregates.
  const positions = wallet.positions ?? [];
  const equity = decimalToPip(wallet.equity);
  const quoteBalance = decimalToPip(wallet.quoteBalance);
  const totalHeldCollateral = decimalToPip(wallet.heldCollateral);

  let initialMarginRequirement = BigInt(0);
  let currentPositionQuantity = BigInt(0);
  let currentInitialMarginRequirement = BigInt(0);
  for (const position of positions) {
    initialMarginRequirement += decimalToPip(position.marginRequirement);
    if (position.market === market.market) {
      currentPositionQuantity = decimalToPip(position.quantity);
      currentInitialMarginRequirement = decimalToPip(
        position.marginRequirement,
      );
    }
  }

  const totalMaintenanceMarginRequirement = multiplyPips(
    decimalToPip(wallet.marginRatio),
    equity,
  );
  // Σ (every position's notional at index price) == equity - quoteBalance
  const otherPositionsNotionalAtIndex = equity - quoteBalance;

  return {
    side,
    isBuy,
    isMarketOrder,
    limitPrice,
    timeInForce,
    reduceOnly,
    indexPrice,
    leverageParameters,
    maximumPositionSize,
    initialMarginFractionOverride,
    maintenanceMarginFraction,
    takerFeeRate,
    gasFeePerOrder,
    makerLevels,
    minimumExecutionPrice,
    maximumExecutionPrice,
    limitOrderPriceExceedsLimit,
    marketStandingOrders,
    currentPositionQuantity,
    equity,
    quoteBalance,
    initialMarginRequirement,
    currentInitialMarginRequirement,
    totalHeldCollateral,
    totalMaintenanceMarginRequirement,
    otherPositionsNotionalAtIndex,
  };
}

/**
 * Generates an estimate of how a taker order submitted via the buy/sell panel
 * would be executed by the trading engine. The estimate takes into account
 * trade and gas fees, the (incremental) initial margin fraction and its
 * overrides, the maximum position size, collateral freed up by the reduction of
 * positions, the effect of differences between the execution and index price on
 * collateral, self-trades, held collateral (for standing orders), and changes
 * in held collateral as a result of self-trades and position size changes.
 *
 * The minimum taker quantity is intentionally ignored; the estimate generates
 * results for quantities that do not meet the minimum.
 *
 * The order's quantity may be expressed in base asset terms, in quote asset
 * terms, or as a fraction of the wallet's available collateral to consume (the
 * panel's slider). See {@link BuySellPanelEstimateQuantity}.
 *
 * All quantities, prices, and collateral values are expressed in pips
 * (see {@link decimalToPip}).
 */
export function calculateBuySellPanelEstimate(
  args: BuySellPanelEstimateArgs,
): BuySellPanelEstimate {
  const { order } = args;

  const quantityInputCount =
    (typeof order.baseQuantity !== 'undefined' ? 1 : 0) +
    (typeof order.quoteQuantity !== 'undefined' ? 1 : 0) +
    (typeof order.availableCollateralRatio !== 'undefined' ? 1 : 0);
  if (quantityInputCount !== 1) {
    throw new Error(
      'Provide exactly one of baseQuantity, quoteQuantity, or availableCollateralRatio',
    );
  }

  const context = buildContext(args);

  if (typeof order.quoteQuantity !== 'undefined') {
    return runEstimate(context, { quoteQuantity: order.quoteQuantity });
  }
  if (typeof order.baseQuantity !== 'undefined') {
    return runEstimate(context, { baseQuantity: order.baseQuantity });
  }
  const ratio = order.availableCollateralRatio;
  const baseQuantity = resolveBaseQuantityForCollateralRatio(context, ratio);
  // Base the zero-quantity determination on the slider input, not the resolved
  // base quantity (which is zero when the order cannot execute or rest). The
  // slider also matches through the book rather than capping at the execution
  // price limit (the breach is still flagged).
  return runEstimate(context, { baseQuantity }, ratio <= BigInt(0), false);
}
