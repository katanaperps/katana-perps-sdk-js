import type { RestRequestByMarket, RestRequestPagination } from '#index';

/**
 * Get Funding Rate Samples
 *
 * @see response {@link RestResponseGetFundingRateSamples}
 * @see type {@link KatanaPerpsFundingRateSample}
 *
 * @category KatanaPerps - Get Funding Rate Samples
 */
export interface RestRequestGetFundingRateSamples
  extends RestRequestPagination,
    RestRequestByMarket {}

/**
 * @see request {@link RestRequestGetFundingRateSamples}
 * @see response {@link RestResponseGetFundingRateSamples}
 *
 * @category KatanaPerps - Get Funding Rate Samples
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsFundingRateSample {
  /** Funding rate computed for the sample */
  fundingRate: string;
  /** Index price of the market at the sample time */
  indexPrice: string | null;
  /** Impact bid price of the market at the sample time */
  impactBidPrice: string | null;
  /** Impact ask price of the market at the sample time */
  impactAskPrice: string | null;
  /** Premium index component of the funding rate sample */
  premiumIndex: string | null;
  /** Minute-aligned timestamp of the sample */
  time: number;
}

/**
 * @see type {@link KatanaPerpsFundingRateSample}
 * @see request {@link RestRequestGetFundingRateSamples}
 *
 * @category KatanaPerps - Get Funding Rate Samples
 */
export type RestResponseGetFundingRateSamples = KatanaPerpsFundingRateSample[];
