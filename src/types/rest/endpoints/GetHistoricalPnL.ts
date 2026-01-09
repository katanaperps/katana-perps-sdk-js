import type { RestRequestPagination, RestRequestByWallet } from '#index';

/**
 * Get Historical PnL
 *
 * @see response {@link RestResponseGetHistoricalPnL}
 * @see type {@link KatanaPerpsHistoricalProfitLoss}
 *
 * @category KatanaPerps - Get Historical PnL
 */
export interface RestRequestGetHistoricalPnL
  extends RestRequestByWallet,
    RestRequestPagination {}

/**
 * @category KatanaPerps - Get Historical PnL
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsHistoricalProfitLoss {
  /** Total account value */
  equity: string;
  /**
   * Total PnL for account since first deposit
   */
  totalPnL: string;
  /**
   * Net quantity deposited and withdrawn since the last data point in quote terms
   */
  netDepositsWithdrawals: string;
  /**
   * The timestamp indicating when the item was created.
   */
  time: number;
}

/**
 * @see type {@link KatanaPerpsHistoricalProfitLoss}
 * @see request {@link RestRequestGetHistoricalPnL}
 *
 * @category KatanaPerps - Get Historical PnL
 */
export type RestResponseGetHistoricalPnL = KatanaPerpsHistoricalProfitLoss[];
