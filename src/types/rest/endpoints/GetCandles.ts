import type * as katanaPerps from '@katanaperps/katana-perps-sdk-ma/types';

/**
 * - Rest Request: `GET /candles`
 *
 * @packageDocumentation
 */

/**
 * GET candles request interface
 *
 * @see response {@link RestResponseGetCandles}
 * @see type {@link KatanaPerpsCandle}
 *
 * @category KatanaPerps - Get Candles
 */
export interface RestRequestGetCandles
  extends katanaPerps.RestRequestPagination,
    katanaPerps.RestRequestByMarket {
  /**
   * Time interval for data
   *
   * - Use the {@link katanaperps.CandleInterval CandleInterval} enum to get auto completion
   *   and inline documentation on the enumerations.
   *
   * @example
   * ```typescript
   * import { RestPublicClient, CandleInterval } from '@katanaperps/katana-perps-sdk-ma';
   *
   * const client = new RestPublicClient();
   *
   * const candles = await client.getCandles({
   *  market: 'ETH-USD',
   *  interval: CandleInterval.ONE_HOUR
   * })
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see enum {@link katanaperps.CandleInterval CandleInterval}
   */
  interval: katanaPerps.CandleInterval;
  /**
   * - Max results to return from 1-1000.
   *
   * @inheritDoc
   * @defaultValue 50
   */
  limit?: number;
  /**
   * Only allowed in strict cases and for internal use only.
   *
   * @internal
   */
  countBack?: number;
}

/**
 * Candle (OHLCV) data points aggregated by time interval
 *
 * - Candles only include values from `fills`, not `liquidations` or `ADLs`.
 *
 * @see request {@link RestRequestGetCandles}
 * @see response {@link RestResponseGetCandles}
 *
 * @category KatanaPerps - Get Candles
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsCandle {
  /**
   * Time of the start of the interval
   */
  start: number;
  /**
   * Price of the first trade in the interval in quote terms
   */
  open: string;
  /**
   * Price of the traded price in the interval in quote terms
   */
  high: string;
  /**
   * Price of the traded price in the interval in quote terms
   */
  low: string;
  /**
   * Price of the last trade in the interval in quote terms
   */
  close: string;
  /**
   * Trading volume in the interval in base terms, `null` for some historical chart data
   */
  baseVolume: string | null;
  /**
   * Trading volume in the interval in quote terms, `null` for some historical chart data
   */
  quoteVolume: string | null;
  /**
   * Number of trades in the interval, `null` for some historical chart data
   */
  trades: number | null;
  /**
   * Fill sequence number of the last trade in the interval, `null` for some historical chart data
   */
  sequence: number | null;
}

/**
 * Candle (OHLCV) data points aggregated by time interval
 *
 * - Candles only include values from `fills`: not `liquidations` or `ADLs`.
 *
 * @see type {@link KatanaPerpsCandle}
 * @see request {@link RestRequestGetCandles}
 *
 * @category KatanaPerps - Get Candles
 */
export type RestResponseGetCandles = KatanaPerpsCandle[];
