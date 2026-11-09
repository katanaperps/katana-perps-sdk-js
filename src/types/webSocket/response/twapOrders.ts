import type { MessageEventType, TwapOrderEventType } from '#types/enums/index';
import type { KatanaPerpsTwapOrder } from '#types/rest/endpoints/internal';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * @category WebSocket - Message Types
 * @internal
 */
export interface KatanaPerpsTwapOrderEvent
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.twapOrders;
  data: KatanaPerpsTwapOrderEventData;
}

interface KatanaPerpsTwapOrderEventDataBase
  extends Pick<KatanaPerpsTwapOrder, 'market' | 'orderId' | 'wallet'> {
  event: TwapOrderEventType;
  /**
   * Timestamp of the update
   */
  time: number;
}

type KatanaPerpsTwapOrderEventDataOrderFields = Pick<
  KatanaPerpsTwapOrder,
  | 'clientOrderId'
  | 'type'
  | 'side'
  | 'originalQuantity'
  | 'executedQuantity'
  | 'cumulativeQuoteQuantity'
  | 'avgExecutionPrice'
  | 'price'
  | 'reduceOnly'
>;

export interface KatanaPerpsTwapOrderEventDataAdded
  extends KatanaPerpsTwapOrderEventDataBase,
    KatanaPerpsTwapOrderEventDataOrderFields {
  event: typeof TwapOrderEventType.added;
}

export interface KatanaPerpsTwapOrderEventDataExecution
  extends KatanaPerpsTwapOrderEventDataBase,
    KatanaPerpsTwapOrderEventDataOrderFields {
  event: typeof TwapOrderEventType.execution;
  isFilled: boolean;
}

export interface KatanaPerpsTwapOrderEventDataCanceled
  extends KatanaPerpsTwapOrderEventDataBase {
  event: typeof TwapOrderEventType.canceled;
  cancellationReason: NonNullable<KatanaPerpsTwapOrder['cancellationReason']>;
}

export interface KatanaPerpsTwapOrderEventDataFilled
  extends KatanaPerpsTwapOrderEventDataBase {
  event: typeof TwapOrderEventType.filled;
}

/**
 * @see parent {@link KatanaPerpsTwapOrderEvent}
 *
 * @category WebSocket - Message Types
 * @internal
 */
export type KatanaPerpsTwapOrderEventData =
  | KatanaPerpsTwapOrderEventDataAdded
  | KatanaPerpsTwapOrderEventDataExecution
  | KatanaPerpsTwapOrderEventDataCanceled
  | KatanaPerpsTwapOrderEventDataFilled;

export interface WebSocketResponseSubscriptionMessageShortTwapOrders
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.twapOrders;
  data: WebSocketResponseTwapOrderShort;
}

/**
 * @internal
 */
interface WebSocketResponseTwapOrderShortBase {
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataBase.event}
   */
  e: KatanaPerpsTwapOrderEventData['event'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataBase.wallet}
   */
  w: KatanaPerpsTwapOrderEventDataBase['wallet'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataBase.market}
   */
  m: KatanaPerpsTwapOrderEventDataBase['market'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataBase.orderId}
   */
  i: KatanaPerpsTwapOrderEventDataBase['orderId'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataBase.time}
   */
  t: KatanaPerpsTwapOrderEventDataBase['time'];
}

/**
 * @internal
 */
interface WebSocketResponseTwapOrderShortOrderFields {
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.clientOrderId}
   */
  c: KatanaPerpsTwapOrderEventDataOrderFields['clientOrderId'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.type}
   */
  o: KatanaPerpsTwapOrderEventDataOrderFields['type'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.side}
   */
  s: KatanaPerpsTwapOrderEventDataOrderFields['side'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.originalQuantity}
   */
  q: KatanaPerpsTwapOrderEventDataOrderFields['originalQuantity'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.executedQuantity}
   */
  z: KatanaPerpsTwapOrderEventDataOrderFields['executedQuantity'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.cumulativeQuoteQuantity}
   */
  Z: KatanaPerpsTwapOrderEventDataOrderFields['cumulativeQuoteQuantity'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.avgExecutionPrice}
   */
  v?: KatanaPerpsTwapOrderEventDataOrderFields['avgExecutionPrice'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.price}
   */
  p?: KatanaPerpsTwapOrderEventDataOrderFields['price'];
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataAdded.reduceOnly}
   */
  r: KatanaPerpsTwapOrderEventDataOrderFields['reduceOnly'];
}

export interface WebSocketResponseTwapOrderShortAdded
  extends WebSocketResponseTwapOrderShortBase,
    WebSocketResponseTwapOrderShortOrderFields {
  e: typeof TwapOrderEventType.added;
}

export interface WebSocketResponseTwapOrderShortExecution
  extends WebSocketResponseTwapOrderShortBase,
    WebSocketResponseTwapOrderShortOrderFields {
  e: typeof TwapOrderEventType.execution;
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataExecution.isFilled}
   */
  F: KatanaPerpsTwapOrderEventDataExecution['isFilled'];
}

export interface WebSocketResponseTwapOrderShortCanceled
  extends WebSocketResponseTwapOrderShortBase {
  e: typeof TwapOrderEventType.canceled;
  /**
   * @see inflated {@link KatanaPerpsTwapOrderEventDataCanceled.cancellationReason}
   */
  R: KatanaPerpsTwapOrderEventDataCanceled['cancellationReason'];
}

export interface WebSocketResponseTwapOrderShortFilled
  extends WebSocketResponseTwapOrderShortBase {
  e: typeof TwapOrderEventType.filled;
}

/**
 * @internal
 */
export type WebSocketResponseTwapOrderShort =
  | WebSocketResponseTwapOrderShortAdded
  | WebSocketResponseTwapOrderShortExecution
  | WebSocketResponseTwapOrderShortCanceled
  | WebSocketResponseTwapOrderShortFilled;
