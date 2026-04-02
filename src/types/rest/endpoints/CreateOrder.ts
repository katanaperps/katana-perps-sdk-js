import type * as katanaPerps from '#index';
import type { RestRequestWithSignature } from '#types/utils';

/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * If {@link katanaperps.DelegatedKeyParams.delegatedKey delegatedKey} is
 * defined, the request signature must be produced by that delegated key's
 * private key.
 *
 * @category Base Types
 *
 * @see related {@link RestRequestOrderBaseWithoutTriggerPrice}
 * @see related {@link RestRequestOrderBaseWithTriggerPrice}
 */
export interface RestRequestOrderBase
  extends katanaPerps.RestRequestByWallet,
    katanaPerps.DelegatedKeyParams,
    katanaPerps.RestRequestByMarket {
  /**
   * - When specifying, using the {@link katanaPerps.OrderType OrderType} enum is recommended for
   *   inline docs and convenience.
   *
   * @example
   * ```typescript
   *  import { OrderType } from '@katanaperps/katana-perps-sdk'
   *
   *  const response = await client.createOrder({
   *    // whichever order type you are creating
   *    type: OrderType.market,
   *    // ...other params
   *  })
   * ```
   *
   * @see docs [API Documentation: Order Types](https://api-docs-v1-perps.katana.network/#order-types)
   * @see enum {@link katanaPerps.OrderType OrderType}
   */
  readonly type: katanaPerps.OrderType;
  /**
   * - When specifying, using the {@link katanaPerps.OrderSide OrderSide} enum is recommended for
   *   inline docs and convenience.
   *
   * @see enum {@link katanaPerps.OrderSide OrderSide}
   */
  readonly side: katanaPerps.OrderSide;
  /**
   * Order quantity in base terms
   */
  readonly quantity: string;
  /**
   * Client-specified order id, maximum of 40 bytes
   */
  readonly clientOrderId?: string;
  /**
   * Reduce only orders are only accepted opposite open
   * positions and only reduce an opposite position’s size
   */
  readonly reduceOnly?: boolean;
  /**
   * - When specifying, using the {@link katanaPerps.TimeInForce TimeInForce} enum is recommended for inline docs and convenience.
   * - {@link isLiquidationAcquisitionOnly} limit orders must have `timeInForce` set to {@link katanaPerps.TimeInForce.gtx TimeInForce.gtx}
   * - Defaults to {@link katanaPerps.TimeInForce.gtc TimeInForce.gtc}
   *
   * @see enum {@link katanaPerps.TimeInForce TimeInForce}
   *
   * @defaultValue
   * ```typescript
   * TimeInForce.gtc
   * ```
   */
  readonly timeInForce?: katanaPerps.TimeInForce;
  /**
   * Self-trade prevention policy, see enum links
   *
   * - When specifying, using the {@link katanaPerps.SelfTradePrevention SelfTradePrevention} enum is
   *   recommended for inline docs and convenience.
   * - **MUST** be {@link katanaPerps.SelfTradePrevention.cn SelfTradePrevention.cn} if
   *   {@link katanaPerps.TimeInForce.fok TimeInForce.fok} is specified for the {@link timeInForce} property.
   * - For {@link isLiquidationAcquisitionOnly} {@link katanaPerps.OrderType.limit OrderType.limit} orders,
   *   `selfTradePrevention` must be omitted or its default value of {@link katanaPerps.SelfTradePrevention.dc SelfTradePrevention.dc}.
   *
   * @see enum {@link katanaPerps.SelfTradePrevention SelfTradePrevention}
   *
   * @defaultValue
   * ```typescript
   * SelfTradePrevention.dc
   * ```
   */
  readonly selfTradePrevention?: katanaPerps.SelfTradePrevention;
  /**
   * **Internal:** Not yet available in production APIs.
   *
   * - Only applicable to stop {@link katanaPerps.OrderType order types}:
   *   - {@link katanaPerps.OrderType.stopLossMarket stopLossMarket}
   *   - {@link katanaPerps.OrderType.stopLossLimit stopLossLimit}
   *   - {@link katanaPerps.OrderType.trailingStopMarket trailingStopMarket}
   * - Indicates an {@link katanaPerps.KatanaPerpsOrder.orderId orderId} of an open {@link katanaPerps.OrderType.limit limit} order
   *   by the same wallet in the same market that must be filled before the stop becomes active.
   * - Canceling the conditional order also cancels the stop order.
   *
   * @see enum {@link katanaPerps.OrderType OrderType}
   *
   * @alpha
   * @internal
   */
  readonly conditionalOrderId?: string | undefined;
  /**
   * **Internal:** Not yet available in production APIs.
   *
   * - Only applicable to {@link katanaPerps.OrderType.trailingStopMarket trailingStopMarket} order types.
   * - bounded from `0.1%` to `5%`
   *
   * @see type {@link RestRequestOrderTypeTrailingStopMarket}
   * @see enum {@link katanaPerps.OrderType OrderType}
   *
   * @alpha
   * @internal
   */
  readonly callbackRate?: string | undefined;
  /**
   * Only allowed for certain order types mentioned below, omitted otherwise.
   *
   * - Stop loss or take profit price for order types:
   *   - {@link katanaPerps.OrderType.stopLossMarket stopLossMarket}
   *   - {@link katanaPerps.OrderType.stopLossLimit stopLossLimit}
   *   - {@link katanaPerps.OrderType.takeProfitMarket takeProfitMarket}
   *   - {@link katanaPerps.OrderType.takeProfitLimit takeProfitLimit}
   *
   * - Activation price for order types:
   *   - {@link katanaPerps.OrderType.trailingStopMarket trailingStopMarket}
   *
   * @see enum {@link katanaPerps.OrderType OrderType}
   */
  readonly triggerPrice?: string;
  /**
   * Price type for the {@link triggerPrice}
   *
   * - When specifying, using the {@link katanaPerps.TriggerType TriggerType} enum is recommended
   *   for inline docs and convenience.
   * - Required when {@link triggerPrice} is defined.
   *
   * @see enum {@link katanaPerps.TriggerType TriggerType}
   */
  readonly triggerType?: katanaPerps.TriggerType;
  /**
   * Order price in quote terms
   *
   * - Required for all {@link katanaPerps.OrderType.limit limit} order types.
   * - Omitted for all {@link katanaPerps.OrderType.market market}  order types.
   *
   * @see enum {@link katanaPerps.OrderType OrderType}
   */
  readonly price?: string | undefined;
  /**
   * When this parameter is `true` it indicates that the order is an LP side
   * channel order not to be executed against the order book.
   *
   * - Wallet placing the order **MUST BE WHITELISTED.** Contact the Katana Perps team for more details.
   * - This parameter is only allowed to be `true` on {@link katanaPerps.OrderType.market market} and
   *   {@link katanaPerps.OrderType.limit limit} order types.
   * - In the case of `limit` orders, {@link timeInForce} must be {@link katanaPerps.TimeInForce.gtc TimeInForce.gtc}
   *   indicating that side channel orders never take liquidity.
   * - {@link reduceOnly} and {@link selfTradePrevention} parameters may be omitted or set to their
   *   default values only.
   *
   * @see enum {@link katanaPerps.OrderType OrderType}
   * @see enum {@link katanaPerps.TimeInForce TimeInForce}
   */
  readonly isLiquidationAcquisitionOnly?: boolean | undefined;
}

