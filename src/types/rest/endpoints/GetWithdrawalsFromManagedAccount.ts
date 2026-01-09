import type {
  RestRequestPaginationWithFromId,
  RestRequestByWallet,
  BridgeTarget,
  ChainTransactionStatus,
} from '#index';

/**
 * Get a single {@link KatanaPerpsWithdrawalFromManagedAccount}
 *
 * @see response {@link RestResponseGetWithdrawalFromManagedAccount}
 * @see type     {@link KatanaPerpsWithdrawal}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export interface RestRequestGetWithdrawalFromManagedAccount
  extends RestRequestByWallet {
  /**
   * Single `withdrawalId` to return
   */
  withdrawalId: string;
}

/**
 *  GET an array of {@link KatanaPerpsWithdrawal}
 *
 * @see response {@link RestResponseGetWithdrawalsFromManagedAccount}
 * @see type     {@link KatanaPerpsWithdrawal}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export interface RestRequestGetWithdrawalsFromManagedAccount
  extends RestRequestByWallet,
    RestRequestPaginationWithFromId {
  /**
   * @defaultValue 50
   */
  limit?: number;
  /**
   * Only valid with {@link RestRequestGetWithdrawalFromManagedAccount}
   */
  withdrawalId?: undefined;
}

/**
 * @see request {@link RestRequestGetWithdrawalsFromManagedAccount}
 * @see response {@link RestResponseGetWithdrawalsFromManagedAccount}
 * @see request {@link RestRequestGetWithdrawalFromManagedAccount}
 * @see response {@link RestResponseGetWithdrawalFromManagedAccount}
 *
 * @category KatanaPerps - Get Withdrawals
 * @category KatanaPerps - Withdraw Funds
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsWithdrawalFromManagedAccount {
  /** Exchange-assigned withdrawal identifier */
  withdrawalId: string;
  /** Asset symbol */
  asset: string;
  /**
   * Address of Managed Account contract
   */
  managedAccount: string;
  /**
   * Address of wallet associated with Managed Account from which
   * funds will be withdrawn
   */
  managerWallet: string;
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
}

/**
 * @see type {@link KatanaPerpsWithdrawalFromManagedAccount}
 * @see request {@link RestRequestGetWithdrawalFromManagedAccount}
 * @see related {@link RestResponseGetWithdrawalsFromManagedAccount}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export type RestResponseGetWithdrawalFromManagedAccount =
  KatanaPerpsWithdrawalFromManagedAccount;

/**
 * @see type {@link KatanaPerpsWithdrawalFromManagedAccount}
 * @see request {@link RestRequestGetWithdrawalsFromManagedAccount}
 * @see related {@link RestResponseGetWithdrawalFromManagedAccount}
 *
 * @category KatanaPerps - Get Withdrawals
 */
export type RestResponseGetWithdrawalsFromManagedAccount =
  KatanaPerpsWithdrawalFromManagedAccount[];
