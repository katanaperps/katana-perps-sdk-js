import type { RestRequestByWalletOptional } from '#index';

/**
 * Get Wallet List
 *
 * - Returns all wallet addresses associated with the API key used to make the request.
 *
 * ---
 *
 * @example
 * ```typescript
 * import { v1 as uuidv1 } from 'uuid';
 *
 * // create client
 *
 * await authenticatedClient.getWalletList({
 *   nonce: uuidv1(),
 * });
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#get-wallet-list)
 * @see response {@link RestResponseGetWalletList}
 * @see type {@link KatanaPerpsWalletList}
 *
 * @category KatanaPerps - Get Wallet List
 * @interface
 */
export type RestRequestGetWalletList = Pick<
  RestRequestByWalletOptional,
  'nonce'
>;

/**
 * Katana Perps Wallet List
 *
 * @see docs     [API Documentation: Get Wallet List](https://api-docs-v1-perps.katana.network/#get-wallet-list)
 * @see request  {@link RestRequestGetWalletList}
 * @see response {@link RestResponseGetWalletList}
 *
 * @category KatanaPerps - Get Wallet List
 */
export interface KatanaPerpsWalletList {
  /**
   * All wallet addresses associated with the API key used to make the request,
   * sorted alphabetically
   */
  wallets: string[];
}

/**
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#get-wallet-list)
 * @see type {@link KatanaPerpsWalletList}
 * @see request {@link RestRequestGetWalletList}
 *
 * @category KatanaPerps - Get Wallet List
 */
export type RestResponseGetWalletList = KatanaPerpsWalletList;
