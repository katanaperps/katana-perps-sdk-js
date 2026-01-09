import type { RestRequestByMarket, RestRequestPagination } from '#index';

/**
 * Get Funding Rates
 *
 * @see response {@link RestResponseGetFundingRates}
 * @see type {@link KatanaPerpsFundingRate}
 *
 * @category KatanaPerps - Get Funding Rates
 */
export interface RestRequestGetFundingRates
  extends RestRequestPagination,
    RestRequestByMarket {}

/**
 * @see request {@link RestRequestGetFundingRates}
 * @see response {@link RestResponseGetFundingRates}
 *
 * @category KatanaPerps - Get Funding Rates
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsFundingRate {
  /** Funding rate for the period */
  fundingRate: string;
  /** Index price of the market at payment time */
  indexPrice: string;
  /** Timestamp of the payment */
  time: number;
}

/**
 * @see type {@link KatanaPerpsFundingRate}
 * @see request {@link RestRequestGetFundingRates}
 *
 * @category KatanaPerps - Get Funding Rates
 */
export type RestResponseGetFundingRates = KatanaPerpsFundingRate[];
