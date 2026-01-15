import type * as katanaPerps from '#index';
import type {
  MessageEventType,
  OrderSubType,
  OrderType,
} from '#types/enums/index';
import type { OrderStateChange } from '#types/enums/response';
import type { KatanaPerpsOrder } from '#types/rest/endpoints/GetOrders';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';
import type { KatanaPerpsOrderFillEventData } from './ordersFill.js';

/**
 * - `orders` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KatanaPerpsSubscriptionEventBase
 *
 * @category KatanaPerps - Get Orders
 * @category WebSocket - Message Types
 *
 * @see {@link KatanaPerpsSubscriptionEventBase}
 */
export interface KatanaPerpsOrderEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  readonly type: typeof MessageEventType.orders;
  /**
   * @inheritDoc KatanaPerpsOrderEventData
   *
   * @example
   * ```typescript
   *  import { OrderEventType } from '@katanaperps/katana-perps-sdk';
   *
   *  // ...
   *
   *  const orderEventData = orderEvent.data
   *
   *  if (
   *    orderEventData.type === OrderEventType.liquidation ||
   *    orderEventData.type === OrderEventType.deleverage
   *  ) {
   *    // orderEventData is of type KatanaPerpsOrderEventDataLiquidation | KatanaPerpsOrderEventDataDeleverage
   *  } else {
   *   // orderEventData is of type KatanaPerpsOrderEventDataGeneral
   *  }
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see type {@link KatanaPerpsOrderEventData}
   */
  readonly data: KatanaPerpsOrderEventData;
}

/**
 * [[include:base.md]]
 *
 * @category Base Types
 */
export interface KatanaPerpsOrderEventDataBase
  extends Pick<KatanaPerpsOrder, 'market' | 'wallet' | 'side'> {
  /**
   * - When `undefined`, indicates the message is a `liquidation` or `deleverage`
   *   where `fills` will include a single  {@link KatanaPerpsOrderFillEventData.type} of
   *   {@link katanaPerps.FillTypeSystem FillTypeSystem}.
   */
  readonly type?: OrderType;
  /**
   * Timestamp of the most recent update
   */
  executionTime: number;
  /**
   * @inheritDoc KatanaPerpsOrderFillEventData
   *
   * @see type {@link KatanaPerpsOrderFillEventData}
   */
  readonly fills?: KatanaPerpsOrderFillEventData[];
}

/**
 * {@link katanaPerps.KatanaPerpsOrderFillEventDataSystem KatanaPerpsOrderFillEventDataSystem} updates do not
 * include many of the standard order update properties
 *
 * - Note that these types include a single {@link KatanaPerpsOrderFillEventDataSystem}.
 *
 * @category KatanaPerps - Get Orders
 */
export interface KatanaPerpsOrderEventDataSystemFill
  extends KatanaPerpsOrderEventDataBase {
  readonly type?: undefined;
  readonly fills: KatanaPerpsOrderFillEventData[];
}

/**
 * All types other than {@link KatanaPerpsOrderEventDataSystemFill} include
 * most properties from {@link KatanaPerpsOrder}
 *
 * @category KatanaPerps - Get Orders
 */
export interface KatanaPerpsOrderEventDataGeneral
  extends KatanaPerpsOrderEventDataBase,
    Omit<KatanaPerpsOrder, 'type' | 'fills' | 'market' | 'wallet' | 'side'> {
  /**
   * @inheritDoc
   */
  readonly type: OrderType;
  /**
   * @internal
   */
  readonly subType?: OrderSubType;
  /**
   * Type of order update
   *
   * @see enum {@link OrderStateChange}
   */
  update: OrderStateChange;
  /**
   * order book update sequence number, only included if update type triggers an order book update
   *
   * @see related {@link katanaPerps.KatanaPerpsOrderBook.sequence}
   */
  sequence?: katanaPerps.KatanaPerpsOrderBook['sequence'];
  readonly fills?: KatanaPerpsOrderFillEventData[];
}

