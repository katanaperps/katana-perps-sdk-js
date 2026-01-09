import type { MessageEventType } from '#types/enums/index';
import type { KatanaPerpsLiquidation } from '#types/rest/endpoints/GetLiquidations';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `liquidations` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KatanaPerpsSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Liquidations
 *
 * @see enum {@link MessageEventType}
 * @see data {@link KatanaPerpsLiquidationEventData}
 */
export interface KatanaPerpsLiquidationEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.liquidations;
  /**
   * @inheritDoc KatanaPerpsLiquidationEventData
   *
   * @see type {@link KatanaPerpsLiquidationEventData}
   */
  data: KatanaPerpsLiquidationEventData;
}

/**
 * - Liquidation updates on the WebSocket include all {@link KatanaPerpsLiquidation} properties as well
 *   as the `market` symbol that corresponds to the liquidation.
 *
 * @see parent {@link KatanaPerpsLiquidationEvent}
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Liquidations
 */
export interface KatanaPerpsLiquidationEventData
  extends KatanaPerpsLiquidation {
  /**
   * Market symbol
   */
  market: string;
}

export interface WebSocketResponseSubscriptionMessageShortLiquidations
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.liquidations;
  data: WebSocketResponseLiquidationsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseLiquidationsShort {
  /**
   * @see inflated {@link KatanaPerpsLiquidationEventData.market}
   */
  m: KatanaPerpsLiquidationEventData['market'];
  /**
   * @see inflated {@link KatanaPerpsLiquidationEventData.fillId}
   */
  i: KatanaPerpsLiquidationEventData['fillId'];
  /**
   * @see inflated {@link KatanaPerpsLiquidationEventData.price}
   */
  p: KatanaPerpsLiquidationEventData['price'];
  /**
   * @see inflated {@link KatanaPerpsLiquidationEventData.quantity}
   */
  q: KatanaPerpsLiquidationEventData['quantity'];
  /**
   * @see inflated {@link KatanaPerpsLiquidationEventData.quoteQuantity}
   */
  Q: KatanaPerpsLiquidationEventData['quoteQuantity'];
  /**
   * @see inflated {@link KatanaPerpsLiquidationEventData.time}
   */
  t: KatanaPerpsLiquidationEventData['time'];
  /**
   * @see inflated {@link KatanaPerpsLiquidationEventData.liquidationSide}
   */
  s: KatanaPerpsLiquidationEventData['liquidationSide'];
}
