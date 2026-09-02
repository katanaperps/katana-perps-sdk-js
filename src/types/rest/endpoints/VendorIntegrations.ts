import type { PayoutProgram } from '#types/enums/request';
import type {
  RestRequestByWallet,
  RestRequestByWalletOptional,
} from '#types/rest/common/common';
import type {
  RestResponseAuthorizeTakerCompetitionV3Payout,
  RestResponseGetKatanaPoints,
  RestResponseGetKatanaPointSeasons,
  RestResponseGetTakerCompetitionV3ByName,
  RestResponseGetTakerCompetitionV3List,
  RestResponseGetTakerCompetitionV3Payout,
  RestResponseRegisterTakerCompetitionV3,
} from './internal.js';

/**
 * Query parameters for `GET /vendor/integrations/v1/takerCompetitionV3/list`.
 *
 * @category Vendor Integrations
 */
export interface RestRequestGetVendorTakerCompetitionV3List {
  nonce: string;
}

/**
 * Query parameters for `GET /vendor/integrations/v1/takerCompetitionV3/name/:name`.
 *
 * @category Vendor Integrations
 */
export interface RestRequestGetVendorTakerCompetitionV3ByName
  extends RestRequestByWalletOptional {
  name: string;
}

/**
 * Body for `POST /vendor/integrations/v1/takerCompetitionV3/register`.
 *
 * @category Vendor Integrations
 */
export interface RestRequestRegisterVendorTakerCompetitionV3 {
  name: string;
  wallet: string;
  nonce: string;
}

/**
 * Query parameters for `GET /vendor/integrations/v1/takerCompetitionV3/payouts`.
 *
 * @category Vendor Integrations
 */
export interface RestRequestGetVendorTakerCompetitionV3Payout {
  wallet: string;
  program: PayoutProgram;
  nonce: string;
}

/**
 * Body for `POST /vendor/integrations/v1/takerCompetitionV3/payouts`.
 *
 * @category Vendor Integrations
 */
export type RestRequestAuthorizeVendorTakerCompetitionV3Payout =
  RestRequestGetVendorTakerCompetitionV3Payout;

/**
 * @category Vendor Integrations
 */
export type RestResponseGetVendorTakerCompetitionV3List =
  RestResponseGetTakerCompetitionV3List;

/**
 * @category Vendor Integrations
 */
export type RestResponseGetVendorTakerCompetitionV3ByName =
  RestResponseGetTakerCompetitionV3ByName;

/**
 * @category Vendor Integrations
 */
export type RestResponseRegisterVendorTakerCompetitionV3 =
  RestResponseRegisterTakerCompetitionV3;

/**
 * @category Vendor Integrations
 */
export type RestResponseGetVendorTakerCompetitionV3Payout =
  RestResponseGetTakerCompetitionV3Payout;

/**
 * @category Vendor Integrations
 */
export type RestResponseAuthorizeVendorTakerCompetitionV3Payout =
  RestResponseAuthorizeTakerCompetitionV3Payout;

/**
 * Query parameters for `GET /vendor/integrations/v1/pointsProgram/seasons`.
 *
 * @category Vendor Integrations
 */
export interface RestRequestGetVendorPointsProgramSeasons {
  nonce: string;
}

/**
 * Query parameters for `GET /vendor/integrations/v1/pointsProgram/status`.
 *
 * @category Vendor Integrations
 */
export interface RestRequestGetVendorPointsProgramStatus
  extends RestRequestByWallet {
  seasonId?: number;
  periodId?: number;
}

/**
 * @category Vendor Integrations
 */
export type RestResponseGetVendorPointsProgramSeasons =
  RestResponseGetKatanaPointSeasons;

/**
 * @category Vendor Integrations
 */
export type RestResponseGetVendorPointsProgramStatus =
  RestResponseGetKatanaPoints;