/**
 * Order updates received from the WebSocket differ from orders retreived from the
 * REST API in several ways.
 *
 * - In addition to the order types received when getting orders from the REST API, WebSocket update events
 *   may also provide the following `undefined` type indicating a {@link KatanaPerpsOrderEventDataSystemFill}
 *   where the `fills` property will include a {@link katanaPerps.FillTypeSystem FillTypeSystem} fill matching
 *   {@link katanaPerps.KatanaPerpsOrderFillEventDataSystem KatanaPerpsOrderFillEventDataSystem}
 * - It is best to narrow on the `type` property between these types and all the
 *   others as shown in the example below.
 *   - This is made easiest by using the {@link OrderType} enum as shown.
 *
 * @example
 * ```typescript
 *  import { OrderType } from '@katanaperps/katana-perps-sdk';
 *
 *  if (!orderEventData.type) {
 *    // orderLong is of type IKatanaPerpsOrderEventDataSystemFill
 *  } else {
 *   // orderLong is of type KatanaPerpsOrderEventDataGeneral
 *   switch(orderEventData.type) {
 *    case OrderType.fill:
 *      break;
 *    // ...etc
 *   }
 *  }
 * ```
 *
 * <br />
 *
 * ---
 *
 * @category KatanaPerps - Get Orders
 * @category WebSocket - Message Types
 *
 * @see union {@link KatanaPerpsOrderEventDataGeneral}
 * @see union {@link KatanaPerpsOrderEventDataSystemFill}
 * @see parent {@link KatanaPerpsOrderEvent}
 */
export type KatanaPerpsOrderEventData =
  | KatanaPerpsOrderEventDataSystemFill
  | KatanaPerpsOrderEventDataGeneral;

export interface WebSocketResponseSubscriptionMessageShortOrders
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.orders;
  data: WebSocketResponseOrderShort;
}

export interface WebSocketResponseOrderShortBase {
  /**
   * @see related {@link KatanaPerpsOrder.type}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.type}
   */
  o?: KatanaPerpsOrderEventDataGeneral['type'];
  /**
   * @see related {@link KatanaPerpsOrder.market}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.market}
   */
  m: KatanaPerpsOrderEventDataBase['market'];
  /**
   * @see related {@link KatanaPerpsOrder.wallet}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.wallet}
   */
  w: KatanaPerpsOrderEventDataBase['wallet'];
  /**
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.executionTime}
   */
  t: KatanaPerpsOrderEventDataBase['executionTime'];
  /**
   * @see related {@link KatanaPerpsOrder.side}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.side}
   */
  s: KatanaPerpsOrderEventDataBase['side'];
  /**
   * @see related {@link KatanaPerpsOrder.fills}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.fills}
   */
  F?: katanaPerps.WebSocketResponseOrderFillShort[];
  /**
   * @see related {@link KatanaPerpsOrder.delegatedKey}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.delegatedKey}
   */
  dk?: KatanaPerpsOrderEventDataGeneral['delegatedKey'];
}

/**
 * @internal
 *
 * `liquidation`, `deleverage`, and `closure` types do not include many of the
 * properties of other order types
 */
export interface WebSocketResponseOrderShortSystem
  extends WebSocketResponseOrderShortBase {
  /**
   * @inheritDoc
   */
  readonly o?: undefined;
  readonly F: katanaPerps.WebSocketResponseOrderFillShort[];
}

/**
 * @internal
 *
 * The type for all order types other than `liquidation`
 */
