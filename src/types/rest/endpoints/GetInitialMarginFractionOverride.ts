import type { RestRequestByMarketOptional, RestRequestByWallet } from '#index';
import type { KatanaPerpsInitialMarginFractionOverride } from './SetInitialMarginFractionOverride.js';

/**
 * - Rest Request: `GET /v1/initialMarginFractionOverride`
 * - Security:     `User`
 * - API Scope:    `Read`
 *
 * @packageDocumentation
 */

/**
 * @see response {@link RestResponseGetInitialMarginFractionOverride}
 * @see type     {@link KatanaPerpsInitialMarginFractionOverride}
 *
 * @category KatanaPerps - Get Initial Margin Fraction override
 */
export interface RestRequestGetInitialMarginFractionOverride
  extends Required<RestRequestByWallet>,
    RestRequestByMarketOptional {
  /**
   * - If provided, the response will include only the market in the resulting array.
   *
   * @inheritDoc
   */
  market?: string;
}

/**
 * @see type    {@link KatanaPerpsInitialMarginFractionOverride}
 * @see request {@link RestRequestGetInitialMarginFractionOverride}
 *
 * @category KatanaPerps - Get Initial Margin Fraction override
 */
export type RestResponseGetInitialMarginFractionOverride =
  KatanaPerpsInitialMarginFractionOverride[];