/**
 * [[include:unexported.md]]
 *
 * @category Base Types
 */
interface RestRequestOrderBaseWithTriggerPrice extends RestRequestOrderBase {
  /**
   * @inheritDoc
   */
  readonly triggerPrice: string;
  /**
   * @inheritDoc
   */
  readonly triggerType: katanaPerps.TriggerType;
}

/**
 * [[include:unexported.md]]
 *
 * @category Base Types
 */
interface RestRequestOrderBaseWithoutTriggerPrice extends RestRequestOrderBase {
  readonly triggerPrice?: undefined;
  readonly triggerType?: undefined;
}

/**
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeLimit
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.limit;
  /**
   * @inheritDoc
   */
  readonly price: string;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  readonly isLiquidationAcquisitionOnly?: false;
}

/**
 * > Orders with {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true` are
 * > only allowed for whitelisted wallets at this time.  Please contact
 * > the Katana Perps team if you would like more details.
 *
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeLimitLPP
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.limit;
  /**
   * @inheritDoc
   */
  readonly isLiquidationAcquisitionOnly: true;
  /**
   * @inheritDoc
   */
  readonly timeInForce: typeof katanaPerps.TimeInForce.gtx;
  /**
   * @inheritDoc
   */
  readonly price: string;
  reduceOnly?: false;
  selfTradePrevention?: typeof katanaPerps.SelfTradePrevention.dc;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
}

