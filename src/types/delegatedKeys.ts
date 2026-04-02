import type { UnknownObj } from '#types/utils';

/**
 * Base delegated key params.
 */
export interface DelegatedKeyParams {
  /**
   * The delegated key to use for the request, if any.
   *
   * If this value is provided on a signed REST request (for example order
   * placement), the EIP-712 signature must be created by this delegated key's
   * private key rather than the custody wallet's private key.
   */
  delegatedKey?: string;
}

/**
 * Base delegated key creation params
 *
 * @internal
 */
export interface DelegatedKeyCreationParams
  extends Required<DelegatedKeyParams> {
  delegatedName?: string; //
  delegatedNonce: string;
}

/**
 * Maintains strictness so that the delegated key has all required properties defined if
 * specified.
 *
 * @internal
 */
export type DelegatedKeyCreationParamsOptional =
  | DelegatedKeyCreationParams
  | {
      delegatedKey?: undefined;
      delegatedNonce?: undefined;
      delegatedName?: undefined;
    };

export type DelegatedKeyProtocol = UnknownObj & Required<DelegatedKeyParams>;

/**
 * @internal
 *
 * Used to augment types with an optional delegated key where they must
 * either define all the values required or none of them.
 *
 * These can also be used to allow sending an object to a function which
 * requires the parameters adhere to the protocol.
 */
export type DelegatedKeyProtocolOptional = UnknownObj &
  Partial<DelegatedKeyParams>;