export interface WebSocketResponseOrderShortGeneral
  extends WebSocketResponseOrderShortBase {
  /**
   * @inheritDoc
   */
  o: KatanaPerpsOrderEventDataGeneral['type'];
  /**
   * @internal
   */
  O?: KatanaPerpsOrderEventDataGeneral['subType'];
  /**
   * @see related {@link KatanaPerpsOrder.orderId}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.orderId}
   */
  i: KatanaPerpsOrderEventDataGeneral['orderId'];
  /**
   * @see related {@link KatanaPerpsOrder.clientOrderId}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.clientOrderId}
   */
  c: KatanaPerpsOrderEventDataGeneral['clientOrderId'];
  /**
   * @see related {@link KatanaPerpsOrder.time}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.time}
   */
  T: KatanaPerpsOrderEventDataGeneral['time'];
  /**
   * @see enum {@link katanaPerps.OrderStateChange}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.update}
   */
  x: KatanaPerpsOrderEventDataGeneral['update'];
  /**
   * @see related {@link KatanaPerpsOrder.status}
   * @see enum {@link katanaPerps.OrderStatus}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.status}
   */
  X: KatanaPerpsOrderEventDataGeneral['status'];
  /**
   * @see related {@link KatanaPerpsOrderBook.sequence}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.sequence}
   */
  u?: KatanaPerpsOrderEventDataGeneral['sequence'];
  /**
   * @see related {@link KatanaPerpsOrder.errorCode}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.errorCode}
   */
  ec?: KatanaPerpsOrderEventDataGeneral['errorCode'];
  /**
   * @see related {@link KatanaPerpsOrder.errorMessage}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.errorMessage}
   */
  em?: KatanaPerpsOrderEventDataGeneral['errorMessage'];
  /**
   * @see related {@link KatanaPerpsOrder.originalQuantity}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.originalQuantity}
   */
  q: KatanaPerpsOrderEventDataGeneral['originalQuantity'];
  /**
   * @see related {@link KatanaPerpsOrder.executedQuantity}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.executedQuantity}
   */
  z: KatanaPerpsOrderEventDataGeneral['executedQuantity'];
  /**
   * @see related {@link KatanaPerpsOrder.cumulativeQuoteQuantity}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.cumulativeQuoteQuantity}
   */
  Z: KatanaPerpsOrderEventDataGeneral['cumulativeQuoteQuantity'];
  /**
   * @see related {@link KatanaPerpsOrder.avgExecutionPrice}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.avgExecutionPrice}
   */
  v?: KatanaPerpsOrderEventDataGeneral['avgExecutionPrice'];
  /**
   * @see related {@link KatanaPerpsOrder.price}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.price}
   */
  p?: KatanaPerpsOrderEventDataGeneral['price'];
  /**
   * @see related {@link KatanaPerpsOrder.triggerPrice}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.triggerPrice}
   */
  P?: KatanaPerpsOrderEventDataGeneral['triggerPrice'];
  /**
   * @see related {@link KatanaPerpsOrder.triggerType}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.triggerType}
   */
  tt?: KatanaPerpsOrderEventDataGeneral['triggerType'];
  /**
   * Only applicable to `trailingStopMarket` orders.
   *
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.callbackRate}
   */
  cr?: KatanaPerpsOrderEventDataGeneral['callbackRate'];
  /**
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.conditionalOrderId}
   */
  ci?: KatanaPerpsOrderEventDataGeneral['conditionalOrderId'];
  /**
   * @see related {@link KatanaPerpsOrder.reduceOnly}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.reduceOnly}
   */
  r: KatanaPerpsOrderEventDataGeneral['reduceOnly'];
  /**
   * @see related {@link KatanaPerpsOrder.timeInForce}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.timeInForce}
   */
  f?: KatanaPerpsOrderEventDataGeneral['timeInForce'];
  /**
   * @see related {@link KatanaPerpsOrder.selfTradePrevention}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.selfTradePrevention}
   */
  V: KatanaPerpsOrderEventDataGeneral['selfTradePrevention'];

  /**
   * @see related {@link KatanaPerpsOrder.isLiquidationAcquisitionOnly}
   * @see inflated {@link KatanaPerpsOrderEventDataGeneral.isLiquidationAcquisitionOnly}
   */
  la?: KatanaPerpsOrderEventDataGeneral['isLiquidationAcquisitionOnly'];
}

/**
 * @internal
 *
 * WebSocket Response Order - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link KatanaPerpsOrder},
 *
 * ## Discriminated Union
 *
 * This type is a discriminated union by property `o` of two types:
 *  - {@link WebSocketResponseOrderShortGeneral}
 *  - {@link WebSocketResponseOrderShortSystem}
 *
 * When `o` is `liquidation`, the type is {@link WebSocketResponseOrderShortSystem} and
 * will not include many of the properties that are included when `o` is not `liquidation`.
 *
 * @example
 * ```typescript
 *  if (orderShort.o === 'liquidation') {
 *    // orderShort is of type WebSocketResponseOrderShortLiquidation
 *  } else {
 *   // orderShort is of type WebSocketResponseOrderShortGeneral
 *  }
 * ```
 */
export type WebSocketResponseOrderShort =
  | WebSocketResponseOrderShortGeneral
  | WebSocketResponseOrderShortSystem;
