import type * as katanaPerps from '#index';

/**
 * Request parameters required to retrieve a single {@link KatanaPerpsFill}.
 *
 * @see related {@link RestRequestGetFills}
 * @see type    {@link KatanaPerpsFill}
 *
 * @category KatanaPerps - Get Fills
 */
export interface RestRequestGetFill extends katanaPerps.RestRequestByWallet {
  /**
   * The `fillId` of the fill to retrieve.
   *
   * - This property being **included** will cause the api to return a single {@link KatanaPerpsFill}
   */
  readonly fillId: string;
}

/**
 * Request parameters required to get a list of matching {@link KatanaPerpsFill} items.
 *
 * @see related {@link RestRequestGetFill}
 * @see type    {@link KatanaPerpsFill}
 *
 * @category KatanaPerps - Get Fills
 */
export interface RestRequestGetFills
  extends katanaPerps.RestRequestByWallet,
    katanaPerps.RestRequestByMarketOptional,
    katanaPerps.RestRequestPaginationWithFromId {}

/**
 * @category KatanaPerps - Get Fills
 * @category KatanaPerps Interfaces
 *
 * @see request {@link RestRequestGetFill}
 * @see request {@link RestRequestGetFills}
 * @see related {@link KatanaPerpsOrderFill}
 */
export interface KatanaPerpsFill {
  /**
   * Exchange-assigned order identifier, omitted for liquidations
   */
  orderId?: string;
  /**
   * Client-provided ID of order, if present
   */
  clientOrderId?: string;
  /**
   * Base-quote pair e.g. 'ETH-USD'
   */
  market: string;
  /**
   * Orders side, `buy` or `sell`
   *
   * @see enum {@link katanaPerps.OrderSide OrderSide}
   */
  side: katanaPerps.OrderSide;

  /**
   * Internal ID of fill
   */
  fillId: string;
  /**
   * Executed price of fill in quote terms
   */
  price: string;
  /**
   * Executed quantity of fill in base terms
   */
  quantity: string;
  /**
   * Executed quantity of trade in quote terms
   */
  quoteQuantity: string;
  /**
   * Realized PnL
   * - PnL only from the fill’s closure, not for the position overall
   * - Does not include fees.
   */
  realizedPnL: string;
  /**
   * Fill timestamp
   */
  time: number;
  /**
   * Maker side of the fill, `buy` or `sell`
   *
   * - omitted for `liquidation` actions
   *
   * @see enum {@link katanaPerps.OrderSide OrderSide}
   */
  makerSide?: katanaPerps.OrderSide;
  /**
   * Fill sequence number
   *
   * - omitted for liquidation actions
   */
  sequence?: number;
  /**
   * Fee amount collected on the fill in quote terms
   *
   * - may be negative due to promotions
   * - omitted for some liquidation actions
   */
  fee?: string;
  /**
   * Whether the fill increases or decreases the notional value of the position, open or close
   *
   * @see enum {@link katanaPerps.FillAction FillAction}
   */
  action: katanaPerps.FillAction;
  /**
   * Resulting position side
   *
   * @see enum {@link katanaPerps.PositionSide PositionSide}
   */
  position: katanaPerps.PositionSide;
  /**
   * Index price of the market at transaction time, for internal use
   */
  indexPrice?: string;
  /**
   * Whether the fill is the maker or taker in the trade from the perspective of the requesting API account,
   * `maker` or `taker`
   *
   * - omitted for liquidation actions
   *
   * @see enum {@link katanaPerps.LiquidityProvider LiquidityProvider}
   */
  liquidity?: katanaPerps.LiquidityProvider;
  /**
   * Fill `type`
   *
   * @see enum {@link katanaPerps.FillType FillType}
   */
  type: katanaPerps.FillType;
  /**
   * Transaction id of the trade settlement transaction or `null` if not yet assigned
   */
  txId: string | null;
  /**
   * Status of the trade settlement transaction
   *
   * @see enum {@link katanaPerps.ChainTransactionStatus ChainTransactionStatus}
   */
  txStatus: katanaPerps.ChainTransactionStatus;

  /**
   * When `true`, the order is a liquidation acquisition only fill.
   */
  isLiquidationAcquisition?: true | undefined;
}

/**
 * - Same as {@link KatanaPerpsFill} but without the following properties:
 *   - {@link KatanaPerpsFill.market market}
 *   - {@link KatanaPerpsFill.orderId orderId}
 *   - {@link KatanaPerpsFill.clientOrderId clientOrderId}
 *   - {@link KatanaPerpsFill.side side}
 *   - {@link KatanaPerpsFill.isLiquidationAcquisition isLiquidationAcquisition}
 * - The omitted properties can instead be found on the order object itself.
 *
 * @category KatanaPerps - Get Orders
 * @category KatanaPerps Interfaces
 *
 * @see related {@link KatanaPerpsFill}
 */

export interface KatanaPerpsOrderFill
  extends Omit<
    KatanaPerpsFill,
    'market' | 'orderId' | 'clientOrderId' | 'side' | 'isLiquidationAcquisition'
  > {}

/**
 * @category KatanaPerps - Get Fills
 *
 * @see request {@link RestRequestGetFill}
 * @see type    {@link KatanaPerpsFill}
 */
export type RestResponseGetFill = KatanaPerpsFill;

/**
 * @category KatanaPerps - Get Fills
 *
 * @see request {@link RestRequestGetFills}
 * @see type    {@link KatanaPerpsFill}
 */
export type RestResponseGetFills = KatanaPerpsFill[];