/**
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeMarket
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.market;
  price?: undefined;
  timeInForce?: undefined;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * > Orders with {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true` are
 * > only allowed for whitelisted wallets at this time.  Please contact
 * > the Katana Perps team if you would like more details.
 *
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeMarketLPP
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.market;
  /**
   * @inheritDoc
   */
  readonly isLiquidationAcquisitionOnly: true;
  price?: undefined;
  timeInForce?: undefined;
  reduceOnly?: false;
  selfTradePrevention?: typeof katanaPerps.SelfTradePrevention.dc;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
}

/**
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeStopLossMarket
  extends RestRequestOrderBaseWithTriggerPrice {
  readonly type: typeof katanaPerps.OrderType.stopLossMarket;
  price?: undefined;
  timeInForce?: undefined;

  callbackRate?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * Order request parameters for when the {@link katanaPerps.OrderType type} is a {@link katanaPerps.OrderType.stopLossLimit stopLossLimit} order.
 *
 * @category KatanaPerps - Create Order
 *
 * @see related {@link katanaPerps.OrderType.stopLossLimit OrderType.stopLossLimit}
 * @see enum {@link katanaPerps.OrderType OrderType}
 */
export interface RestRequestOrderTypeStopLossLimit
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.stopLossLimit;
  /**
   * @inheritDoc
   */
  readonly price: string;
  callbackRate?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeTakeProfitMarket
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.takeProfitMarket;
  price?: undefined;
  timeInForce?: undefined;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeTakeProfitLimit
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.takeProfitLimit;
  /**
   * @inheritDoc
   */
  readonly price: string;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * @category KatanaPerps - Create Order
 */
export interface RestRequestOrderTypeTrailingStopMarket
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof katanaPerps.OrderType.trailingStopMarket;
  /**
   * @inheritDoc
   */
  readonly callbackRate?: string;
  price?: undefined;
  timeInForce?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * Available Request Order Types.  The request is narrowed based on the parameters given to the
 * request. Below is a summary of the various interfaces to match to achieve different orders.
 *
 * - {@link RestRequestOrderTypeLimit}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.limit OrderType.limit}
 * - {@link RestRequestOrderTypeMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.market OrderType.market}
 * - {@link RestRequestOrderTypeStopLossMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.stopLossMarket OrderType.stopLossMarket}
 * - {@link RestRequestOrderTypeStopLossLimit}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.stopLossLimit OrderType.stopLossLimit}
 * - {@link RestRequestOrderTypeTakeProfitMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.takeProfitMarket OrderType.takeProfitMarket}
 * - {@link RestRequestOrderTypeTakeProfitLimit}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.takeProfitLimit OrderType.takeProfitLimit}
 * - {@link RestRequestOrderTypeTrailingStopMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.trailingStopMarket OrderType.trailingStopMarket}
 *
 * Protected Request Order Types:
 *
 * - {@link RestRequestOrderTypeLimitLPP}
 *   - parameter {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true`
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.limit OrderType.limit}
 * - {@link RestRequestOrderTypeMarketLPP}
 *   - parameter {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true`
 *   - parameter {@link RestRequestOrderBase.type type} is {@link katanaPerps.OrderType.market OrderType.market} order
 *
 * @category KatanaPerps - Create Order
 */
export type RestRequestOrder =
  | RestRequestOrderTypeLimit
  | RestRequestOrderTypeMarket
  | RestRequestOrderTypeStopLossMarket
  | RestRequestOrderTypeStopLossLimit
  | RestRequestOrderTypeTakeProfitMarket
  | RestRequestOrderTypeTakeProfitLimit
  | RestRequestOrderTypeTrailingStopMarket
  | RestRequestOrderTypeLimitLPP
  | RestRequestOrderTypeMarketLPP;

/**
 * Extract an order by its {@link RestRequestOrderBase.type type} parameter.
 */
export type RestRequestOrderOfType<T extends katanaPerps.OrderType> = Extract<
  RestRequestOrder,
  { type: T }
>;

export type RestRequestOrderTypeAllLimit = Extract<
  RestRequestOrder,
  { type: 'limit' | `${string}Limit` }
>;

export type RestRequestOrderTypeAllMarket = Extract<
  RestRequestOrder,
  { type: 'market' | `${string}Market` }
>;

export type RestRequestOrderTypeLPP = Extract<
  RestRequestOrder,
  { isLiquidationAcquisitionOnly: true }
>;

/**
 * The raw request body for the `DELETE /v1/orders` endpoint
 * including `signature` and the body in `parameters`.
 *
 * @internal
 */
export type RestRequestCreateOrderSigned =
  RestRequestWithSignature<RestRequestOrder>;
