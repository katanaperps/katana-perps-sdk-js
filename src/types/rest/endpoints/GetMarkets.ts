import type {
  MarginType,
  MarketStatus,
  MarketTradingSessionStatus,
  MarketType,
  RestRequestByMarketOptional,
} from '#index';

/**
 * GET markets
 *
 * @see response {@link RestResponseGetMarkets}
 * @see type     {@link KatanaPerpsMarket}
 *
 * @category KatanaPerps - Get Markets
 */
export interface RestRequestGetMarkets extends RestRequestByMarketOptional {}

/**
 * Katana Perps Market
 *
 * @category KatanaPerps - Get Markets
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsMarket {
  /**
   * Market symbol
   */
  market: string;
  /**
   * Market type
   */
  type: MarketType;
  /**
   * Market trading status
   *
   * @see {@link MarketStatus}
   */
  status: MarketStatus;
  /**
   * Market trading session status
   *
   * - Not present for `perpetual` markets
   *
   * @see {@link MarketTradingSessionStatus}
   */
  tradingSessionStatus?: MarketTradingSessionStatus;
  /**
   * Approximated time of the next market close, in milliseconds. Use
   * `tradingSessionStatus` for definitive status
   *
   * - Not present for `perpetual` markets
   */
  approximateNextCloseTime?: number;
  /**
   * Approximated time of the next market open, in milliseconds. Use
   * `tradingSessionStatus` for definitive status
   *
   * - Not present for `perpetual` markets
   */
  approximateNextOpenTime?: number;
  /** Base asset symbol */
  baseAsset: string;
  /** Quote asset symbol */
  quoteAsset: string;
  /**
   * Minimum quantity increment change in base terms
   */
  stepSize: string;
  /**
   * Minimum price increment change in quote terms
   */
  tickSize: string;
  /**
   * Current index price of the market
   */
  indexPrice: string;
  /**
   * Index price 24 hours ago.
   *
   * - For the first 24 hours after the market is created, this value will return `0.00000000`.
   */
  indexPrice24h: string;
  /**
   * Percent change in index price from 24h ago to current
   *
   * - `1.00%` is expressed as `0.01000000`
   * - For the first 24 hours after the market is created, this value will return `0.00000000`.
   */
  indexPricePercentChange: string;
  /**
   * Funding rate of the last payment
   *
   * - `1.00%` is expressed as `0.01000000`
   */
  lastFundingRate: string | null;
  /**
   * Current funding rate
   *
   * - `1.00%` is expressed as `0.01000000`
   */
  currentFundingRate: string | null;
  /**
   * Time of the next funding payment
   */
  nextFundingTime: number;
  /**
   * Minimum size of an order that can rest on the order book in base terms
   */
  makerOrderMinimum: string;
  /**
   * Minimum order size that is accepted by the matching engine for execution in base terms
   */
  takerOrderMinimum: string;
  /**
   * Execution price limit for market orders on the market.
   */
  marketOrderExecutionPriceLimit: string;
  /**
   * Execution price limit for limit orders on the market.
   */
  limitOrderExecutionPriceLimit: string;
  /** Minimum position size in base terms */
  minimumPositionSize: string;
  /** Maximum position size in base terms */
  maximumPositionSize: string;
  /** Margin requirement to open a position expressed as a fraction */
  initialMarginFraction: string;
  /** Margin requirement prevent liquidation expressed as a fraction */
  maintenanceMarginFraction: string;
  /**
   * Maximum position size available under the {@link initialMarginFraction}
   */
  basePositionSize: string;
  /**
   * If a position exceeds {@link basePositionSize}, each
   * step of {@link incrementalPositionSize} increases
   * the {@link initialMarginFraction} by
   * {@link incrementalInitialMarginFraction}
   */
  incrementalPositionSize: string;
  /**
   * - If a position exceeds {@link basePositionSize}
   *   - for each step of {@link incrementalPositionSize}
   *     - increases the {@link initialMarginFraction} by {@link incrementalInitialMarginFraction} (this value)
   */
  incrementalInitialMarginFraction: string;
  /**
   * Type of margin
   *
   * @see {@link MarginType}
   */
  marginType: MarginType;
  /**
   * Default maker trade fee rate for the market
   *
   * - Overrides the "Get Exchange" endpoint's `defaultMakerFeeRate`
   * - May be overidden by the wallet's `makerFeeRate`
   * - Effective fee rate will be the lowest of the three
   */
  makerFeeRate: string;
  /**
   * Default taker trade fee rate for the market
   *
   * - Overrides the "Get Exchange" endpoint's `defaultTakerFeeRate`
   * - May be overidden by the "Get Wallets" endpoint's `takerFeeRate`
   * - Effective fee rate will be the lowest of the three
   */
  takerFeeRate: string;
  /** Trailing 24h volume for the market in USD */
  volume24h: string;
  /** Number of trade executions in the market in the trailing 24h */
  trades24h: number;
  /** Open interest quantity in base terms */
  openInterest: string;
  /**
   * - Indicates if the market is featured on the trading markets listing
   *
   * @internal
   */
  featured?: true;
  /**
   * - Indicates if this is the default market when loading the exchange.
   *
   * @internal
   */
  default?: true;
}

/**
 * @see type {@link KatanaPerpsMarket}
 * @see request {@link RestRequestGetMarkets}
 *
 * @category KatanaPerps - Get Markets
 */
export type RestResponseGetMarkets = KatanaPerpsMarket[];
