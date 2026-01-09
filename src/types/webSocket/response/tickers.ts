import type { MessageEventType } from '#types/enums/index';
import type { KatanaPerpsTicker } from '#types/rest/endpoints/GetTickers';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';
/**
 * When the `tickers` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Tickers
 */
export interface KatanaPerpsTickerEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.tickers;
  /**
   * @inheritDoc KatanaPerpsOrderFillEventData
   *
   * @see type {@link KatanaPerpsTickerEventData}
   */
  data: KatanaPerpsTickerEventData;
}

/**
 * Represents the type found on the {@link KatanaPerpsTickerEvent.data} property.
 *
 * - An alias of the {@link KatanaPerpsTicker} interface.
 *
 * @see parent {@link KatanaPerpsTickerEvent}
 *
 * @category WebSocket - Message Types
 */
export type KatanaPerpsTickerEventData = KatanaPerpsTicker;

export interface WebSocketResponseSubscriptionMessageShortTickers
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.tickers;
  data: WebSocketResponseTickerShort;
}

/**
 * @internal
 *
 * Ticker response from the WebSocket, which is a deflated version of {@link RestResponseTicker}
 */
export interface WebSocketResponseTickerShort {
  /**
   * @see inflated {@link RestResponseTicker.market}
   */
  m: KatanaPerpsTickerEventData['market'];
  /**
   * @see inflated {@link RestResponseTicker.time}
   */
  t: KatanaPerpsTickerEventData['time'];
  /**
   * @see inflated {@link RestResponseTicker.open}
   */
  o: KatanaPerpsTickerEventData['open'];
  /**
   * @see inflated {@link RestResponseTicker.high}
   */
  h: KatanaPerpsTickerEventData['high'];
  /**
   * @see inflated {@link RestResponseTicker.low}
   */
  l: KatanaPerpsTickerEventData['low'];
  /**
   * @see inflated {@link RestResponseTicker.close}
   */
  c: KatanaPerpsTickerEventData['close'];
  /**
   * @see inflated {@link RestResponseTicker.closeQuantity}
   */
  Q: KatanaPerpsTickerEventData['closeQuantity'];
  /**
   * @see inflated {@link RestResponseTicker.baseVolume}
   */
  v: KatanaPerpsTickerEventData['baseVolume'];
  /**
   * @see inflated {@link RestResponseTicker.quoteVolume}
   */
  q: KatanaPerpsTickerEventData['quoteVolume'];
  /**
   * @see inflated {@link RestResponseTicker.percentChange}
   */
  P: KatanaPerpsTickerEventData['percentChange'];
  /**
   * @see inflated {@link RestResponseTicker.trades}
   */
  n: KatanaPerpsTickerEventData['trades'];
  /**
   * @see inflated {@link RestResponseTicker.ask}
   */
  a: KatanaPerpsTickerEventData['ask'];
  /**
   * @see inflated {@link RestResponseTicker.bid}
   */
  b: KatanaPerpsTickerEventData['bid'];
  /**
   * @see inflated {@link RestResponseTicker.markPrice}
   */
  mp: KatanaPerpsTickerEventData['markPrice'];
  /**
   * @see inflated {@link RestResponseTicker.indexPrice}
   */
  ip: KatanaPerpsTickerEventData['indexPrice'];
  /**
   * @see inflated {@link RestResponseTicker.indexPrice24h}
   */
  id: KatanaPerpsTickerEventData['indexPrice24h'];
  /**
   * @see inflated {@link RestResponseTicker.indexPricePercentChange}
   */
  iP: KatanaPerpsTickerEventData['indexPricePercentChange'];
  /**
   * @see inflated {@link RestResponseTicker.lastFundingRate}
   */
  lf: KatanaPerpsTickerEventData['lastFundingRate'];
  /**
   * @see inflated {@link RestResponseTicker.currentFundingRate}
   */
  nf: KatanaPerpsTickerEventData['currentFundingRate'];
  /**
   * @see inflated {@link RestResponseTicker.nextFundingTime}
   */
  ft: KatanaPerpsTickerEventData['nextFundingTime'];
  /**
   * @see inflated {@link RestResponseTicker.openInterest}
   */
  oi: KatanaPerpsTickerEventData['openInterest'];

  /**
   * @see inflated {@link RestResponseTicker.sequence}
   */
  u: KatanaPerpsTickerEventData['sequence'];
}
