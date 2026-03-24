import type { RestRequestByWallet } from '#types/rest/common/common';
import type { RestRequestWithSignature } from '#types/utils';

/**
 * Query parameters for `GET /v1/delegatedKeys`.
 *
 * @category KatanaPerps - Delegated Keys
 */
export interface RestRequestGetDelegatedKeys extends RestRequestByWallet {}

/**
 * One authorized delegated key as returned by the public API.
 *
 * @category KatanaPerps - Delegated Keys
 */
export interface RestResponseDelegatedKeyEntry {
  delegatedKey: string;
  userAgent: string;
  name?: string;
  time: number;
  expires: number;
}

/**
 * Parameters (inside `parameters`) for authorizing a delegated key (`POST /v1/delegatedKeys`).
 *
 * @category KatanaPerps - Delegated Keys
 */
export interface RestRequestAuthorizeDelegatedKeyParameters {
  nonce: string;
  wallet: string;
  delegatedKey: string;
  name?: string;
}

/**
 * Signed body for `POST /v1/delegatedKeys`.
 *
 * @category KatanaPerps - Delegated Keys
 */
export type RestRequestAuthorizeDelegatedKeySigned =
  RestRequestWithSignature<RestRequestAuthorizeDelegatedKeyParameters>;

/**
 * Parameters (inside `parameters`) for removing a delegated key (`DELETE /v1/delegatedKeys`).
 *
 * @category KatanaPerps - Delegated Keys
 */
export interface RestRequestRemoveDelegatedKeyParameters {
  nonce: string;
  wallet: string;
  delegatedKey: string;
}

/**
 * Signed body for `DELETE /v1/delegatedKeys`.
 *
 * @category KatanaPerps - Delegated Keys
 */
export type RestRequestRemoveDelegatedKeySigned =
  RestRequestWithSignature<RestRequestRemoveDelegatedKeyParameters>;
