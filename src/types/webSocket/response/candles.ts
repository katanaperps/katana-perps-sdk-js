import type { MessageEventType } from '#types/enums/index';
import type { CandleInterval } from '#types/enums/request';
import type { KatanaPerpsCandle } from '#types/rest/endpoints/GetCandles';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `candles` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KatanaPerpsSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Candles
 *
 * @see {@link KatanaPerpsSubscriptionEventBase}
 */
export interface KatanaPerpsCandleEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.candles;
  /**
   * @inheritDoc KatanaPerpsCandleEventData
   *
   * @see type {@link KatanaPerpsCandleEventData}
   */
  data: KatanaPerpsCandleEventData;
}

/**
 * - Extended {@link KatanaPerpsCandle} which includes additional properties for WebSocket messages:
 *   - {@link KatanaPerpsCandleEventData.market market},
 *     {@link KatanaPerpsCandleEventData.time time},
 *     {@link KatanaPerpsCandleEventData.interval interval},
 *     {@link KatanaPerpsCandleEventData.end end},
 *     {@link KatanaPerpsCandleEventData.trades trades}
 *
 * @see parent {@link KatanaPerpsCandleEvent}
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Candles
 */
export interface KatanaPerpsCandleEventData extends KatanaPerpsCandle {
  /**
   * Market symbol
   */
  market: string;
  /**
   * Timestamp when the statistics were computed, `time` is always
   * between the {@link start} and {@link close} timestamps
   * of the interval
   */
  time: number;
  /**
   * Interval duration of the candle.
   *
   * @see enum {@link CandleInterval}
   */
  interval: CandleInterval;
  /**
   * Timestamp of the end of the {@link interval}
   */
  end: number;
  /**
   * Number of trades in the {@link interval}
   */
  trades: number;
}

export interface WebSocketResponseSubscriptionMessageShortCandles
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.candles;
  data: WebSocketResponseCandleShort;
}

/**
 * @internal
 *
 * WebSocket Response Candle - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link KatanaPerpsCandle}
 */
export interface WebSocketResponseCandleShort {
  /**
   * @see inflated {@link KatanaPerpsCandleEventData.market}
   */
  m: KatanaPerpsCandleEventData['market'];
  /**
   * @see inflated {@link KatanaPerpsCandleEventData.time}
   */
  t: KatanaPerpsCandleEventData['time'];
  /**
   * @see inflated {@link KatanaPerpsCandleEventData.interval}
   */
  i: KatanaPerpsCandleEventData['interval'];
  /**
   * @see inflated {@link KatanaPerpsCandleEventData.start}
   */
  s: KatanaPerpsCandleEventData['start'];
  /**
   * @see inflated {@link KatanaPerpsCandleEventData.end}
   */
  e: KatanaPerpsCandleEventData['end'];
  /**
   * @see related {@link KatanaPerpsCandle.open}
   * @see inflated {@link KatanaPerpsCandleEventData.open}
   */
  o: KatanaPerpsCandleEventData['open'];
  /**
   * @see related {@link KatanaPerpsCandle.high}
   * @see inflated {@link KatanaPerpsCandleEventData.high}
   */
  h: KatanaPerpsCandleEventData['high'];
  /**
   * @see related {@link KatanaPerpsCandle.low}
   * @see inflated {@link KatanaPerpsCandleEventData.low}
   */
  l: KatanaPerpsCandleEventData['low'];
  /**
   * @see related {@link KatanaPerpsCandle.close}
   * @see inflated {@link KatanaPerpsCandleEventData.close}
   */
  c: KatanaPerpsCandleEventData['close'];
  /**
   * @see {@link KatanaPerpsCandle.baseVolume}
   * @see inflated {@link KatanaPerpsCandleEventData.baseVolume}
   */
  v: KatanaPerpsCandleEventData['baseVolume'];
  /**
   * @see related {@link KatanaPerpsCandle.quoteVolume}
   * @see inflated {@link KatanaPerpsCandleEventData.quoteVolume}
   */
  q: KatanaPerpsCandleEventData['quoteVolume'];
  /**
   * @see related {@link KatanaPerpsCandle.trades}
   * @see inflated {@link KatanaPerpsCandleEventData.trades}
   */
  n: KatanaPerpsCandleEventData['trades'];
  /**
   * @see related {@link KatanaPerpsCandle.sequence}
   * @see inflated {@link KatanaPerpsCandleEventData.sequence}
   */
  u: KatanaPerpsCandleEventData['sequence'];
}
