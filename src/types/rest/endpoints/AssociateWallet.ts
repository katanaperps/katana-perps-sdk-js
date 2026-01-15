import type { RestRequestWithSignature } from '#types/utils';
import type {
  KatanaPerpsWallet,
  RestRequestByWallet,
} from '@katanaperps/katana-perps-sdk/types';

/**
 * Associate a wallet with the authenticated account.
 *
 * @category KatanaPerps - Associate Wallet
 *
 * @see response {@link RestResponseAssociateWallet}
 * @see type     {@link KatanaPerpsWallet}
 */
export interface RestRequestAssociateWallet extends RestRequestByWallet {
  /**
   * - The wallet to associate with the authenticated account.
   *
   * @inheritDoc
   */
  wallet: string;
}

/**
 * The raw request body for the `POST /v1/wallets` endpoint
 * including `signature` and the body in `parameters`.
 *
 * @internal
 */
export type RestRequestAssociateWalletSigned =
  | {
      /**
       * - Referral code. Required when associating a wallet for the first time
       */
      referralCode?: string;
    }
  | RestRequestWithSignature<RestRequestAssociateWallet>;

/**
 * The response to a request to associate a wallet.
 *
 * @category KatanaPerps - Associate Wallet
 *
 * @see request {@link RestRequestAssociateWallet}
 * @see type    {@link KatanaPerpsWallet}
 */
export type RestResponseAssociateWallet = KatanaPerpsWallet;
