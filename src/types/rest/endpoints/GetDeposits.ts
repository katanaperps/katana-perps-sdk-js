import type * as katanaPerps from '#index';

/**
 * Get Deposit Request
 *
 * @see request  {@link katanaPerps.RestAuthenticatedClient.getDeposit RestAuthenticatedClient.getDeposit}
 * @see related  {@link RestRequestGetDeposits}
 *
 * @category KatanaPerps - Get Deposits
 */
export interface RestRequestGetDeposit extends katanaPerps.RestRequestByWallet {
  /**
   * Single `depositId` to return
   */
  depositId: string;
}

/**
 * Get {@link KatanaPerpsDeposit Deposits}
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/interfaces/RestRequestGetDeposits.html)
 * @see request  {@link katanaPerps.RestAuthenticatedClient.getDeposits RestAuthenticatedClient.getDeposits}
 * @see related  {@link RestRequestGetDeposit}
 *
 * @category KatanaPerps - Get Deposits
 */
export interface RestRequestGetDeposits
  extends katanaPerps.RestRequestByWallet,
    katanaPerps.RestRequestPaginationWithFromId {
  depositId?: undefined;
}

/**
 * An object which represents a single deposit on the exchange.
 *
 * @see request  {@link katanaPerps.RestAuthenticatedClient.getDeposit RestAuthenticatedClient.getDeposit}
 * @see request  {@link katanaPerps.RestAuthenticatedClient.getDeposits RestAuthenticatedClient.getDeposits}
 *
 * @category KatanaPerps - Get Deposits
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsDeposit {
  /**
   * Katana Perps-issued deposit identifier
   */
  depositId: string;
  /**
   * Asset symbol for collateral token
   */
  asset: string;
  /**
   * Deposit amount in asset terms
   */
  quantity: string;
  /**
   * Bridge and source chain of the deposit
   *
   * - Use the {@link katanaPerps.BridgeTarget BridgeTarget} enum to narrow
   *   all possible values when needed.
   *
   * @see enum {@link katanaPerps.BridgeTarget BridgeTarget}
   */
  bridgeSource: katanaPerps.DepositSource;
  /**
   * Timestamp of crediting the deposited funds on the exchange
   */
  time: number;
  /**
   * Transaction id of the bridge transaction initiated by the user; also
   * queryable for bridge details on https://layerzeroscan.com/
   */
  bridgeTxId?: string;
  /**
   * Transaction id of the bridge transaction delivering funds to Katana; also
   * queryable for bridge details on https://layerzeroscan.com/
   */
  forwarderTxId?: string;
  /**
   * Transaction id of the deposit transaction on Katana
   */
  katanaTxId: string;
  /**
   * For deposits to vaults, contains details about the vault.
   */
  vault?: {
    /** Manager-specified name */
    name?: string;
    /** Manager wallet address  */
    manager: string;
  };
}

/**
 * Returns of a single deposit by the `depositId` provided.
 *
 * @see type    {@link KatanaPerpsDeposit}
 * @see request {@link RestRequestGetDeposit}
 * @see related {@link RestResponseGetDeposits}
 * @see related {@link RestRequestGetDeposits}
 *
 * @category KatanaPerps - Get Deposits
 */
export type RestResponseGetDeposit = KatanaPerpsDeposit;

/**
 * Returns deposits according to the request parameters.
 *
 * @see type    {@link KatanaPerpsDeposit}
 * @see request {@link RestRequestGetDeposits}
 * @see related {@link RestResponseGetDeposit}
 * @see related {@link RestRequestGetDeposit}
 *
 * @category KatanaPerps - Get Deposits
 */
export type RestResponseGetDeposits = KatanaPerpsDeposit[];
