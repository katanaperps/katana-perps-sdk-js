/**
 * **Endpoint Parameters**
 *
 * > - **HTTP Request**:      `GET /v1/exchange`
 * > - **Endpoint Security:** [Public](https://api-docs-v1-perps.katana.network/#endpointSecurityPublic)
 * > - **API Key Scope:**     [None](https://api-docs-v1-perps.katana.network/#api-keys)
 */

export interface RestRequestGetExchange {}

/**
 * Basic exchange info
 *
 * @category KatanaPerps - Get Exchange
 * @category KatanaPerps Interfaces
 *
 * @see docs [API Documentation](https://api-docs-v1-perps.katana.network/#get-exchange)
 * @see response {@link RestResponseGetExchange}
 */
export interface KatanaPerpsExchange {
  /** Server time zone, always UTC */
  timeZone: 'UTC';
  /**
   * Current server time
   */
  serverTime: number;
  /**
   * [Katana](https://katana.network/) address of the exchange smart contract for deposits
   */
  exchangeContractAddress: string;
  /**
   * [Katana](https://katana.network/) chain identifier
   */
  chainId: number;
  /**
   * Address of the quote asset (USDC) on [Katana](https://katana.network/)
   */
  quoteTokenAddress: string;
  /** Total open interest across all markets in USD */
  totalOpenInterest: string;
  /** Total exchange trading volume for the trailing 24 hours in USD */
  volume24h: string;
  /** Total exchange trading volume for Katana Perps in USD */
  totalVolume: string;
  /** Total number of trade executions for Katana Perps */
  totalTrades: number;
  /** Balance of the insurance fund in USD */
  insuranceFundBalance?: string;
  /** Default exchange-wide maker trade fee rate */
  defaultMakerFeeRate: string;
  /** Default exchange-wide taker trade fee rate */
  defaultTakerFeeRate: string;
  /** Minimum withdrawal amount in USD */
  withdrawalMinimum: string;
  /**
   * Whether deposits are enabled
   *
   * - Internal use only, not returned in all circumstances
   *
   * @internal
   */
  depositEnabled?: boolean;
  /**
   * Whether deposits are enabled
   *
   * - Internal use only, not returned in all circumstances
   *
   * @internal
   */
  withdrawEnabled?: boolean;
  bridgeAdapters: {
    /** Address of the v1 Stargate bridge adapter contract on Katana */
    stargateBridgeAdapterV1KatanaContractAddress: string;
    /** Address of the v1 Stargate cross-chain forwarder contract on Ethereum */
    stargateBridgeForwarderV1EthereumContractAddress: string;
    /** Address of the vbUSDC OFT adapter contract on Ethereum */
    vbUsdcOFTAdapterEthereumContractAddress: string;
    /** Address of the vbUSDC OVault composer contract on Ethereum */
    vbUsdcVaultComposerSyncEthereumContractAddress: string;
  };
}

/**
 * @see docs [API Documentation](https://api-docs-v1-perps.katana.network/#get-exchange)
 * @see type {@link KatanaPerpsExchange}
 *
 * @category KatanaPerps - Get Exchange
 */
export type RestResponseGetExchange = KatanaPerpsExchange;
