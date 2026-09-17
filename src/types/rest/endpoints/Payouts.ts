import type { PayoutProgram, RestRequestByWallet } from '#index';
import type { EmptyObj } from '#types/utils';

/**
 * Payout distribution fields to be provided to the escrow contract's `distribute` function.
 *
 * @see parent {@link KatanaPerpsPayoutProgramAuthorization}
 *
 * @category KatanaPerps - Authorize Payout
 */
export interface KatanaPerpsPayoutDistribution {
  nonce: string;
  parentNonce: string;
  walletAddress: string;
  assetAddress: string;
  quantity: string;
  exchangeSignature: string;
}

/**
 * Get Payout Program Data
 *
 * ---
 *
 * @example
 * ```typescript
 * import { PayoutProgram } from '@katanaperps/katana-perps-sdk';
 *
 * // create client
 *
 * authenticatedClient.getPayouts({
 *  wallet: '0x...',
 *  nonce: uuidv1(),
 *  program: PayoutProgram.tradingRewardsV2
 * })
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#get-payouts)
 * @see response {@link RestResponseGetPayouts}
 * @see type {@link KatanaPerpsPayoutProgram}
 *
 * @category KatanaPerps - Get Payouts
 */
export interface RestRequestGetPayouts extends RestRequestByWallet {
  /**
   * - The payout program to query for the given {@link wallet}
   *
   * ---
   *
   * @example
   * ```typescript
   * import { PayoutProgram } from '@katanaperps/katana-perps-sdk';
   *
   * // create client
   *
   * await authenticatedClient.getPayouts({
   *  wallet: '0x...',
   *  nonce: uuidv1(),
   *  program: PayoutProgram.tradingRewardsV2
   * })
   * ```
   */
  program: PayoutProgram;
}

/**
 * Get Payout Program Authorization
 *
 * - Programs paid out via the v1 Escrow contract return a signed authorization for the
 *   wallet to claim on the escrow contract.
 * - Programs paid out by direct deposit (e.g. {@link PayoutProgram.builderRewards builderRewards})
 *   deposit the payout to the exchange on behalf of the wallet and return an empty object.
 *
 * ---
 *
 * @example
 * ```typescript
 * import { PayoutProgram } from '@katanaperps/katana-perps-sdk';
 *
 * // create client
 *
 * await authenticatedClient.authorizePayout({
 *  wallet: '0x...',
 *  nonce: uuidv1(),
 *  program: PayoutProgram.tradingRewardsV2
 * })
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#authorize-payout)
 * @see response {@link RestResponseAuthorizePayout}
 * @see type {@link KatanaPerpsPayoutProgramAuthorization}
 *
 * @category KatanaPerps - Authorize Payout
 */
export interface RestRequestAuthorizePayout extends RestRequestByWallet {
  /**
   * - The payout program to authorize a payout for the given {@link wallet}
   *
   * @example
   * ```typescript
   * import { PayoutProgram } from '@katanaperps/katana-perps-sdk';
   *
   * // create client
   *
   * await client.authorizePayout({
   *  wallet: '0x...',
   *  nonce: uuidv1(),
   *  // use the PayoutProgram enum for inline auto completion
   *  program: PayoutProgram.tradingRewardsV2
   * })
   * ```
   */
  program: PayoutProgram;
}

/**
 * Katana Perps Get Payout Program Response
 *
 * @see docs     [API Documentation: Get Payouts](https://api-docs-v1-perps.katana.network/#get-payouts)
 * @see request  {@link RestRequestGetPayouts}
 * @see response {@link RestResponseGetPayouts}
 *
 * @category KatanaPerps - Get Payouts
 */
export interface KatanaPerpsPayoutProgram {
  /**
   * Contract address of the rewarded asset for the {@link PayoutProgram payout program}
   */
  assetAddress: string;
  /**
   * Symbol of the rewarded asset for the {@link PayoutProgram payout program}
   */
  assetSymbol: string;
  /**
   * Address of the escrow contract for the {@link PayoutProgram payout program}
   *
   * - Only present for programs paid out via the v1 Escrow contract; omitted for
   *   programs paid out by direct deposit to the exchange.
   */
  escrowContractAddress?: string;
  /**
   * Total quantity earned for the requested wallet for the {@link PayoutProgram payout program}
   *
   * - **Format:** Asset Units
   */
  quantityEarned: string;
  /**
   * Total quantity paid to the requested wallet for the {@link PayoutProgram payout program}
   *
   * - **Format:** Asset Units
   */
  quantityPaid: string;
  /**
   * Total quantity owed to the requested wallet for the {@link PayoutProgram payout program}
   *
   * - **Minimums:** Each program has a minimum quantity that must be earned before a payout can be made
   * - **Logical Flow:** When ({@link quantityEarned} - {@link quantityPaid}) is below the program minimum, `quantityOwed` will be `0` and a payout cannot be made.
   * - **Format:** Asset Units
   */
  quantityOwed: string;
  /**
   * Indicates whether there is likely to be a pending earnings distribution tx that has not been mined yet.
   *
   * - Only applicable to programs paid out via the v1 Escrow contract.
   * - This is for internal use and may change without notice.
   *
   * @internal
   */
  hasPendingEarnings?: boolean;
}

/**
 * Katana Perps Authorize Payout Program Response
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#authorize-payout)
 * @see request {@link RestRequestAuthorizePayout}
 * @see response {@link RestResponseAuthorizePayout}
 *
 * @category KatanaPerps - Authorize Payout
 */
export interface KatanaPerpsPayoutProgramAuthorization
  extends Omit<KatanaPerpsPayoutProgram, `quantity${string}`> {
  /**
   * Address of the escrow contract for the {@link PayoutProgram payout program}
   *
   * - Always present, as authorizations are only generated for programs paid out
   *   via the v1 Escrow contract.
   */
  escrowContractAddress: string;
  /**
   * Payout distribution fields to be provided to the {@link KatanaPerpsPayoutProgram.escrowContractAddress escrow contract's} `distribute` function
   *
   * @see {@link KatanaPerpsPayoutDistribution}
   */
  distribution: KatanaPerpsPayoutDistribution;
}

/**
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#get-payouts)
 * @see type {@link KatanaPerpsPayoutProgram}
 * @see request {@link RestRequestGetPayouts}
 * @see related {@link RestResponseAuthorizePayout}
 *
 * @category KatanaPerps - Get Payouts
 */
export type RestResponseGetPayouts = KatanaPerpsPayoutProgram;

/**
 * The response depends on how the requested program pays out:
 *
 * - Programs paid out via the v1 Escrow contract return a signed
 *   {@link KatanaPerpsPayoutProgramAuthorization authorization}, which the wallet uses
 *   to claim the payout on the escrow contract.
 * - Programs paid out by direct deposit return an empty object, as the payout is
 *   deposited to the exchange on behalf of the wallet with no further action needed.
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#authorize-payout)
 * @see type {@link KatanaPerpsPayoutProgramAuthorization}
 * @see request {@link RestRequestAuthorizePayout}
 *
 * @category KatanaPerps - Authorize Payout
 */
export type RestResponseAuthorizePayout =
  | KatanaPerpsPayoutProgramAuthorization
  | EmptyObj;
