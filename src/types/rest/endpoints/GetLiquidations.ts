import type {
  OrderSide,
  RestRequestByMarket,
  RestRequestPaginationWithFromId,
} from '#index';

/**
 * Get Liquidations
 *
 * @see response {@link RestResponseGetLiquidations}
 * @see type {@link KatanaPerpsLiquidation}
 *
 * @category KatanaPerps - Get Liquidations
 */
export interface RestRequestGetLiquidations
  extends RestRequestByMarket,
    RestRequestPaginationWithFromId {}

/**
 * @see request {@link RestRequestGetLiquidations}
 * @see response {@link RestResponseGetLiquidations}
 *
 * @category KatanaPerps - Get Liquidations
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsLiquidation {
  /**
   * Liquidation identifier
   */
  fillId: string;
  /**
   * Price of the liquidation in quote terms
   */
  price: string;
  /**
   * Quantity of the liquidation in base terms
   */
  quantity: string;
  /**
   * Quantity of the liquidation in quote terms
   */
  quoteQuantity: string;
  /**
   * Timestamp of the liquidation
   */
  time: number;
  /**
   * Liquidation side of the settlement, `buy` or `sell`
   */
  liquidationSide: OrderSide;
}

/**
 * @see type {@link KatanaPerpsLiquidation}
 * @see request {@link RestRequestGetLiquidations}
 *
 * @category KatanaPerps - Get Liquidations
 */
export type RestResponseGetLiquidations = KatanaPerpsLiquidation[];
