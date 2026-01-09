import type { MessageEventType } from '#types/enums/index';
import type {
  KatanaPerpsOrderBook,
  OrderBookPriceLevel,
  RestResponseGetOrderBookLevel2,
} from '#types/rest/endpoints/GetOrderBook';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `l1orderbook` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KatanaPerpsSubscriptionEventBase
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get OrderBook
 *
 * @see enum {@link MessageEventType}
 * @see data {@link KatanaPerpsOrderBookLevel1EventData}
 */
export interface KatanaPerpsOrderBookLevel1Event
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.l1orderbook;
  /**
   * @inheritDoc KatanaPerpsOrderBookLevel1EventData
   *
   * @see type {@link KatanaPerpsOrderBookLevel1EventData}
   */
  data: KatanaPerpsOrderBookLevel1EventData;
}

/**
 * Level-1 event messages include properties that help indicate what changes
 * were made that triggered the message event.
 *
 * @see parent {@link KatanaPerpsOrderBookLevel1Event}
 *
 * @category KatanaPerps - Get OrderBook
 * @category WebSocket - Message Types
 */
export interface KatanaPerpsOrderBookLevel1EventData
  extends Pick<KatanaPerpsOrderBook, 'markPrice' | 'indexPrice' | 'lastPrice'> {
  /**
   * Market symbol
   */
  market: string; // m
  /**
   * Timestamp of the order book update
   */
  time: number; // t
  /**
   * Best bid price
   *
   * @see tuple {@link OrderBookPriceLevel}.price
   */
  bidPrice: OrderBookPriceLevel[0]; // b
  /**
   * Quantity available at the best bid price
   *
   * @see tuple {@link OrderBookPriceLevel}.size
   */
  bidQuantity: OrderBookPriceLevel[1]; // B
  /**
   * Best ask price
   *
   * @see tuple {@link OrderBookPriceLevel}.price
   */
  askPrice: OrderBookPriceLevel[0];
  /**
   * Quantity available at the best ask price
   *
   * @see tuple {@link OrderBookPriceLevel}.size
   */
  askQuantity: OrderBookPriceLevel[1];
}

/**
 * - Level-2 updates provided to the message handler when subscribed.
 *
 * @inheritDoc KatanaPerpsSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get OrderBook
 *
 * @see data {@link KatanaPerpsOrderBookLevel2EventData}
 */
export interface KatanaPerpsOrderBookLevel2Event
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: 'l2orderbook';
  /**
   * @inheritDoc KatanaPerpsOrderBookLevel2EventData
   *
   * @see type {@link KatanaPerpsOrderBookLevel2EventData}
   */
  data: KatanaPerpsOrderBookLevel2EventData;
}

/**
 * - Level-2 OrderBook updates are identical to {@link RestResponseGetOrderBookLevel2}
 *   but also include a {@link KatanaPerpsOrderBookLevel2EventData.market market} and
 *   {@link KatanaPerpsOrderBookLevel2EventData.time time} property.
 *
 * @see parent {@link KatanaPerpsOrderBookLevel2Event}
 *
 * @category KatanaPerps - Get OrderBook
 * @category WebSocket - Message Types
 */
export interface KatanaPerpsOrderBookLevel2EventData
  extends RestResponseGetOrderBookLevel2 {
  /**
   * Market symbol
   */
  market: string; // m
  /**
   * Timestamp of the order book update
   */
  time: number; // t
}

export interface WebSocketResponseSubscriptionMessageShortL1Orderbook
  extends KatanaPerpsSubscriptionEventBase {
  type: 'l1orderbook';
  data: WebSocketResponseL1OrderBookShort;
}

export interface WebSocketResponseSubscriptionMessageShortL2Orderbook
  extends KatanaPerpsSubscriptionEventBase {
  type: 'l2orderbook';
  data: WebSocketResponseL2OrderBookShort;
}

/**
 * @internal
 *
 * WebSocket Response Order Book (Level 1) - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link RestResponseOrderBookLevel1}
 */
export interface WebSocketResponseL1OrderBookShort {
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.market}
   */
  m: KatanaPerpsOrderBookLevel1EventData['market'];
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.time}
   */
  t: KatanaPerpsOrderBookLevel1EventData['time'];
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.bidPrice}
   */
  b: KatanaPerpsOrderBookLevel1EventData['bidPrice'];
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.bidQuantity}
   */
  B: KatanaPerpsOrderBookLevel1EventData['bidQuantity'];
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.askPrice}
   */
  a: KatanaPerpsOrderBookLevel1EventData['askPrice'];
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.askQuantity}
   */
  A: KatanaPerpsOrderBookLevel1EventData['askQuantity'];
  /**
   * @see related {@link RestResponseOrderBook.lastPrice}
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.lastPrice}
   */
  lp: KatanaPerpsOrderBookLevel1EventData['lastPrice'];
  /**
   * @see related {@link RestResponseOrderBook.markPrice}
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.markPrice}
   */
  mp: KatanaPerpsOrderBookLevel1EventData['markPrice'];
  /**
   * @see related {@link RestResponseOrderBook.indexPrice}
   * @see inflated {@link KatanaPerpsOrderBookLevel1EventData.indexPrice}
   */
  ip: KatanaPerpsOrderBookLevel1EventData['indexPrice'];
}

/**
 * @internal
 *
 * WebSocket Response Order Book (Level 2) - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link RestResponseGetOrderBookLevel2}
 */
export interface WebSocketResponseL2OrderBookShort {
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.market}
   */
  m: string;
  /**
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.time}
   */
  t: number;
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.sequence}
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.sequence}
   */
  u: KatanaPerpsOrderBookLevel2EventData['sequence'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.bids}
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.bids}
   */
  b: KatanaPerpsOrderBookLevel2EventData['bids'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.asks}
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.asks}
   */
  a: KatanaPerpsOrderBookLevel2EventData['asks'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.lastPrice}
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.lastPrice}
   */
  lp: KatanaPerpsOrderBookLevel2EventData['lastPrice'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.markPrice}
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.markPrice}
   */
  mp: KatanaPerpsOrderBookLevel2EventData['markPrice'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.indexPrice}
   * @see inflated {@link KatanaPerpsOrderBookLevel2EventData.indexPrice}
   */
  ip: KatanaPerpsOrderBookLevel2EventData['indexPrice'];
}
