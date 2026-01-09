import type { RestRequestByWallet } from '#index';

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see typedoc [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/interfaces/RestRequestGetAuthenticationToken.html)
 * @see response {@link RestResponseGetAuthenticationToken}
 * @see type {@link KatanaPerpsWebSocketToken}
 *
 * @category KatanaPerps - Get WebSocket Token
 */
export interface RestRequestGetAuthenticationToken
  extends RestRequestByWallet {}

// TIP: Open the reference documentation to see the interfaces properties

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#get-authentication-token)
 * @see request {@link RestRequestGetAuthenticationToken}
 * @see response {@link RestResponseGetAuthenticationToken}
 *
 * @category KatanaPerps Interfaces
 * @category KatanaPerps - Get WebSocket Token
 */
export interface KatanaPerpsWebSocketToken {
  /**
   * WebSocket subscription authentication token
   */
  token: string;
}

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#get-authentication-token)
 * @see type {@link KatanaPerpsWebSocketToken}
 * @see request {@link RestRequestGetAuthenticationToken}
 *
 * @category KatanaPerps - Get WebSocket Token
 */
export type RestResponseGetAuthenticationToken = KatanaPerpsWebSocketToken;
