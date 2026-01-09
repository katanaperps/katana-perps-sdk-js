import type { MessageEventType } from '#types/enums/index';
import type { KatanaPerpsTrade } from '#types/rest/endpoints/GetTrades';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `trades` subscription provides an update
 *
 * @category KatanaPerps - Get Trades
 * @category WebSocket - Message Types
 */
export interface KatanaPerpsTradeEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.trades;
  /**
   * @inheritDoc KatanaPerpsTradeEventData
   *
   * @see type {@link KatanaPerpsTradeEventData}
   */
  data: KatanaPerpsTradeEventData;
}

/**
 * - Trade updates on the WebSocket include all {@link KatanaPerpsTrade} properties as well
 *   as the `market` symbol that corresponds to the trade.
 *
 * @see related {@link KatanaPerpsTrade}
 *
 * @category KatanaPerps - Get Trades
 * @category WebSocket - Message Types
 */
export interface KatanaPerpsTradeEventData extends KatanaPerpsTrade {
  /**
   * Market Symbol
   */
  market: string;
}

export interface WebSocketResponseSubscriptionMessageShortTrades
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.trades;
  data: WebSocketResponseTradeShort;
}

/**
 * @internal
 *
 * WebSocket Response Trade - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link RestResponseTrade}
 */
export interface WebSocketResponseTradeShort {
  /**
   * @see inflated {@link KatanaPerpsTradeEventData.market}
   */
  m: KatanaPerpsTradeEventData['market'];
  /**
   * @see related {@link RestResponseTrade.fillId}
   * @see inflated {@link KatanaPerpsTradeEventData.fillId}
   */
  i: KatanaPerpsTradeEventData['fillId'];
  /**
   * @see related {@link RestResponseTrade.price}
   * @see inflated {@link KatanaPerpsTradeEventData.price}
   */
  p: KatanaPerpsTradeEventData['price'];
  /**
   * @see related {@link RestResponseTrade.quantity}
   * @see inflated {@link KatanaPerpsTradeEventData.quantity}
   */
  q: KatanaPerpsTradeEventData['quantity'];
  /**
   * @see related {@link RestResponseTrade.quoteQuantity}
   * @see inflated {@link KatanaPerpsTradeEventData.quoteQuantity}
   */
  Q: KatanaPerpsTradeEventData['quoteQuantity'];
  /**
   * @see related {@link RestResponseTrade.time}
   * @see inflated {@link KatanaPerpsTradeEventData.time}
   */
  t: KatanaPerpsTradeEventData['time'];
  /**
   * @see enum {@link enums2.OrderSide}
   * @see related {@link RestResponseTrade.makerSide}
   * @see inflated {@link KatanaPerpsTradeEventData.makerSide}
   */
  s: KatanaPerpsTradeEventData['makerSide'];
  /**
   * @see related {@link RestResponseTrade.sequence}
   * @see inflated {@link KatanaPerpsTradeEventData.sequence}
   */
  u: KatanaPerpsTradeEventData['sequence'];
}
