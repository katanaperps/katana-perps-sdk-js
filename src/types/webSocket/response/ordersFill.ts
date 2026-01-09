import type {
  FillType,
  FillTypeOrder,
  FillTypeSystem,
} from '#types/enums/response';
import type { KatanaPerpsOrderFill } from '#types/rest/index';

/**
 * [[include:base.md]]
 *
 * @category Base Types
 */
export interface KatanaPerpsOrderFillEventDataBase
  extends Omit<
    KatanaPerpsOrderFill,
    'type' | 'makerSide' | 'sequence' | 'liquidity'
  > {
  /**
   * @inheritDoc
   */
  type: FillType;
}

/**
 * Fills of type {@link FillTypeSystem}
 *
 * - These types of fills do not include values from {@link KatanaPerpsOrderFill}
 *   that other fill types include:
 *   - {@link KatanaPerpsOrderFill.makerSide makerSide}
 *   - {@link KatanaPerpsOrderFill.sequence sequence}
 *   - {@link KatanaPerpsOrderFill.liquidity liquidity}
 *
 * @see type {@link FillTypeSystem}
 * @category KatanaPerps - Get Orders
 */
export interface KatanaPerpsOrderFillEventDataSystem
  extends KatanaPerpsOrderFillEventDataBase {
  /**
   * @inheritDoc
   */
  type: FillTypeSystem;
}

/**
 * Non-liquidation Order Fill Type
 *
 * @see type {@link FillTypeOrder}
 * @category KatanaPerps - Get Orders
 */
export interface KatanaPerpsOrderFillEventDataGeneral
  extends KatanaPerpsOrderFillEventDataBase,
    Pick<KatanaPerpsOrderFill, 'makerSide' | 'sequence' | 'liquidity'> {
  /**
   * @inheritDoc
   */
  type: FillTypeOrder;
}

/**
 * An orders `fills` will potentially have a different shape
 * dependent on the `type` property of the fill.
 *
 * @category KatanaPerps - Get Orders
 */
export type KatanaPerpsOrderFillEventData =
  | KatanaPerpsOrderFillEventDataSystem
  | KatanaPerpsOrderFillEventDataGeneral;

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.type}
   */
  y: KatanaPerpsOrderFillEventDataBase['type'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.fillId}
   */
  i: KatanaPerpsOrderFillEventDataGeneral['fillId'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.price}
   */
  p: KatanaPerpsOrderFillEventDataGeneral['price'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.quantity}
   */
  q: KatanaPerpsOrderFillEventDataGeneral['quantity'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.quoteQuantity}
   */
  Q: KatanaPerpsOrderFillEventDataGeneral['quoteQuantity'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.realizedPnL}
   */
  rn: KatanaPerpsOrderFillEventDataGeneral['realizedPnL'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.time}
   */
  t: KatanaPerpsOrderFillEventDataGeneral['time'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.fee}
   */
  f?: KatanaPerpsOrderFillEventDataGeneral['fee'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.action}
   */
  a: KatanaPerpsOrderFillEventDataGeneral['action'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.position}
   */
  P: KatanaPerpsOrderFillEventDataGeneral['position'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.txId}
   */
  T: KatanaPerpsOrderFillEventDataGeneral['txId'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.txStatus}
   */
  S: KatanaPerpsOrderFillEventDataGeneral['txStatus'];
}

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortSystem
  extends WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.type}
   */
  y: KatanaPerpsOrderFillEventDataSystem['type'];
}

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortGeneral
  extends WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.type}
   */
  y: KatanaPerpsOrderFillEventDataGeneral['type'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.makerSide}
   */
  s: {} & KatanaPerpsOrderFillEventDataGeneral['makerSide'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.sequence}
   */
  u: {} & KatanaPerpsOrderFillEventDataGeneral['sequence'];
  /**
   * @see inflated {@link KatanaPerpsOrderFillEventData.liquidity}
   */
  l: {} & KatanaPerpsOrderFillEventDataGeneral['liquidity'];
}

/**
 * @internal
 */
export type WebSocketResponseOrderFillShort =
  | WebSocketResponseOrderFillShortSystem
  | WebSocketResponseOrderFillShortGeneral;
