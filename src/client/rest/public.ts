import * as http from 'http';
import * as https from 'https';

import Axios from 'axios';

import { REST_API_KEY_HEADER } from '#constants';
import {
  INTERNAL_SYMBOL,
  deriveBaseURL,
  isNode,
  sanitizeSearchParams,
} from '#utils';

import type * as katanaPerps from '#index';
import type { AnyObj } from '#types/utils';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from 'axios';

/**
 * Public REST API client options
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/interfaces/RestPublicClientOptions.html)
 * @see client   {@link RestPublicClient}
 *
 * @category API Clients
 */
export interface RestPublicClientOptions {
  /**
   * - If `true`, the client will point to [Katana Perps Sandbox API](https;//api-docs-v1-perps.katana.network/#sandbox)
   * - If not provided or `false`, will point to the Katana Perps Production API.
   *
   * @defaultValue
   * ```typescript
   * false
   * ```
   */
  sandbox?: boolean;
  /**
   * Optional for public clients
   *
   * - Increases rate limits when provided
   */
  apiKey?: string;

  /**
   * Override the API url
   *
   * @internal
   */
  baseURL?: string;
  /**
   * - This is for internal use only and may not work as expected if used.
   *
   * @internal
   */
  axiosConfig?: CreateAxiosDefaults;
}

/**
 * The {@link RestPublicClient} is used to make public requests to the Katana Perps API.  It does not require
 * any special options to access.
 *
 * - An {@link RestPublicClientOptions.apiKey apiKey} can be provided
 *   to increase rate limits.
 * - Optionally, a {@link RestPublicClientOptions.sandbox sandbox} option can
 *   be set to `true` in order to point to the Katana Perps Sandbox API.
 *
 * @example
 * ```typescript
 * import { RestPublicClient } from '@katanaperps/katana-perps-sdk-ma';
 *
 * // works without any options
 * // const publicClient = new RestPublicClient();
 *
 * const publicClient = new RestPublicClient({
 *   sandbox: true,
 *   // Optionally provide an API key to increase rate limits
 *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 * });
 *
 * const tickers = await publicClient.getTickers('ETH-USD');
 * console.log('Tickers: ', tickers);
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html)
 * @see options  {@link RestPublicClientOptions}
 *
 * @category API Clients
 * @category KatanaPerps - Get Time
 * @category KatanaPerps - Get Ping
 * @category KatanaPerps - Get Exchange
 * @category KatanaPerps - Get Gas Fees
 * @category KatanaPerps - Get Markets
 * @category KatanaPerps - Get Tickers
 * @category KatanaPerps - Get Candles
 * @category KatanaPerps - Get Trades
 * @category KatanaPerps - Get OrderBook
 * @category KatanaPerps - Get Liquidations
 * @category KatanaPerps - Get Funding Rates
 */
