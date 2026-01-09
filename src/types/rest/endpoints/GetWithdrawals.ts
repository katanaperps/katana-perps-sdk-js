import type {
  RestRequestPaginationWithFromId,
  RestRequestByWallet,
  BridgeTarget,
  ChainTransactionStatus,
} from '#index';

/**
 * Get a single {@link KatanaPerpsWithdrawal}
 *
 * @see response {@link RestResponseGetWithdrawal}
 * @see type     {@link KatanaPerpsWithdrawal}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export interface RestRequestGetWithdrawal extends RestRequestByWallet {
  /**
   * Single `withdrawalId` to return
   */
  withdrawalId: string;
}

/**
 *  GET an array of {@link KatanaPerpsWithdrawal}
 *
 * @see response {@link RestResponseGetWithdrawals}
 * @see type     {@link KatanaPerpsWithdrawal}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export interface RestRequestGetWithdrawals
  extends RestRequestByWallet,
    RestRequestPaginationWithFromId {
  /**
   * @defaultValue 50
   */
  limit?: number;
  /**
   * Only valid with {@link RestRequestGetWithdrawal}
   */
  withdrawalId?: undefined;
}

/**
 * @see request {@link RestRequestGetWithdrawals}
 * @see response {@link RestResponseGetWithdrawals}
 * @see request {@link RestRequestGetWithdrawal}
 * @see response {@link RestResponseGetWithdrawal}
 *
 * @category KatanaPerps - Get Withdrawals
 * @category KatanaPerps - Withdraw Funds
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsWithdrawal {
  /** Exchange-assigned withdrawal identifier */
  withdrawalId: string;
  /** Asset symbol */
  asset: string;
  /**
   * **Gross** quantity of the withdrawal
   */
  quantity: string;
  /**
   * The gas fee paid for the withdrawal.
   */
  gas: string;
  /** Bridge and target chain of the withdrawal */
  bridgeTarget: BridgeTarget;
  /** Timestamp of withdrawal API request */
  time: number;
  /**
   * Transaction id of the withdrawal transaction on Katana or null if not yet
   * assigned; also queryable for bridge details on https://layerzeroscan.com/
   */
  katanaTxId: string | null;
  /**
   * Status of the withdrawal transaction on Katana
   *
   * @see enum {@link ChainTransactionStatus}
   */
  katanaTxStatus: ChainTransactionStatus;
  /**
   * For withdrawals from vaults, contains details about the vault.
   */
  vault?: {
    /** Manager-specified name */
    name?: string;
    /** Manager wallet address  */
    manager: string;
  };
}

/**
 * @see type {@link KatanaPerpsWithdrawal}
 * @see request {@link RestRequestGetWithdrawal}
 * @see related {@link RestResponseGetWithdrawals}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export type RestResponseGetWithdrawal = KatanaPerpsWithdrawal;

/**
 * @see type {@link KatanaPerpsWithdrawal}
 * @see request {@link RestRequestGetWithdrawals}
 * @see related {@link RestResponseGetWithdrawal}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export type RestResponseGetWithdrawals = KatanaPerpsWithdrawal[];
