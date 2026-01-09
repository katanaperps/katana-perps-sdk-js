import type { MessageEventType, PositionEventStatus } from '#types/enums/index';
import type { KatanaPerpsPosition } from '#types/rest/endpoints/GetPositions';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `positions` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Positions
 */
export interface KatanaPerpsPositionEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.positions;
  /**
   * @inheritDoc KatanaPerpsPositionEventData
   *
   * @see data {@link KatanaPerpsPositionEventData}
   */
  data: KatanaPerpsPositionEventData;
}

/**
 * - Includes most properties from the REST API's {@link KatanaPerpsPosition} type.
 * - Also includes
 *   {@link KatanaPerpsPositionEventData.wallet wallet},
 *   {@link KatanaPerpsPositionEventData.status status},
 *   and {@link KatanaPerpsPositionEventData.quoteBalance quoteBalance} properties.
 *
 * @see parent {@link KatanaPerpsPositionEvent}
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Positions
 */
export interface KatanaPerpsPositionEventData
  extends Pick<
    KatanaPerpsPosition,
    | 'market'
    | 'time'
    | 'quantity'
    | 'maximumQuantity'
    | 'entryPrice'
    | 'exitPrice'
    | 'realizedPnL'
    | 'totalFunding'
    | 'totalOpen'
    | 'totalClose'
    | 'openedByFillId'
    | 'lastFillId'
  > {
  /**
   * Wallet address
   */
  wallet: string;
  /**
   * - {@link PositionEventStatus.open open} if position is open.
   * - {@link PositionEventStatus.closed closed} for the last update.
   *
   * @see enum {@link PositionEventStatus}
   */
  status: PositionEventStatus;
  /**
   * The total quote balance after the positions update
   */
  quoteBalance: string;
}

export interface WebSocketResponseSubscriptionMessageShortPositions
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.positions;
  data: WebSocketResponsePositionsShort;
}

/**
 * @internal
 */
export interface WebSocketResponsePositionsShort {
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.wallet}
   */
  w: KatanaPerpsPositionEventData['wallet'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.market}
   */
  m: KatanaPerpsPositionEventData['market'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.status}
   */
  X: KatanaPerpsPositionEventData['status'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.quantity}
   */
  q: KatanaPerpsPositionEventData['quantity'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.maximumQuantity}
   */
  mq: KatanaPerpsPositionEventData['maximumQuantity'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.entryPrice}
   */
  np: KatanaPerpsPositionEventData['entryPrice'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.exitPrice}
   */
  xp: KatanaPerpsPositionEventData['exitPrice'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.realizedPnL}
   */
  rn: KatanaPerpsPositionEventData['realizedPnL'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.totalFunding}
   */
  f: KatanaPerpsPositionEventData['totalFunding'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.totalOpen}
   */
  to: KatanaPerpsPositionEventData['totalOpen'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.totalClose}
   */
  tc: KatanaPerpsPositionEventData['totalClose'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.openedByFillId}
   */
  of: KatanaPerpsPositionEventData['openedByFillId'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.lastFillId}
   */
  lf: KatanaPerpsPositionEventData['lastFillId'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.quoteBalance}
   */
  qb: KatanaPerpsPositionEventData['quoteBalance'];
  /**
   * @see inflated {@link KatanaPerpsPositionEventData.time}
   */
  t: KatanaPerpsPositionEventData['time'];
}