export class RestPublicClient {
  /**
   * The {@link RestPublicClient} is used to make public requests to the Katana Perps API.  It does not require
   * any special options to access.
   *
   * - An {@link RestPublicClientOptions.apiKey apiKey} can be provided
   *   to increase rate limits.
   * - Optionally, a {@link RestPublicClientOptions.sandbox sandbox} option can
   *   be set to `true` in order to point to the Katana Perps Sandbox API.
   *
   * @param options
   *  Options for configuring the RestPublicClient
   *
   * @example
   * ```typescript
   * import { RestPublicClient } from '@katanaperps/katana-perps-sdk-ma';
   *
   * // works without any options
   * // const publicClient = new RestPublicClient();
   *
   * const publicClient = new RestPublicClient({
   *   sandbox: true,
   *   // Optionally provide an API key to increase rate limits
   *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
   * });
   *
   * const tickers = await publicClient.getTickers('ETH-USD');
   * console.log('Tickers: ', tickers);
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html)
   * @see options  {@link RestPublicClientOptions}
   *
   * @category Constructor
   */
  public constructor(options: RestPublicClientOptions = {}) {
    const { sandbox = false } = options;

    const baseURL = deriveBaseURL({
      sandbox,
      api: 'rest',
      overrideBaseURL: options.baseURL ?? options.axiosConfig?.baseURL,
    });

    if (!baseURL) {
      throw new Error(
        `Invalid configuration, baseURL could not be derived (sandbox? ${String(
          sandbox,
        )})`,
      );
    }

    this.#axiosConfig = Object.freeze({
      paramsSerializer(params) {
        return sanitizeSearchParams(params ?? {}).toString();
      },
      ...(isNode ?
        {
          httpAgent:
            options.axiosConfig?.httpAgent ??
            new http.Agent({ keepAlive: true }),
          httpsAgent:
            options.axiosConfig?.httpsAgent ??
            new https.Agent({ keepAlive: true }),
        }
      : {}),
      ...(options.axiosConfig ?? {}),
      baseURL,
      headers: {
        ...(options.apiKey ?
          {
            [REST_API_KEY_HEADER]: options.apiKey,
          }
        : {}),
        ...(options.axiosConfig?.headers ?? {}),
      },
    });

    this.axios = Axios.create(this.#axiosConfig);
  }

  #realtime = false;

  /**
   * Tests connectivity to the REST API
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/ping`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#ping)
   * @see response {@link katanaperps.RestResponseGetPing RestResponseGetPing}
   *
   * @category Utility
   */
  public async ping() {
    return this.get<katanaPerps.RestResponseGetPing>('/ping');
  }

  /**
   * Returns the current server time
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/time`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getServerTime)
   * @see response {@link katanaperps.RestResponseGetTime RestResponseGetTime}
   *
   * @returns An object with the current server time in `UTC`
   *
   * @category Utility
   */
  public async getServerTime() {
    return this.get<katanaPerps.RestResponseGetTime>('/time');
  }

  /**
   * Returns basic information about the exchange.
   *
   * - Some of the returned parmeters can be used to configure contract calls
   *   required for other methods.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/exchange`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * ---
   *
   * @returns
   * > An object matching {@link katanaperps.KatanaPerpsExchange KatanaPerpsExchange} providing properties relating
   * to the exchange.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getExchange)
   * @see response {@link katanaperps.RestResponseGetExchange RestResponseGetExchange}
   *
   * @category Exchange Data
   */
  public async getExchange() {
    return this.get<katanaPerps.RestResponseGetExchange>('/exchange');
  }

  /**
   * Returns estimated gas fees by bridge and target chain
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/gasFees`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getGasFees)
   * @see response {@link katanaperps.RestResponseGetGasFees RestResponseGetGasFees}
   * @see type     {@link katanaperps.KatanaPerpsGasFees KatanaPerpsGasFees}
   *
   * @category Exchange Data
   */
  public async getGasFees() {
    return this.get<katanaPerps.RestResponseGetGasFees>('/gasFees');
  }

  /**
   * Returns information about the currently listed markets
   *
   * - Optionally filter for a specific market by providing a `market` request
   *   parameter.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/markets`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getMarkets)
   * @see request  {@link katanaperps.RestRequestGetMarkets RestRequestGetMarkets}
   * @see response {@link katanaperps.RestResponseGetMarkets RestResponseGetMarkets}
   * @see type     {@link katanaperps.KatanaPerpsMarket KatanaPerpsMarket}
   *
   * @category Exchange Data
   */
  public async getMarkets(params?: katanaPerps.RestRequestGetMarkets) {
    return this.get<katanaPerps.RestResponseGetMarkets>('/markets', params);
  }

  // Market Data Endpoints

  /**
   * Returns market statistics for the trailing 24-hour period
   *
   * - **TIP:** Automatic ticker updates are avilable via the WebSocket API tickers subscription,
   *   which is both faster and more efficient than polling this endpoint!
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/tickers`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getTickers)
   * @see request  {@link katanaperps.RestRequestGetTickers RestRequestGetTickers}
   * @see response {@link katanaperps.RestResponseGetTickers RestResponseGetTickers}
   * @see type     {@link katanaperps.KatanaPerpsTicker KatanaPerpsTicker}
   *
   * @category Exchange Data
   */
  public async getTickers(params?: katanaPerps.RestRequestGetTickers) {
    return this.get<katanaPerps.RestResponseGetTickers>('/tickers', params);
  }

  /**
   * Returns candle (OHLCV) data for a market
   *
   * - For autocompletion and inline documentation, use the {@link katanaperps.CandleInterval CandleInterval} enum
   *   when specifying the `interval` property (see example)
   * - **TIP:** Automatic candle updates are avilable via the WebSocket API candles subscription,
   *   which is both faster and more efficient than polling this endpoint!
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/candles`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * > - **Pagination:**
   * > {@link katanaperps.RestRequestPagination.start start},
   * > {@link katanaperps.RestRequestPagination.end end},
   * > {@link katanaperps.RestRequestPagination.limit limit}
   * ---
   *
   * @example
   * ```typescript
   * import { RestPublicClient, CandleInterval } from '@katanaperps/katana-perps-sdk-ma';
   *
   * const client = new RestPublicClient();
   *
   * const candles = await client.getCandles({
   *  market: 'ETH-USD',
   *  interval: CandleInterval.ONE_MINUTE
   * })
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getCandles)
   * @see request  {@link katanaperps.RestRequestGetCandles RestRequestGetCandles}
   * @see response {@link katanaperps.RestResponseGetCandles RestResponseGetCandles}
   * @see type     {@link katanaperps.KatanaPerpsCandle KatanaPerpsCandle}
   *
   * @category Exchange Data
   */
  public async getCandles(params: katanaPerps.RestRequestGetCandles) {
    return this.get<katanaPerps.RestResponseGetCandles>('/candles', params);
  }

  /**
   * Returns trade data for a market. In this documentation, "trades" refers to public information about trades, whereas "fills" refers to detailed non-public information about trades resulting from orders placed by the API account.
   *
   * - **TIP:** Automatic trades updates are available via the WebSocket API trades subscription,
   *   which is both faster and more efficient than polling this endpoint!
   * - **TIP:** There is also a call on the authenticated client {@link katanaPerps.RestAuthenticatedClient.getFills RestAuthenticatedClient.getFills}
   *   which includes the {@link katanaperps.KatanaPerpsFill KatanaPerpsFill} properties, if required.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/trades`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * > - **Pagination:**
   * > {@link katanaperps.RestRequestPaginationWithFromId.start start},
   * > {@link katanaperps.RestRequestPaginationWithFromId.end end},
   * > {@link katanaperps.RestRequestPaginationWithFromId.limit limit},
   * > {@link katanaperps.RestRequestPaginationWithFromId.fromId fromId}
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getTrades)
   * @see request  {@link katanaperps.RestRequestGetTrades RestRequestGetTrades}
   * @see response {@link katanaperps.RestResponseGetTrades RestResponseGetTrades}
   * @see type     {@link katanaperps.KatanaPerpsTrade KatanaPerpsTrade}
   * @see related  {@link katanaPerps.RestAuthenticatedClient.getFills RestAuthenticatedClient.getFills}
   *
   * @category Exchange Data
   */
  public async getTrades(params: katanaPerps.RestRequestGetTrades) {
    return this.get<katanaPerps.RestResponseGetTrades>('/trades', params);
  }

  /**
   * Returns a level-1 order book of a market.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/orderbook`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * > - **Pagination:**
   * > {@link katanaperps.RestRequestPagination.limit limit},
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getOrderBookLevel1)
   * @see request  {@link katanaperps.RestRequestGetOrderBookLevel1 RestRequestGetOrderBookLevel1}
   * @see response {@link katanaperps.RestResponseGetOrderBookLevel1 RestResponseGetOrderBookLevel1}
   * @see related  {@link getOrderBookLevel2 client.getOrderBookLevel2}
   *
   * @category Exchange Data
   */
  public async getOrderBookLevel1(
    params: katanaPerps.RestRequestGetOrderBookLevel1,
  ) {
    return this.get<katanaPerps.RestResponseGetOrderBookLevel1>('/orderbook', {
      ...params,
      level: 1,
    } satisfies katanaPerps.RestRequestGetOrderBookLevel1);
  }

  /**
   * Get current order book price levels for a market
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/orderbook`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * > - **Pagination:**
   * > {@link katanaperps.RestRequestPagination.limit limit},
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getOrderBookLevel2)
   * @see request  {@link katanaperps.RestRequestGetOrderBookLevel2 RestRequestGetOrderBookLevel2}
   * @see response {@link katanaperps.RestResponseGetOrderBookLevel2 RestResponseGetOrderBookLevel2}
   * @see related  {@link getOrderBookLevel1 client.getOrderBookLevel1}
   *
   * @category Exchange Data
   */
  public async getOrderBookLevel2(
    params: katanaPerps.RestRequestGetOrderBookLevel2,
  ) {
    return this.get<katanaPerps.RestResponseGetOrderBookLevel2>('/orderbook', {
      ...params,
      level: 2,
    } satisfies katanaPerps.RestRequestGetOrderBookLevel2);
  }

  /**
   * Get liquidations for a market
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/liquidations`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * > - **Pagination:**
   * > {@link katanaperps.RestRequestPaginationWithFromId.start start},
   * > {@link katanaperps.RestRequestPaginationWithFromId.end end},
   * > {@link katanaperps.RestRequestPaginationWithFromId.limit limit},
   * > {@link katanaperps.RestRequestPaginationWithFromId.fromId fromId}
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getLiquidations)
   * @see request  {@link katanaperps.RestRequestGetLiquidations RestRequestGetLiquidations}
   * @see response {@link katanaperps.RestResponseGetLiquidations RestResponseGetLiquidations}
   * @see type     {@link katanaperps.KatanaPerpsLiquidation KatanaPerpsLiquidation}
   *
   * @category Exchange Data
   */
  public async getLiquidations(params: katanaPerps.RestRequestGetLiquidations) {
    return this.get<katanaPerps.RestResponseGetLiquidations>(
      '/liquidations',
      params,
    );
  }

  /**
   * Get Funding Rates
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request**:      `GET /v1/fundingRates`
   * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
   * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
   * > - **Pagination:**
   * > {@link katanaperps.RestRequestPaginationWithFromId.start start},
   * > {@link katanaperps.RestRequestPaginationWithFromId.end end},
   * > {@link katanaperps.RestRequestPaginationWithFromId.limit limit}
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v1-perps.katana.network/classes/RestPublicClient.html#getFundingRates)
   * @see request  {@link katanaperps.RestRequestGetFundingRates RestRequestGetFundingRates}
   * @see response {@link katanaperps.RestResponseGetFundingRates RestResponseGetFundingRates}
   * @see type     {@link katanaperps.KatanaPerpsFundingRate KatanaPerpsFundingRate}
   *
   * @category Exchange Data
   */
  public async getFundingRates(params: katanaPerps.RestRequestGetFundingRates) {
    return this.get<katanaPerps.RestResponseGetFundingRates>(
      '/fundingRates',
      params,
    );
  }

  /**
   * - All requests within the internal symbol are undocumented internal methods which may change or be removed without notice.
   * - API handling of the parameters used within these methods is likely to change without notice without changes to the SDK to match.
   * - These methods or parameters may require additional permissions to use and result in errors or blocking of your request if used.
   * - If you need to use these methods for your use case, please contact support to discuss your requirements before using them.
   *
   * @internal
   */
  public readonly [INTERNAL_SYMBOL] = Object.freeze({
    realtime: () => {
      this.#realtime = true;
    },
  } as const);

  // Internal methods exposed for advanced usage.

  protected async get<R, O extends AnyObj | URLSearchParams = {}>(
    endpoint: string,
    params?: O | undefined,
    axiosConfig: Omit<
      Partial<AxiosRequestConfig>,
      'method' | 'url' | 'params'
    > = {},
  ) {
    return (
      await this.request<R>(endpoint, {
        ...axiosConfig,
        method: 'GET',
        url: endpoint,
        params: new URLSearchParams(params),
      })
    ).data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected request<R = any>(
    endpoint: string,
    config: Partial<AxiosRequestConfig> & { method: 'GET' },
  ) {
    const request = {
      ...config,
      headers: config.headers ?? {},
      url: endpoint,
    } satisfies AxiosRequestConfig;

    if (this.#realtime && !request.headers['KP-Web-Client']) {
      request.headers['KP-Web-Client'] = 'realtime-sdk';
    }

    return this.axios<R>(request);
  }

  readonly axios: AxiosInstance;

  readonly #axiosConfig: RestPublicClientOptions['axiosConfig'] & {};
}

const EXCHANGE_RESPONSE_CACHE_DURATION_MS = 300_000;

let cachedExchangeResponse: katanaPerps.RestResponseGetExchange | undefined;
let exchangeResponseCachedAt = 0;

export async function loadExchangeResponseFromApiIfNeeded(
  opts?: RestPublicClientOptions,
) {
  const client = new RestPublicClient(opts);
  const now = Date.now();

  const cachedValueIsStale =
    now - exchangeResponseCachedAt > EXCHANGE_RESPONSE_CACHE_DURATION_MS;

  const exchange =
    !cachedExchangeResponse || cachedValueIsStale ?
      await client.getExchange()
    : cachedExchangeResponse;

  cachedExchangeResponse = exchange;
  exchangeResponseCachedAt =
    cachedValueIsStale ? now : exchangeResponseCachedAt;

  return [exchange, client] as const;
}
