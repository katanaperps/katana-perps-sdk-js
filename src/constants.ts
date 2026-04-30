export const REST_API_KEY_HEADER = 'kp-api-key';
export const REST_HMAC_SIGNATURE_HEADER = 'kp-hmac-signature';

export const EIP_712_DOMAIN_NAME = 'KatanaPerps';

export const EIP_712_DOMAIN_VERSION = '2.0.0';

export const EIP_712_DOMAIN_VERSION_SANDBOX = '2.0.0-sandbox';

// sdk-js-docs-v1-perps.katana.network
// api-docs-v1-perps.katana.network

export const VAULT_NAME_CHARACTER_LIMIT = 30;
export const VAULT_DESCRIPTION_CHARACTER_LIMIT = 2_000;

export const WALLET_SIGNATURE_MESSAGE =
  'Sign this free message to prove you control this wallet';

/**
 * The URI that will be used based on the configuration given.  This includes
 * sandbox vs production as well as the multi-verse chain that should be used
 * (eth default for all clients).
 *
 * @see docs [Websocket API Interaction Docs](https://api-docs-v1-perps.katana.network/#websocket-api-interaction)
 * @see docs [REST API Interaction Docs](https://api-docs-v1-perps.katana.network/#rest-api-interaction)
 * @see docs [Sandbox API Docs](https://api-docs-v1-perps.katana.network/#sandbox)
 *
 * @internal
 */
export const URLS = Object.freeze({
  sandbox: {
    v1: {
      rest: 'https://api-perps-sandbox.katana.network/v1',
      websocket: 'wss://websocket-perps-sandbox.katana.network/v1',
    },
  },
  production: {
    v1: {
      rest: 'https://api-perps.katana.network/v1',
      websocket: 'wss://websocket-perps.katana.network/v1',
    },
  },
} as const);
