import type {
  RestRequestByWallet,
  KatanaPerpsDeposit,
  KatanaPerpsWithdrawal,
} from '#index';

/**
 * Request a collateral transfer from a given wallet to another wallet on the
 * exchange.
 *
 * @see docs    [API Documentation](https://api-docs-v1-perps.katana.network/#transfer-funds)
 * @see related {@link RestResponseTransferFunds}
 *
 * @category KatanaPerps - Transfer Funds
 */
export interface RestRequestTransferFunds extends RestRequestByWallet {
  /**
   * **Gross** transfer amount in asset terms; fees are taken from this value
   */
  quantity: string;
  /**
   * Maximum acceptable fee that can be deducted from the transferred
   * quantity in asset terms
   */
  maximumGasFee: string;
  /**
   * Address of the wallet receiving the transferred funds
   */
  destinationWallet: string;
}

/**
 * A transfer sent by the wallet. Shares the shape of a
 * {@link KatanaPerpsWithdrawal} so that sent transfers can be handled
 * uniformly with withdrawals, with `exchange.transfer` as the
 * {@link KatanaPerpsOutgoingTransfer.bridgeTarget bridgeTarget} and the
 * receiving wallet in
 * {@link KatanaPerpsOutgoingTransfer.destinationWallet destinationWallet}.
 *
 * @see related {@link KatanaPerpsIncomingTransfer}
 * @see related {@link KatanaPerpsWithdrawal}
 *
 * @category KatanaPerps - Get Withdrawals
 * @category KatanaPerps - Transfer Funds
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsOutgoingTransfer
  extends Omit<KatanaPerpsWithdrawal, 'bridgeTarget' | 'vault'> {
  /**
   * Transfers move collateral between wallets without leaving the exchange
   */
  bridgeTarget: 'exchange.transfer';
  /**
   * Address of the wallet that received the transferred funds
   */
  destinationWallet: string;
}

/**
 * A transfer received by the wallet. Shares the shape of a
 * {@link KatanaPerpsDeposit} so that received transfers can be handled
 * uniformly with deposits, with `exchange.transfer` as the
 * {@link KatanaPerpsIncomingTransfer.bridgeSource bridgeSource} and the
 * sending wallet in
 * {@link KatanaPerpsIncomingTransfer.sourceWallet sourceWallet}.
 *
 * @see related {@link KatanaPerpsOutgoingTransfer}
 * @see related {@link KatanaPerpsDeposit}
 *
 * @category KatanaPerps - Get Deposits
 * @category KatanaPerps - Transfer Funds
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsIncomingTransfer
  extends Omit<
    KatanaPerpsDeposit,
    'bridgeSource' | 'bridgeTxId' | 'forwarderTxId' | 'katanaTxId' | 'vault'
  > {
  /**
   * Transfers move collateral between wallets without leaving the exchange
   */
  bridgeSource: 'exchange.transfer';
  /**
   * Transaction id of the transfer transaction on Katana, or null if not yet
   * assigned
   */
  katanaTxId: string | null;
  /**
   * Address of the wallet that sent the transferred funds
   */
  sourceWallet: string;
}

/**
 * The successfully created transfer as it will also be reported by the Get
 * Withdrawals endpoint.
 *
 * @see request {@link RestRequestTransferFunds}
 * @see type    {@link KatanaPerpsOutgoingTransfer}
 *
 * @category KatanaPerps - Transfer Funds
 */
export type RestResponseTransferFunds = KatanaPerpsOutgoingTransfer;
